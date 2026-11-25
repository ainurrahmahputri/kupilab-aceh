import fs from "fs";
import path from "path";
import crypto from "crypto";
import { createInitialDb, type DbState } from "./seed.ts";

const DATA_DIR = process.env.VERCEL
  ? path.resolve("/tmp", "kupilab-data")
  : path.resolve(process.cwd(), "data");
const DB_FILE = path.resolve(DATA_DIR, "db.json");

let cachedDb: DbState | null = null;

function ensureDataDir(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

export function loadDb(): DbState {
  if (cachedDb) return cachedDb;
  ensureDataDir();
  if (fs.existsSync(DB_FILE)) {
    try {
      const raw = fs.readFileSync(DB_FILE, "utf8");
      const parsed = JSON.parse(raw) as Partial<DbState>;
      const base = createInitialDb(null);
      cachedDb = {
        beans: Array.isArray(parsed.beans) ? parsed.beans : base.beans,
        articles: Array.isArray(parsed.articles) ? parsed.articles : base.articles,
        batch: parsed.batch && typeof parsed.batch.date === "string" ? parsed.batch : base.batch,
        reviews: Array.isArray(parsed.reviews) ? parsed.reviews : base.reviews,
        orders: Array.isArray(parsed.orders) ? parsed.orders : [],
        customers: Array.isArray(parsed.customers) ? parsed.customers : [],
        adminPassHash: typeof parsed.adminPassHash === "string" ? parsed.adminPassHash : null,
      };
      return cachedDb;
    } catch {
      // Fallback to fresh seed if JSON is corrupted
    }
  }
  cachedDb = createInitialDb(null);
  saveDb(cachedDb);
  return cachedDb;
}

export function saveDb(next: DbState): void {
  ensureDataDir();
  cachedDb = next;
  const tmpFile = `${DB_FILE}.${process.pid}.tmp`;
  fs.writeFileSync(tmpFile, JSON.stringify(next, null, 2), "utf8");
  fs.renameSync(tmpFile, DB_FILE);
}

export function hashSecret(secret: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(secret, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifySecret(secret: string, stored: string): boolean {
  const parts = stored.split(":");
  if (parts.length !== 2) return false;
  const [salt, keyHex] = parts;
  if (!salt || !keyHex) return false;
  const derived = crypto.scryptSync(secret, salt, 64);
  const expected = Buffer.from(keyHex, "hex");
  if (derived.length !== expected.length) return false;
  return crypto.timingSafeEqual(derived, expected);
}

export function constantTimeEqualStr(a: string, b: string): boolean {
  const da = crypto.createHash("sha256").update(a).digest();
  const db = crypto.createHash("sha256").update(b).digest();
  return crypto.timingSafeEqual(da, db);
}

export function sanitizeImageUrl(input: unknown): string | undefined {
  if (typeof input !== "string") return undefined;
  const trimmed = input.trim();
  if (!trimmed) return undefined;
  if (trimmed.startsWith("/src/assets/") || trimmed.startsWith("/foto/") || trimmed.startsWith("/assets/")) {
    return trimmed;
  }
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === "https:" || parsed.protocol === "http:") {
      return parsed.toString();
    }
  } catch {
    return undefined;
  }
  return undefined;
}
