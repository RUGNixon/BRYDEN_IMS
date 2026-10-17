import { Pool } from "pg";

// Use a global singleton so the pool isn't recreated on every hot-reload in dev
declare global {
    // eslint-disable-next-line no-var
    var _pgPool: Pool | undefined;
}

function createPool(): Pool {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
        throw new Error("DATABASE_URL environment variable is not set.");
    }

    const isSupabase =
        connectionString.includes("supabase.co") ||
        connectionString.includes("supabase.com") ||
        connectionString.includes("pooler.supabase.com");
    const isProduction = process.env.NODE_ENV === "production";
    const useSsl = isProduction || isSupabase || connectionString.includes("sslmode=require");

    return new Pool({
        connectionString,
        ssl: useSsl ? { rejectUnauthorized: false } : undefined,
        max: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 10000,
    });
}

const pool: Pool = globalThis._pgPool ?? createPool();

if (process.env.NODE_ENV !== "production") {
    globalThis._pgPool = pool;
}

export default pool;
