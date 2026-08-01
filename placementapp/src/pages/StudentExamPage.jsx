import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

const API_BASE = `http://${window.location.hostname}:8000/api`;

// ── helpers ──────────────────────────────────────────────────────────────────
const getToken = () => (localStorage.getItem("access") || "").replace(/^"|"$/g, "");
const authH = () => ({ Authorization: `Bearer ${getToken()}` });
const fmtTime = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

// ── Shuffle ───────────────────────────────────────────────────────────────────
const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

export default function StudentExamPage() {
  const { examId } = useParams();
  const navigate = useNavigate();

  // ── Phase: "loading" | "briefing" | "exam" | "submitted" | "error"
  const [phase, setPhase] = useState("loading");
  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});        // { qIdx: optionIdx }
  const [currentQ, setCurrentQ] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [tabViolations, setTabViolations] = useState(0);
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [flagged, setFlagged] = useState({});        // flagged questions
  const timerRef = useRef(null);
  const submittedRef = useRef(false);

  // ── Load exam ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        const res = await axios.get(`${API_BASE}/exams/${examId}/`, { headers: authH() });
        const data = res.data;
        setExam(data);

        // Check if student has already completed this exam
        if (data.already_taken) {
          setPhase("already_taken");
          return;
        }

        let qs = (data.questions || []).map((q, i) => ({
          ...q,
          _idx: i,
          _options: data.settings?.randomize_options ? shuffle(q.options || []) : (q.options || [])
        }));
        if (data.settings?.randomize_questions) qs = shuffle(qs);
        setQuestions(qs);
        setTimeLeft((data.duration || 60) * 60);
        setPhase("briefing");
      } catch (e) {
        setErrorMsg(e.response?.data?.detail || "Failed to load exam. Please try again.");
        setPhase("error");
      }
    };
    load();
  }, [examId]);

  // ── Auto-submit ───────────────────────────────────────────────────────────
  const submitExam = useCallback(async (auto = false) => {
    if (submittedRef.current) return;
    submittedRef.current = true;
    clearInterval(timerRef.current);
    setIsSubmitting(true);

    // Compute score
    let score = 0;
    let correct = 0;
    let wrong = 0;
    const negMark = exam?.settings?.negative_marking ? (exam?.settings?.negative_marks || 0.25) : 0;
    const mpp = exam?.marks_per_question || 1;

    questions.forEach((q, qi) => {
      const chosen = answers[qi];
      if (chosen === undefined) return;
      const correctIdx = q._options.findIndex((_, oi) => q._options[oi] === q._options[q.correct_option_index ?? q.correct ?? 0]);
      if (chosen === correctIdx) { score += mpp; correct++; }
      else { score -= negMark; wrong++; }
    });
    score = Math.max(0, score);
    const pass = score >= (exam?.pass_marks || 0);

    const payload = {
      exam_id: examId,
      score,
      total: exam?.total_marks || questions.length,
      correct,
      wrong,
      unattempted: questions.length - correct - wrong,
      time_taken: (exam?.duration || 60) * 60 - timeLeft,
      passed: pass,
      auto_submitted: auto
    };

    try {
      await axios.post(`${API_BASE}/exams/${examId}/submit/`, payload, { headers: authH() });
    } catch (e) { /* best-effort */ }

    setResult({ ...payload, pass });
    setPhase("submitted");
    setIsSubmitting(false);
    // Exit fullscreen
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
  }, [exam, examId, questions, answers, timeLeft]);

  // ── Timer ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== "exam") return;
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(timerRef.current); submitExam(true); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [phase, submitExam]);

  // ── Tab / visibility violation ────────────────────────────────────────────
  useEffect(() => {
    if (phase !== "exam") return;
    const limit = exam?.settings?.tab_switch_limit ?? 3;
    const handleBlur = () => {
      setTabViolations(v => {
        const next = v + 1;
        if (next >= limit && exam?.settings?.auto_submit) submitExam(true);
        return next;
      });
    };
    window.addEventListener("blur", handleBlur);
    return () => window.removeEventListener("blur", handleBlur);
  }, [phase, exam, submitExam]);

  // ── Prevent copy-paste on exam ────────────────────────────────────────────
  useEffect(() => {
    if (phase !== "exam") return;
    if (!exam?.settings?.disable_copy_paste) return;
    const block = (e) => e.preventDefault();
    document.addEventListener("copy", block);
    document.addEventListener("paste", block);
    document.addEventListener("cut", block);
    return () => {
      document.removeEventListener("copy", block);
      document.removeEventListener("paste", block);
      document.removeEventListener("cut", block);
    };
  }, [phase, exam]);

  // ── Right-click ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== "exam") return;
    if (!exam?.settings?.disable_right_click) return;
    const block = (e) => e.preventDefault();
    document.addEventListener("contextmenu", block);
    return () => document.removeEventListener("contextmenu", block);
  }, [phase, exam]);

  // ── Fullscreen ────────────────────────────────────────────────────────────
  const enterFullscreen = () => {
    const el = document.documentElement;
    if (el.requestFullscreen) el.requestFullscreen();
    else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
  };

  const startExam = () => {
    if (exam?.settings?.fullscreen_required) enterFullscreen();
    setPhase("exam");
  };

  // ── Select answer ─────────────────────────────────────────────────────────
  const selectAnswer = (qi, oi) => {
    setAnswers(prev => ({ ...prev, [qi]: oi }));
  };

  const toggleFlag = (qi) => setFlagged(prev => ({ ...prev, [qi]: !prev[qi] }));

  // ─────────────────────────── RENDER ──────────────────────────────────────
  if (phase === "loading") return (
    <div className="fixed inset-0 flex items-center justify-center bg-slate-950">
      <div className="text-center text-white">
        <div className="w-14 h-14 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-lg font-bold">Loading Exam...</p>
      </div>
    </div>
  );

  if (phase === "already_taken") return (
    <div className="fixed inset-0 flex items-center justify-center bg-slate-950 p-4">
      <div className="bg-white rounded-3xl p-10 text-center max-w-md w-full shadow-2xl">
        <div className="w-20 h-20 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center text-4xl mx-auto mb-6">
          🔒
        </div>
        <h2 className="text-2xl font-black text-slate-900 mb-2">Test Already Completed</h2>
        <p className="text-slate-500 text-sm mb-6 leading-relaxed">
          You have already taken the test <strong>"{exam?.title}"</strong>. Multiple attempts are not permitted for this assessment.
        </p>
        <button onClick={() => navigate("/dashboard/exams")} className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold transition shadow-lg shadow-indigo-200">
          Return to Exams
        </button>
      </div>
    </div>
  );

  if (phase === "error") return (
    <div className="fixed inset-0 flex items-center justify-center bg-slate-950 p-4">
      <div className="bg-white rounded-2xl p-10 text-center max-w-md w-full shadow-2xl">
        <div className="text-5xl mb-4">❌</div>
        <h2 className="text-xl font-black text-red-600 mb-2">Cannot Load Exam</h2>
        <p className="text-slate-500 mb-6">{errorMsg}</p>
        <button onClick={() => navigate(-1)} className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold">
          ← Go Back
        </button>
      </div>
    </div>
  );

  if (phase === "submitted" && result) {
    const pct = Math.round((result.score / result.total) * 100);
    return (
      <div className="fixed inset-0 overflow-auto bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full overflow-hidden">
          <div className={`p-8 text-center text-white ${result.pass ? "bg-gradient-to-r from-emerald-500 to-green-600" : "bg-gradient-to-r from-red-500 to-rose-600"}`}>
            <div className="text-6xl mb-3">{result.pass ? "🎉" : "😔"}</div>
            <h1 className="text-3xl font-black mb-1">{result.pass ? "Congratulations!" : "Better Luck Next Time"}</h1>
            <p className="opacity-80">{result.pass ? "You passed the exam!" : "You did not meet the passing criteria."}</p>
          </div>
          <div className="p-8">
            {/* Score Circle */}
            <div className="flex justify-center mb-8">
              <div className="relative w-36 h-36">
                <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                  <circle cx="60" cy="60" r="50" fill="none" stroke="#f1f5f9" strokeWidth="12"/>
                  <circle cx="60" cy="60" r="50" fill="none"
                    stroke={result.pass ? "#10b981" : "#ef4444"}
                    strokeWidth="12"
                    strokeDasharray={`${2 * Math.PI * 50}`}
                    strokeDashoffset={`${2 * Math.PI * 50 * (1 - pct / 100)}`}
                    strokeLinecap="round"
                    style={{ transition: "stroke-dashoffset 1s ease" }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-black text-slate-800">{pct}%</span>
                  <span className="text-xs font-bold text-slate-400">Score</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-8">
              {[
                { label: "Score", value: `${result.score}/${result.total}`, color: "indigo" },
                { label: "Correct", value: result.correct, color: "green" },
                { label: "Wrong", value: result.wrong, color: "red" },
              ].map(s => (
                <div key={s.label} className={`rounded-2xl p-4 text-center bg-${s.color}-50 border border-${s.color}-100`}>
                  <div className={`text-2xl font-black text-${s.color}-600`}>{s.value}</div>
                  <div className="text-xs font-bold text-slate-500 mt-1 uppercase tracking-wide">{s.label}</div>
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <button onClick={() => navigate("/dashboard/exams")}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition">
                Back to Exams
              </button>
              <button onClick={() => navigate("/dashboard")}
                className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition">
                Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (phase === "briefing") return (
    <div className="fixed inset-0 overflow-auto bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-8 text-white">
          <div className="text-4xl mb-3">📋</div>
          <h1 className="text-2xl font-black">{exam?.title}</h1>
          <p className="opacity-70 text-sm mt-1">{exam?.subject} · {exam?.exam_type?.toUpperCase()}</p>
        </div>
        <div className="p-8">
          <h3 className="text-sm font-black text-slate-400 uppercase tracking-wider mb-4">Exam Details</h3>
          <div className="grid grid-cols-2 gap-3 mb-6">
            {[
              { label: "⏱️ Duration", value: `${exam?.duration || 60} minutes` },
              { label: "❓ Questions", value: `${questions.length} MCQs` },
              { label: "✅ Total Marks", value: exam?.total_marks || questions.length },
              { label: "🎯 Pass Marks", value: exam?.pass_marks || "—" },
              { label: "📊 Marks/Q", value: exam?.marks_per_question || 1 },
              { label: "➖ Negative Mark", value: exam?.settings?.negative_marking ? (exam.settings.negative_marks || 0.25) : "No" },
            ].map(d => (
              <div key={d.label} className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                <div className="text-xs font-bold text-slate-400">{d.label}</div>
                <div className="text-base font-black text-slate-800 mt-0.5">{d.value}</div>
              </div>
            ))}
          </div>

          {exam?.description && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
              <div className="text-xs font-black text-amber-700 uppercase mb-1">📢 Instructions</div>
              <p className="text-sm text-amber-800">{exam.description}</p>
            </div>
          )}

          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 space-y-1">
            <div className="text-xs font-black text-red-700 uppercase mb-2">🔒 Anti-Cheat Rules</div>
            {exam?.settings?.fullscreen_required && <p className="text-xs text-red-600">• Exam runs in fullscreen mode. Exiting forfeits your attempt.</p>}
            {exam?.settings?.disable_copy_paste && <p className="text-xs text-red-600">• Copy, paste, and cut are disabled.</p>}
            {exam?.settings?.disable_right_click && <p className="text-xs text-red-600">• Right-click is disabled.</p>}
            <p className="text-xs text-red-600">• Tab switching is monitored. {exam?.settings?.tab_switch_limit ?? 3} violations = auto-submit.</p>
            {exam?.settings?.auto_submit && <p className="text-xs text-red-600">• Exam auto-submits when time runs out.</p>}
          </div>

          <button onClick={startExam}
            className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-black text-lg hover:opacity-90 transition shadow-lg shadow-indigo-200">
            🚀 Start Exam
          </button>
        </div>
      </div>
    </div>
  );

  // ── EXAM PHASE ────────────────────────────────────────────────────────────
  const q = questions[currentQ];
  const answered = Object.keys(answers).length;
  const unanswered = questions.length - answered;
  const isCritical = timeLeft < 300;

  return (
    <div className="fixed inset-0 flex flex-col bg-slate-950 overflow-hidden select-none">
      {/* Top Bar */}
      <div className="flex-shrink-0 bg-slate-900 border-b border-slate-700 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-black text-sm">
            {currentQ + 1}
          </div>
          <div>
            <div className="text-white font-black text-sm">{exam?.title}</div>
            <div className="text-slate-400 text-xs">{exam?.subject} · {currentQ + 1}/{questions.length}</div>
          </div>
        </div>

        <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-black text-xl tabular-nums ${isCritical ? "bg-red-500/20 text-red-400 animate-pulse" : "bg-slate-800 text-green-400"}`}>
          ⏱ {fmtTime(timeLeft)}
        </div>

        <div className="flex items-center gap-4 text-xs">
          {tabViolations > 0 && (
            <div className="bg-orange-500/20 text-orange-400 px-3 py-1.5 rounded-lg font-bold">
              ⚠️ {tabViolations} violation{tabViolations > 1 ? "s" : ""}
            </div>
          )}
          <div className="text-slate-400">
            <span className="text-green-400 font-bold">{answered}</span> answered · <span className="text-slate-500">{unanswered}</span> left
          </div>
          <button onClick={() => { if (window.confirm("Are you sure you want to submit now?")) submitExam(false); }}
            disabled={isSubmitting}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm transition disabled:opacity-50">
            {isSubmitting ? "Submitting..." : "Submit Exam"}
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Question Panel */}
        <div className="flex-1 overflow-y-auto p-6">
          {q && (
            <div className="max-w-3xl mx-auto">
              {/* Question Header */}
              <div className="flex items-start justify-between mb-6 gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="bg-indigo-600 text-white text-xs font-black px-2.5 py-1 rounded-lg">Q {currentQ + 1}</span>
                    <span className="bg-slate-800 text-slate-300 text-xs font-bold px-2.5 py-1 rounded-lg capitalize">{q.difficulty || "medium"}</span>
                    <span className="bg-slate-800 text-slate-300 text-xs font-bold px-2.5 py-1 rounded-lg">{q.marks || exam?.marks_per_question || 1} mark{(q.marks || 1) !== 1 ? "s" : ""}</span>
                    {flagged[currentQ] && <span className="bg-amber-500/20 text-amber-400 text-xs font-bold px-2.5 py-1 rounded-lg">🚩 Flagged</span>}
                  </div>
                  <p className="text-white text-lg font-semibold leading-relaxed">{q.question_text || q.question}</p>
                </div>
                <button onClick={() => toggleFlag(currentQ)}
                  className={`flex-shrink-0 px-3 py-2 rounded-xl text-xs font-bold transition ${flagged[currentQ] ? "bg-amber-500/20 text-amber-400" : "bg-slate-800 text-slate-400 hover:bg-slate-700"}`}>
                  {flagged[currentQ] ? "🚩 Flagged" : "🏳 Flag"}
                </button>
              </div>

              {/* Options */}
              <div className="space-y-3">
                {(q._options || []).map((opt, oi) => {
                  const selected = answers[currentQ] === oi;
                  return (
                    <button key={oi} onClick={() => selectAnswer(currentQ, oi)}
                      className={`w-full text-left px-5 py-4 rounded-2xl border-2 font-semibold transition-all text-sm ${
                        selected
                          ? "border-indigo-500 bg-indigo-500/20 text-white shadow-lg shadow-indigo-500/10"
                          : "border-slate-700 bg-slate-800/50 text-slate-300 hover:border-slate-500 hover:bg-slate-800"
                      }`}>
                      <span className={`inline-flex w-7 h-7 rounded-full items-center justify-center mr-3 text-xs font-black ${selected ? "bg-indigo-500 text-white" : "bg-slate-700 text-slate-400"}`}>
                        {String.fromCharCode(65 + oi)}
                      </span>
                      {opt}
                    </button>
                  );
                })}
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between mt-8">
                <button onClick={() => setCurrentQ(q => Math.max(0, q - 1))} disabled={currentQ === 0}
                  className="px-5 py-3 bg-slate-800 text-slate-300 rounded-xl font-bold hover:bg-slate-700 transition disabled:opacity-40">
                  ← Previous
                </button>
                <span className="text-slate-500 text-sm">{currentQ + 1} / {questions.length}</span>
                <button onClick={() => setCurrentQ(q => Math.min(questions.length - 1, q + 1))} disabled={currentQ === questions.length - 1}
                  className="px-5 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition disabled:opacity-40">
                  Next →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Question Palette */}
        <div className="w-64 flex-shrink-0 bg-slate-900 border-l border-slate-700 p-4 overflow-y-auto">
          <div className="text-xs font-black text-slate-400 uppercase tracking-wider mb-3">Question Palette</div>
          <div className="flex flex-wrap gap-2 mb-4">
            {questions.map((_, i) => {
              const isAnswered = answers[i] !== undefined;
              const isFlagged = flagged[i];
              const isCurrent = i === currentQ;
              return (
                <button key={i} onClick={() => setCurrentQ(i)}
                  className={`w-9 h-9 rounded-lg text-xs font-black transition relative ${
                    isCurrent ? "ring-2 ring-white" : ""
                  } ${
                    isAnswered && isFlagged ? "bg-amber-500 text-white" :
                    isAnswered ? "bg-green-500 text-white" :
                    isFlagged ? "bg-amber-500/30 text-amber-400 border border-amber-500" :
                    "bg-slate-800 text-slate-400 hover:bg-slate-700"
                  }`}>
                  {i + 1}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-2 text-slate-400"><div className="w-4 h-4 bg-green-500 rounded" />Answered</div>
            <div className="flex items-center gap-2 text-slate-400"><div className="w-4 h-4 bg-amber-500 rounded" />Flagged</div>
            <div className="flex items-center gap-2 text-slate-400"><div className="w-4 h-4 bg-slate-800 rounded" />Not Visited</div>
          </div>

          {/* Stats */}
          <div className="mt-6 pt-4 border-t border-slate-700 space-y-2">
            <div className="flex justify-between text-xs"><span className="text-slate-400">Answered</span><span className="text-green-400 font-bold">{answered}</span></div>
            <div className="flex justify-between text-xs"><span className="text-slate-400">Flagged</span><span className="text-amber-400 font-bold">{Object.values(flagged).filter(Boolean).length}</span></div>
            <div className="flex justify-between text-xs"><span className="text-slate-400">Unanswered</span><span className="text-slate-400 font-bold">{unanswered}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
