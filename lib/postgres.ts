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
    return new Pool({ connectionString });
}

const pool: Pool = globalThis._pgPool ?? createPool();

if (process.env.NODE_ENV !== "production") {
    globalThis._pgPool = pool;
}

export default pool;
