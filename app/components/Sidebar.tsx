"use client";

import { useState, useRef, useEffect, useId } from "react";
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
  CalendarDays,
  ChevronRight,
  LogOut,
} from "lucide-react";
import { useLanguage } from "@/app/context/LanguageContext";
import { useTheme } from "@/app/context/ThemeContext";
import { useAuth } from "@/app/context/AuthContext";

/**
 * ─── Design Tokens ────────────────────────────────────────────────────────────
 *
 * The sidebar surface is ALWAYS the dark-mode palette, regardless of the app
 * theme. Only the ACTIVE INDICATOR changes to match the current page-background
 * colour so the tab blends seamlessly into the content area on either side:
 *
 *   Light mode page bg → #ffffff   (CSS :root { --background })
 *   Dark  mode page bg → #00002b   (CSS :root.dark { --background })
 */
const INDICATOR_LIGHT = "#ffffff";
const INDICATOR_DARK  = "#00002b";
const FILLET_R        = 20; // px — inverted-corner arc radius

/** ─── Types ──────────────────────────────────────────────────────────────── */
interface NavItem {
  name: string;
  href: string;
  icon: React.FC<{ size?: number; strokeWidth?: number; className?: string }>;
  badge?: string | number;
}

/** ─── Component ──────────────────────────────────────────────────────────── */
export default function Sidebar() {
  const pathname  = usePathname();
  const { t }     = useLanguage();
  const { theme } = useTheme();
  const { user, logout } = useAuth();
  const uniqueId  = useId();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  /**
   * The ONE value that reacts to the theme toggle.
   * Everything else is hardcoded to the dark palette.
   */
  const indicatorColor = theme === "dark" ? INDICATOR_DARK : INDICATOR_LIGHT;

  // ── Nav items ──────────────────────────────────────────────────────────────
  const navItems: NavItem[] = [
    { name: t("navDashboard"), href: "/dashboard",  icon: LayoutDashboard },
    { name: t("navProducts"),  href: "/products",   icon: Package },
    { name: t("navSales"),     href: "/sales",      icon: ShoppingCart },
    { name: t("navPurchase"),  href: "/purchase",   icon: Truck },
    { name: t("navExpenses"),  href: "/expenses",   icon: ReceiptText },
    { name: t("navOrders"),    href: "/orders",     icon: ClipboardList },
    { name: t("navTaxation"),  href: "/taxes",      icon: Calculator },
    { name: t("navAnalytics"), href: "/analytics",  icon: LineChart },
    { name: t("navNotes"),     href: "/notes",      icon: NotebookPen },
    { name: t("navCalendar"),  href: "/calendar",   icon: CalendarDays },
    { name: t("navSettings"),  href: "/settings",   icon: Settings },
  ];

  // ── Active href — longest-prefix match ────────────────────────────────────
  function getActiveHref(): string {
    let matched = "";
    for (const item of navItems) {
      if (
        (pathname === item.href ||
          (pathname.startsWith(item.href + "/") && item.href !== "/")) &&
        item.href.length > matched.length
      ) {
        matched = item.href;
      }
    }
    return matched || navItems[0].href;
  }
  const activeHref = getActiveHref();

  // ── Sliding indicator position ─────────────────────────────────────────────
  const navContainerRef = useRef<HTMLDivElement>(null);
  const [indicator, setIndicator] = useState<{
    top: number; height: number; ready: boolean;
  }>({ top: 0, height: 48, ready: false });

  function measureIndicator() {
    const container = navContainerRef.current;
    if (!container) return;
    const activeEl = container.querySelector<HTMLElement>(
      `[data-sidebar-href="${activeHref}"]`
    );
    if (!activeEl) return;
    const cRect = container.getBoundingClientRect();
    const eRect = activeEl.getBoundingClientRect();
    setIndicator({
      top:    eRect.top - cRect.top + container.scrollTop,
      height: eRect.height,
      ready:  true,
    });
  }

  // Re-measure on active route change or collapse toggle
  useEffect(() => { measureIndicator(); /* eslint-disable-next-line */ }, [activeHref, isCollapsed]);

  // Re-measure after theme switch (paint is async; small delay required)
  useEffect(() => {
    setIndicator((p) => ({ ...p, ready: false }));
    const id = setTimeout(measureIndicator, 50);
    return () => clearTimeout(id);
  /* eslint-disable-next-line */
  }, [theme]);

  return (
    <aside
      aria-label="Main navigation"
      className={`
        relative flex flex-col shrink-0 z-50
        transition-all duration-300 ease-in-out
        ${isCollapsed ? "w-20" : "w-64"}
        /* Floating panel — margin exposes all four rounded corners */
        my-3 ml-3 h-[calc(100dvh-24px)]
        /* ── ALWAYS dark palette ───────────────────────────────── */
        bg-slate-900eeee
        shadow-xl shadow-black/40
        rounded-2xl overflow-hidden
      `}
    >

      {/* ── Brand / Header ──────────────────────────────────────────────── */}
      <div
        className={`
          h-14 shrink-0 flex items-center gap-3
          border-b border-slate-800
          transition-all duration-300 ease-in-out
          ${isCollapsed ? "justify-center px-0" : "px-4"}
        `}
      >
        {/* Indigo logo mark */}
        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-gradient-to-br from-indigo-500 to-indigo-700 shadow-md shadow-indigo-900/40">
          <svg
            xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
            fill="none" stroke="white" strokeWidth="2.5"
            strokeLinecap="round" strokeLinejoin="round"
            className="w-[18px] h-[18px]"
          >
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
        </div>

        {/* Wordmark (expanded only) */}
        {!isCollapsed && (
          <div className="flex flex-col overflow-hidden whitespace-nowrap min-w-0 flex-1">
            <span className="text-sm font-bold tracking-wide text-white truncate leading-tight">
              Bryden IMS
            </span>
            <span className="text-[10px] text-slate-500 tracking-widest uppercase truncate">
              {t("tagline") ?? "Enterprise Suite"}
            </span>
          </div>
        )}

        {/* Collapse button (expanded only) */}
        {!isCollapsed && (
          <button
            type="button"
            onClick={() => setIsCollapsed(true)}
            aria-label="Collapse sidebar"
            className="p-1.5 rounded-xl text-slate-500 hover:text-white hover:bg-slate-800 transition-all duration-200 cursor-pointer shrink-0"
            title="Collapse sidebar"
          >
            <Menu size={18} />
          </button>
        )}
      </div>

      {/* ── Navigation list ─────────────────────────────────────────────── */}
      <div
        ref={navContainerRef}
        className="relative flex-1 py-2.5 flex flex-col overflow-y-auto overflow-x-hidden sidebar-scroll"
        style={{ gap: "1px" }}
      >
        {/*
         * ── SLIDING ACTIVE INDICATOR ──────────────────────────────────────
         *
         * Background = current page-bg colour → creates a "cutout tab" effect.
         * The tab appears to pop out of the sidebar frame and merge with the
         * content area. The two SVG fillets complete the concave inner-corner
         * geometry so there are no hard right-angle joints.
         *
         * Strictly bounded: left-3 right-0 — never bleeds past the sidebar edge.
         */}
        {indicator.ready && (
          <div
            aria-hidden="true"
            className="absolute left-3 right-0 pointer-events-none transition-all duration-300 ease-in-out z-10 rounded-l-xl"
            style={{
              top:             `${indicator.top}px`,
              height:          `${indicator.height}px`,
              backgroundColor: indicatorColor,
              boxShadow:       "-4px 0 14px rgba(0,0,0,0.45), 0 0 0 1px rgba(99,102,241,0.14)",
            }}
          >
            {/* TOP inverted inner-corner fillet */}
            <svg
              viewBox={`0 0 ${FILLET_R} ${FILLET_R}`}
              className="absolute right-0 pointer-events-none"
              style={{ top: -FILLET_R, width: FILLET_R, height: FILLET_R }}
              aria-hidden="true"
            >
              <path
                d={`M${FILLET_R} 0 L${FILLET_R} ${FILLET_R} L0 ${FILLET_R} A${FILLET_R} ${FILLET_R} 0 0 0 ${FILLET_R} 0 Z`}
                fill={indicatorColor}
              />
            </svg>

            {/* BOTTOM inverted inner-corner fillet */}
            <svg
              viewBox={`0 0 ${FILLET_R} ${FILLET_R}`}
              className="absolute right-0 pointer-events-none"
              style={{ bottom: -FILLET_R, width: FILLET_R, height: FILLET_R }}
              aria-hidden="true"
            >
              <path
                d={`M${FILLET_R} ${FILLET_R} L${FILLET_R} 0 L0 0 A${FILLET_R} ${FILLET_R} 0 0 1 ${FILLET_R} ${FILLET_R} Z`}
                fill={indicatorColor}
              />
            </svg>
          </div>
        )}

        {/* ── Individual nav links ─────────────────────────────────────── */}
        {navItems.map((item) => {
          const isActive = item.href === activeHref;
          const Icon     = item.icon;
          const tipId    = `tip-${uniqueId}-${item.href.replace(/\//g, "")}`;

          return (
            <Link
              key={item.href}
              href={item.href}
              data-sidebar-href={item.href}
              aria-current={isActive ? "page" : undefined}
              aria-describedby={isCollapsed ? tipId : undefined}
              className={`
                group relative flex items-center h-12 z-20 cursor-pointer
                transition-all duration-300 ease-in-out
                ${isCollapsed
                  ? "justify-center mx-3 rounded-xl"
                  : "gap-3 mx-3 pl-3 pr-2 rounded-l-xl"
                }
                ${!isActive && "hover:bg-slate-800/80 hover:text-white"}
              `}
            >
              {/* Icon */}
              <Icon
                size={20}
                strokeWidth={isActive ? 2.5 : 2}
                className={`
                  shrink-0 transition-colors duration-300 ease-in-out
                  ${isActive
                    ? "text-indigo-400"
                    : "text-slate-500 group-hover:text-slate-200"
                  }
                `}
              />

              {/* Label (expanded only) */}
              {!isCollapsed && (
                <span
                  className={`
                    flex-1 text-sm truncate transition-colors duration-300 ease-in-out
                    ${isActive
                      ? "font-semibold text-indigo-400"
                      : "font-medium text-slate-400 group-hover:text-white"
                    }
                  `}
                >
                  {item.name}
                </span>
              )}

              {/* Badge (expanded only) */}
              {!isCollapsed && item.badge && (
                <span
                  className={`
                    text-[10px] px-2 py-0.5 rounded-full font-bold shrink-0
                    transition-all duration-300
                    ${isActive
                      ? "bg-indigo-950 text-indigo-400"
                      : "bg-slate-800 text-slate-400"
                    }
                  `}
                >
                  {item.badge}
                </span>
              )}

              {/* Tooltip (collapsed / rail mode) */}
              {isCollapsed && (
                <div
                  id={tipId}
                  role="tooltip"
                  className="
                    absolute left-full ml-3 px-3 py-1.5 rounded-xl text-xs font-semibold
                    whitespace-nowrap z-50 pointer-events-none
                    bg-slate-800 text-white border border-slate-700
                    shadow-lg shadow-black/40
                    opacity-0 -translate-x-1
                    group-hover:opacity-100 group-hover:translate-x-0
                    transition-all duration-200 ease-out
                  "
                >
                  {item.name}
                </div>
              )}
            </Link>
          );
        })}
      </div>

      {/* ── Expand button (collapsed / rail mode only) ──────────────────── */}
      {isCollapsed && (
        <div className="shrink-0 flex justify-center py-2 border-t border-slate-800">
          <button
            type="button"
            onClick={() => setIsCollapsed(false)}
            aria-label="Expand sidebar"
            className="p-2 rounded-xl text-slate-500 hover:text-white hover:bg-slate-800 transition-all duration-200 cursor-pointer"
            title="Expand sidebar"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      )}

      {/* ── Footer / User badge & Sign Out ──────────────────────────────────── */}
      {(() => {
        const initials = user?.name
          ? user.name
              .split(" ")
              .filter(Boolean)
              .map((n) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2)
          : "BY";
        const roleLabel = user?.role === "admin" ? "Admin" : user?.role === "manager" ? "Manager" : "Staff";

        return (
          <div
            className={`
              shrink-0 border-t border-slate-800 flex items-center justify-between
              transition-all duration-300 ease-in-out
              ${isCollapsed ? "flex-col gap-2 p-2.5" : "px-3 py-2.5"}
            `}
          >
            {/* User Info & Avatar */}
            <div className={`flex items-center min-w-0 ${isCollapsed ? "justify-center" : "gap-2.5 flex-1"}`}>
              <div className="relative shrink-0" title={`${user?.name || "Bryden User"} (${roleLabel})`}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-[11px] text-white bg-gradient-to-br from-indigo-500 to-indigo-700 border border-indigo-800/50 shadow-xs">
                  {initials}
                </div>
                <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-slate-900" />
              </div>

              {!isCollapsed && (
                <div className="flex flex-col min-w-0 flex-1 overflow-hidden">
                  <span className="text-xs font-bold text-white truncate leading-tight">
                    {user?.name || "Bryden Admin"}
                  </span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span
                      className={`text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded-full tracking-wider ${
                        user?.role === "admin"
                          ? "bg-indigo-950 text-indigo-400 border border-indigo-800/60"
                          : "bg-emerald-950 text-emerald-400 border border-emerald-800/60"
                      }`}
                    >
                      {roleLabel}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Logout Button */}
            <button
              type="button"
              onClick={async () => {
                if (isLoggingOut) return;
                setIsLoggingOut(true);
                await logout();
              }}
              title={t("authSignOut")}
              aria-label={t("authSignOut")}
              className={`
                rounded-xl text-slate-400 hover:text-red-400 hover:bg-slate-800/80 transition-all duration-200 cursor-pointer shrink-0
                ${isCollapsed ? "p-1.5" : "p-2"}
              `}
            >
              <LogOut size={16} />
            </button>
          </div>
        );
      })()}
    </aside>
  );
}
