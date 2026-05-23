"use client";

import { useState } from "react";
import { 
  Users, UserPlus, FolderPlus, ShieldCheck, Mail, Projector, MessageSquare, Plus, Activity 
} from "lucide-react";

interface IMember {
  name: string;
  email: string;
  role: string;
  status: string;
}

interface INote {
  author: string;
  content: string;
  timestamp: string;
  project: string;
}

export default function TeamSpaces() {
  const [members, setMembers] = useState<IMember[]>([
    { name: "Alex Miller (You)", email: "admin@pulseguard.ai", role: "Owner", status: "Active" },
    { name: "Samantha Ross", email: "sam@pulseguard.ai", role: "SRE Admin", status: "Active" },
    { name: "David Chen", email: "david@pulseguard.ai", role: "DevOps Engineer", status: "Active" }
  ]);

  const [projects, setProjects] = useState<string[]>([
    "Core Platform",
    "E-Commerce Platform",
    "Marketing Hub"
  ]);

  const [notes, setNotes] = useState<INote[]>([
    {
      author: "Samantha Ross",
      content: "Stripe capturing post-mortem: timeouts are completely resolved. We increased transaction isolation levels to avoid SQL deadlock locks.",
      timestamp: "Today at 10:14 AM",
      project: "E-Commerce Platform"
    },
    {
      author: "David Chen",
      content: "AI recommendation GPU timings averaged 720ms during peak marketing runs. I am scheduling a Redis memory buffer cluster upgrade tomorrow.",
      timestamp: "Yesterday at 4:32 PM",
      project: "Marketing Hub"
    }
  ]);

  // Form states
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [newProjectName, setNewProjectName] = useState("");
  const [newNoteText, setNewNoteText] = useState("");
  const [selectedNoteProj, setSelectedNoteProj] = useState("Core Platform");

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberEmail) return;
    setMembers(prev => [
      ...prev,
      { name: "Invited Member", email: newMemberEmail, role: "Member", status: "Invited" }
    ]);
    setNewMemberEmail("");
    alert(`Invitation link dispatched successfully to: ${newMemberEmail}`);
  };

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName) return;
    setProjects(prev => [...prev, newProjectName]);
    setNewProjectName("");
    alert(`Workspace Project: [${newProjectName}] initialized successfully.`);
  };

  const handlePostNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText) return;
    setNotes(prev => [
      {
        author: "Alex Miller",
        content: newNoteText,
        timestamp: "Just now",
        project: selectedNoteProj
      },
      ...prev
    ]);
    setNewNoteText("");
  };

  return (
    <div className="space-y-8 relative z-10">
      {/* Header */}
      <div>
        <h2 className="text-2xl md:text-3xl font-extrabold text-white">Team Operations Space</h2>
        <p className="text-slate-400 text-sm">Manage project access parameters, dispatch workspace invitations, and share incident logs takeaways.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Left Column: Team & Projects */}
        <div className="xl:col-span-1 space-y-8">
          {/* Members Panel */}
          <div className="glass-panel p-6 rounded-3xl space-y-4">
            <div className="flex justify-between items-center border-b border-white/5 pb-3">
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider font-mono">Team Members</h3>
              <Users className="w-4 h-4 text-indigo-400" />
            </div>

            <div className="space-y-3">
              {members.map((mem, idx) => (
                <div key={idx} className="flex justify-between items-center p-3 rounded-xl bg-white/[0.01] border border-white/5 text-xs">
                  <div>
                    <div className="font-bold text-slate-200">{mem.name}</div>
                    <div className="text-[10px] text-slate-500 font-mono">{mem.email}</div>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[8px] font-mono font-bold uppercase ${
                    mem.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-indigo-500/10 text-indigo-400'
                  }`}>
                    {mem.role}
                  </span>
                </div>
              ))}
            </div>

            <form onSubmit={handleInvite} className="flex gap-2">
              <input
                type="email"
                placeholder="sre@company.com"
                value={newMemberEmail}
                onChange={(e) => setNewMemberEmail(e.target.value)}
                className="w-full bg-[#0c0d12] border border-white/5 rounded-xl px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500/50"
                required
              />
              <button type="submit" className="p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-colors">
                <UserPlus className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* Projects List */}
          <div className="glass-panel p-6 rounded-3xl space-y-4">
            <div className="flex justify-between items-center border-b border-white/5 pb-3">
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider font-mono">Workspace Projects</h3>
              <Plus className="w-4.5 h-4.5 text-indigo-400 cursor-pointer" />
            </div>

            <div className="flex flex-wrap gap-2 text-xs font-mono">
              {projects.map((proj, idx) => (
                <span key={idx} className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/5 text-slate-300">
                  {proj}
                </span>
              ))}
            </div>

            <form onSubmit={handleCreateProject} className="flex gap-2">
              <input
                type="text"
                placeholder="New project..."
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                className="w-full bg-[#0c0d12] border border-white/5 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500/50"
                required
              />
              <button type="submit" className="p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-colors">
                <FolderPlus className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>

        {/* Right 2 Columns: Shared Team Takeaways */}
        <div className="xl:col-span-2 glass-panel p-6 rounded-3xl space-y-6 flex flex-col justify-between">
          <div className="space-y-4 flex-1">
            <div className="flex justify-between items-center border-b border-white/5 pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-200">Incident Takeaways Board</h3>
                <p className="text-xs text-slate-500 font-light">Collaborate on post-mortem summaries and log diagnostic checklists.</p>
              </div>
              <MessageSquare className="w-5 h-5 text-indigo-400" />
            </div>

            {/* Note logs list */}
            <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
              {notes.map((note, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-white/[0.01] border border-white/5 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <div className="font-bold text-slate-200">{note.author}</div>
                    <span className="text-[9px] px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 font-mono uppercase tracking-wider">
                      {note.project}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed font-light">{note.content}</p>
                  <div className="text-[9px] text-slate-500 font-mono text-right">{note.timestamp}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Form input shared comments */}
          <form onSubmit={handlePostNote} className="space-y-3 border-t border-white/5 pt-4">
            <div className="flex gap-4 items-center">
              <label className="text-[10px] font-bold text-slate-400 uppercase font-mono tracking-wider shrink-0">Tag Project:</label>
              <select
                value={selectedNoteProj}
                onChange={(e) => setSelectedNoteProj(e.target.value)}
                className="bg-[#0c0d12] border border-white/5 rounded-lg px-2.5 py-1 text-xs text-slate-300 focus:outline-none"
              >
                {projects.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Share takeaway checklist with SRE team..."
                value={newNoteText}
                onChange={(e) => setNewNoteText(e.target.value)}
                className="w-full bg-[#0c0d12] border border-white/5 rounded-xl px-4 py-3 text-xs text-slate-200 focus:outline-none focus:border-indigo-500/50"
                required
              />
              <button 
                type="submit" 
                className="px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold font-mono transition-colors shrink-0"
              >
                SHARE
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
