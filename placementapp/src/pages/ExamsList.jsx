import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useSEO } from "../utils/useSEO";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faClipboardList, faClock, faBook, faShieldAlt, faCamera,
  faPlay, faSearch, faCalendarAlt, faTrophy, faCheckCircle,
  faTimesCircle, faUsers, faLock, faSpinner, faExclamationTriangle,
  faArrowRight, faGraduationCap, faFilter, faBolt, faChartBar
} from "@fortawesome/free-solid-svg-icons";

const API_BASE = `http://${window.location.hostname}:8000/api`;


const TYPE_META = {
  daily:        { label: "Daily Exam",           emoji: "📅", bg: "#eff6ff", color: "#2563eb", border: "#bfdbfe" },
  weekly:       { label: "Weekly Exam",          emoji: "📆", bg: "#f5f3ff", color: "#7c3aed", border: "#ddd6fe" },
  monthly:      { label: "Monthly Exam",         emoji: "🗓️",  bg: "#fdf4ff", color: "#a21caf", border: "#f0abfc" },
  placement:    { label: "Placement Assessment", emoji: "🎯", bg: "#fefce8", color: "#ca8a04", border: "#fde68a" },
  mock:         { label: "Mock Interview",       emoji: "🎭", bg: "#fff1f2", color: "#e11d48", border: "#fecdd3" },
  certification:{ label: "Certification",        emoji: "🏆", bg: "#f0fdf4", color: "#16a34a", border: "#bbf7d0" },
};

export default function StudentExamHub() {
  useSEO("Exams Hub", "Access daily, weekly, and monthly exams on the SSSIT Placement Portal. Track your performance and prepare for placements.");
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [studentCourse, setStudentCourse] = useState("");
  const [studentName, setStudentName] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = (localStorage.getItem("access") || "").replace(/^"|"$/g, "");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        // Fetch student profile + exams in parallel
        const [profileRes, examsRes] = await Promise.allSettled([
          axios.get(`${API_BASE}/profile/`, { headers }),
          axios.get(`${API_BASE}/exams/list/`)
        ]);

        if (profileRes.status === "fulfilled") {
          const p = profileRes.value.data;
          setStudentCourse(p.course_title || p.enrolled_courses?.[0] || "");
          setStudentName(p.first_name || p.username || "Student");
        }

        if (examsRes.status === "fulfilled") {
          setExams(examsRes.value.data || []);
        }
      } catch (e) {
        console.warn(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const now = new Date();

  const getExamStatus = (exam) => {
    if (!exam.start_time || !exam.end_time) return "available";
    const start = new Date(exam.start_time);
    const end = new Date(exam.end_time);
    if (now < start) return "upcoming";
    if (now > end) return "ended";
    return "live";
  };

  const filtered = exams.filter(e => {
    const matchSearch =
      e.title?.toLowerCase().includes(search.toLowerCase()) ||
      e.subject?.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || e.exam_type === filter;
    return matchSearch && matchFilter;
  });

  const liveExams = exams.filter(e => getExamStatus(e) === "live").length;
  const upcomingExams = exams.filter(e => getExamStatus(e) === "upcoming").length;

  const handleStartExam = (exam) => {
    // Store exam config in sessionStorage for the exam engine to pick up
    sessionStorage.setItem("active_exam_config", JSON.stringify(exam));
    // Route to the relevant exam page based on type
    if (exam.exam_type === "daily") {
      navigate(`/dashboard/daily-exam/${exam.subject?.toLowerCase().replace(/\s+/g, "_")}`);
    } else if (exam.exam_type === "weekly") {
      navigate("/dashboard/weekly-exam");
    } else if (exam.exam_type === "monthly") {
      navigate("/dashboard/monthly-exam");
    } else {
      // For placement/mock/certification — use daily exam engine with stored config
      navigate(`/dashboard/daily-exam/${exam.subject?.toLowerCase().replace(/\s+/g, "_")}`);
    }
  };

  const StatusBadge = ({ exam }) => {
    const status = getExamStatus(exam);
    const configs = {
      live:      { label: "🔴 LIVE",     bg: "#fef2f2", color: "#dc2626", border: "#fecaca" },
      upcoming:  { label: "🟡 Upcoming", bg: "#fffbeb", color: "#d97706", border: "#fde68a" },
      ended:     { label: "⚫ Ended",    bg: "#f1f5f9", color: "#64748b", border: "#e2e8f0" },
      available: { label: "🟢 Open",     bg: "#f0fdf4", color: "#16a34a", border: "#bbf7d0" },
    };
    const c = configs[status];
    return (
      <span style={{
        padding: "4px 10px", borderRadius: 20, fontSize: 10, fontWeight: 800,
        background: c.bg, color: c.color, border: `1px solid ${c.border}`,
        textTransform: "uppercase", letterSpacing: "0.05em"
      }}>{c.label}</span>
    );
  };

  return (
    <div style={{ fontFamily: "'Outfit','Inter',sans-serif", color: "#1e293b", width: "100%" }}>

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 160px 160px 160px", gap: 16, marginBottom: 24 }}>

        {/* Banner */}
        <div style={{ background: "linear-gradient(135deg,#1e1b4b 0%,#4338ca 60%,#6366f1 100%)", borderRadius: 16, padding: "24px 28px", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", right: -20, top: -20, width: 130, height: 130, background: "rgba(255,255,255,0.06)", borderRadius: "50%" }} />
          <div style={{ position: "absolute", right: 60, bottom: -30, width: 80, height: 80, background: "rgba(255,255,255,0.04)", borderRadius: "50%" }} />
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 6 }}>
            Welcome back, {studentName} 👋
          </div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 900, color: "#fff", marginBottom: 6 }}>My Examinations</h1>
          <p style={{ margin: "0 0 18px", fontSize: 12, color: "rgba(255,255,255,0.65)" }}>
            {studentCourse ? `${studentCourse} — Assessment Hub` : "Your scheduled assessments and tests"}
          </p>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => navigate("/dashboard/daily-exam")} style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 18px", borderRadius: 10, border: "none", cursor: "pointer", background: "#fff", color: "#4338ca", fontWeight: 800, fontSize: 12, boxShadow: "0 2px 10px rgba(0,0,0,0.15)" }}>
              <FontAwesomeIcon icon={faBook} /> Practice Exams
            </button>
            <button onClick={() => navigate("/dashboard/exam-reports")} style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 16px", borderRadius: 10, border: "none", cursor: "pointer", background: "rgba(255,255,255,0.15)", color: "#fff", fontWeight: 700, fontSize: 12 }}>
              <FontAwesomeIcon icon={faChartBar} /> My Results
            </button>
          </div>
        </div>

        {/* Total stat */}
        <div style={{ background: "#f8fafc", borderRadius: 16, padding: "20px", border: "1.5px solid #e2e8f0", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div style={{ width: 38, height: 38, background: "#eff6ff", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <FontAwesomeIcon icon={faClipboardList} style={{ color: "#2563eb", fontSize: 16 }} />
          </div>
          <div>
            <div style={{ fontSize: 10, fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>Total Exams</div>
            <div style={{ fontSize: 30, fontWeight: 900, color: "#0f172a" }}>{exams.length}</div>
          </div>
        </div>

        {/* Live stat */}
        <div style={{ background: "#fef2f2", borderRadius: 16, padding: "20px", border: "1.5px solid #fecaca", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div style={{ width: 38, height: 38, background: "#fee2e2", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <FontAwesomeIcon icon={faBolt} style={{ color: "#dc2626", fontSize: 16 }} />
          </div>
          <div>
            <div style={{ fontSize: 10, fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>Live Now</div>
            <div style={{ fontSize: 30, fontWeight: 900, color: "#dc2626" }}>{liveExams}</div>
          </div>
        </div>

        {/* Upcoming stat */}
        <div style={{ background: "#fffbeb", borderRadius: 16, padding: "20px", border: "1.5px solid #fde68a", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div style={{ width: 38, height: 38, background: "#fef3c7", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <FontAwesomeIcon icon={faCalendarAlt} style={{ color: "#d97706", fontSize: 16 }} />
          </div>
          <div>
            <div style={{ fontSize: 10, fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>Upcoming</div>
            <div style={{ fontSize: 30, fontWeight: 900, color: "#d97706" }}>{upcomingExams}</div>
          </div>
        </div>
      </div>

      {/* ── Search & Filter ─────────────────────────────────────────────── */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
          <FontAwesomeIcon icon={faSearch} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#94a3b8", fontSize: 12 }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search exams by title or subject..."
            style={{ width: "100%", padding: "10px 14px 10px 36px", borderRadius: 12, border: "1.5px solid #e2e8f0", fontSize: 13, fontWeight: 600, outline: "none", boxSizing: "border-box", background: "#fff" }} />
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {["all", "daily", "weekly", "monthly", "placement", "mock", "certification"].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding: "9px 14px", borderRadius: 10, border: "none", cursor: "pointer",
              fontWeight: 700, fontSize: 11, textTransform: "capitalize",
              background: filter === f ? "#6366f1" : "#f1f5f9",
              color: filter === f ? "#fff" : "#64748b", transition: "all 0.15s"
            }}>{f === "all" ? "All Types" : TYPE_META[f]?.emoji + " " + TYPE_META[f]?.label}</button>
          ))}
        </div>
      </div>

      {/* ── Exam Cards Grid ─────────────────────────────────────────────── */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "60px 0", color: "#94a3b8" }}>
          <FontAwesomeIcon icon={faSpinner} spin style={{ fontSize: 32, marginBottom: 12 }} />
          <div style={{ fontWeight: 700 }}>Loading your exams...</div>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 0", background: "#f8fafc", borderRadius: 16, border: "2px dashed #e2e8f0" }}>
          <FontAwesomeIcon icon={faClipboardList} style={{ fontSize: 40, color: "#94a3b8", marginBottom: 12 }} />
          <div style={{ fontWeight: 800, fontSize: 15, color: "#64748b" }}>
            {search ? "No exams match your search." : "No exams published yet. Check back soon!"}
          </div>
          <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>Your faculty will publish exams here</div>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 16 }}>
          {filtered.map(exam => {
            const status = getExamStatus(exam);
            const meta = TYPE_META[exam.exam_type] || TYPE_META.daily;
            const canStart = status === "live" || status === "available";

            return (
              <div key={exam.id} style={{
                background: "#fff", borderRadius: 16,
                border: `1.5px solid ${canStart ? "#e2e8f0" : "#f1f5f9"}`,
                overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                transition: "all 0.2s", cursor: canStart ? "pointer" : "default",
                opacity: status === "ended" ? 0.7 : 1
              }}
                onMouseEnter={e => canStart && (e.currentTarget.style.boxShadow = "0 8px 30px rgba(99,102,241,0.15)")}
                onMouseLeave={e => e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.06)"}
              >
                {/* Card top accent */}
                <div style={{ height: 4, background: `linear-gradient(90deg, ${meta.color}, ${meta.color}99)` }} />

                <div style={{ padding: "18px 20px" }}>
                  {/* Type badge + Status */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                    <span style={{ padding: "4px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, background: meta.bg, color: meta.color, border: `1px solid ${meta.border}` }}>
                      {meta.emoji} {meta.label}
                    </span>
                    <StatusBadge exam={exam} />
                  </div>

                  {/* Exam title */}
                  <h3 style={{ margin: "0 0 6px", fontSize: 15, fontWeight: 900, color: "#0f172a", lineHeight: 1.3 }}>{exam.title}</h3>
                  <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600, marginBottom: 14 }}>
                    {exam.subject} {exam.course ? `• ${exam.course}` : ""}
                  </div>

                  {/* Stats row */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 16 }}>
                    {[
                      { icon: faClock, label: "Duration", val: `${exam.duration} min` },
                      { icon: faClipboardList, label: "Questions", val: exam.total_questions },
                      { icon: faTrophy, label: "Marks", val: exam.total_marks },
                    ].map(s => (
                      <div key={s.label} style={{ padding: "8px 10px", background: "#f8fafc", borderRadius: 10, textAlign: "center" }}>
                        <FontAwesomeIcon icon={s.icon} style={{ color: "#94a3b8", fontSize: 11, marginBottom: 4 }} />
                        <div style={{ fontSize: 13, fontWeight: 800, color: "#0f172a" }}>{s.val}</div>
                        <div style={{ fontSize: 9, color: "#94a3b8", fontWeight: 700, textTransform: "uppercase" }}>{s.label}</div>
                      </div>
                    ))}
                  </div>

                  {/* Security icons */}
                  <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
                    {exam.settings?.fullscreen_required && (
                      <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10, fontWeight: 700, color: "#7c3aed", background: "#f5f3ff", padding: "3px 8px", borderRadius: 8, border: "1px solid #ddd6fe" }}>
                        <FontAwesomeIcon icon={faLock} /> Fullscreen
                      </span>
                    )}
                  </div>

                  {/* Schedule info */}
                  {exam.start_time && (
                    <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600, marginBottom: 14, display: "flex", alignItems: "center", gap: 6 }}>
                      <FontAwesomeIcon icon={faCalendarAlt} />
                      {new Date(exam.start_time).toLocaleString()} → {new Date(exam.end_time).toLocaleString()}
                    </div>
                  )}

                  {/* Start Button */}
                  <button
                    onClick={() => canStart && handleStartExam(exam)}
                    disabled={!canStart}
                    style={{
                      width: "100%", padding: "11px", borderRadius: 12, border: "none",
                      cursor: canStart ? "pointer" : "not-allowed",
                      background: canStart
                        ? (status === "live" ? "linear-gradient(135deg,#dc2626,#ef4444)" : "linear-gradient(135deg,#4338ca,#6366f1)")
                        : "#f1f5f9",
                      color: canStart ? "#fff" : "#94a3b8",
                      fontWeight: 800, fontSize: 13,
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                      boxShadow: canStart ? "0 4px 15px rgba(99,102,241,0.3)" : "none",
                      transition: "all 0.2s"
                    }}
                  >
                    {status === "live" ? (
                      <><FontAwesomeIcon icon={faBolt} /> Start Live Exam</>
                    ) : status === "upcoming" ? (
                      <><FontAwesomeIcon icon={faCalendarAlt} /> Starts {new Date(exam.start_time).toLocaleDateString()}</>
                    ) : status === "ended" ? (
                      <><FontAwesomeIcon icon={faTimesCircle} /> Exam Ended</>
                    ) : (
                      <><FontAwesomeIcon icon={faPlay} /> Start Exam</>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
