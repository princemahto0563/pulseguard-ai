"use client";

import { useState } from "react";
import { useStore } from "@/store/useStore";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Activity, ArrowRight, ShieldAlert } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("admin@pulseguard.ai");
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const login = useStore((state) => state.login);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login({ email, password });
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.error || "Invalid email or password authentication sequence.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050508] relative grid-mesh overflow-hidden flex items-center justify-center px-4">
      {/* Glow mesh */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-mesh-glow opacity-30 pointer-events-none" />

      <div className="w-full max-w-md glass-panel p-8 rounded-3xl relative z-10 space-y-6 glow-border-indigo">
        {/* Top Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-pink-500 items-center justify-center shadow-lg shadow-indigo-500/20 mb-2">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Welcome back</h2>
          <p className="text-slate-400 text-xs font-light">
            Sign in to access your SRE diagnostic pipelines
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center gap-2 text-xs text-rose-400">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#0c0d12] border border-white/5 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500/50 text-slate-100 transition-colors"
              required
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Password</label>
              <span className="text-[10px] text-indigo-400 hover:underline cursor-pointer">Forgot?</span>
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#0c0d12] border border-white/5 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500/50 text-slate-100 transition-colors"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-800 text-sm font-bold rounded-xl text-white shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/40 transition-all flex items-center justify-center gap-1.5"
          >
            {loading ? "Authenticating SRE Session..." : "Secure Login"}
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        <div className="text-center pt-2 text-xs text-slate-500">
          <span>New to PulseGuard? </span>
          <Link href="/register" className="text-indigo-400 hover:underline">
            Create an Account
          </Link>
        </div>

        {/* Demo Credentials Alert Helper */}
        <div className="p-3 rounded-xl bg-indigo-500/5 border border-indigo-500/10 text-[10px] text-slate-400 font-mono space-y-1">
          <div className="text-indigo-400 font-bold">💡 DEMO ACCESS CREDENTIALS:</div>
          <div>Email: <span className="text-slate-200">admin@pulseguard.ai</span></div>
          <div>Password: <span className="text-slate-200">admin123</span></div>
        </div>
      </div>
    </div>
  );
}
