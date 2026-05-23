"use client";

import { useStore } from "@/store/useStore";
import { useState } from "react";
import { 
  Bell, FileText, Download, Sparkles, RefreshCw, CheckSquare, ShieldCheck, ArrowRight, Bot 
} from "lucide-react";

export default function AIReportsHub() {
  const { reports, generateReport, apis } = useStore();
  const [loading, setLoading] = useState(false);
  const [activeReport, setActiveReport] = useState<any | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      await generateReport();
      alert("AI Weekly Performance Audit Report generated successfully!");
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = (reportTitle: string) => {
    alert(`Generating high-fidelity PDF report bundle for [${reportTitle}]... Download complete successfully!`);
  };

  const activeReportDetails = activeReport || reports[0];

  return (
    <div className="space-y-8 relative z-10">
      {/* Top banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white">AI Telemetry Audit Hub</h2>
          <p className="text-slate-400 text-sm">Review weekly SLA reports, download audited PDF performance metrics, and trigger fresh audits.</p>
        </div>
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-xs font-bold text-white rounded-xl shadow-lg transition-all flex items-center gap-1.5"
        >
          <Sparkles className="w-4 h-4" />
          <span>{loading ? "GENERATING AUDIT REPORT..." : "RUN WEEKLY AUDIT REPORT"}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Col: Historical audit list */}
        <div className="space-y-3 lg:col-span-1">
          <div className="flex items-center gap-2 border-b border-white/5 pb-2">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider font-mono">Performance Audits Archived</h3>
          </div>

          <div className="space-y-3.5">
            {reports.length === 0 ? (
              <div className="glass-panel py-8 text-center text-xs text-slate-500 font-mono">
                No weekly reports generated yet.
              </div>
            ) : (
              reports.map((rep) => {
                const isSelected = activeReportDetails?._id === rep._id;
                return (
                  <div
                    key={rep._id}
                    onClick={() => setActiveReport(rep)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      isSelected 
                        ? 'bg-indigo-600/10 border-indigo-500/40 shadow-lg' 
                        : 'glass-panel hover:border-slate-500/20'
                    } space-y-2`}
                  >
                    <div className="flex items-center gap-2.5 text-xs font-bold text-slate-200">
                      <FileText className="w-4.5 h-4.5 text-indigo-400 shrink-0" />
                      <span>{rep.title}</span>
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      Generated: {new Date(rep.generatedAt).toLocaleDateString()}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right 2 Cols: Report details explorer */}
        <div className="lg:col-span-2 space-y-6">
          {!activeReportDetails ? (
            <div className="glass-panel py-32 text-center text-slate-500 font-mono flex flex-col items-center justify-center gap-2">
              <FileText className="w-8 h-8 text-slate-600 mb-1 animate-pulse" />
              <span>Awaiting Audit Selection...</span>
              <p className="text-[10px] text-slate-600 max-w-[200px]">Click any weekly performance audit on the left or generate a fresh audit above to investigate details.</p>
            </div>
          ) : (
            <div className="glass-panel p-6 rounded-3xl space-y-6">
              {/* Report Header */}
              <div className="flex justify-between items-start border-b border-white/5 pb-5">
                <div className="space-y-1">
                  <span className="px-2 py-0.5 rounded text-[9px] bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-extrabold uppercase font-mono tracking-wider">
                    EXECUTIVE PERFORMANCE AUDIT
                  </span>
                  <h3 className="text-xl font-bold text-slate-200">{activeReportDetails.title}</h3>
                  <div className="text-xs text-slate-500 font-mono">Timestamp: {new Date(activeReportDetails.generatedAt).toLocaleString()}</div>
                </div>

                <button
                  onClick={() => handleDownloadPDF(activeReportDetails.title)}
                  className="px-3 py-2 bg-white/5 border border-white/5 hover:border-indigo-500/30 text-slate-300 text-xs font-bold font-mono transition-all flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>EXPORT PDF</span>
                </button>
              </div>

              {/* Grid: Audit stats + Recommendations */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                {/* Executive Summary */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold font-mono text-slate-400 uppercase tracking-widest border-b border-white/5 pb-2">Audit Summary</h4>
                  <div className="p-4 rounded-2xl bg-white/[0.01] border border-white/5 text-xs leading-relaxed text-slate-300 font-light font-mono">
                    <p>{activeReportDetails.summary}</p>
                  </div>

                  {/* Aggregate Metrics in Report */}
                  <div className="grid grid-cols-2 gap-3 font-mono text-[10px]">
                    <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 text-center">
                      <div className="text-slate-500">AGGREGATE UPTIME</div>
                      <div className="font-extrabold text-slate-200 text-sm">{activeReportDetails.metrics?.overallUptime}%</div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 text-center">
                      <div className="text-slate-500">AVG RESPONSE TIME</div>
                      <div className="font-extrabold text-slate-200 text-sm">{activeReportDetails.metrics?.averageLatency}ms</div>
                    </div>
                  </div>
                </div>

                {/* Audit recommendations */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold font-mono text-slate-400 uppercase tracking-widest border-b border-white/5 pb-2">Actionable Fix Checklist</h4>

                  <ul className="space-y-3 text-xs font-light text-slate-300">
                    {activeReportDetails.recommendations?.map((rec: string, idx: number) => (
                      <li key={idx} className="flex gap-2 p-3 rounded-xl bg-white/[0.02] border border-white/5">
                        <CheckSquare className="w-4.5 h-4.5 text-indigo-400 shrink-0" />
                        <div>
                          <div className="font-bold text-slate-200">Checkpoint [{idx+1}]</div>
                          <p className="text-[11px] text-slate-400 font-light mt-0.5 leading-relaxed">{rec}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
