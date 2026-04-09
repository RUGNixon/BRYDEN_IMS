"use client";

import { useEffect, useState } from "react";
import { HandCoins, ShoppingBag, Clock } from "lucide-react";
import { fmtCurrency } from "@/lib/format";

interface ListItem {
    clientName: string;
    productName: string;
    size: string;
    amount: number;
    date: string;
}

interface ListsData {
    loans: ListItem[];
    orders: ListItem[];
}

function ListCard({ title, icon, items, accentColor, emptyMsg }: { title: string, icon: React.ReactNode, items: ListItem[], accentColor: string, emptyMsg: string }) {
    return (
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200/60 flex flex-col h-full">
            <div className="flex items-center gap-3 mb-6">
                <div className={`p-2.5 rounded-xl bg-white shadow-sm border ${accentColor}`}>
                    {icon}
                </div>
                <h3 className="text-lg font-bold text-slate-800 tracking-tight">{title}</h3>
                <span className="ml-auto text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg">
                    {items.length} Recent
                </span>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4">
                {items.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center py-12 px-4">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                            <Clock className="w-8 h-8 text-slate-300" />
                        </div>
                        <p className="text-slate-500 font-medium">{emptyMsg}</p>
                    </div>
                ) : (
                    <ul className="flex flex-col gap-3">
                        {items.map((item, idx) => (
                            <li key={idx} className="group p-4 rounded-2xl border border-slate-100 hover:border-slate-200 bg-slate-50/50 hover:bg-white transition-all duration-200">
                                <div className="flex justify-between items-start gap-4">
                                    <div className="flex flex-col min-w-0">
                                        <p className="font-semibold text-slate-800 truncate" title={item.clientName}>
                                            {item.clientName}
                                        </p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-xs font-medium text-slate-500 truncate max-w-[140px]" title={item.productName}>
                                                {item.productName}
                                            </span>
                                            {item.size && (
                                                <span className="text-[10px] font-bold px-1.5 py-0.5 bg-slate-200/70 text-slate-600 rounded">
                                                    {item.size}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <p className="font-bold text-slate-900">
                                            {fmtCurrency(item.amount)}
                                        </p>
                                        <p className="text-[10px] font-medium text-slate-400 mt-1 uppercase tracking-wider">
                                            {new Date(item.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                        </p>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
            
            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background-color: #cbd5e1;
                    border-radius: 20px;
                }
            `}</style>
        </div>
    );
}

export default function DashboardLists() {
    const [data, setData] = useState<ListsData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchLists = async () => {
            try {
                const res = await fetch("/api/dashboard/lists");
                if (res.ok) {
                    const result = await res.json();
                    setData(result);
                }
            } catch (error) {
                console.error("Failed to load dashboard lists:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchLists();
    }, []);

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-pulse">
                <div className="bg-white p-6 rounded-3xl border border-slate-200/60 h-[400px]"></div>
                <div className="bg-white p-6 rounded-3xl border border-slate-200/60 h-[400px]"></div>
            </div>
        );
    }

    if (!data) return null;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ListCard 
                title="Active Loans" 
                icon={<HandCoins className="w-5 h-5 text-amber-600" />} 
                items={data.loans} 
                accentColor="text-amber-600 border-amber-100"
                emptyMsg="No active loans found."
            />
            <ListCard 
                title="Pending Orders" 
                icon={<ShoppingBag className="w-5 h-5 text-sky-600" />} 
                items={data.orders} 
                accentColor="text-sky-600 border-sky-100"
                emptyMsg="No pending orders right now."
            />
        </div>
    );
}
