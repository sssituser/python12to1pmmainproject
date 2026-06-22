import { useState } from "react";
import axios from "axios";

const API = `http://${window.location.hostname}:8000/api`;
const getToken = () => localStorage.getItem("access")?.replace(/^"|"$/g, "");

const ScoreBadge = ({ score }) => {
  const color = score >= 70 ? "text-green-400 border-green-500/40 bg-green-500/10"
    : score >= 40 ? "text-amber-400 border-amber-500/40 bg-amber-500/10"
    : "text-red-400 border-red-500/40 bg-red-500/10";
  return (
    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full border text-sm font-black ${color}`}>
      {score}% match
    </span>
  );
};

export default function AICandidateRanker() {
  const [query, setQuery] = useState("");
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);

  const suggestions = [
    "Django, React, Docker",
    "Python, Machine Learning",
    "Java, Spring Boot",
    "SQL, Data Analysis",
    "AWS, Kubernetes, DevOps",
  ];

  const search = async () => {
    if (!query.trim()) return;
    setLoading(true); setError(""); setCandidates([]); setSearched(true);
    try {
      const res = await axios.get(`${API}/ai/rank-candidates/?query=${encodeURIComponent(query)}&top_k=15`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      setCandidates(res.data.candidates || []);
    } catch (e) {
      setError(e.response?.data?.error || "Search failed. Please try again.");
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#0b1120] text-white p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 bg-purple-500/10 text-purple-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest border border-purple-500/20 mb-4">
            <span>🤖</span> AI Ranked
          </div>
          <h1 className="text-3xl md:text-4xl font-black mb-2">Candidate Ranker</h1>
          <p className="text-slate-400">Search candidates using natural language — ranked by AI relevance, not just keywords.</p>
        </div>

        {/* Search Box */}
        <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === "Enter" && search()}
              placeholder='e.g. "Find students skilled in Django, React, Docker and AWS"'
              className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
            <button onClick={search} disabled={loading || !query.trim()}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl font-bold text-sm uppercase tracking-widest hover:opacity-90 active:scale-95 transition-all disabled:opacity-40 whitespace-nowrap shadow-lg shadow-purple-500/20">
              {loading ? "Searching…" : "🔍 Search"}
            </button>
          </div>

          {/* Suggestions */}
          <div className="mt-4">
            <p className="text-slate-500 text-xs font-semibold uppercase tracking-widest mb-2">Quick searches</p>
            <div className="flex flex-wrap gap-2">
              {suggestions.map(s => (
                <button key={s} onClick={() => { setQuery(s); }}
                  className="px-3 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-full text-xs text-slate-400 hover:text-white transition-all">
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl p-4 mb-4 text-sm">{error}</div>}

        {loading && (
          <div className="text-center py-20">
            <div className="inline-block w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-slate-400">Searching and ranking candidates…</p>
          </div>
        )}

        {!loading && searched && candidates.length === 0 && !error && (
          <div className="text-center py-20 text-slate-400">
            <div className="text-5xl mb-4">🔎</div>
            <p className="font-semibold">No candidates found for your query.</p>
            <p className="text-sm mt-1">Try different skills or broader search terms.</p>
          </div>
        )}

        {candidates.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-lg">
                Found <span className="text-purple-400">{candidates.length}</span> candidates
              </h2>
              <p className="text-slate-400 text-xs">Ranked by AI relevance score</p>
            </div>
            <div className="space-y-3">
              {candidates.map((c, idx) => (
                <div key={c.student_id}
                  className={`bg-slate-900 border rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center gap-4 transition-all hover:border-purple-500/40
                    ${idx === 0 ? "border-purple-500/50 ring-1 ring-purple-500/20" : "border-slate-800"}`}>

                  {/* Rank badge */}
                  <div className={`shrink-0 w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg
                    ${idx === 0 ? "bg-gradient-to-br from-purple-600 to-indigo-600" : "bg-slate-800 text-slate-400"}`}>
                    {idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : `#${idx + 1}`}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="font-black text-base">{c.full_name}</h3>
                      <span className="text-slate-500 text-xs">@{c.username}</span>
                      {idx === 0 && <span className="text-xs bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded-full px-2 py-0.5 font-bold">Best Match</span>}
                    </div>
                    <p className="text-slate-400 text-sm mb-2">{c.college || "College not specified"} {c.cgpa ? `• CGPA: ${c.cgpa}` : ""}</p>
                    <div className="flex flex-wrap gap-1">
                      {(c.skills || []).slice(0, 6).map(s => (
                        <span key={s} className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded-full text-xs border border-slate-700">{s}</span>
                      ))}
                      {c.skills?.length > 6 && <span className="text-slate-500 text-xs px-1">+{c.skills.length - 6} more</span>}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <ScoreBadge score={Math.round(c.relevance_score)} />
                    <a href={`mailto:${c.email}`}
                      className="text-xs text-slate-400 hover:text-indigo-400 transition-colors">{c.email}</a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
