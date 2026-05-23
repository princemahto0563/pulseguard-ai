"use client";

import { useState, useEffect } from "react";
import { useStore } from "@/store/useStore";
import { FileText, Sparkles, Calendar, UserCheck, ShieldAlert, Cpu, Download, Copy, Share2, CornerDownRight } from "lucide-react";

export default function StoryGenerator() {
  const { incidents, generatePostMortem, speakText } = useStore();
  const [selectedIncidentId, setSelectedIncidentId] = useState("");
  const [customTitle, setCustomTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"doc" | "md">("doc");

  useEffect(() => {
    if (incidents.length > 0 && !selectedIncidentId) {
      setSelectedIncidentId(incidents[0]._id);
      setCustomTitle(incidents[0].title);
    }
  }, [incidents]);

  const handleSelectChange = (id: string) => {
    setSelectedIncidentId(id);
    const inc = incidents.find(i => i._id === id);
    if (inc) {
      setCustomTitle(inc.title);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    const title = customTitle.trim() || "Critical Gateway Timeout";
    
    setLoading(true);
    speakText("Starting site failure story generation...");
    
    try {
      const data = await generatePostMortem(title);
      setReport(data);
      speakText("AI incident postmortem compiled successfully.");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const copyMarkdown = () => {
    if (!report) return;
    const md = `# SRE POSTMORTEM: ${customTitle.toUpperCase()}
Root Cause: ${report.rootCause}
Customer Impact: ${report.customerImpact}
Users Affected Ratio: ${report.affectedUsersRatio}
Recovery Actions Executed: ${report.recoveryActionExecuted}

## Operational Timeline
${report.timeline.map((t: any) => `- [${new Date(t.timestamp).toLocaleTimeString()}] ${t.event}`).join("\n")}

## Lessons Learned
${report.lessonsLearned.map((l: string) => `- ${l}`).join("\n")}

## Preventative SRE Checks
${report.preventativeChecks.map((p: string) => `- ${p}`).join("\n")}
`;
    navigator.clipboard.writeText(md);
    alert("Postmortem Markdown copied to clipboard!");
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8 relative z-10">
      {/* Title */}
      <div>
        <h2 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
          <FileText className="w-6.5 h-6.5 text-indigo-400" />
          AI Failure Story & Postmortem Generator
        </h2>
        <p className="text-slate-400 text-xs">Transform raw Express/Mongoose transaction failures and alerts spikes into premium, Notion-style executive postmortem summaries and lessons learned sheets.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Control Column */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-panel rounded-3xl p-5 border border-white/5 bg-black/60 space-y-5">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-500" />
              Incident Selector
            </h3>

            {/* Select Target Incident */}
            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-400 font-mono">SELECT CLOSED / WARNING INCIDENT</label>
              <select
                value={selectedIncidentId}
                onChange={(e) => handleSelectChange(e.target.value)}
                className="w-full bg-[#0d0d12] border border-white/10 rounded-2xl px-4 py-3 text-xs text-slate-200 focus:outline-none focus:border-indigo-500/40 font-mono"
              >
                {incidents.map(inc => (
                  <option key={inc._id} value={inc._id}>
                    [{inc.severity.toUpperCase()}] {inc.title.slice(0, 35)}...
                  </option>
                ))}
              </select>
            </div>

            {/* Title override */}
            <form onSubmit={handleGenerate} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-400 font-mono">CUSTOM INCIDENT WORKSPACE TITLE</label>
                <input
                  type="text"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  placeholder="e.g. database transactions deadlocks Stripe Checkout"
                  disabled={loading}
                  className="w-full bg-[#0d0d12] border border-white/10 rounded-2xl px-4 py-3 text-xs text-slate-200 focus:outline-none focus:border-indigo-500/40 font-mono"
                />
              </div>

              <button
                type="submit"
                disabled={loading || !customTitle.trim()}
                className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-900 text-white text-xs font-extrabold transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-950/20"
              >
                {loading ? (
                  <>
                    <Cpu className="w-4 h-4 animate-spin" />
                    <span>Compiling SRE Postmortem...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Compile Failure Story</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right Notion Doc Column */}
        <div className="lg:col-span-2 space-y-6">
          {report ? (
            <div className="space-y-4">
              {/* Document actions header bar */}
              <div className="flex justify-between items-center bg-[#07070b]/60 border border-white/5 rounded-2xl px-4 py-2 text-xs font-mono shrink-0">
                <div className="flex gap-2">
                  <button
                    onClick={() => setActiveTab("doc")}
                    className={`px-3 py-1 rounded-lg transition-colors ${
                      activeTab === "doc" ? "bg-indigo-600/15 text-indigo-400 font-bold" : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    Notion View
                  </button>
                  <button
                    onClick={() => setActiveTab("md")}
                    className={`px-3 py-1 rounded-lg transition-colors ${
                      activeTab === "md" ? "bg-indigo-600/15 text-indigo-400 font-bold" : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    Raw Markdown
                  </button>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={copyMarkdown}
                    className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors flex items-center gap-1.5"
                    title="Copy Markdown"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Copy MD</span>
                  </button>
                  <button
                    onClick={handlePrint}
                    className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors flex items-center gap-1.5"
                    title="Export PDF"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Export PDF</span>
                  </button>
                </div>
              </div>

              {/* Document view wrapper */}
              {activeTab === "doc" ? (
                <div className="glass-panel rounded-3xl border border-white/5 bg-[#0a0a0f] p-8 md:p-10 space-y-8 text-slate-300 font-sans shadow-2xl relative">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-radial-glow opacity-[0.03] pointer-events-none" />

                  {/* Header metadata */}
                  <div className="space-y-4 border-b border-white/5 pb-8">
                    <div className="flex items-center gap-2 bg-rose-500/10 border border-rose-500/20 px-3 py-1 rounded-full text-[9px] tracking-wider text-rose-400 font-extrabold w-max font-mono uppercase">
                      <ShieldAlert className="w-3.5 h-3.5" />
                      Postmortem Report: SEV-1 INCIDENT
                    </div>

                    <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight leading-tight">
                      {customTitle.toUpperCase()}
                    </h1>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono text-slate-500 pt-2">
                      <div>
                        <span className="block text-[9px] uppercase tracking-wider text-slate-600">INCIDENT ID</span>
                        <span className="text-slate-300 font-bold">{selectedIncidentId.slice(-8).toUpperCase() || "PG-9821A"}</span>
                      </div>
                      <div>
                        <span className="block text-[9px] uppercase tracking-wider text-slate-600">AFFECTED USERS</span>
                        <span className="text-rose-400 font-bold">{report.affectedUsersRatio}</span>
                      </div>
                      <div>
                        <span className="block text-[9px] uppercase tracking-wider text-slate-600">COMPILER</span>
                        <span className="text-slate-300">PulseGuard AI SRE</span>
                      </div>
                      <div>
                        <span className="block text-[9px] uppercase tracking-wider text-slate-600">VERDICT</span>
                        <span className="text-emerald-400 font-bold">RESOLVED</span>
                      </div>
                    </div>
                  </div>

                  {/* Summary Block */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-1 border-l-2 border-indigo-500 pl-4 space-y-1">
                      <span className="text-[9px] uppercase tracking-wider text-indigo-400 font-bold font-mono">ROOT CAUSE</span>
                      <p className="text-xs font-bold text-white font-mono leading-relaxed">{report.rootCause}</p>
                    </div>
                    <div className="md:col-span-2 border-l-2 border-indigo-500/20 pl-4 space-y-1">
                      <span className="text-[9px] uppercase tracking-wider text-indigo-400 font-bold font-mono">CUSTOMER IMPACT SUMMARY</span>
                      <p className="text-xs text-slate-400 font-mono leading-relaxed">{report.customerImpact}</p>
                    </div>
                  </div>

                  {/* Timeline section */}
                  <div className="space-y-3.5">
                    <h3 className="text-xs font-extrabold text-white uppercase tracking-wider font-mono border-b border-white/5 pb-2">
                      Operational Incident Timeline
                    </h3>
                    <div className="space-y-4">
                      {report.timeline.map((item: any, idx: number) => (
                        <div key={idx} className="flex gap-4 relative">
                          {idx !== report.timeline.length - 1 && (
                            <div className="absolute left-[3.5px] top-4 bottom-[-18px] w-0.5 bg-white/5" />
                          )}
                          <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 shrink-0 mt-1 z-10" />
                          <div className="text-xs font-mono">
                            <span className="text-slate-500 block text-[10px]">{new Date(item.timestamp).toLocaleTimeString()}</span>
                            <span className="text-slate-300 leading-normal">{item.event}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Action executed */}
                  <div className="space-y-2 border-l-2 border-emerald-500 pl-4 py-1">
                    <h3 className="text-[9px] font-extrabold text-emerald-400 uppercase tracking-wider font-mono">
                      RECOVERY OPERATIONS EXECUTED
                    </h3>
                    <p className="text-xs font-mono text-slate-300 leading-relaxed">
                      {report.recoveryActionExecuted}
                    </p>
                  </div>

                  {/* Double lists: Lessons + Checks */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-white/5">
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-1.5">
                        <CornerDownRight className="w-3.5 h-3.5 text-indigo-400" />
                        Lessons Learned
                      </h4>
                      <ul className="space-y-2.5 text-xs text-slate-400 font-mono leading-relaxed">
                        {report.lessonsLearned.map((item: string, index: number) => (
                          <li key={index} className="flex gap-2">
                            <span>-</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="space-y-3">
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-1.5">
                        <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                        Preventative SRE Upgrades
                      </h4>
                      <ul className="space-y-2.5 text-xs text-slate-400 font-mono leading-relaxed">
                        {report.preventativeChecks.map((item: string, index: number) => (
                          <li key={index} className="flex gap-2">
                            <span>-</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="glass-panel rounded-3xl border border-white/5 bg-black/90 p-6 md:p-8 h-[600px] overflow-y-auto font-mono text-xs text-slate-400 leading-relaxed scrollbar-style">
                  <pre className="whitespace-pre-wrap">{`# SRE POSTMORTEM: ${customTitle.toUpperCase()}
Root Cause: ${report.rootCause}
Customer Impact: ${report.customerImpact}
Users Affected Ratio: ${report.affectedUsersRatio}
Recovery Actions Executed: ${report.recoveryActionExecuted}

## Operational Timeline
${report.timeline.map((t: any) => `- [${new Date(t.timestamp).toLocaleTimeString()}] ${t.event}`).join("\n")}

## Lessons Learned
${report.lessonsLearned.map((l: string) => `- ${l}`).join("\n")}

## Preventative SRE Checks
${report.preventativeChecks.map((p: string) => `- ${p}`).join("\n")}
`}</pre>
                </div>
              )}
            </div>
          ) : (
            <div className="glass-panel rounded-3xl border border-white/5 bg-black/60 h-[480px] flex flex-col items-center justify-center text-center p-8">
              <div className="w-14 h-14 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mb-4">
                <FileText className="w-6.5 h-6.5" />
              </div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono mb-2">Failure Story Compiler Locked</h3>
              <p className="text-xs text-slate-500 max-w-sm font-mono leading-normal">Choose an active telemetry incident workspace on the left parameters panel to compile real-time Notion-grade SRE postmortem documents.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
