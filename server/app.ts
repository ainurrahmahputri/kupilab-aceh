import express, { type Express, type Request, type Response, type NextFunction } from "express";
import crypto from "crypto";
import {
  loadDb,
  saveDb,
  hashSecret,
  verifySecret,
  constantTimeEqualStr,
  sanitizeImageUrl,
} from "./db.ts";
import {
  calcShipping,
  COURIERS,
  createInitialDb,
  ORDER_STATUSES,
  PAYMENT_METHODS,
  SHIPPING_ZONES,
  type Article,
  type Bean,
  type OrderItem,
  type OrderRecord,
} from "./seed.ts";

interface SessionEntry {
  role: "customer" | "admin";
  userId?: string;
  expiresAt: number;
}

const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const sessions = new Map<string, SessionEntry>();

function pruneSessions(): void {
  const now = Date.now();
  for (const [token, entry] of sessions.entries()) {
    if (entry.expiresAt <= now) {
      sessions.delete(token);
    }
  }
}

function issueToken(role: "customer" | "admin", userId?: string): string {
  pruneSessions();
  const token = crypto.randomBytes(32).toString("hex");
  sessions.set(token, {
    role,
    userId,
    expiresAt: Date.now() + SESSION_TTL_MS,
  });
  return token;
}

function readBearerToken(req: Request): string | null {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) return null;
  const token = header.slice(7).trim();
  return token.length > 0 ? token : null;
}

function getSession(req: Request, expectedRole: "customer" | "admin"): SessionEntry | null {
  const token = readBearerToken(req);
  if (!token) return null;
  const entry = sessions.get(token);
  if (!entry || entry.role !== expectedRole) return null;
  if (entry.expiresAt <= Date.now()) {
    sessions.delete(token);
    return null;
  }
  return entry;
}

function getEnvAdminPasscode(): string {
  return (process.env.ADMIN_PASSCODE || "").trim();
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

function requireCustomer(req: Request, res: Response, next: NextFunction): void {
  const session = getSession(req, "customer");
  if (!session?.userId) {
    res.status(401).json({ error: "Silakan masuk terlebih dahulu." });
    return;
  }
  const db = loadDb();
  const customer = db.customers.find((c) => c.id === session.userId);
  if (!customer) {
    res.status(401).json({ error: "Sesi pembeli tidak valid." });
    return;
  }
  (req as Request & { customerId?: string }).customerId = customer.id;
  next();
}

function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  const session = getSession(req, "admin");
  if (!session) {
    res.status(401).json({ error: "Akses pengelola diperlukan." });
    return;
  }
  next();
}

export function createApiApp(): Express {
  const app = express();
  app.use(express.json({ limit: "1mb" }));

  // Public bootstrap data
  app.get("/api/bootstrap", (_req, res) => {
    const db = loadDb();
    res.json({
      beans: db.beans,
      articles: db.articles,
      batch: db.batch,
      reviews: db.reviews,
    });
  });

  // Public review submission
  app.post("/api/reviews", (req, res) => {
    const { beanId, name, rating, comment } = req.body ?? {};
    const db = loadDb();
    if (typeof beanId !== "string" || !db.beans.some((b) => b.id === beanId)) {
      res.status(400).json({ error: "Produk tidak ditemukan." });
      return;
    }
    const cleanName = typeof name === "string" ? name.trim().slice(0, 40) : "";
    if (!cleanName) {
      res.status(400).json({ error: "Isi nama dulu." });
      return;
    }
    const numRating = Number(rating);
    if (!Number.isInteger(numRating) || numRating < 1 || numRating > 5) {
      res.status(400).json({ error: "Pilih jumlah bintang antara 1 sampai 5." });
      return;
    }
    const cleanComment = typeof comment === "string" ? comment.trim().slice(0, 500) : "";
    if (cleanComment.length < 5) {
      res.status(400).json({ error: "Tulis ulasan minimal 5 huruf." });
      return;
    }
    const review = {
      id: crypto.randomUUID(),
      beanId,
      name: cleanName,
      rating: numRating,
      comment: cleanComment,
      date: todayIsoDate(),
    };
    const nextDb = { ...db, reviews: [review, ...db.reviews] };
    saveDb(nextDb);
    res.status(201).json({ review });
  });

  // Customer authentication
  app.post("/api/auth/register", (req, res) => {
    const { name, email, phone, password } = req.body ?? {};
    const cleanName = typeof name === "string" ? name.trim().slice(0, 80) : "";
    const cleanEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
    const cleanPhone = typeof phone === "string" ? phone.trim() : "";
    const rawPassword = typeof password === "string" ? password : "";

    if (!cleanName) {
      res.status(400).json({ error: "Isi nama." });
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(cleanEmail)) {
      res.status(400).json({ error: "Email belum benar." });
      return;
    }
    if (!/^[0-9+\s-]{9,16}$/.test(cleanPhone)) {
      res.status(400).json({ error: "Nomor HP belum benar." });
      return;
    }
    if (rawPassword.length < 6) {
      res.status(400).json({ error: "Password minimal 6 karakter." });
      return;
    }

    const db = loadDb();
    if (db.customers.some((c) => c.email === cleanEmail)) {
      res.status(409).json({ error: "Email sudah terdaftar. Silakan masuk." });
      return;
    }

    const customer = {
      id: crypto.randomUUID(),
      name: cleanName,
      email: cleanEmail,
      phone: cleanPhone,
      passwordHash: hashSecret(rawPassword),
      createdAt: new Date().toISOString(),
    };
    saveDb({ ...db, customers: [...db.customers, customer] });
    const token = issueToken("customer", customer.id);
    res.status(201).json({
      token,
      customer: { id: customer.id, name: customer.name, email: customer.email, phone: customer.phone },
    });
  });

  app.post("/api/auth/login", (req, res) => {
    const { email, password } = req.body ?? {};
    const cleanEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
    const rawPassword = typeof password === "string" ? password : "";
    if (!cleanEmail || !rawPassword) {
      res.status(400).json({ error: "Email dan password wajib diisi." });
      return;
    }
    const db = loadDb();
    const customer = db.customers.find((c) => c.email === cleanEmail);
    if (!customer || !verifySecret(rawPassword, customer.passwordHash)) {
      res.status(401).json({ error: "Email atau password salah." });
      return;
    }
    const token = issueToken("customer", customer.id);
    res.json({
      token,
      customer: { id: customer.id, name: customer.name, email: customer.email, phone: customer.phone },
    });
  });

  app.post("/api/auth/logout", (req, res) => {
    const token = readBearerToken(req);
    if (token) sessions.delete(token);
    res.json({ ok: true });
  });

  app.get("/api/auth/me", requireCustomer, (req, res) => {
    const customerId = (req as Request & { customerId?: string }).customerId;
    const db = loadDb();
    const customer = db.customers.find((c) => c.id === customerId);
    if (!customer) {
      res.status(404).json({ error: "Akun tidak ditemukan." });
      return;
    }
    res.json({
      customer: { id: customer.id, name: customer.name, email: customer.email, phone: customer.phone },
    });
  });

  // Customer orders (owned by current customer, totals verified server-side)
  app.get("/api/orders", requireCustomer, (req, res) => {
    const customerId = (req as Request & { customerId?: string }).customerId;
    const db = loadDb();
    const orders = db.orders.filter((o) => o.customerId === customerId);
    res.json({ orders });
  });

  app.post("/api/orders", requireCustomer, (req, res) => {
    const customerId = (req as Request & { customerId?: string }).customerId!;
    const { customer, phone, address, zoneId, courierId, paymentId, note, items } = req.body ?? {};
    const cleanName = typeof customer === "string" ? customer.trim().slice(0, 80) : "";
    const cleanPhone = typeof phone === "string" ? phone.trim() : "";
    const cleanAddress = typeof address === "string" ? address.trim().slice(0, 400) : "";
    const cleanNote = typeof note === "string" ? note.trim().slice(0, 240) : "";

    if (!cleanName) {
      res.status(400).json({ error: "Isi nama penerima." });
      return;
    }
    if (!/^[0-9+\s-]{9,16}$/.test(cleanPhone)) {
      res.status(400).json({ error: "Nomor HP belum benar." });
      return;
    }
    if (cleanAddress.length < 12) {
      res.status(400).json({ error: "Alamat kurang lengkap. Tulis jalan, nomor, kecamatan, dan kode pos." });
      return;
    }

    const zone = SHIPPING_ZONES.find((z) => z.id === zoneId);
    const courier = COURIERS.find((c) => c.id === courierId);
    const payment = PAYMENT_METHODS.find((p) => p.id === paymentId);
    if (!zone || !courier || !payment) {
      res.status(400).json({ error: "Pilihan wilayah, kurir, atau pembayaran tidak valid." });
      return;
    }
    if (payment.id === "cod" && zone.id !== "bna") {
      res.status(400).json({ error: "COD hanya tersedia untuk Banda Aceh & Aceh Besar." });
      return;
    }
    if (!Array.isArray(items) || items.length === 0) {
      res.status(400).json({ error: "Keranjang kosong." });
      return;
    }

    const db = loadDb();
    const normalizedItems: OrderItem[] = [];
    for (const rawItem of items) {
      if (!rawItem || typeof rawItem !== "object") {
        res.status(400).json({ error: "Item pesanan tidak valid." });
        return;
      }
      const bean = db.beans.find((b) => b.id === rawItem.beanId);
      if (!bean) {
        res.status(400).json({ error: "Salah satu produk tidak ditemukan di katalog." });
        return;
      }
      if (bean.stock === "Habis") {
        res.status(400).json({ error: `Stok "${bean.name}" sedang habis.` });
        return;
      }
      const size = rawItem.size === "500" ? "500" : "200";
      const qty = Math.floor(Number(rawItem.qty));
      if (!Number.isFinite(qty) || qty < 1 || qty > 99) {
        res.status(400).json({ error: "Jumlah item tidak valid." });
        return;
      }
      const grind = typeof rawItem.grind === "string" && rawItem.grind.trim() ? rawItem.grind.trim().slice(0, 40) : "Biji utuh";
      const unitPrice = size === "200" ? bean.price200 : bean.price500;
      normalizedItems.push({
        beanId: bean.id,
        name: bean.name,
        size,
        grind,
        roast: bean.roast,
        qty,
        price: unitPrice,
      });
    }

    const subtotal = normalizedItems.reduce((acc, item) => acc + item.price * item.qty, 0);
    const weight = normalizedItems.reduce((acc, item) => acc + Number(item.size) * item.qty, 0);
    const shipping = calcShipping(zone.id, courier.id, weight);
    const fee = payment.fee;
    const total = subtotal + shipping + fee;

    const order: OrderRecord = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      customerId,
      customer: cleanName,
      phone: cleanPhone,
      address: cleanAddress,
      note: cleanNote,
      items: normalizedItems,
      subtotal,
      shipping,
      fee,
      total,
      weight,
      zone: zone.name,
      courier: `${courier.name} · ${courier.service}`,
      eta: courier.eta,
      payment: payment.name,
      status: payment.id === "cod" ? "Diproses" : "Menunggu pembayaran",
    };

    saveDb({ ...db, orders: [order, ...db.orders] });
    res.status(201).json({ order });
  });

  app.post("/api/orders/:id/pay", requireCustomer, (req, res) => {
    const customerId = (req as Request & { customerId?: string }).customerId;
    const db = loadDb();
    const order = db.orders.find((o) => o.id === req.params.id && o.customerId === customerId);
    if (!order) {
      res.status(404).json({ error: "Pesanan tidak ditemukan." });
      return;
    }
    if (order.status !== "Menunggu pembayaran") {
      res.status(400).json({ error: "Status pesanan tidak bisa ditandai dibayar." });
      return;
    }
    const updated: OrderRecord = {
      ...order,
      status: "Dibayar",
      paidAt: new Date().toISOString(),
    };
    saveDb({
      ...db,
      orders: db.orders.map((o) => (o.id === order.id ? updated : o)),
    });
    res.json({ order: updated });
  });

  app.post("/api/orders/:id/cancel", requireCustomer, (req, res) => {
    const customerId = (req as Request & { customerId?: string }).customerId;
    const db = loadDb();
    const order = db.orders.find((o) => o.id === req.params.id && o.customerId === customerId);
    if (!order) {
      res.status(404).json({ error: "Pesanan tidak ditemukan." });
      return;
    }
    if (order.status !== "Menunggu pembayaran") {
      res.status(400).json({ error: "Hanya pesanan yang menunggu pembayaran yang bisa dibatalkan." });
      return;
    }
    const updated: OrderRecord = { ...order, status: "Batal" };
    saveDb({
      ...db,
      orders: db.orders.map((o) => (o.id === order.id ? updated : o)),
    });
    res.json({ order: updated });
  });

  // Admin auth status, first-run claim, login, logout
  app.get("/api/admin/status", (req, res) => {
    const db = loadDb();
    const envPass = getEnvAdminPasscode();
    const hasEnvPasscode = envPass.length > 0;
    const needsClaim = !hasEnvPasscode && !db.adminPassHash;
    const authenticated = Boolean(getSession(req, "admin"));
    res.json({ hasEnvPasscode, needsClaim, authenticated });
  });

  app.post("/api/admin/claim", (req, res) => {
    const db = loadDb();
    if (getEnvAdminPasscode().length > 0 || db.adminPassHash) {
      res.status(409).json({ error: "Kata sandi pengelola sudah dikonfigurasi." });
      return;
    }
    const password = typeof req.body?.password === "string" ? req.body.password : "";
    if (password.length < 8) {
      res.status(400).json({ error: "Kata sandi pengelola minimal 8 karakter." });
      return;
    }
    const hash = hashSecret(password);
    saveDb({ ...db, adminPassHash: hash });
    const token = issueToken("admin");
    res.status(201).json({ token });
  });

  app.post("/api/admin/login", (req, res) => {
    const db = loadDb();
    const password = typeof req.body?.password === "string" ? req.body.password : "";
    if (!password) {
      res.status(400).json({ error: "Kata sandi wajib diisi." });
      return;
    }
    const envPass = getEnvAdminPasscode();
    let valid = false;
    if (envPass.length > 0) {
      valid = constantTimeEqualStr(password, envPass);
    } else if (db.adminPassHash) {
      valid = verifySecret(password, db.adminPassHash);
    } else {
      res.status(409).json({ error: "Kata sandi pengelola belum diatur. Buat kata sandi terlebih dahulu." });
      return;
    }
    if (!valid) {
      res.status(401).json({ error: "Kata sandi pengelola salah." });
      return;
    }
    const token = issueToken("admin");
    res.json({ token });
  });

  app.post("/api/admin/logout", (req, res) => {
    const token = readBearerToken(req);
    if (token) sessions.delete(token);
    res.json({ ok: true });
  });

  // Admin protected endpoints
  app.get("/api/admin/orders", requireAdmin, (_req, res) => {
    const db = loadDb();
    res.json({ orders: db.orders });
  });

  app.patch("/api/admin/orders/:id", requireAdmin, (req, res) => {
    const db = loadDb();
    const order = db.orders.find((o) => o.id === req.params.id);
    if (!order) {
      res.status(404).json({ error: "Pesanan tidak ditemukan." });
      return;
    }
    const nextStatus = typeof req.body?.status === "string" ? req.body.status : order.status;
    if (!(ORDER_STATUSES as readonly string[]).includes(nextStatus)) {
      res.status(400).json({ error: "Status pesanan tidak valid." });
      return;
    }
    const nextTracking =
      typeof req.body?.tracking === "string" ? req.body.tracking.trim().slice(0, 64) : order.tracking;
    const updated: OrderRecord = {
      ...order,
      status: nextStatus,
      tracking: nextTracking || undefined,
    };
    saveDb({
      ...db,
      orders: db.orders.map((o) => (o.id === order.id ? updated : o)),
    });
    res.json({ order: updated });
  });

  app.delete("/api/admin/orders/:id", requireAdmin, (req, res) => {
    const db = loadDb();
    saveDb({ ...db, orders: db.orders.filter((o) => o.id !== req.params.id) });
    res.json({ ok: true });
  });

  function normalizeBeanPayload(body: Record<string, unknown>, existingId?: string): Bean | string {
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const region = typeof body.region === "string" ? body.region.trim() : "";
    if (!name || !region) return "Nama dan asal daerah wajib diisi.";
    const altitude = Number(body.altitude);
    const price200 = Number(body.price200);
    const price500 = Number(body.price500);
    if (!Number.isFinite(altitude) || altitude <= 0) return "Ketinggian harus lebih dari 0 mdpl.";
    if (!Number.isFinite(price200) || price200 <= 0 || !Number.isFinite(price500) || price500 <= 0) {
      return "Harga 200 g dan 500 g harus lebih dari 0.";
    }
    const roast = body.roast === "Light" || body.roast === "Dark" ? body.roast : "Medium";
    const stock =
      body.stock === "Stok Terbatas" || body.stock === "Habis" ? body.stock : "Tersedia";
    return {
      id: existingId || (typeof body.id === "string" && body.id.trim() ? body.id.trim() : crypto.randomUUID()),
      name: name.slice(0, 80),
      category: typeof body.category === "string" && body.category.trim() ? body.category.trim() : "Single Origin Arabika",
      region: region.slice(0, 100),
      origin: typeof body.origin === "string" && body.origin.trim() ? body.origin.trim() : "Aceh Tengah",
      altitude: Math.round(altitude),
      process: typeof body.process === "string" ? body.process.trim().slice(0, 140) : "",
      flavors: Array.isArray(body.flavors)
        ? body.flavors.filter((x): x is string => typeof x === "string")
        : [],
      roast,
      notes: typeof body.notes === "string" ? body.notes.trim().slice(0, 200) : "",
      brew: Array.isArray(body.brew)
        ? body.brew.filter((x): x is string => typeof x === "string" && x.trim().length > 0)
        : [],
      stock,
      description: typeof body.description === "string" ? body.description.trim().slice(0, 600) : "",
      price200: Math.round(price200),
      price500: Math.round(price500),
      image: sanitizeImageUrl(body.image),
    };
  }

  app.post("/api/admin/beans", requireAdmin, (req, res) => {
    const beanOrErr = normalizeBeanPayload(req.body ?? {});
    if (typeof beanOrErr === "string") {
      res.status(400).json({ error: beanOrErr });
      return;
    }
    const db = loadDb();
    saveDb({ ...db, beans: [beanOrErr, ...db.beans] });
    res.status(201).json({ bean: beanOrErr });
  });

  app.put("/api/admin/beans/:id", requireAdmin, (req, res) => {
    const db = loadDb();
    if (!db.beans.some((b) => b.id === req.params.id)) {
      res.status(404).json({ error: "Produk tidak ditemukan." });
      return;
    }
    const beanOrErr = normalizeBeanPayload(req.body ?? {}, req.params.id);
    if (typeof beanOrErr === "string") {
      res.status(400).json({ error: beanOrErr });
      return;
    }
    saveDb({
      ...db,
      beans: db.beans.map((b) => (b.id === req.params.id ? beanOrErr : b)),
    });
    res.json({ bean: beanOrErr });
  });

  app.delete("/api/admin/beans/:id", requireAdmin, (req, res) => {
    const db = loadDb();
    saveDb({
      ...db,
      beans: db.beans.filter((b) => b.id !== req.params.id),
      reviews: db.reviews.filter((r) => r.beanId !== req.params.id),
    });
    res.json({ ok: true });
  });

  function normalizeArticlePayload(body: Record<string, unknown>, existingSlugs: string[], existingId?: string): Article | string {
    const title = typeof body.title === "string" ? body.title.trim() : "";
    const content = typeof body.body === "string" ? body.body.trim() : "";
    if (!title || !content) return "Judul dan isi artikel wajib diisi.";
    let candidate = slugify(typeof body.slug === "string" && body.slug.trim() ? body.slug : title) || crypto.randomUUID().slice(0, 8);
    const base = candidate;
    let suffix = 2;
    while (existingSlugs.includes(candidate)) {
      candidate = `${base}-${suffix++}`;
    }
    const mins = Number(body.readMinutes);
    return {
      id: existingId || (typeof body.id === "string" && body.id.trim() ? body.id.trim() : crypto.randomUUID()),
      slug: candidate,
      title: title.slice(0, 140),
      excerpt: typeof body.excerpt === "string" ? body.excerpt.trim().slice(0, 260) : "",
      author: typeof body.author === "string" && body.author.trim() ? body.author.trim().slice(0, 60) : "Tim KupiLab",
      date: typeof body.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(body.date) ? body.date : todayIsoDate(),
      readMinutes: Number.isFinite(mins) && mins > 0 ? Math.round(mins) : 1,
      body: content,
    };
  }

  app.post("/api/admin/articles", requireAdmin, (req, res) => {
    const db = loadDb();
    const articleOrErr = normalizeArticlePayload(
      req.body ?? {},
      db.articles.map((a) => a.slug),
    );
    if (typeof articleOrErr === "string") {
      res.status(400).json({ error: articleOrErr });
      return;
    }
    saveDb({ ...db, articles: [articleOrErr, ...db.articles] });
    res.status(201).json({ article: articleOrErr });
  });

  app.put("/api/admin/articles/:id", requireAdmin, (req, res) => {
    const db = loadDb();
    if (!db.articles.some((a) => a.id === req.params.id)) {
      res.status(404).json({ error: "Artikel tidak ditemukan." });
      return;
    }
    const articleOrErr = normalizeArticlePayload(
      req.body ?? {},
      db.articles.filter((a) => a.id !== req.params.id).map((a) => a.slug),
      req.params.id,
    );
    if (typeof articleOrErr === "string") {
      res.status(400).json({ error: articleOrErr });
      return;
    }
    saveDb({
      ...db,
      articles: db.articles.map((a) => (a.id === req.params.id ? articleOrErr : a)),
    });
    res.json({ article: articleOrErr });
  });

  app.delete("/api/admin/articles/:id", requireAdmin, (req, res) => {
    const db = loadDb();
    saveDb({ ...db, articles: db.articles.filter((a) => a.id !== req.params.id) });
    res.json({ ok: true });
  });

  app.put("/api/admin/batch", requireAdmin, (req, res) => {
    const db = loadDb();
    const date = typeof req.body?.date === "string" ? req.body.date : "";
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      res.status(400).json({ error: "Format tanggal tidak valid." });
      return;
    }
    const batch = {
      date,
      roaster: typeof req.body?.roaster === "string" && req.body.roaster.trim() ? req.body.roaster.trim().slice(0, 80) : "Roaster KupiLab",
      note: typeof req.body?.note === "string" ? req.body.note.trim().slice(0, 400) : "",
    };
    saveDb({ ...db, batch });
    res.json({ batch });
  });

  app.delete("/api/admin/reviews/:id", requireAdmin, (req, res) => {
    const db = loadDb();
    saveDb({ ...db, reviews: db.reviews.filter((r) => r.id !== req.params.id) });
    res.json({ ok: true });
  });

  app.delete("/api/admin/reviews-demo", requireAdmin, (_req, res) => {
    const db = loadDb();
    saveDb({ ...db, reviews: db.reviews.filter((r) => !r.demo) });
    res.json({ ok: true });
  });

  app.post("/api/admin/reset", requireAdmin, (_req, res) => {
    const db = loadDb();
    const fresh = createInitialDb(db.adminPassHash);
    fresh.customers = db.customers;
    saveDb(fresh);
    res.json({
      beans: fresh.beans,
      articles: fresh.articles,
      batch: fresh.batch,
      reviews: fresh.reviews,
      orders: fresh.orders,
    });
  });

  return app;
}
