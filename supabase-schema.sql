-- ============================================================
-- BRYDEN IMS: Complete Supabase Database Schema
-- Run this in your Supabase SQL Editor (Dashboard -> SQL Editor)
-- ============================================================

-- 1. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    size TEXT NOT NULL DEFAULT '',
    category TEXT NOT NULL DEFAULT '',
    selling_price NUMERIC(10,2) NOT NULL DEFAULT 0,
    purchase_price NUMERIC(10,2) NOT NULL DEFAULT 0,
    quantity INTEGER NOT NULL DEFAULT 0
);

-- 2. PURCHASES TABLE
CREATE TABLE IF NOT EXISTS purchases (
    id SERIAL PRIMARY KEY,
    supplier_name TEXT NOT NULL,
    product_name TEXT NOT NULL,
    size TEXT NOT NULL DEFAULT '',
    purchase_price NUMERIC(10,2) NOT NULL DEFAULT 0,
    quantity INTEGER NOT NULL DEFAULT 0,
    date TEXT NOT NULL
);

-- 3. SALES TABLE
CREATE TABLE IF NOT EXISTS sales (
    id SERIAL PRIMARY KEY,
    client_name TEXT NOT NULL,
    product_name TEXT NOT NULL,
    size TEXT NOT NULL DEFAULT '',
    quantity INTEGER NOT NULL DEFAULT 0,
    selling_price NUMERIC(10,2) NOT NULL DEFAULT 0,
    profits NUMERIC(10,2) NOT NULL DEFAULT 0,
    vat NUMERIC(10,2) NOT NULL DEFAULT 0,
    status BOOLEAN NOT NULL DEFAULT FALSE,
    "order" BOOLEAN NOT NULL DEFAULT FALSE,
    date TEXT NOT NULL,
    phone TEXT,
    email TEXT
);

-- 4. SALES PROFIT & VAT CALCULATION TRIGGER
CREATE OR REPLACE FUNCTION calculate_sales_profit()
RETURNS TRIGGER AS $$
DECLARE
    product_cp NUMERIC(10,2);
BEGIN
    SELECT purchase_price INTO product_cp
    FROM products
    WHERE LOWER(name) = LOWER(NEW.product_name) AND size = NEW.size
    LIMIT 1;

    IF FOUND THEN
        NEW.profits := (NEW.selling_price - product_cp) * NEW.quantity;
    ELSE
        NEW.profits := 0;
    END IF;

    -- VAT: 18% standard formula
    NEW.vat := ROUND((NEW.selling_price - (NEW.selling_price / 1.18)) * NEW.quantity, 2);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS sales_profit_trigger ON sales;

CREATE TRIGGER sales_profit_trigger
BEFORE INSERT OR UPDATE ON sales
FOR EACH ROW
EXECUTE FUNCTION calculate_sales_profit();

-- 5. EXPENSES TABLE
CREATE TABLE IF NOT EXISTS expenses (
    id SERIAL PRIMARY KEY,
    person_name TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    amount NUMERIC(10,2) NOT NULL DEFAULT 0,
    date TEXT NOT NULL
);

-- 6. NOTES TABLE
CREATE TABLE IF NOT EXISTS notes (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL DEFAULT '',
    reminder_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. APP SETTINGS TABLE
CREATE TABLE IF NOT EXISTS app_settings (
    id SERIAL PRIMARY KEY,
    language VARCHAR(10) NOT NULL DEFAULT 'en',
    tax_payment_schedule VARCHAR(20) NOT NULL DEFAULT 'monthly',
    theme VARCHAR(10) NOT NULL DEFAULT 'light',
    admin_email VARCHAR(255) NOT NULL DEFAULT 'admin@brydenims.com',
    admin_password_hash VARCHAR(255) NOT NULL DEFAULT 'admin123',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO app_settings (id, language, tax_payment_schedule, theme, admin_email, admin_password_hash)
VALUES (1, 'en', 'monthly', 'light', 'admin@brydenims.com', 'admin123')
ON CONFLICT (id) DO NOTHING;

-- 8. USERS TABLE
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

CREATE INDEX IF NOT EXISTS idx_users_email ON users(LOWER(email));

-- 9. USER SESSIONS TABLE
CREATE TABLE IF NOT EXISTS user_sessions (
    id VARCHAR(128) PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at TIMESTAMPTZ NOT NULL,
    ip_address VARCHAR(50),
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires_at ON user_sessions(expires_at);

-- 10. AUTH AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS auth_audit_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    email VARCHAR(255) NOT NULL,
    action VARCHAR(50) NOT NULL,
    ip_address VARCHAR(50),
    details TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_auth_audit_logs_email ON auth_audit_logs(LOWER(email));
CREATE INDEX IF NOT EXISTS idx_auth_audit_logs_created_at ON auth_audit_logs(created_at DESC);
