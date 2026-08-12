"use client";

import { useState } from "react";
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
    Settings,
    Calculator,
    Menu,
    NotebookPen,
    CalendarDays
} from "lucide-react";

const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Products", href: "/products", icon: Package },
    { name: "Sales", href: "/sales", icon: ShoppingCart },
    { name: "Purchase", href: "/purchase", icon: Truck },
    { name: "Expenses", href: "/expenses", icon: ReceiptText },
    { name: "Orders & Loans", href: "/orders", icon: ClipboardList },
    { name: "Taxation", href: "/taxes", icon: Calculator },
    { name: "Analytics", href: "/analytics", icon: LineChart },
    { name: "Notes", href: "/notes", icon: NotebookPen },
    { name: "Calendar", href: "/calendar", icon: CalendarDays },
    { name: "Settings", href: "/settings", icon: Settings },
];

const navGapRem = 0.25;
const navFixedHeightRem = 6 + (navItems.length - 1) * navGapRem;
const navItemHeight = `clamp(1.5rem, calc((100dvh - ${navFixedHeightRem}rem) / ${navItems.length}), 2.5rem)`;

export default function Sidebar() {
    const pathname = usePathname();
    const [isCollapsed, setIsCollapsed] = useState(false);

    return (
        <aside className={`${isCollapsed ? "w-20" : "w-64"} h-[100dvh] overflow-hidden bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800 shadow-xl transition-all duration-300 relative z-50`}>
            <div className={`h-12 shrink-0 flex items-center border-b border-slate-800 font-bold text-lg tracking-wider text-white ${isCollapsed ? "justify-center px-0" : "justify-between px-4"}`}>
                {!isCollapsed && (
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-500 overflow-hidden whitespace-nowrap">
                        Bryden IMS
                    </span>
                )}
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="text-slate-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-slate-800 shrink-0"
                    title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
                >
                    <Menu size={20} />
                </button>
            </div>

            <nav className="flex-1 min-h-0 px-2 py-1.5 flex flex-col justify-between gap-1">
                {navItems.map((item) => {
                    const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== "/");
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center min-h-6 text-sm leading-none ${isCollapsed ? "justify-center px-0" : "gap-3 px-3"} rounded-lg transition-all duration-300 group relative ${isActive
                                ? "bg-indigo-600/10 text-indigo-400 font-medium"
                                : "hover:bg-slate-800 hover:text-white"
                                }`}
                            style={{
                                height: navItemHeight,
                            }}
                        >
                            <Icon
                                size={20}
                                className={`shrink-0 transition-colors duration-300 ${isActive ? "text-indigo-400" : "text-slate-500 group-hover:text-indigo-300"
                                    }`}
                            />
                            {!isCollapsed && <span className="truncate">{item.name}</span>}

                            {isCollapsed && (
                                <div className="absolute left-full ml-4 px-2.5 py-1.5 bg-slate-800 text-white text-xs rounded-md shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 whitespace-nowrap z-50 transition-all duration-200">
                                    {item.name}
                                </div>
                            )}
                        </Link>
                    );
                })}
            </nav>

            <div className="h-9 shrink-0 flex items-center justify-center border-t border-slate-800 px-2 text-xs text-slate-500 text-center transition-all">
                {isCollapsed ? "2026" : "(c) 2026 Bryden Inc."}
            </div>
        </aside>
    );
}
