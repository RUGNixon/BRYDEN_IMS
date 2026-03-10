import { Lock } from "lucide-react";

export default function LoginPage() {
    return (
        <div className="flex items-center justify-center h-screen w-full bg-slate-900 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-800 to-slate-900">
            <div className="w-full max-w-md p-8 space-y-8 bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-3xl shadow-2xl">
                <div className="text-center">
                    <div className="flex justify-center mb-6">
                        <div className="p-4 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 shadow-inner">
                            <Lock className="w-8 h-8 text-indigo-400" />
                        </div>
                    </div>
                    <h2 className="text-3xl font-bold tracking-tight text-white mb-2">Bryden IMS</h2>
                    <p className="text-sm text-slate-400">Inventory Management System</p>
                </div>
                <form className="mt-8 space-y-5">
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="email-address" className="sr-only">Email address</label>
                            <input id="email-address" name="email" type="email" required className="block w-full px-4 py-3.5 border border-slate-700/50 bg-slate-900/50 text-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all" placeholder="Email address" />
                        </div>
                        <div>
                            <label htmlFor="password" className="sr-only">Password</label>
                            <input id="password" name="password" type="password" required className="block w-full px-4 py-3.5 border border-slate-700/50 bg-slate-900/50 text-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all" placeholder="Password" />
                        </div>
                    </div>
                    <div className="pt-2">
                        <button type="submit" className="group relative flex w-full justify-center py-3.5 px-4 border border-transparent text-sm font-semibold rounded-xl text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-slate-900 transition-all shadow-lg hover:shadow-indigo-500/25 active:scale-[0.98]">
                            Sign In
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
