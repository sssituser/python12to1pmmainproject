import { useState, useEffect } from "react";
import axios from "axios";
import { useSEO } from "../utils/useSEO";

const API = `http://${window.location.hostname}:8000/api`;
const getToken = () => localStorage.getItem("access")?.replace(/^"|"$/g, "");

const MatchBadge = ({ pct }) => {
  const color = pct >= 70 ? "text-green-400 bg-green-500/10 border-green-500/30"
    : pct >= 40 ? "text-amber-400 bg-amber-500/10 border-amber-500/30"
    : "text-red-400 bg-red-500/10 border-red-500/30";
  return <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-black border ${color}`}>{pct}% match</span>;
};

const SkillTag = ({ skill, variant = "match" }) => {
  const styles = variant === "match"
    ? "bg-green-500/10 text-green-400 border-green-500/20"
    : "bg-red-500/10 text-red-400 border-red-500/20";
  return <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold border mr-1 mb-1 ${styles}`}>{skill}</span>;
};

export default function AIJobRecommendations() {
  useSEO("AI Job Recommendations", "Discover student jobs and career recommendations curated by SSSIT AI according to skill matches.");
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(null);
  const [gap, setGap] = useState(null);
  const [gapLoading, setGapLoading] = useState(false);
  const [interview, setInterview] = useState(null);
  const [interviewLoading, setInterviewLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("jobs");
  const [studentSkills, setStudentSkills] = useState([]);

  useEffect(() => {
    axios.get(`${API}/ai/job-recommendations/`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    }).then(res => {
      setJobs(res.data.jobs || []);
      setStudentSkills(res.data.student_skills || []);
    }).catch(e => {
      setError(e.response?.data?.error || "Failed to load recommendations.");
    }).finally(() => setLoading(false));
  }, []);

  const loadGap = async (job) => {
    setSelected(job); setGap(null); setInterview(null); setGapLoading(true); setActiveTab("gap");
    try {
      const res = await axios.get(`${API}/ai/skill-gap/?job_id=${job.id}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      setGap(res.data);
    } catch (e) {
      setGap({ error: e.response?.data?.error || "Failed to load skill gap." });
    } finally { setGapLoading(false); }
  };

  const loadInterview = async (job) => {
    setSelected(job); setInterview(null); setInterviewLoading(true); setActiveTab("interview");
    try {
      const res = await axios.post(`${API}/ai/generate-interview/`,
        { job_role: job.job_title, company: job.company },
        { headers: { Authorization: `Bearer ${getToken()}`, "Content-Type": "application/json" } }
      );
      setInterview(res.data);
    } catch (e) {
      setInterview({ error: e.response?.data?.error || "Failed to generate questions." });
    } finally { setInterviewLoading(false); }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#0b1120] text-white p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 bg-green-500/10 text-green-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest border border-green-500/20 mb-4">
            <span>🎯</span> AI Matched
          </div>
          <h1 className="text-3xl md:text-4xl font-black mb-2">Job Recommendations</h1>
          <p className="text-slate-400">Jobs ranked by how well they match your skills.</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 bg-slate-900 border border-slate-800 rounded-xl p-1 w-fit">
          {["jobs", "gap", "interview"].map(t => (
            <button key={t} onClick={() => setActiveTab(t)}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all
                ${activeTab === t ? "bg-indigo-600 text-white shadow-lg" : "text-slate-400 hover:text-white"}`}>
              {t === "jobs" ? "💼 Jobs" : t === "gap" ? "📊 Skill Gap" : "🎙️ Interview Prep"}
            </button>
          ))}
        </div>

        {/* Jobs Tab */}
        {activeTab === "jobs" && (
          <div>
            {loading && <div className="text-center py-20 text-slate-400">Loading recommendations…</div>}
            {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl p-4 mb-4">{error}</div>}
            {!loading && jobs.length === 0 && !error && (
              <div className="text-center py-20 text-slate-400">
                <div className="text-5xl mb-4">📄</div>
                <p className="font-semibold">No recommendations yet.</p>
                <p className="text-sm mt-1">Upload your resume or add skills to your profile first.</p>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {jobs.map(job => (
                <div key={job.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-indigo-500/40 transition-all">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-black text-lg leading-tight">{job.job_title}</h3>
                      <p className="text-indigo-400 font-semibold text-sm">{job.company}</p>
                      {job.location && <p className="text-slate-500 text-xs mt-0.5">📍 {job.location}</p>}
                    </div>
                    <MatchBadge pct={job.match_percentage} />
                  </div>

                  {/* Match bar */}
                  <div className="w-full bg-slate-800 rounded-full h-1.5 mb-3">
                    <div className="h-1.5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all"
                      style={{ width: `${job.match_percentage}%` }} />
                  </div>

                  <div className="mb-3">
                    <p className="text-xs text-slate-500 font-bold uppercase mb-1">Matched Skills</p>
                    <div className="flex flex-wrap">{(job.matched_skills || []).slice(0, 5).map(s => <SkillTag key={s} skill={s} variant="match" />)}</div>
                  </div>
                  {job.missing_skills?.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs text-slate-500 font-bold uppercase mb-1">Missing Skills</p>
                      <div className="flex flex-wrap">{(job.missing_skills || []).slice(0, 4).map(s => <SkillTag key={s} skill={s} variant="missing" />)}</div>
                    </div>
                  )}

                  <div className="flex gap-2 mt-4">
                    <button onClick={() => loadGap(job)}
                      className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-bold uppercase tracking-widest transition-all">
                      📊 Skill Gap
                    </button>
                    <button onClick={() => loadInterview(job)}
                      className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-xs font-bold uppercase tracking-widest transition-all">
                      🎙️ Prep Interview
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Skill Gap Tab */}
        {activeTab === "gap" && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            {!selected && <p className="text-slate-400 text-center py-10">Select a job from the Jobs tab to see your skill gap.</p>}
            {selected && (
              <div>
                <h2 className="text-xl font-black mb-1">{selected.job_title}</h2>
                <p className="text-indigo-400 font-semibold text-sm mb-6">{selected.company}</p>
                {gapLoading && <p className="text-slate-400 text-center py-10">Analysing skill gap…</p>}
                {gap && !gap.error && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-sm font-bold uppercase text-slate-400 mb-2">Missing Skills</h3>
                      <div className="flex flex-wrap">{(gap.missing_skills || []).map(s => <SkillTag key={s} skill={s} variant="missing" />)}</div>
                    </div>
                    <div>
                      <h3 className="text-sm font-bold uppercase text-slate-400 mb-3">📅 Learning Roadmap ({gap.estimated_weeks} weeks)</h3>
                      <div className="space-y-3">
                        {(gap.roadmap || []).map((r, i) => (
                          <div key={i} className="flex items-start gap-4 bg-slate-800 rounded-xl p-4">
                            <div className="shrink-0 w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center font-black text-sm">W{r.week}</div>
                            <div>
                              <p className="font-bold text-sm">{r.topic}</p>
                              <p className="text-slate-400 text-xs mt-0.5">{r.resources}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                {gap?.error && <p className="text-red-400">{gap.error}</p>}
              </div>
            )}
          </div>
        )}

        {/* Interview Prep Tab */}
        {activeTab === "interview" && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            {!selected && <p className="text-slate-400 text-center py-10">Select a job to generate interview questions.</p>}
            {selected && (
              <div>
                <h2 className="text-xl font-black mb-1">{selected.job_title}</h2>
                <p className="text-indigo-400 font-semibold text-sm mb-6">{selected.company}</p>
                {interviewLoading && <p className="text-slate-400 text-center py-10">Generating questions…</p>}
                {interview && !interview.error && (
                  <div className="space-y-6">
                    {[
                      { key: "technical", label: "🛠️ Technical", color: "indigo" },
                      { key: "hr", label: "🤝 HR Questions", color: "purple" },
                      { key: "coding", label: "💻 Coding Challenges", color: "green" },
                      { key: "company_specific", label: "🏢 Company Specific", color: "amber" },
                    ].map(({ key, label, color }) => (
                      interview[key]?.length > 0 && (
                        <div key={key}>
                          <h3 className="font-bold text-sm uppercase tracking-widest text-slate-400 mb-3">{label}</h3>
                          <div className="space-y-2">
                            {interview[key].map((q, i) => (
                              <div key={i} className="bg-slate-800 rounded-xl p-4 text-sm">
                                <span className="text-indigo-400 font-bold mr-2">Q{i + 1}.</span>{q}
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                    ))}
                  </div>
                )}
                {interview?.error && <p className="text-red-400">{interview.error}</p>}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
