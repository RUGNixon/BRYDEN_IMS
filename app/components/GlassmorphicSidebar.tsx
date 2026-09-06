"use client";

import React, { useState, useRef, useEffect, useId } from "react";
import Link from "next/link";
import {
  Home,
  Ruler,
  BarChart3,
  Package,
  Layers,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  LucideIcon,
} from "lucide-react";

export interface NavItem {
  id: string;
  label: string;
  icon: LucideIcon;
  href?: string;
  badge?: string | number;
}

export interface GlassmorphicSidebarProps {
  /** Array of navigation items */
  items?: NavItem[];
  /** Currently active item ID (controlled) */
  activeId?: string;
  /** Callback fired when an item is selected */
  onSelect?: (id: string, item: NavItem) => void;
  /** Whether the sidebar is collapsed into a rail (controlled) */
  isCollapsed?: boolean;
  /** Callback fired when collapse toggle is clicked */
  onToggleCollapse?: (collapsed: boolean) => void;
  /** Default collapsed state (uncontrolled) */
  defaultCollapsed?: boolean;
  /** Optional custom title or logo component */
  brandLogo?: React.ReactNode;
  brandTitle?: string;
  /** Optional footer content or user profile component */
  footer?: React.ReactNode;
  /** Additional container CSS class names */
  className?: string;
  /** Hex color for matte gold active indicator (defaults to #C5A059) */
  goldColor?: string;
}

// Default items matching the prompt requirements ("Home", "Measure", etc.)
export const DEFAULT_NAV_ITEMS: NavItem[] = [
  { id: "home", label: "Home", icon: Home, href: "#home" },
  { id: "measure", label: "Measure", icon: Ruler, href: "#measure" },
  { id: "analytics", label: "Analytics", icon: BarChart3, href: "#analytics" },
  { id: "inventory", label: "Inventory", icon: Package, href: "#inventory", badge: "12" },
  { id: "layers", label: "Workflows", icon: Layers, href: "#workflows" },
  { id: "settings", label: "Settings", icon: Settings, href: "#settings" },
];

export default function GlassmorphicSidebar({
  items = DEFAULT_NAV_ITEMS,
  activeId: controlledActiveId,
  onSelect,
  isCollapsed: controlledCollapsed,
  onToggleCollapse,
  defaultCollapsed = false,
  brandLogo,
  brandTitle = "Aura Studio",
  footer,
  className = "",
  goldColor = "#C5A059",
}: GlassmorphicSidebarProps) {
  // Internal state for uncontrolled mode
  const [internalActiveId, setInternalActiveId] = useState<string>(
    items[0]?.id || "home"
  );
  const [internalCollapsed, setInternalCollapsed] = useState<boolean>(defaultCollapsed);

  const activeId = controlledActiveId !== undefined ? controlledActiveId : internalActiveId;
  const isCollapsed = controlledCollapsed !== undefined ? controlledCollapsed : internalCollapsed;

  // Active indicator positioning
  const navContainerRef = useRef<HTMLDivElement>(null);
  const [indicatorStyle, setIndicatorStyle] = useState<{ top: number; height: number; ready: boolean }>({
    top: 0,
    height: 48,
    ready: false,
  });

  const uniqueId = useId();

  // Recalculate indicator position on active change, resize, or collapse change
  useEffect(() => {
    if (!navContainerRef.current) return;

    const activeButton = navContainerRef.current.querySelector<HTMLElement>(
      `[data-nav-id="${activeId}"]`
    );

    if (activeButton) {
      const containerRect = navContainerRef.current.getBoundingClientRect();
      const buttonRect = activeButton.getBoundingClientRect();

      setIndicatorStyle({
        top: buttonRect.top - containerRect.top,
        height: buttonRect.height,
        ready: true,
      });
    }
  }, [activeId, isCollapsed, items]);

  const handleItemClick = (item: NavItem, e: React.MouseEvent) => {
    if (!item.href || item.href.startsWith("#")) {
      e.preventDefault();
    }
    if (controlledActiveId === undefined) {
      setInternalActiveId(item.id);
    }
    onSelect?.(item.id, item);
  };

  const handleToggleCollapse = () => {
    const nextState = !isCollapsed;
    if (controlledCollapsed === undefined) {
      setInternalCollapsed(nextState);
    }
    onToggleCollapse?.(nextState);
  };

  return (
    <aside
      aria-label="Sidebar Navigation"
      className={`relative flex flex-col h-full select-none
        transition-all duration-300 ease-in-out
        ${isCollapsed ? "w-20" : "w-64"}
        /* Glassmorphism styling */
        bg-neutral-900/60 dark:bg-neutral-950/70
        backdrop-blur-xl backdrop-saturate-150
        border border-white/10
        shadow-2xl shadow-black/40
        rounded-3xl
        overflow-hidden
        ${className}
      `}
    >
      {/* Top Brand Header */}
      <div
        className={`h-16 shrink-0 flex items-center border-b border-white/10 px-4 transition-all duration-300 ease-in-out ${
          isCollapsed ? "justify-center" : "justify-between"
        }`}
      >
        <div className="flex items-center gap-3 overflow-hidden">
          {brandLogo ? (
            brandLogo
          ) : (
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border border-white/15 shadow-inner transition-transform duration-300 hover:scale-105"
              style={{
                background: `linear-gradient(135deg, ${goldColor} 0%, #9E7D3B 100%)`,
              }}
            >
              <Sparkles className="w-5 h-5 text-neutral-950" />
            </div>
          )}

          {!isCollapsed && (
            <div className="flex flex-col overflow-hidden whitespace-nowrap">
              <span className="font-semibold text-sm tracking-wide text-white font-sans">
                {brandTitle}
              </span>
              <span className="text-[11px] text-neutral-400 tracking-wider uppercase">
                Enterprise Suite
              </span>
            </div>
          )}
        </div>

        {/* Collapse / Expand Toggle Button */}
        {!isCollapsed && (
          <button
            type="button"
            onClick={handleToggleCollapse}
            aria-label="Collapse sidebar"
            className="p-1.5 rounded-xl text-neutral-400 hover:text-white hover:bg-white/10 transition-all duration-200 cursor-pointer"
            title="Collapse sidebar"
          >
            <ChevronLeft size={18} />
          </button>
        )}
      </div>

      {/* Nav List Container */}
      <div
        ref={navContainerRef}
        className="relative flex-1 py-4 flex flex-col gap-1.5 overflow-y-auto overflow-x-hidden scrollbar-none"
      >
        {/*
          ========================================================================
          SLIDING ACTIVE INDICATOR WITH INVERTED INNER-CORNER FILLETS
          Strictly bounded within the sidebar container (right-0, rounded-l-2xl).
          It does not bleed past the right edge of the panel.
          ========================================================================
        */}
        {indicatorStyle.ready && (
          <div
            aria-hidden="true"
            className="absolute left-3 right-0 rounded-l-2xl pointer-events-none transition-all duration-300 ease-in-out z-10"
            style={{
              top: `${indicatorStyle.top}px`,
              height: `${indicatorStyle.height}px`,
              backgroundColor: goldColor, // Solid matte muted gold (#C5A059)
              boxShadow: "0 4px 20px -2px rgba(197, 160, 89, 0.25)",
            }}
          >
            {/*
              TOP INVERTED FILLET
              Vector SVG creating a concave inner fillet between the top of the active
              tab and the vertical right frame of the sidebar.
              M20 0 L20 20 L0 20 A20 20 0 0 0 20 0 Z
            */}
            <svg
              viewBox="0 0 20 20"
              className="absolute right-0 -top-5 w-5 h-5 pointer-events-none"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M20 0 L20 20 L0 20 A20 20 0 0 0 20 0 Z"
                fill={goldColor}
              />
            </svg>

            {/*
              BOTTOM INVERTED FILLET
              Vector SVG creating a concave inner fillet between the bottom of the active
              tab and the vertical right frame of the sidebar.
              M20 20 L20 0 L0 0 A20 20 0 0 1 20 20 Z
            */}
            <svg
              viewBox="0 0 20 20"
              className="absolute right-0 -bottom-5 w-5 h-5 pointer-events-none"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M20 20 L20 0 L0 0 A20 20 0 0 1 20 20 Z"
                fill={goldColor}
              />
            </svg>
          </div>
        )}

        {/* Navigation Items */}
        {items.map((item) => {
          const isActive = activeId === item.id;
          const Icon = item.icon;
          const tooltipId = `tooltip-${uniqueId}-${item.id}`;

          const content = (
            <>
              {/* Icon Container */}
              <div
                className={`relative flex items-center justify-center shrink-0 transition-all duration-300 ease-in-out ${
                  isCollapsed ? "w-full" : "w-6 h-6"
                }`}
              >
                <Icon
                  size={20}
                  className={`transition-colors duration-300 ease-in-out ${
                    isActive
                      ? "text-emerald-950 dark:text-neutral-950 font-bold"
                      : "text-slate-400 group-hover:text-white"
                  }`}
                  strokeWidth={isActive ? 2.5 : 2}
                />
              </div>

              {/* Label & Badge (Expanded State) */}
              {!isCollapsed && (
                <div className="flex-1 flex items-center justify-between overflow-hidden pr-2">
                  <span
                    className={`text-sm font-medium tracking-wide truncate transition-colors duration-300 ease-in-out ${
                      isActive
                        ? "text-emerald-950 dark:text-neutral-950 font-bold tracking-tight"
                        : "text-slate-300 group-hover:text-white"
                    }`}
                  >
                    {item.label}
                  </span>

                  {item.badge && (
                    <span
                      className={`text-[11px] px-2 py-0.5 rounded-full font-semibold transition-all duration-300 ${
                        isActive
                          ? "bg-neutral-950/20 text-neutral-950"
                          : "bg-white/10 text-neutral-300 group-hover:bg-white/15 group-hover:text-white"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>
              )}

              {/* Tooltip for Collapsed Rail State */}
              {isCollapsed && (
                <div
                  id={tooltipId}
                  role="tooltip"
                  className="absolute left-full ml-4 px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap
                    bg-neutral-900/90 text-white backdrop-blur-md border border-white/10 shadow-xl
                    opacity-0 pointer-events-none -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0
                    transition-all duration-200 ease-out z-50 flex items-center gap-2"
                >
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/15 text-neutral-200">
                      {item.badge}
                    </span>
                  )}
                </div>
              )}
            </>
          );

          // Render Link if href is a real route, otherwise interactive button
          const itemClasses = `
            group relative flex items-center h-12 select-none cursor-pointer
            transition-all duration-300 ease-in-out
            z-20
            ${isCollapsed ? "justify-center px-0 mx-3 rounded-2xl" : "gap-3 px-4 mx-3 rounded-l-2xl"}
            ${
              isActive
                ? "font-semibold"
                : "hover:bg-[#C5A059]/10 text-slate-300 hover:text-white"
            }
          `;

          if (item.href && !item.href.startsWith("#")) {
            return (
              <Link
                key={item.id}
                href={item.href}
                data-nav-id={item.id}
                onClick={(e) => handleItemClick(item, e)}
                className={itemClasses}
                aria-current={isActive ? "page" : undefined}
                aria-describedby={isCollapsed ? tooltipId : undefined}
              >
                {content}
              </Link>
            );
          }

          return (
            <button
              key={item.id}
              type="button"
              data-nav-id={item.id}
              onClick={(e) => handleItemClick(item, e)}
              className={itemClasses}
              aria-current={isActive ? "true" : undefined}
              aria-describedby={isCollapsed ? tooltipId : undefined}
            >
              {content}
            </button>
          );
        })}
      </div>

      {/* Expand Button in Collapsed Rail */}
      {isCollapsed && (
        <div className="shrink-0 p-2 flex justify-center border-t border-white/10">
          <button
            type="button"
            onClick={handleToggleCollapse}
            aria-label="Expand sidebar"
            className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-white/10 transition-all duration-200 cursor-pointer"
            title="Expand sidebar"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      )}

      {/* Optional Custom Footer / User Section */}
      {footer ? (
        <div className="shrink-0 border-t border-white/10">{footer}</div>
      ) : (
        <div
          className={`shrink-0 p-3 border-t border-white/10 flex items-center transition-all duration-300 ease-in-out ${
            isCollapsed ? "justify-center" : "gap-3 px-4"
          }`}
        >
          <div className="relative">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs text-neutral-950 shrink-0 border border-white/20"
              style={{ backgroundColor: goldColor }}
            >
              BY
            </div>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-neutral-900" />
          </div>

          {!isCollapsed && (
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-semibold text-white truncate">
                Bryden Studio
              </span>
              <span className="text-[11px] text-neutral-400 truncate">
                admin@bryden.ims
              </span>
            </div>
          )}
        </div>
      )}
    </aside>
  );
}
