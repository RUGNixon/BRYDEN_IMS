import { NextResponse } from "next/server";
import pool from "@/lib/postgres";

// Helper to generate a random date within the last 6 months
function getRandomDate(monthsAgoStart: number, monthsAgoEnd: number) {
    const now = new Date();
    // Approximate days per month to keep logic simple
    const startDaysAgo = monthsAgoStart * 30;
    const endDaysAgo = monthsAgoEnd * 30;

    // Pick a random number of days between startDaysAgo and endDaysAgo
    const randomDaysAgo = Math.floor(Math.random() * (startDaysAgo - endDaysAgo + 1)) + endDaysAgo;

    const randomDate = new Date(now);
    randomDate.setDate(now.getDate() - randomDaysAgo);

    // Add some random hours/minutes for realism
    randomDate.setHours(Math.floor(Math.random() * 12) + 8); // 8 AM to 8 PM
    randomDate.setMinutes(Math.floor(Math.random() * 60));

    return randomDate.toISOString();
}

export async function GET() {
    // SECURITY WARNING: In a production app, GET shouldn't mutate data and this endpoint should be protected.
    // For development purposes, we are exposing it as a GET.

    // We want local dev environment to only seed if it's explicitly hit.
    if (process.env.NODE_ENV === "production") {
        return NextResponse.json({ error: "Cannot seed in production environment." }, { status: 403 });
    }

    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        // 1. Clear existing data
        // CASCADE is important in case of foreign keys (though this schema doesn't appear to use them strictly yet)
        await client.query(`TRUNCATE TABLE products, sales, purchases, expenses RESTART IDENTITY CASCADE`);

        // 2. Seed Products
        const productsRaw = [
            { name: "Premium Widget", size: "M", category: "Hardware", cp: 15.00, sp: 25.00 },
            { name: "Premium Widget", size: "L", category: "Hardware", cp: 18.00, sp: 30.00 },
            { name: "Basic Widget", size: "S", category: "Hardware", cp: 5.00, sp: 10.00 },
            { name: "Super Screwdriver", size: "Standard", category: "Tools", cp: 8.50, sp: 15.99 },
            { name: "Power Drill", size: "Pro", category: "Power Tools", cp: 85.00, sp: 149.99 },
            { name: "Safety Goggles", size: "Universal", category: "Safety", cp: 4.00, sp: 9.99 },
            { name: "Work Gloves", size: "L", category: "Safety", cp: 3.50, sp: 8.50 },
            { name: "LED Work Light", size: "1000 lumen", category: "Lighting", cp: 22.00, sp: 45.00 },
            { name: "Measuring Tape", size: "25 ft", category: "Tools", cp: 6.00, sp: 14.50 },
            { name: "Utility Knife", size: "Standard", category: "Tools", cp: 2.50, sp: 6.99 },
            { name: "Duct Tape", size: "2 inch", category: "Supplies", cp: 1.50, sp: 4.50 },
            { name: "WD-40", size: "12 oz", category: "Supplies", cp: 3.80, sp: 8.99 }
        ];

        // Insert products and build a map of inserted products to use for sales/purchases
        const products: any[] = [];
        for (const p of productsRaw) {
            // Assign a random current quantity: 0 (out of stock), 1-20 (low), 21-100 (healthy)
            let currentQty = 0;
            const rand = Math.random();
            if (rand < 0.1) currentQty = 0; // 10% chance Out of Stock
            else if (rand < 0.3) currentQty = Math.floor(Math.random() * 20) + 1; // 20% chance Low Stock
            else currentQty = Math.floor(Math.random() * 80) + 21; // Healthy stock

            const res = await client.query(
                `INSERT INTO products (name, size, category, purchase_price, selling_price, quantity) 
                 VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
                [p.name, p.size, p.category, p.cp, p.sp, currentQty]
            );
            products.push(res.rows[0]);
        }

        // 3. Seed Purchases (Inventory acquisition over 6 months)
        const suppliers = ["Acme Hardware Corp", "Global Supply Inc", "FastTools Distributors", "SafetyFirst Gear"];

        for (let m = 6; m >= 0; m--) {
            // 2-5 purchases per month
            const numPurchases = Math.floor(Math.random() * 4) + 2;
            for (let i = 0; i < numPurchases; i++) {
                const product = products[Math.floor(Math.random() * products.length)];
                const supplier = suppliers[Math.floor(Math.random() * suppliers.length)];
                const qty = Math.floor(Math.random() * 100) + 20; // Buy 20-120 items at a time
                const date = getRandomDate(m + 1, m); // Random date strictly within that specific month window

                await client.query(
                    `INSERT INTO purchases (supplier_name, product_name, size, purchase_price, quantity, date)
                     VALUES ($1, $2, $3, $4, $5, $6)`,
                    [supplier, product.name, product.size, product.purchase_price, qty, date]
                );
            }
        }

        // 4. Seed Sales (Over 6 months)
        const clients = ["John Doe Construction", "Jane Smith Renovations", "Bob Builder LLC", "Alice Handyman", "Charlie's Plumbing", "Walk-in Customer"];

        for (let m = 6; m >= 0; m--) {
            // 10-30 sales per month to show volume
            const numSales = Math.floor(Math.random() * 21) + 10;
            for (let i = 0; i < numSales; i++) {
                const product = products[Math.floor(Math.random() * products.length)];
                const clientName = clients[Math.floor(Math.random() * clients.length)];
                const qty = Math.floor(Math.random() * 5) + 1; // Sell 1-5 items
                const date = getRandomDate(m + 1, m);

                // Determine flags
                // Pending orders: 5% chance
                const isOrder = Math.random() < 0.05;
                // Loans: 15% chance
                const status = Math.random() < 0.15;

                await client.query(
                    `INSERT INTO sales (client_name, product_name, size, quantity, selling_price, status, "order", date)
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
                    [clientName, product.name, product.size, qty, product.selling_price, status, isOrder, date]
                );
            }
        }

        // 5. Seed Expenses
        const expenseTypes = [
            { name: "Monthly Rent", amount: 1500.00 },
            { name: "Electricity Bill", amount: 250.00 },
            { name: "Internet", amount: 80.00 },
            { name: "Office Supplies", amount: 45.50 },
            { name: "Marketing Flyer Print", amount: 120.00 },
            { name: "Vehicle Fuel", amount: 65.00 },
            { name: "Store Maintenance", amount: 200.00 }
        ];

        for (let m = 6; m >= 0; m--) {
            // Always pay rent, electricity, internet each month
            const fixedExpenses = [expenseTypes[0], expenseTypes[1], expenseTypes[2]];
            for (const fe of fixedExpenses) {
                const date = getRandomDate(m + 1, m);
                // add slight variation to amount (except rent)
                const amt = fe.name === "Monthly Rent" ? fe.amount : fe.amount + (Math.random() * 20 - 10);

                await client.query(
                    `INSERT INTO expenses (person_name, description, amount, date)
                     VALUES ($1, $2, $3, $4)`,
                    ["Admin", Math.random() < 0.5 ? fe.name : fe.name + " Payment", Math.abs(amt), date]
                );
            }

            // 1-3 random variable expenses per month
            const numVarExp = Math.floor(Math.random() * 3) + 1;
            for (let i = 0; i < numVarExp; i++) {
                // Pick one of the remaining expenses
                const ve = expenseTypes[Math.floor(Math.random() * 4) + 3];
                const date = getRandomDate(m + 1, m);
                const amt = ve.amount + (Math.random() * 30 - 15);

                await client.query(
                    `INSERT INTO expenses (person_name, description, amount, date)
                     VALUES ($1, $2, $3, $4)`,
                    ["Employee Handled", ve.name, Math.abs(amt), date]
                );
            }
        }

        await client.query("COMMIT");

        return NextResponse.json({
            message: "Database successfully seeded with 6 months of historical data.",
            productsCount: productsRaw.length,
            note: "Please refresh the page to see the updated data."
        });

    } catch (error) {
        await client.query("ROLLBACK");
        console.error("GET /api/seed error:", error);
        return NextResponse.json({ error: "Failed to seed database." }, { status: 500 });
    } finally {
        client.release();
    }
}
