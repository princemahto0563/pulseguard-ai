"use client";

import { useState, useEffect } from "react";
import { Globe, MapPin, Activity } from "lucide-react";

interface IRegion {
  id: string;
  name: string;
  coords: { x: number; y: number }; // SVG map percent coordinates
  latency: number;
  status: "healthy" | "congested" | "degraded" | "outage";
  provider: string;
}

export default function RegionMap() {
  const [regions, setRegions] = useState<IRegion[]>([
    { id: "us-east", name: "US-East-1 (N. Virginia)", coords: { x: 25, y: 35 }, latency: 42, status: "healthy", provider: "AWS" },
    { id: "eu-west", name: "EU-Central-1 (Frankfurt)", coords: { x: 52, y: 28 }, latency: 85, status: "healthy", provider: "AWS" },
    { id: "ap-south", name: "AP-South-1 (Mumbai)", coords: { x: 72, y: 52 }, latency: 680, status: "degraded", provider: "AWS" },
    { id: "sa-east", name: "SA-East-1 (São Paulo)", coords: { x: 38, y: 72 }, latency: 120, status: "healthy", provider: "AWS" }
  ]);

  const [selectedRegion, setSelectedRegion] = useState<IRegion | null>(null);

  // Dynamic simulation updates for the map to look extremely alive
  useEffect(() => {
    const timer = setInterval(() => {
      setRegions(prev => prev.map(reg => {
        // Latency variations
        let diff = Math.floor(Math.random() * 8) - 4;
        let newLatency = Math.max(reg.latency + diff, 20);
        
        let newStatus = reg.status;
        if (reg.id === "ap-south") {
          // Keep ap-south degraded or congested for the demonstration of warnings
          newLatency = Math.floor(Math.random() * 200) + 580;
          newStatus = "degraded";
        } else {
          newStatus = newLatency > 200 ? "congested" : "healthy";
        }

        return {
          ...reg,
          latency: newLatency,
          status: newStatus
        };
      }));
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="glass-panel p-6 rounded-3xl relative overflow-hidden flex flex-col justify-between h-96">
      {/* Header */}
      <div className="flex justify-between items-start border-b border-white/5 pb-3 shrink-0">
        <div>
          <h3 className="text-sm font-bold text-slate-200 font-mono uppercase tracking-wider">Multi-Region Infrastructure Map</h3>
          <p className="text-[10px] text-slate-500">Live latency measurements by AWS region nodes.</p>
        </div>
        <Globe className="w-5 h-5 text-indigo-400 animate-spin [animation-duration:12s]" />
      </div>

      {/* Interactive World Map Canvas wrapper */}
      <div className="flex-1 relative min-h-0 py-4 flex items-center justify-center">
        {/* World Map SVG Outline Grid */}
        <svg 
          viewBox="0 0 100 100" 
          className="w-full h-full max-h-[220px] opacity-25 pointer-events-none"
        >
          {/* Simple grid latitude/longitude lines */}
          <line x1="0" y1="20" x2="100" y2="20" stroke="rgba(99, 102, 241, 0.15)" strokeWidth="0.5" />
          <line x1="0" y1="40" x2="100" y2="40" stroke="rgba(99, 102, 241, 0.15)" strokeWidth="0.5" />
          <line x1="0" y1="60" x2="100" y2="60" stroke="rgba(99, 102, 241, 0.15)" strokeWidth="0.5" />
          <line x1="0" y1="80" x2="100" y2="80" stroke="rgba(99, 102, 241, 0.15)" strokeWidth="0.5" />
          
          <line x1="20" y1="0" x2="20" y2="100" stroke="rgba(99, 102, 241, 0.15)" strokeWidth="0.5" />
          <line x1="40" y1="0" x2="40" y2="100" stroke="rgba(99, 102, 241, 0.15)" strokeWidth="0.5" />
          <line x1="60" y1="0" x2="60" y2="100" stroke="rgba(99, 102, 241, 0.15)" strokeWidth="0.5" />
          <line x1="80" y1="0" x2="80" y2="100" stroke="rgba(99, 102, 241, 0.15)" strokeWidth="0.5" />

          {/* Simulated Land masses dots */}
          <circle cx="20" cy="30" r="1.5" fill="rgba(255,255,255,0.2)" />
          <circle cx="28" cy="38" r="1.2" fill="rgba(255,255,255,0.2)" />
          <circle cx="50" cy="25" r="1.8" fill="rgba(255,255,255,0.2)" />
          <circle cx="70" cy="45" r="2" fill="rgba(255,255,255,0.2)" />
          <circle cx="42" cy="70" r="1.6" fill="rgba(255,255,255,0.2)" />
        </svg>

        {/* Region Glowing Beacons */}
        {regions.map((reg) => (
          <div
            key={reg.id}
            onMouseEnter={() => setSelectedRegion(reg)}
            onMouseLeave={() => setSelectedRegion(null)}
            className="absolute cursor-pointer group"
            style={{ left: `${reg.coords.x}%`, top: `${reg.coords.y}%` }}
          >
            {/* Glowing outer beacon */}
            <span className={`absolute -left-2 -top-2 w-5 h-5 rounded-full status-dot-pulse opacity-80 ${
              reg.status === "healthy" 
                ? "text-emerald-500" 
                : reg.status === "degraded" 
                ? "text-rose-500" 
                : "text-amber-500"
            }`} />
            <MapPin className={`w-4 h-4 relative z-10 transition-transform group-hover:scale-125 ${
              reg.status === "healthy" 
                ? "text-emerald-400" 
                : reg.status === "degraded" 
                ? "text-rose-400" 
                : "text-amber-400"
            }`} />

            {/* Hover tooltip label */}
            <span className="absolute left-5 top-0 bg-[#090a0f] border border-white/5 px-2 py-1 rounded text-[9px] font-bold text-slate-300 font-mono whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
              {reg.id.toUpperCase()}: {reg.latency}ms
            </span>
          </div>
        ))}
      </div>

      {/* World regions summary status board */}
      <div className="p-3.5 rounded-2xl bg-white/[0.01] border border-white/5 flex items-center justify-between font-mono text-[10px] shrink-0">
        {selectedRegion ? (
          <div className="flex justify-between items-center w-full">
            <div>
              <span className="text-slate-500">REGION:</span> <strong className="text-slate-200">{selectedRegion.name}</strong>
            </div>
            <div className="flex gap-4">
              <span>LATENCY: <strong className={selectedRegion.status === "healthy" ? "text-emerald-400" : "text-rose-400"}>{selectedRegion.latency}ms</strong></span>
              <span>PROVIDER: <strong className="text-indigo-400">{selectedRegion.provider}</strong></span>
            </div>
          </div>
        ) : (
          <div className="flex justify-between items-center w-full text-slate-500">
            <span className="flex items-center gap-1.5 animate-pulse">
              <Activity className="w-3.5 h-3.5 text-indigo-400" />
              <span>Hover over active region nodes to audit node health checks...</span>
            </span>
            <span>AP-South degraded</span>
          </div>
        )}
      </div>
    </div>
  );
}
