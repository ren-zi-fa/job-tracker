import "dotenv/config";
import { neon } from "@neondatabase/serverless";
import type { NeonHttpDatabase } from "drizzle-orm/neon-http";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./models/schema";

type Database = NeonHttpDatabase<typeof schema>;

let database: Database | undefined;

/**
 * `DATABASE_URL` harus berisi connection string saja. Kalau terlanjur
 * ditempel sebagai `DATABASE_URL=...` atau dibungkus tanda kutip, nilai
 * dirapikan agar tidak gagal hanya karena format penulisan.
 */
function normalizeConnectionString(raw: string): string {
  let value = raw.trim();

  if (value.startsWith("DATABASE_URL=")) {
    value = value.slice("DATABASE_URL=".length).trim();
  }

  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    value = value.slice(1, -1).trim();
  }

  if (value !== raw) {
    console.warn(
      "[db] DATABASE_URL berisi prefix/kutip tambahan dan sudah dirapikan otomatis. " +
        "Perbaiki credential agar isinya hanya postgresql://...",
    );
  }

  return value;
}

function createDatabase(): Database {
  const raw = process.env.DATABASE_URL;

  if (!raw) {
    throw new Error(
      "[db] DATABASE_URL belum diset. Tambahkan connection string Neon " +
        "(postgresql://...) ke environment.",
    );
  }

  const connectionString = normalizeConnectionString(raw);

  let url: URL;
  try {
    url = new URL(connectionString);
  } catch {
    throw new Error(
      "[db] DATABASE_URL bukan URL yang valid. Pastikan nilainya hanya " +
        "connection string, tanpa teks 'DATABASE_URL=' di depan, tanpa " +
        "tanda kutip, dan tanpa baris baru.",
    );
  }

  if (url.protocol !== "postgres:" && url.protocol !== "postgresql:") {
    throw new Error(
      `[db] Skema DATABASE_URL harus postgresql:// atau postgres://, bukan "${url.protocol}".`,
    );
  }

  return drizzle({ client: neon(connectionString), schema });
}

function getDatabase(): Database {
  database ??= createDatabase();
  return database;
}

/**
 * Koneksi dibuat saat properti pertama kali diakses (lazy), bukan saat modul
 * di-import. Dengan begitu `next build` tidak memerlukan DATABASE_URL sama
 * sekali, sedangkan query tetap gagal cepat dengan pesan jelas bila env salah.
 */
const db = new Proxy({} as Database, {
  get(_target, property) {
    const instance = getDatabase();
    const value = Reflect.get(instance, property);
    return typeof value === "function" ? value.bind(instance) : value;
  },
  has(_target, property) {
    return property in getDatabase();
  },
  getPrototypeOf() {
    return Object.getPrototypeOf(getDatabase());
  },
});

export default db;
