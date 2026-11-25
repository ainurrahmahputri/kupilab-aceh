const CART_STORAGE_KEY = "kupilab_cart_v1";

function loadCartFromStorage() {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (item) =>
          item &&
          typeof item.beanId === "string" &&
          (item.size === "200" || item.size === "500") &&
          Number(item.qty) > 0
      )
      .map((item) => ({
        beanId: item.beanId,
        size: item.size,
        grind: typeof item.grind === "string" ? item.grind : "Biji utuh",
        qty: Math.min(99, Math.max(1, Math.floor(Number(item.qty)))),
      }));
  } catch {
    return [];
  }
}

function saveCartToStorage(lines) {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(lines));
  } catch {
    // Ignore storage quota errors
  }
}

function sameCartLine(a, beanId, size, grind) {
  return a.beanId === beanId && a.size === size && a.grind === grind;
}

class AppStore {
  constructor() {
    this.listeners = new Set();
    this.loading = true;
    this.loadError = null;

    this.beans = [];
    this.articles = [];
    this.batch = { date: "", roaster: "Roaster KupiLab", note: "" };
    this.reviews = [];

    this.cart = loadCartFromStorage();

    // Sessions held strictly in JS memory (never localStorage)
    this.customerToken = null;
    this.customer = null;
    this.customerOrders = [];

    this.adminToken = null;
    this.adminOrders = [];
    this.adminStatus = {
      hasEnvPasscode: false,
      needsClaim: false,
      authenticated: false,
      loaded: false,
    };
  }

  subscribe(fn) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  notify(reason = "update") {
    for (const fn of this.listeners) {
      fn(this, reason);
    }
  }

  async apiFetch(url, options = {}, token = null) {
    const headers = { ...(options.headers || {}) };
    if (options.body && !headers["Content-Type"]) {
      headers["Content-Type"] = "application/json";
    }
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    const res = await fetch(url, { ...options, headers });
    let data = {};
    try {
      data = await res.json();
    } catch {
      data = {};
    }
    if (!res.ok) {
      const msg = data.error || `Permintaan gagal (${res.status}).`;
      const err = new Error(msg);
      err.status = res.status;
      throw err;
    }
    return data;
  }

  async init() {
    this.loading = true;
    this.loadError = null;
    try {
      const data = await this.apiFetch("/api/bootstrap");
      this.beans = Array.isArray(data.beans) ? data.beans : [];
      this.articles = Array.isArray(data.articles) ? data.articles : [];
      this.batch = data.batch || this.batch;
      this.reviews = Array.isArray(data.reviews) ? data.reviews : [];
      this.loading = false;
      this.notify("bootstrap");
    } catch (err) {
      this.loading = false;
      this.loadError = err.message || "Gagal memuat data roastery.";
      this.notify("bootstrap-error");
    }
  }

  ratingOf(beanId) {
    const matches = this.reviews.filter((r) => r.beanId === beanId);
    if (matches.length === 0) return { avg: 0, count: 0 };
    const sum = matches.reduce((acc, r) => acc + r.rating, 0);
    return { avg: sum / matches.length, count: matches.length };
  }

  get cartCount() {
    return this.cart.reduce((sum, line) => sum + line.qty, 0);
  }

  addToCart(beanId, size, grind = "Biji utuh", qty = 1) {
    const idx = this.cart.findIndex((item) => sameCartLine(item, beanId, size, grind));
    if (idx === -1) {
      this.cart = [...this.cart, { beanId, size, grind, qty: Math.min(99, Math.max(1, qty)) }];
    } else {
      this.cart = this.cart.map((item, i) =>
        i === idx ? { ...item, qty: Math.min(99, item.qty + qty) } : item
      );
    }
    saveCartToStorage(this.cart);
    this.notify("cart");
  }

  setCartQty(beanId, size, grind, qty) {
    this.cart = this.cart
      .map((item) =>
        sameCartLine(item, beanId, size, grind) ? { ...item, qty: Math.min(99, qty) } : item
      )
      .filter((item) => item.qty > 0);
    saveCartToStorage(this.cart);
    this.notify("cart");
  }

  updateCartLine(beanId, oldSize, oldGrind, newSize, newGrind) {
    if (oldSize === newSize && oldGrind === newGrind) return;
    const current = this.cart.find((item) => sameCartLine(item, beanId, oldSize, oldGrind));
    if (!current) return;

    const existingTarget = this.cart.find((item) => sameCartLine(item, beanId, newSize, newGrind));
    if (existingTarget) {
      const mergedQty = Math.min(99, existingTarget.qty + current.qty);
      this.cart = this.cart
        .filter((item) => !sameCartLine(item, beanId, oldSize, oldGrind))
        .map((item) =>
          sameCartLine(item, beanId, newSize, newGrind) ? { ...item, qty: mergedQty } : item
        );
    } else {
      this.cart = this.cart.map((item) =>
        sameCartLine(item, beanId, oldSize, oldGrind)
          ? { ...item, size: newSize, grind: newGrind }
          : item
      );
    }
    saveCartToStorage(this.cart);
    this.notify("cart");
  }

  removeFromCart(beanId, size, grind) {
    this.cart = this.cart.filter((item) => !sameCartLine(item, beanId, size, grind));
    saveCartToStorage(this.cart);
    this.notify("cart");
  }

  clearCart() {
    this.cart = [];
    saveCartToStorage(this.cart);
    this.notify("cart");
  }

  async addReview(payload) {
    const data = await this.apiFetch("/api/reviews", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    this.reviews = [data.review, ...this.reviews];
    this.notify("reviews");
    return data.review;
  }

  // Customer auth & orders
  async registerCustomer(payload) {
    const data = await this.apiFetch("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    this.customerToken = data.token;
    this.customer = data.customer;
    this.customerOrders = [];
    this.notify("auth");
    return data.customer;
  }

  async loginCustomer(email, password) {
    const data = await this.apiFetch("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    this.customerToken = data.token;
    this.customer = data.customer;
    await this.loadCustomerOrders();
    this.notify("auth");
    return data.customer;
  }

  async logoutCustomer() {
    const token = this.customerToken;
    this.customerToken = null;
    this.customer = null;
    this.customerOrders = [];
    this.notify("auth");
    if (token) {
      try {
        await this.apiFetch("/api/auth/logout", { method: "POST" }, token);
      } catch {
        // Ignore logout network error
      }
    }
  }

  async loadCustomerOrders() {
    if (!this.customerToken) return [];
    const data = await this.apiFetch("/api/orders", {}, this.customerToken);
    this.customerOrders = Array.isArray(data.orders) ? data.orders : [];
    this.notify("customer-orders");
    return this.customerOrders;
  }

  async createOrder(payload) {
    if (!this.customerToken) {
      throw new Error("Silakan masuk terlebih dahulu.");
    }
    const data = await this.apiFetch(
      "/api/orders",
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
      this.customerToken
    );
    this.customerOrders = [data.order, ...this.customerOrders];
    this.clearCart();
    this.notify("customer-orders");
    return data.order;
  }

  async markOrderPaid(orderId) {
    const data = await this.apiFetch(
      `/api/orders/${encodeURIComponent(orderId)}/pay`,
      { method: "POST" },
      this.customerToken
    );
    this.customerOrders = this.customerOrders.map((o) =>
      o.id === orderId ? data.order : o
    );
    this.notify("customer-orders");
    return data.order;
  }

  async cancelCustomerOrder(orderId) {
    const data = await this.apiFetch(
      `/api/orders/${encodeURIComponent(orderId)}/cancel`,
      { method: "POST" },
      this.customerToken
    );
    this.customerOrders = this.customerOrders.map((o) =>
      o.id === orderId ? data.order : o
    );
    this.notify("customer-orders");
    return data.order;
  }

  // Admin auth & CRUD
  async fetchAdminStatus() {
    const data = await this.apiFetch("/api/admin/status", {}, this.adminToken);
    this.adminStatus = {
      hasEnvPasscode: Boolean(data.hasEnvPasscode),
      needsClaim: Boolean(data.needsClaim),
      authenticated: Boolean(data.authenticated),
      loaded: true,
    };
    if (!this.adminStatus.authenticated && this.adminToken) {
      this.adminToken = null;
    }
    this.notify("admin-status");
    return this.adminStatus;
  }

  async claimAdminPassword(password) {
    const data = await this.apiFetch("/api/admin/claim", {
      method: "POST",
      body: JSON.stringify({ password }),
    });
    this.adminToken = data.token;
    this.adminStatus = {
      hasEnvPasscode: false,
      needsClaim: false,
      authenticated: true,
      loaded: true,
    };
    await this.loadAdminOrders();
    this.notify("admin-auth");
  }

  async loginAdmin(password) {
    const data = await this.apiFetch("/api/admin/login", {
      method: "POST",
      body: JSON.stringify({ password }),
    });
    this.adminToken = data.token;
    this.adminStatus = {
      ...this.adminStatus,
      needsClaim: false,
      authenticated: true,
      loaded: true,
    };
    await this.loadAdminOrders();
    this.notify("admin-auth");
  }

  async logoutAdmin() {
    const token = this.adminToken;
    this.adminToken = null;
    this.adminOrders = [];
    this.adminStatus = { ...this.adminStatus, authenticated: false };
    this.notify("admin-auth");
    if (token) {
      try {
        await this.apiFetch("/api/admin/logout", { method: "POST" }, token);
      } catch {
        // Ignore logout network error
      }
    }
  }

  async loadAdminOrders() {
    if (!this.adminToken) return [];
    const data = await this.apiFetch("/api/admin/orders", {}, this.adminToken);
    this.adminOrders = Array.isArray(data.orders) ? data.orders : [];
    this.notify("admin-orders");
    return this.adminOrders;
  }

  async saveBean(bean, isNew) {
    if (isNew) {
      const data = await this.apiFetch(
        "/api/admin/beans",
        { method: "POST", body: JSON.stringify(bean) },
        this.adminToken
      );
      this.beans = [data.bean, ...this.beans];
    } else {
      const data = await this.apiFetch(
        `/api/admin/beans/${encodeURIComponent(bean.id)}`,
        { method: "PUT", body: JSON.stringify(bean) },
        this.adminToken
      );
      this.beans = this.beans.map((b) => (b.id === bean.id ? data.bean : b));
    }
    this.notify("beans");
  }

  async removeBean(beanId) {
    await this.apiFetch(
      `/api/admin/beans/${encodeURIComponent(beanId)}`,
      { method: "DELETE" },
      this.adminToken
    );
    this.beans = this.beans.filter((b) => b.id !== beanId);
    this.reviews = this.reviews.filter((r) => r.beanId !== beanId);
    this.notify("beans");
  }

  async saveArticle(article, isNew) {
    if (isNew) {
      const data = await this.apiFetch(
        "/api/admin/articles",
        { method: "POST", body: JSON.stringify(article) },
        this.adminToken
      );
      this.articles = [data.article, ...this.articles];
    } else {
      const data = await this.apiFetch(
        `/api/admin/articles/${encodeURIComponent(article.id)}`,
        { method: "PUT", body: JSON.stringify(article) },
        this.adminToken
      );
      this.articles = this.articles.map((a) => (a.id === article.id ? data.article : a));
    }
    this.notify("articles");
  }

  async removeArticle(articleId) {
    await this.apiFetch(
      `/api/admin/articles/${encodeURIComponent(articleId)}`,
      { method: "DELETE" },
      this.adminToken
    );
    this.articles = this.articles.filter((a) => a.id !== articleId);
    this.notify("articles");
  }

  async saveBatch(batch) {
    const data = await this.apiFetch(
      "/api/admin/batch",
      { method: "PUT", body: JSON.stringify(batch) },
      this.adminToken
    );
    this.batch = data.batch;
    this.notify("batch");
  }

  async updateAdminOrder(orderId, patch) {
    const data = await this.apiFetch(
      `/api/admin/orders/${encodeURIComponent(orderId)}`,
      { method: "PATCH", body: JSON.stringify(patch) },
      this.adminToken
    );
    this.adminOrders = this.adminOrders.map((o) =>
      o.id === orderId ? data.order : o
    );
    this.customerOrders = this.customerOrders.map((o) =>
      o.id === orderId ? data.order : o
    );
    this.notify("admin-orders");
  }

  async removeAdminOrder(orderId) {
    await this.apiFetch(
      `/api/admin/orders/${encodeURIComponent(orderId)}`,
      { method: "DELETE" },
      this.adminToken
    );
    this.adminOrders = this.adminOrders.filter((o) => o.id !== orderId);
    this.customerOrders = this.customerOrders.filter((o) => o.id !== orderId);
    this.notify("admin-orders");
  }

  async removeReview(reviewId) {
    await this.apiFetch(
      `/api/admin/reviews/${encodeURIComponent(reviewId)}`,
      { method: "DELETE" },
      this.adminToken
    );
    this.reviews = this.reviews.filter((r) => r.id !== reviewId);
    this.notify("reviews");
  }

  async clearDemoReviews() {
    await this.apiFetch("/api/admin/reviews-demo", { method: "DELETE" }, this.adminToken);
    this.reviews = this.reviews.filter((r) => !r.demo);
    this.notify("reviews");
  }

  async resetDemoData() {
    const data = await this.apiFetch("/api/admin/reset", { method: "POST" }, this.adminToken);
    this.beans = data.beans;
    this.articles = data.articles;
    this.batch = data.batch;
    this.reviews = data.reviews;
    this.adminOrders = data.orders;
    this.customerOrders = [];
    this.notify("reset");
  }
}

export const store = new AppStore();
