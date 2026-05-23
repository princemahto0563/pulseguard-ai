"use client";

import { useEffect, useState, useRef } from "react";
import { useStore } from "@/store/useStore";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { 
  Activity, LayoutDashboard, Radio, ShieldAlert, BarChart3, 
  Bot, Bell, History, Users, Settings, LogOut, Volume2, VolumeX, Menu, X, Terminal,
  Flame, Network, Cpu, FileText, Search, CornerDownLeft
} from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { 
    init, user, isAuthenticated, logout, 
    isVoiceAlertEnabled, toggleVoiceAlerts, abortChaos, generateReport 
  } = useStore();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  
  // COMMAND PALETTE STATE
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const paletteInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    init();
    // Quick delay check for auth
    const token = localStorage.getItem('pg_token');
    if (!token) {
      router.push('/login');
    }
  }, []);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const navItems = [
    { name: "Overview Diagnostics", href: "/dashboard", icon: LayoutDashboard },
    { name: "Monitored APIs", href: "/dashboard/apis", icon: Radio },
    { name: "Alert Console", href: "/dashboard/alerts", icon: ShieldAlert },
    { name: "Telemetry Charts", href: "/dashboard/analytics", icon: BarChart3 },
    { name: "AI Reports Hub", href: "/dashboard/ai-insights", icon: Bell },
    
    // NEW ELITE SRE SIGNATURE FEATURES
    { name: "SRE Live Terminal", href: "/dashboard/sre-console", icon: Terminal },
    { name: "Disaster Chaos Deck", href: "/dashboard/chaos-deck", icon: Flame },
    { name: "Architecture Auditor", href: "/dashboard/architecture-analyzer", icon: Network },
    { name: "Digital Twin Clone", href: "/dashboard/digital-twin", icon: Cpu },
    { name: "Failure Story Gen", href: "/dashboard/story-generator", icon: FileText },
    
    { name: "AI Log Summarizer", href: "/dashboard/log-summarizer", icon: Terminal },
    { name: "AI Debug Terminal", href: "/dashboard/ai-chat", icon: Bot },
    { name: "Incident Playback", href: "/dashboard/incident-replay", icon: History },
    { name: "Incidents Feed", href: "/dashboard/incidents", icon: History },
    { name: "Team Spaces", href: "/dashboard/team", icon: Users },
    { name: "SRE Settings", href: "/dashboard/settings", icon: Settings },
  ];

  // Quick action options for CMD+K palette
  const quickActions = [
    {
      name: "Emergency Abort Active Chaos",
      desc: "Instantly clear active stress-test disaster overrides",
      icon: Flame,
      action: async () => {
        await abortChaos();
        alert("Active disaster simulations terminated successfully!");
      }
    },
    {
      name: "Generate Executive SRE Weekly Report",
      desc: "Triggers deep LLM summaries across logs database",
      icon: Bell,
      action: async () => {
        await generateReport();
        alert("AI weekly compliance report compiled successfully!");
      }
    },
    {
      name: "Toggle AI Voice incident alerts",
      desc: "Enable/disable speech synthesis alerts",
      icon: Volume2,
      action: () => {
        toggleVoiceAlerts();
      }
    }
  ];

  // Combine links and actions for search filtering
  const allPaletteOptions = [
    ...navItems.map(item => ({
      name: item.name,
      desc: `Jump to ${item.name} panel`,
      icon: item.icon,
      type: "nav" as const,
      handler: () => {
        router.push(item.href);
        setPaletteOpen(false);
      }
    })),
    ...quickActions.map(action => ({
      name: action.name,
      desc: action.desc,
      icon: action.icon,
      type: "action" as const,
      handler: () => {
        action.action();
        setPaletteOpen(false);
      }
    }))
  ];

  const filteredOptions = allPaletteOptions.filter(opt =>
    opt.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    opt.desc.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Global listener for CMD+K / CTRL+K key bindings
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setPaletteOpen(prev => !prev);
        setSearchQuery("");
        setSelectedIndex(0);
      }
      
      if (paletteOpen) {
        if (e.key === "Escape") {
          setPaletteOpen(false);
        } else if (e.key === "ArrowDown") {
          e.preventDefault();
          setSelectedIndex(prev => (prev + 1) % Math.max(1, filteredOptions.length));
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          setSelectedIndex(prev => (prev - 1 + filteredOptions.length) % Math.max(1, filteredOptions.length));
        } else if (e.key === "Enter") {
          e.preventDefault();
          if (filteredOptions[selectedIndex]) {
            filteredOptions[selectedIndex].handler();
          }
        }
      }
    };
    
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [paletteOpen, filteredOptions, selectedIndex]);

  // Refocus input box when palette launches
  useEffect(() => {
    if (paletteOpen) {
      setTimeout(() => paletteInputRef.current?.focus(), 80);
    }
  }, [paletteOpen]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#050508] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Activity className="w-10 h-10 text-indigo-500 animate-spin" />
          <span className="text-sm text-slate-400 font-mono">Verifying SRE credentials session...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050508] flex relative overflow-hidden">
      {/* Background grids */}
      <div className="absolute inset-0 grid-mesh opacity-30 pointer-events-none z-0" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-radial-glow opacity-20 pointer-events-none z-0" />

      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex flex-col w-64 glass-panel border-r border-white/5 relative z-10 shrink-0 h-screen sticky top-0 bg-black/40">
        {/* Brand header */}
        <div className="p-6 border-b border-white/5 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-pink-500 flex items-center justify-center shadow-lg">
            <Activity className="w-4.5 h-4.5 text-white animate-pulse" />
          </div>
          <span className="font-extrabold text-lg tracking-tight text-white">
            PulseGuard<span className="text-indigo-400">.AI</span>
          </span>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto scrollbar-style">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.name} 
                href={item.href}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isActive 
                    ? "bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 shadow-md shadow-indigo-500/5 font-bold" 
                    : "text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-indigo-400" : "text-slate-400"}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* User footer */}
        <div className="p-4 border-t border-white/5 space-y-3">
          <div className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/5">
            <div className="truncate pr-2">
              <div className="text-xs font-bold text-slate-200 truncate">{user?.name}</div>
              <div className="text-[10px] text-slate-500 font-mono truncate">{user?.email}</div>
            </div>
            <button 
              onClick={toggleVoiceAlerts}
              className={`p-1.5 rounded-lg border transition-colors shrink-0 ${
                isVoiceAlertEnabled 
                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20" 
                  : "bg-rose-500/10 border-rose-500/20 text-rose-400 hover:bg-rose-500/20"
              }`}
              title={isVoiceAlertEnabled ? "Mute Voice Alerts" : "Enable Voice Alerts"}
            >
              {isVoiceAlertEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            </button>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/10 text-rose-400 text-xs font-bold transition-all"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout SRE Node</span>
          </button>
        </div>
      </aside>

      {/* Mobile Drawer Trigger Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-[#050508]/80 backdrop-blur-md border-b border-white/5 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-indigo-500 to-pink-500 flex items-center justify-center">
            <Activity className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-slate-200">PulseGuard</span>
        </div>
        <button onClick={() => setMobileOpen(!mobileOpen)} className="p-1.5 rounded-lg bg-white/5 text-slate-400 hover:text-white border border-white/10">
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Sidebar overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden flex">
          <div className="fixed inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
          <aside className="relative flex flex-col w-72 bg-[#090a0f] border-r border-white/5 h-full p-6 z-50 animate-slide-in">
            <div className="flex items-center justify-between pb-6 border-b border-white/5">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-indigo-400" />
                <span className="font-bold text-white text-lg">PulseGuard AI</span>
              </div>
              <button onClick={() => setMobileOpen(false)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex-1 py-6 space-y-1.5 overflow-y-auto">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link 
                    key={item.name} 
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium ${
                      isActive 
                        ? "bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 font-bold" 
                        : "text-slate-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <Icon className="w-4.5 h-4.5" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
            <div className="border-t border-white/5 pt-4 space-y-3">
              <button 
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/10 text-rose-400 text-xs font-bold"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main content workspace */}
      <main className="flex-1 min-w-0 min-h-screen relative z-10 flex flex-col pt-16 lg:pt-0 overflow-y-auto bg-[#050508]/20">
        {/* Dynamic header with Linear-style search command trigger */}
        <header className="hidden lg:flex items-center justify-between px-8 py-5 border-b border-white/5 bg-[#050508]/10 backdrop-blur-sm sticky top-0 z-30">
          <div className="flex items-center gap-6">
            <div>
              <h1 className="text-lg font-bold tracking-tight text-white">System Diagnostics Panel</h1>
              <p className="text-xs text-slate-500 font-mono uppercase tracking-wider">Cluster status: Operational</p>
            </div>
            
            {/* Linear-Style Search Trigger Button */}
            <button 
              onClick={() => setPaletteOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 hover:bg-white/10 text-[10px] font-mono text-slate-500 hover:text-slate-300 transition-all shadow-inner"
            >
              <Search className="w-3.5 h-3.5 text-slate-400" />
              <span>Search SRE workspace...</span>
              <kbd className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[9px] text-slate-400 font-sans shadow-md">
                ⌘K
              </kbd>
            </button>
          </div>
          
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 status-dot-pulse" />
            <span className="text-xs text-slate-400 font-mono">Live Monitoring Link Connected</span>
          </div>
        </header>
        
        <div className="flex-1 p-6 lg:p-8 max-w-[1600px] mx-auto w-full">
          {children}
        </div>
      </main>

      {/* INTERACTIVE CMD+K GLOBAL COMMAND PALETTE MODAL */}
      {paletteOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          {/* Backdrop closer */}
          <div className="fixed inset-0" onClick={() => setPaletteOpen(false)} />
          
          {/* Glass Palette Frame */}
          <div className="relative w-full max-w-lg bg-[#08080c]/95 border border-indigo-500/20 rounded-3xl p-5 shadow-[0_0_80px_rgba(99,102,241,0.15)] flex flex-col overflow-hidden font-mono z-10">
            {/* Holographic sweeps decoration */}
            <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-indigo-500 to-transparent animate-laser-sweep" />

            {/* Input Launcher */}
            <div className="relative shrink-0 flex items-center mb-4">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-400" />
              <input
                ref={paletteInputRef}
                type="text"
                placeholder="Type a command or jump to page..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setSelectedIndex(0);
                }}
                className="w-full bg-[#030305] border border-indigo-500/10 rounded-2xl pl-10 pr-4 py-3.5 text-xs text-indigo-300 placeholder-indigo-500/30 focus:outline-none focus:border-indigo-500/40 focus:shadow-[0_0_20px_rgba(99,102,241,0.05)] font-mono"
              />
              <button 
                onClick={() => setPaletteOpen(false)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[9px] px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-slate-500"
              >
                ESC
              </button>
            </div>

            {/* Results Section */}
            <div className="flex-1 overflow-y-auto max-h-[300px] space-y-1 pr-1 scrollbar-style">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((opt, index) => {
                  const Icon = opt.icon;
                  const isSelected = index === selectedIndex;
                  return (
                    <button
                      key={opt.name}
                      onClick={opt.handler}
                      onMouseEnter={() => setSelectedIndex(index)}
                      className={`w-full text-left flex items-center justify-between px-4 py-3 rounded-2xl border transition-all ${
                        isSelected
                          ? "bg-indigo-600/10 border-indigo-500/30 text-white font-bold"
                          : "bg-transparent border-transparent text-slate-400 hover:bg-white/5 hover:text-slate-200"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-1.5 rounded-lg ${isSelected ? "bg-indigo-600/20 text-indigo-400" : "bg-white/5"}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="block text-xs font-mono">{opt.name}</span>
                          <span className="block text-[9px] text-slate-500 leading-normal mt-0.5">{opt.desc}</span>
                        </div>
                      </div>
                      
                      {isSelected && (
                        <div className="flex items-center gap-1.5 text-[8px] text-indigo-400 font-extrabold uppercase bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded shadow">
                          <span>Confirm</span>
                          <CornerDownLeft className="w-2.5 h-2.5" />
                        </div>
                      )}
                    </button>
                  );
                })
              ) : (
                <div className="text-center py-8 text-slate-500 text-xs font-mono">
                  No matching workspace actions detected.
                </div>
              )}
            </div>

            {/* Hint Footer */}
            <div className="mt-4 pt-3 border-t border-indigo-500/10 flex items-center justify-between text-[8px] text-slate-500 font-mono">
              <div className="flex gap-2">
                <span>↑↓ Navigation</span>
                <span>•</span>
                <span>⏎ Select Option</span>
              </div>
              <span className="text-indigo-400/50 font-bold uppercase tracking-wider">PulseGuard Command Center</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
