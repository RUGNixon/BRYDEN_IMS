import pool from "@/lib/postgres";

/**
 * Initializes authentication and authorization tables in PostgreSQL if they do not already exist.
 * Roles are strictly limited to 'admin' and 'manager'.
 */
export async function ensureAuthTables(): Promise<void> {
    await pool.query(`
        -- 1. USERS TABLE
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            name VARCHAR(120) NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            role VARCHAR(50) NOT NULL DEFAULT 'manager' CHECK (role IN ('admin', 'manager')),
            status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'pending')),
            phone VARCHAR(50),
            avatar_url TEXT,
            last_login_at TIMESTAMPTZ,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );

        -- Index for fast email lookups
        CREATE INDEX IF NOT EXISTS idx_users_email ON users(LOWER(email));

        -- 2. USER SESSIONS TABLE (Stateful session management for instant revocation & device tracking)
        CREATE TABLE IF NOT EXISTS user_sessions (
            id VARCHAR(128) PRIMARY KEY, -- SHA-256 hash of the session token
            user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            expires_at TIMESTAMPTZ NOT NULL,
            ip_address VARCHAR(50),
            user_agent TEXT,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );

        CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
        CREATE INDEX IF NOT EXISTS idx_user_sessions_expires_at ON user_sessions(expires_at);

        -- 3. AUTH AUDIT LOGS TABLE
        CREATE TABLE IF NOT EXISTS auth_audit_logs (
            id SERIAL PRIMARY KEY,
            user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
            email VARCHAR(255) NOT NULL,
            action VARCHAR(50) NOT NULL, -- 'login_success', 'login_failed', 'register', 'logout'
            ip_address VARCHAR(50),
            details TEXT,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );

        CREATE INDEX IF NOT EXISTS idx_auth_audit_logs_email ON auth_audit_logs(LOWER(email));
        CREATE INDEX IF NOT EXISTS idx_auth_audit_logs_created_at ON auth_audit_logs(created_at DESC);
    `);
}
