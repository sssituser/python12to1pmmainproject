import { useState, useRef } from "react";
import axios from "axios";

const API = `http://${window.location.hostname}:8000/api`;

const getToken = () => localStorage.getItem("access")?.replace(/^"|"$/g, "");

const CircleScore = ({ score }) => {
  const r = 52, c = 2 * Math.PI * r;
  const offset = c - (score / 100) * c;
  const color = score >= 70 ? "#22c55e" : score >= 40 ? "#f59e0b" : "#ef4444";
  return (
    <div className="relative w-36 h-36 mx-auto">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={r} fill="none" stroke="#1e293b" strokeWidth="10" />
        <circle cx="60" cy="60" r={r} fill="none" stroke={color} strokeWidth="10"
          strokeDasharray={c} strokeDashoffset={offset}
          strokeLinecap="round" style={{ transition: "stroke-dashoffset 1s ease" }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-black" style={{ color }}>{score}</span>
        <span className="text-xs text-slate-400 font-bold">ATS Score</span>
      </div>
    </div>
  );
};

const Tag = ({ text, color = "indigo" }) => {
  const colors = {
    indigo: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
    green: "bg-green-500/10 text-green-400 border-green-500/20",
    amber: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    purple: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${colors[color]} mr-1.5 mb-1.5`}>
      {text}
    </span>
  );
};

export default function AIResumeAnalyzer() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef();

  const handleFile = (f) => {
    if (!f) return;
    if (!["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"].includes(f.type)) {
      setError("Only PDF and DOCX files are supported."); return;
    }
    if (f.size > 5 * 1024 * 1024) { setError("File must be under 5 MB."); return; }
    setFile(f); setError("");
  };

  const handleAnalyze = async () => {
    if (!file) { setError("Please select a resume file."); return; }
    setLoading(true); setError(""); setResult(null);
    const form = new FormData();
    form.append("resume", file);
    try {
      const res = await axios.post(`${API}/ai/analyze-resume/`, form, {
        headers: { Authorization: `Bearer ${getToken()}`, "Content-Type": "multipart/form-data" },
      });
      setResult(res.data);
    } catch (e) {
      setError(e.response?.data?.error || "Analysis failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const loadExisting = async () => {
    setLoading(true); setError("");
    try {
      const res = await axios.get(`${API}/ai/resume-analysis/`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      setResult({ ...res.data, success: true });
    } catch (e) {
      setError(e.response?.data?.error || "No previous analysis found.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#0b1120] text-white p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 bg-indigo-500/10 text-indigo-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest border border-indigo-500/20 mb-4">
            <span>⚡</span> AI Powered
          </div>
          <h1 className="text-3xl md:text-4xl font-black mb-2">Resume Analyzer</h1>
          <p className="text-slate-400">Upload your resume for instant AI analysis, ATS score, and improvement suggestions.</p>
        </div>

        {/* Upload Card */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); }}
          onClick={() => fileRef.current.click()}
          className={`cursor-pointer border-2 border-dashed rounded-2xl p-10 text-center transition-all mb-6
            ${dragOver ? "border-indigo-400 bg-indigo-500/10" : "border-slate-700 hover:border-indigo-500/50 hover:bg-slate-800/50"}`}
        >
          <input ref={fileRef} type="file" accept=".pdf,.docx" className="hidden" onChange={(e) => handleFile(e.target.files[0])} />
          <div className="text-4xl mb-3">📄</div>
          {file ? (
            <div>
              <p className="text-indigo-400 font-bold text-lg">{file.name}</p>
              <p className="text-slate-500 text-sm mt-1">{(file.size / 1024).toFixed(1)} KB • Ready to analyse</p>
            </div>
          ) : (
            <div>
              <p className="text-slate-300 font-semibold text-lg">Drag & drop or click to upload</p>
              <p className="text-slate-500 text-sm mt-1">PDF or DOCX • Max 5 MB</p>
            </div>
          )}
        </div>

        {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl px-4 py-3 mb-4 text-sm">{error}</div>}

        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <button onClick={handleAnalyze} disabled={loading || !file}
            className="flex-1 py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl font-bold text-sm uppercase tracking-widest hover:opacity-90 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/20">
            {loading ? "Analysing…" : "🔍 Analyse Resume"}
          </button>
          <button onClick={loadExisting} disabled={loading}
            className="flex-1 py-3.5 bg-slate-800 border border-slate-700 rounded-xl font-bold text-sm uppercase tracking-widest hover:bg-slate-700 active:scale-95 transition-all disabled:opacity-40">
            📂 Load Previous Analysis
          </button>
        </div>

        {/* Results */}
        {result && (
          <div className="space-y-6">
            {/* ATS Score + Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col items-center justify-center">
                <CircleScore score={result.ats_score || 0} />
                <p className="mt-3 text-slate-400 text-xs font-semibold text-center">
                  {result.ats_score >= 70 ? "✅ Strong Resume" : result.ats_score >= 40 ? "⚠️ Needs Improvement" : "❌ Weak ATS Score"}
                </p>
              </div>
              <div className="md:col-span-2 grid grid-cols-2 gap-4">
                {[
                  { label: "Technical Skills", count: result.technical_skills?.length || 0, icon: "🛠️", color: "indigo" },
                  { label: "Soft Skills", count: result.soft_skills?.length || 0, icon: "🤝", color: "purple" },
                  { label: "Projects", count: result.projects?.length || 0, icon: "💡", color: "green" },
                  { label: "Certifications", count: result.certifications?.length || 0, icon: "🏆", color: "amber" },
                ].map(({ label, count, icon, color }) => (
                  <div key={label} className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                    <div className="text-2xl mb-1">{icon}</div>
                    <div className="text-2xl font-black">{count}</div>
                    <div className="text-slate-400 text-xs font-semibold">{label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Technical Skills */}
            {result.technical_skills?.length > 0 && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <h3 className="font-bold text-slate-300 mb-3 flex items-center gap-2">🛠️ Technical Skills</h3>
                <div className="flex flex-wrap">{result.technical_skills.map(s => <Tag key={s} text={s} color="indigo" />)}</div>
              </div>
            )}

            {/* Soft Skills */}
            {result.soft_skills?.length > 0 && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <h3 className="font-bold text-slate-300 mb-3 flex items-center gap-2">🤝 Soft Skills</h3>
                <div className="flex flex-wrap">{result.soft_skills.map(s => <Tag key={s} text={s} color="purple" />)}</div>
              </div>
            )}

            {/* Certifications */}
            {result.certifications?.length > 0 && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <h3 className="font-bold text-slate-300 mb-3">🏆 Certifications</h3>
                <div className="flex flex-wrap">{result.certifications.map(s => <Tag key={s} text={s} color="amber" />)}</div>
              </div>
            )}

            {/* Projects */}
            {result.projects?.length > 0 && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <h3 className="font-bold text-slate-300 mb-4">💡 Projects</h3>
                <div className="space-y-3">
                  {result.projects.map((p, i) => (
                    <div key={i} className="bg-slate-800 rounded-xl p-4">
                      <p className="font-bold text-sm text-white">{p.title || p}</p>
                      {p.description && <p className="text-slate-400 text-xs mt-1">{p.description}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Improvements */}
            {result.improvements?.length > 0 && (
              <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-6">
                <h3 className="font-bold text-amber-400 mb-4 flex items-center gap-2">⚡ AI Recommendations</h3>
                <ul className="space-y-2">
                  {result.improvements.map((tip, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-slate-300">
                      <span className="text-amber-400 font-bold mt-0.5 shrink-0">{i + 1}.</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
