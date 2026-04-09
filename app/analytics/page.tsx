import AnalyticsChart from "@/app/components/AnalyticsChart";
import AnalyticsProfitsChart from "@/app/components/AnalyticsProfitsChart";

export default function AnalyticsPage() {
    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Analytics</h1>
            <AnalyticsChart />
            <AnalyticsProfitsChart />
        </div>
    );
}
