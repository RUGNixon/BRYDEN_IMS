"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Package,
    ShoppingCart,
    Truck,
    ReceiptText,
    ClipboardList,
    LineChart,
    Settings
} from "lucide-react";

const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Products", href: "/products", icon: Package },
    { name: "Sales", href: "/sales", icon: ShoppingCart },
    { name: "Purchase", href: "/purchase", icon: Truck },
    { name: "Expenses", href: "/expenses", icon: ReceiptText },
    { name: "Orders & Loans", href: "/orders", icon: ClipboardList },
    { name: "Analytics", href: "/analytics", icon: LineChart },
    { name: "Settings", href: "/settings", icon: Settings },
];

export default function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="w-64 h-screen bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800 shadow-xl transition-all duration-300">
            <div className="h-16 flex items-center px-6 border-b border-slate-800 mb-6 font-bold text-xl tracking-wider text-white">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-500">
                    Bryden IMS
                </span>
            </div>
            <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
                {navItems.map((item) => {
                    const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== "/");
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 px-3 py-3 mt-1 rounded-xl transition-all duration-300 group ${isActive
                                ? "bg-indigo-600/10 text-indigo-400 font-medium"
                                : "hover:bg-slate-800 hover:text-white"
                                }`}
                        >
                            <Icon
                                size={20}
                                className={`transition-colors duration-300 ${isActive ? "text-indigo-400" : "text-slate-500 group-hover:text-indigo-300"
                                    }`}
                            />
                            {item.name}
                        </Link>
                    );
                })}
            </nav>
            <div className="p-4 border-t border-slate-800 text-sm text-slate-500 text-center">
                &copy; 2026 Bryden Inc.
            </div>
        </aside>
    );
}
