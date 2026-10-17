import { Pool } from "pg";

// Use a global singleton so the pool isn't recreated on every hot-reload in dev
declare global {
    // eslint-disable-next-line no-var
    var _pgPool: Pool | undefined;
}

function getPool(): Pool {
    if (globalThis._pgPool) {
        return globalThis._pgPool;
    }

    let connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
        throw new Error(
            "DATABASE_URL environment variable is not set in Vercel. Please add DATABASE_URL under Project Settings -> Environment Variables and redeploy."
        );
    }

    const isSupabase =
        connectionString.includes("supabase.co") ||
        connectionString.includes("supabase.com") ||
        connectionString.includes("pooler.supabase.com");
    const isProduction = process.env.NODE_ENV === "production";
    const needsSsl = isProduction || isSupabase || connectionString.includes("sslmode=require");

    // Strip sslmode from connection string to avoid pg module double-processing SSL.
    // We handle SSL configuration programmatically below instead.
    if (needsSsl) {
        connectionString = connectionString
            .replace(/[?&]sslmode=require/gi, "")
            .replace(/[?&]sslmode=prefer/gi, "")
            .replace(/\?$/, ""); // clean trailing ? if sslmode was the only param
    }

    // Ensure Node.js doesn't reject Supabase's pooler certificates
    if (needsSsl && typeof process !== "undefined") {
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    }

    const poolInstance = new Pool({
        connectionString,
        ssl: needsSsl ? { rejectUnauthorized: false } : undefined,
        max: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 10000,
    });

    globalThis._pgPool = poolInstance;
    return poolInstance;
}

// Proxy wrapper so imports never throw on initial load, only when query/connect is executed
const pool = new Proxy({} as Pool, {
    get(_target, prop: keyof Pool) {
        const actualPool = getPool();
        const value = actualPool[prop];
        if (typeof value === "function") {
            return value.bind(actualPool);
        }
        return value;
    },
});

export default pool;
