import { useState } from "react";
import axios from "axios";
import { useSEO } from "../utils/useSEO";

const API = `http://${window.location.hostname}:8000/api`;
const getToken = () => localStorage.getItem("access")?.replace(/^"|"$/g, "");

const StatCard = ({ label, value, icon, color }) => {
  const colors = {
    indigo: "from-indigo-600/20 to-indigo-900/10 border-indigo-500/20 text-indigo-400",
    green: "from-green-600/20 to-green-900/10 border-green-500/20 text-green-400",
    amber: "from-amber-600/20 to-amber-900/10 border-amber-500/20 text-amber-400",
    purple: "from-purple-600/20 to-purple-900/10 border-purple-500/20 text-purple-400",
    red: "from-red-600/20 to-red-900/10 border-red-500/20 text-red-400",
    cyan: "from-cyan-600/20 to-cyan-900/10 border-cyan-500/20 text-cyan-400",
  };
  return (
    <div className={`bg-gradient-to-br ${colors[color]} border rounded-2xl p-5`}>
      <div className="text-2xl mb-2">{icon}</div>
      <div className="text-3xl font-black text-white">{value}</div>
      <div className="text-xs font-semibold text-slate-400 mt-1 uppercase tracking-wider">{label}</div>
    </div>
  );
};

export default function AIFacultyReports() {
  useSEO("AI Faculty Reports", "Generate automated performance reports, score assessments, and student progress summaries with SSSIT AI.");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const generate = async () => {
    setLoading(true); setError(""); setResult(null);
    try {
      const res = await axios.get(`${API}/ai/generate-report/?type=full`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      setResult(res.data);
    } catch (e) {
      setError(e.response?.data?.error || "Failed to generate report. Please try again.");
    } finally { setLoading(false); }
  };

  const copyReport = () => {
    if (result?.report) {
      navigator.clipboard.writeText(result.report);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const data = result?.data || {};

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#0b1120] text-white p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 bg-amber-500/10 text-amber-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest border border-amber-500/20 mb-4">
            <span>📊</span> AI Generated
          </div>
          <h1 className="text-3xl md:text-4xl font-black mb-2">AI Faculty Reports</h1>
          <p className="text-slate-400">Generate comprehensive natural-language placement & performance reports in one click.</p>
        </div>

        {/* Generate Button */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex-1">
              <h3 className="font-bold text-lg mb-1">Full Placement Report</h3>
              <p className="text-slate-400 text-sm">Includes exam performance, placement stats, department analysis, top performers, and AI recommendations.</p>
            </div>
            <button
              onClick={generate}
              disabled={loading}
              className="shrink-0 px-8 py-3.5 bg-gradient-to-r from-amber-500 to-orange-600 rounded-xl font-bold text-sm uppercase tracking-widest hover:opacity-90 active:scale-95 transition-all disabled:opacity-40 shadow-lg shadow-amber-500/20"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Generating…
                </span>
              ) : "⚡ Generate Report"}
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl p-4 mb-6 text-sm">{error}</div>
        )}

        {loading && (
          <div className="text-center py-20">
            <div className="inline-block w-10 h-10 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-slate-400 text-sm">AI is analysing placement data and writing your report…</p>
          </div>
        )}

        {result && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <StatCard label="Total Students" value={data.total_students ?? "–"} icon="🎓" color="indigo" />
              <StatCard label="Exam Attempts" value={data.total_attempts ?? "–"} icon="📝" color="purple" />
              <StatCard label="Avg Score" value={data.avg_score ?? "–"} icon="⭐" color="amber" />
              <StatCard label="Passed" value={data.passed ?? "–"} icon="✅" color="green" />
              <StatCard label="Failed" value={data.failed ?? "–"} icon="❌" color="red" />
              <StatCard label="Placement Rate" value={`${data.placement_rate ?? 0}%`} icon="💼" color="cyan" />
            </div>

            {/* Top Performers */}
            {data.top_performers?.length > 0 && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <h3 className="font-bold text-slate-300 mb-4 flex items-center gap-2">🏆 Top Performers</h3>
                <div className="flex flex-wrap gap-2">
                  {data.top_performers.map((name, i) => (
                    <div key={name} className="flex items-center gap-2 bg-slate-800 rounded-xl px-3 py-2">
                      <span className="text-lg">{i === 0 ? "🥇" : i === 1 ? "🥈" : "🥉"}</span>
                      <span className="text-sm font-semibold">{name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Subject Performance */}
            {data.subject_averages?.length > 0 && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <h3 className="font-bold text-slate-300 mb-4">📚 Subject-wise Performance</h3>
                <div className="space-y-3">
                  {data.subject_averages.map((s) => (
                    <div key={s.subject} className="flex items-center gap-4">
                      <div className="w-36 shrink-0 text-sm text-slate-400 truncate">{s.subject}</div>
                      <div className="flex-1 bg-slate-800 rounded-full h-2">
                        <div
                          className="h-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"
                          style={{ width: `${Math.min(100, (s.avg / 100) * 100)}%` }}
                        />
                      </div>
                      <div className="w-16 text-right text-sm font-bold text-white">{s.avg} pts</div>
                      <div className="w-20 text-right text-xs text-slate-500">{s.count} attempts</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* AI Report Text */}
            <div className="bg-slate-900 border border-amber-500/20 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-amber-400 flex items-center gap-2">⚡ AI Generated Report</h3>
                <button
                  onClick={copyReport}
                  className="text-xs text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg px-3 py-1.5 transition-all"
                >
                  {copied ? "✅ Copied!" : "📋 Copy"}
                </button>
              </div>
              <pre className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap font-sans">
                {result.report}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
