import AnalyticsChart from "@/app/components/AnalyticsChart";
import AnalyticsProfitsChart from "@/app/components/AnalyticsProfitsChart";
import AnalyticsStockCards from "@/app/components/AnalyticsStockCards";
import { Activity, CalendarRange } from "lucide-react";

export default function AnalyticsPage() {
    return (
        <div className="analytics-page min-h-full px-4 py-6 sm:px-6 lg:px-8">
            <div className="mx-auto flex max-w-7xl flex-col gap-6 lg:gap-8">
                <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div className="max-w-3xl">
                        <div className="analytics-eyebrow">
                            <Activity size={16} aria-hidden="true" />
                            Analytics
                        </div>
                        <h1 className="mt-3 text-3xl font-black tracking-tight text-[var(--analytics-text)] sm:text-4xl">
                            Performance command center
                        </h1>
                        <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-[var(--analytics-muted)] sm:text-base">
                            Revenue, purchasing, inventory value, and profit signals designed for fast operational decisions.
                        </p>
                    </div>

                    <div className="analytics-range-chip">
                        <CalendarRange size={16} aria-hidden="true" />
                        Past 12 months
                    </div>
                </header>

                <AnalyticsChart />
                <AnalyticsProfitsChart />
                <AnalyticsStockCards />
            </div>
        </div>
    );
}
