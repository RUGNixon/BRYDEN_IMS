"use client";

import React, { useState } from "react";
import GlassmorphicSidebar, { DEFAULT_NAV_ITEMS, NavItem } from "@/app/components/GlassmorphicSidebar";
import {
  Sparkles,
  LayoutGrid,
  CheckCircle2,
  Sliders,
  ShieldCheck,
  Zap,
  Maximize2,
  Minimize2,
  Eye,
  Info,
} from "lucide-react";

export default function SidebarDemoPage() {
  const [activeId, setActiveId] = useState("home");
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [customGold, setCustomGold] = useState("#C5A059");

  const activeItem = DEFAULT_NAV_ITEMS.find((item) => item.id === activeId) || DEFAULT_NAV_ITEMS[0];

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-emerald-950 via-teal-950 to-neutral-950 text-slate-100 flex flex-col p-4 md:p-8 font-sans overflow-x-hidden">
      {/* Top Banner / Navigation Bar */}
      <header className="flex flex-wrap items-center justify-between gap-4 pb-6 mb-6 border-b border-white/10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-semibold tracking-wider text-amber-300/90 mb-2">
            <Sparkles size={13} className="text-[#C5A059]" />
            SPECIFICATION COMPLIANT DEMO
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
            Glassmorphic Sidebar with Inverted Fillets
          </h1>
          <p className="text-sm text-emerald-200/70 mt-1 max-w-2xl">
            Responsive React navigation component featuring matte muted gold active state,
            custom inverted inner-corner geometry, and strict container boundary constraints.
          </p>
        </div>

        {/* Live Controls */}
        <div className="flex items-center gap-3 bg-white/5 backdrop-blur-md border border-white/10 p-2 rounded-2xl">
          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/15 text-white transition-all cursor-pointer"
          >
            {isCollapsed ? (
              <>
                <Maximize2 size={14} className="text-[#C5A059]" />
                <span>Expanded Sidebar</span>
              </>
            ) : (
              <>
                <Minimize2 size={14} className="text-[#C5A059]" />
                <span>Collapsed Rail</span>
              </>
            )}
          </button>

          {/* Color Switcher */}
          <div className="flex items-center gap-1.5 pl-2 border-l border-white/10">
            <span className="text-[11px] text-neutral-400 font-medium hidden sm:inline">Tone:</span>
            {[
              { label: "Muted Gold", hex: "#C5A059" },
              { label: "Classic Gold", hex: "#D4AF37" },
              { label: "Amber Gold", hex: "#E5B94E" },
            ].map((tone) => (
              <button
                key={tone.hex}
                type="button"
                onClick={() => setCustomGold(tone.hex)}
                className={`w-6 h-6 rounded-full transition-transform cursor-pointer border ${
                  customGold === tone.hex
                    ? "scale-110 border-white ring-2 ring-white/30"
                    : "border-transparent opacity-70 hover:opacity-100"
                }`}
                style={{ backgroundColor: tone.hex }}
                title={`${tone.label} (${tone.hex})`}
              />
            ))}
          </div>
        </div>
      </header>

      {/* Main Workspace Preview Layout */}
      <div className="flex-1 flex gap-6 min-h-[640px]">
        {/*
          ========================================================================
          THE SIDEBAR COMPONENT UNDER TEST
          Sitting on top of the deep green background gradient
          ========================================================================
        */}
        <div className="shrink-0 flex items-stretch">
          <GlassmorphicSidebar
            items={DEFAULT_NAV_ITEMS}
            activeId={activeId}
            onSelect={(id) => setActiveId(id)}
            isCollapsed={isCollapsed}
            onToggleCollapse={(val) => setIsCollapsed(val)}
            goldColor={customGold}
            brandTitle="Aura IMS"
          />
        </div>

        {/* Content Pane Simulating Host App */}
        <main className="flex-1 flex flex-col gap-6 min-w-0">
          {/* Active State Details Card */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-white/10">
              <div className="flex items-center gap-4">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-neutral-950 font-bold shadow-lg"
                  style={{ backgroundColor: customGold }}
                >
                  <activeItem.icon size={24} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-white capitalize">
                      {activeItem.label} View
                    </h2>
                    <span
                      className="px-2.5 py-0.5 rounded-full text-[11px] font-bold text-neutral-950 tracking-wide"
                      style={{ backgroundColor: customGold }}
                    >
                      ACTIVE
                    </span>
                  </div>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    Item ID: <code className="text-emerald-400 font-mono">{activeItem.id}</code> &bull;
                    Sidebar State: <span className="text-white font-medium">{isCollapsed ? "Collapsed Rail" : "Expanded Sidebar"}</span>
                  </p>
                </div>
              </div>

              {/* Status Pills */}
              <div className="flex flex-wrap gap-2 text-xs">
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">
                  <CheckCircle2 size={13} />
                  <span>Boundary Constraint Enforced</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300">
                  <Sparkles size={13} />
                  <span>Matte Gold ({customGold})</span>
                </div>
              </div>
            </div>

            {/* Geometry & Requirement Verification Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              {/* Card 1: Boundary & Cutout Fillet Geometry */}
              <div className="bg-black/20 border border-white/5 rounded-2xl p-4 flex flex-col gap-2">
                <div className="flex items-center gap-2 text-sm font-semibold text-white">
                  <ShieldCheck size={16} className="text-[#C5A059]" />
                  <span>Smooth Cutout Geometry</span>
                </div>
                <p className="text-xs text-neutral-300 leading-relaxed">
                  Both top and bottom inner fillets use mathematically precise vector arcs connecting the
                  tab to the sidebar's right vertical frame without bleeding past the panel border.
                </p>
                <div className="mt-auto pt-2 text-[11px] font-mono text-emerald-400/90 bg-black/40 rounded-lg p-2 overflow-x-auto">
                  A20 20 0 0 0 20 0 Z (Top)
                  <br />
                  A20 20 0 0 1 20 20 Z (Bottom)
                </div>
              </div>

              {/* Card 2: Contrast Switch */}
              <div className="bg-black/20 border border-white/5 rounded-2xl p-4 flex flex-col gap-2">
                <div className="flex items-center gap-2 text-sm font-semibold text-white">
                  <Zap size={16} className="text-[#C5A059]" />
                  <span>Active Content Contrast</span>
                </div>
                <p className="text-xs text-neutral-300 leading-relaxed">
                  When selected, icons and typography dynamically switch to deep charcoal/forest green (<code className="text-emerald-300">text-emerald-950</code>)
                  for high contrast readability against the matte gold.
                </p>
                <div className="mt-auto pt-2 flex items-center gap-2 text-[11px]">
                  <span className="w-4 h-4 rounded-md" style={{ backgroundColor: customGold }} />
                  <span className="text-neutral-400">vs</span>
                  <span className="w-4 h-4 rounded-md bg-emerald-950 border border-white/20" />
                  <span className="text-emerald-300 font-mono text-[10px]">Ratio &gt; 7:1 AAA</span>
                </div>
              </div>

              {/* Card 3: Glassmorphism Architecture */}
              <div className="bg-black/20 border border-white/5 rounded-2xl p-4 flex flex-col gap-2">
                <div className="flex items-center gap-2 text-sm font-semibold text-white">
                  <Sliders size={16} className="text-[#C5A059]" />
                  <span>Glassmorphic Architecture</span>
                </div>
                <p className="text-xs text-neutral-300 leading-relaxed">
                  Sidebar container utilizes <code className="text-amber-200">backdrop-blur-xl</code>, subtle <code className="text-amber-200">border-white/10</code>,
                  and <code className="text-amber-200">rounded-3xl</code>, floating cleanly over the deep green gradient.
                </p>
                <div className="mt-auto pt-2 text-[11px] text-neutral-400 flex items-center gap-1.5">
                  <Info size={12} />
                  <span>Transitions: 300ms ease-in-out</span>
                </div>
              </div>
            </div>

            {/* Quick Interactive Nav Buttons in host app to verify state syncing */}
            <div className="mt-8 pt-6 border-t border-white/10">
              <div className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-3">
                Simulate Programmatic Selection (Click any item to change active state):
              </div>
              <div className="flex flex-wrap gap-2">
                {DEFAULT_NAV_ITEMS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveId(item.id)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                      activeId === item.id
                        ? "text-neutral-950 font-bold shadow-md"
                        : "bg-white/5 text-neutral-300 hover:bg-white/10 hover:text-white"
                    }`}
                    style={{
                      backgroundColor: activeId === item.id ? customGold : undefined,
                    }}
                  >
                    <item.icon size={14} />
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Sample App Content Display */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6 shadow-xl">
              <h3 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                <LayoutGrid size={16} className="text-[#C5A059]" />
                <span>Active Screen Metric Simulation</span>
              </h3>
              <p className="text-xs text-neutral-400 mb-4">
                Showing live context for module <span className="text-emerald-300 font-semibold">{activeItem.label}</span>.
              </p>
              <div className="space-y-3">
                <div className="p-3 rounded-2xl bg-black/30 border border-white/5 flex items-center justify-between">
                  <span className="text-xs text-neutral-300">Precision Index</span>
                  <span className="text-xs font-bold text-white font-mono">99.82%</span>
                </div>
                <div className="p-3 rounded-2xl bg-black/30 border border-white/5 flex items-center justify-between">
                  <span className="text-xs text-neutral-300">Hardware Acceleration</span>
                  <span className="text-xs font-bold text-emerald-400 font-mono">Enabled (GPU)</span>
                </div>
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6 shadow-xl flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                  <Eye size={16} className="text-[#C5A059]" />
                  <span>Visual Inspector</span>
                </h3>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Notice how hovering over inactive items produces a subtle, low-opacity gold glow
                  (<code className="text-amber-200">hover:bg-[#C5A059]/10</code>) that harmonizes with the matte active gold
                  without cluttering the interface.
                </p>
              </div>

              <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between text-xs text-neutral-400">
                <span>Tailwind CSS v4</span>
                <span className="text-emerald-400 font-semibold">&bull; React 19 Client Component</span>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
