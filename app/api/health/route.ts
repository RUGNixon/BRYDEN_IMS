import { NextResponse } from "next/server";
import pool from "@/lib/postgres";

export const dynamic = "force-dynamic";

export async function GET() {
    const rawDbUrl = process.env.DATABASE_URL;

    // 1. Check if DATABASE_URL is defined
    if (!rawDbUrl) {
        return NextResponse.json(
            {
                status: "error",
                issue: "DATABASE_URL_MISSING",
                message: "The DATABASE_URL environment variable is NOT set in Vercel.",
                solution:
                    "Go to Vercel Dashboard -> Settings -> Environment Variables, add DATABASE_URL, and then REDEPLOY the project.",
            },
            { status: 500 }
        );
    }

    // 2. Check for unreplaced placeholders
    if (rawDbUrl.includes("[YOUR-PASSWORD]") || rawDbUrl.includes("[YOUR_PASSWORD]") || rawDbUrl.includes("[password]")) {
        return NextResponse.json(
            {
                status: "error",
                issue: "PASSWORD_PLACEHOLDER_NOT_REPLACED",
                message: "The DATABASE_URL contains the literal placeholder [YOUR-PASSWORD].",
                solution: "Replace [YOUR-PASSWORD] with your actual Supabase database password.",
            },
            { status: 500 }
        );
    }

    // 3. Check for IPv6 Direct connection vs Pooler
    let warning: string | null = null;
    if (rawDbUrl.includes("db.") && rawDbUrl.includes(".supabase.co") && !rawDbUrl.includes("pooler.supabase.com")) {
        warning =
            "You are using the Supabase direct connection (db.[ref].supabase.co:5432). Supabase direct connections use IPv6, which Vercel serverless functions often cannot resolve. Switch to the Supabase Connection Pooler (Transaction mode, port 6543: aws-0-[region].pooler.supabase.com:6543).";
    }

    // 4. Test actual database connection
    try {
        const testRes = await pool.query("SELECT NOW() as db_time, current_database() as database_name;");
        
        // Check existing tables
        const tablesRes = await pool.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            ORDER BY table_name;
        `);

        const tables = tablesRes.rows.map((r: any) => r.table_name);

        return NextResponse.json({
            status: "connected",
            database: testRes.rows[0]?.database_name,
            dbTime: testRes.rows[0]?.db_time,
            tablesCount: tables.length,
            tables,
            warning,
            schemaInitialized: tables.includes("users") && tables.includes("products") && tables.includes("app_settings"),
            note: tables.length === 0 
                ? "Database connected, but no tables exist yet. Visit /api/db-init or run supabase-schema.sql in Supabase SQL Editor."
                : "Database is connected and ready!",
        });
    } catch (err: any) {
        console.error("Database health check failed:", err);

        let guidance = "Check your database credentials, password encoding, and network connection.";
        if (err.code === "28P01") {
            guidance = "Password authentication failed. Double check your database password in DATABASE_URL. If your password has special characters like @, #, $, %, encode them or reset password to alphanumeric.";
        } else if (err.code === "ENOTFOUND" || err.code === "ECONNREFUSED") {
            guidance = "Could not reach database host. Make sure you are using the Supabase Connection Pooler URL (pooler.supabase.com:6543), NOT the direct IPv6 host.";
        } else if (err.message && err.message.includes("SSL")) {
            guidance = "SSL handshake failed. Ensure ?sslmode=require is present in the connection string.";
        }

        return NextResponse.json(
            {
                status: "connection_failed",
                error: err.message || String(err),
                code: err.code || null,
                guidance,
                warning,
            },
            { status: 500 }
        );
    }
}
