import React, { useEffect, useState, useRef } from "react";

const API = "http://127.0.0.1:8000/api";

export default function ExamsList() {
  const [exams, setExams]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [toast, setToast]         = useState(null);
  const [activeExam, setActiveExam] = useState(null);  // exam being taken
  const [examMode, setExamMode]   = useState(null);    // 'mcq' | 'coding'
  const userId = localStorage.getItem("userId") || 1;

  useEffect(() => { fetchExams(); }, []);

  async function fetchExams() {
    setLoading(true);
    try {
      const res = await fetch(`${API}/exams/all/?user_id=${userId}`);
      if (!res.ok) throw new Error();
      setExams(await res.json());
    } catch {
      showToast("⚠ Could not connect to API", "danger");
    } finally {
      setLoading(false);
    }
  }

  function showToast(msg, type) {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  function formatDate(d) {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  }

  function getGrade(pct) {
    if (pct >= 80) return { grade: "A", color: "#22c55e" };
    if (pct >= 65) return { grade: "B", color: "#4d6ef5" };
    if (pct >= 50) return { grade: "C", color: "#f97316" };
    if (pct >= 35) return { grade: "D", color: "#f59e0b" };
    return { grade: "F", color: "#ef4444" };
  }

  function startExam(exam, mode) {
    setActiveExam(exam);
    setExamMode(mode);
  }

  function exitExam() {
    setActiveExam(null);
    setExamMode(null);
    fetchExams();
  }

  const finished   = exams.filter(e => e.is_finished);
  const upcoming   = exams.filter(e => !e.is_finished);
  const attempted  = finished.filter(e => e.attempt?.status === "attempted");
  const notAtt     = finished.filter(e => !e.attempt || e.attempt.status === "unattempted");

  // ── Show exam taking UI ──
  if (activeExam && examMode === 'mcq') {
    return <MCQExam exam={activeExam} userId={userId} onExit={exitExam} showToast={showToast} />;
  }
  if (activeExam && examMode === 'coding') {
    return <CodingExam exam={activeExam} userId={userId} onExit={exitExam} showToast={showToast} />;
  }

  if (loading) return (
    <div className="container mt-4 text-center">
      <div className="spinner-border text-primary" />
      <p className="mt-2 text-muted">Loading exams...</p>
    </div>
  );

  return (
    <div className="container mt-3">
      {toast && (
        <div className={`alert alert-${toast.type} position-fixed`}
          style={{ top: 20, right: 20, zIndex: 9999, minWidth: 280 }}>
          {toast.msg}
        </div>
      )}

      <h2 className="fw-bold mb-1">My Exams</h2>
      <p className="text-muted mb-4">Dashboard / Exams</p>

      {/* STATS */}
      <div className="row g-3 mb-4">
        {[
          { icon: "📝", val: exams.length,    label: "Total",       color: "" },
          { icon: "⏳", val: upcoming.length, label: "Upcoming",    color: "text-warning" },
          { icon: "✅", val: attempted.length, label: "Attempted",  color: "text-success" },
          { icon: "❌", val: notAtt.length,   label: "Not Attempted", color: "text-danger" },
        ].map((s, i) => (
          <div className="col-6 col-md-3" key={i}>
            <div className="card border-0 shadow-sm text-center py-3">
              <div style={{ fontSize: 28 }}>{s.icon}</div>
              <h3 className={`fw-bold mb-0 ${s.color}`}>{s.val}</h3>
              <small className="text-muted">{s.label}</small>
            </div>
          </div>
        ))}
      </div>

      {/* ⏳ UPCOMING EXAMS */}
      <Section title="⏳ Upcoming Exams" badge={upcoming.length} badgeColor="warning">
        {upcoming.length === 0 ? (
          <p className="text-muted">No upcoming exams scheduled.</p>
        ) : (
          <div className="row g-3">
            {upcoming.map(exam => (
              <div className="col-lg-4 col-md-6" key={exam.id}>
                <div className="card shadow-sm border-0 h-100">
                  <div className="card-header text-white fw-bold"
                    style={{ background: "linear-gradient(135deg,#92400e,#b45309)" }}>
                    {exam.title}
                    <span className="float-end badge bg-light text-dark">
                      {exam.exam_type?.toUpperCase()}
                    </span>
                  </div>
                  <div className="card-body">
                    <InfoRow label="📅 Date"       val={formatDate(exam.start_date)} />
                    <InfoRow label="⏰ Start"      val={exam.start_time} />
                    <InfoRow label="🕐 End"        val={exam.end_time} />
                    <InfoRow label="⏱ Duration"   val={`${exam.duration_minutes} mins`} />
                    <InfoRow label="❓ MCQs"       val={exam.mcq_questions?.length || 0} />
                    <InfoRow label="💻 Coding"     val={exam.coding_questions?.length || 0} />
                  </div>
                  <div className="card-footer d-flex gap-2">
                    {(exam.exam_type === 'mcq' || exam.exam_type === 'both') && (
                      <button className="btn btn-sm btn-primary flex-fill"
                        onClick={() => startExam(exam, 'mcq')}>
                        Start MCQ
                      </button>
                    )}
                    {(exam.exam_type === 'coding' || exam.exam_type === 'both') && (
                      <button className="btn btn-sm btn-dark flex-fill"
                        onClick={() => startExam(exam, 'coding')}>
                        Start Coding
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* ✅ ATTEMPTED */}
      <Section title="✅ Attempted Exams" badge={attempted.length} badgeColor="success">
        {attempted.length === 0 ? <p className="text-muted">No attempted exams yet.</p> : (
          <div className="row g-3">
            {attempted.map(exam => (
              <div className="col-lg-4 col-md-6" key={exam.id}>
                <div className="card shadow-sm border-0 h-100">
                  <div className="card-header text-white fw-bold"
                    style={{ background: "linear-gradient(135deg,#064e3b,#065f46)" }}>
                    {exam.title} <span className="float-end">#ID {exam.id}</span>
                  </div>
                  <div className="card-body">
                    <InfoRow label="📅 Date"      val={formatDate(exam.start_date)} />
                    <InfoRow label="⏰ Start"      val={exam.start_time} />
                    <InfoRow label="🕐 End"        val={exam.end_time} />
                    <InfoRow label="⏱ Duration"   val={`${exam.duration_minutes} mins`} />
                    <InfoRow label="🗓 Attempted"  val={exam.attempt?.attempted_at ? formatDate(exam.attempt.attempted_at) : "—"} />
                  </div>
                  <div className="card-footer d-flex justify-content-between align-items-center">
                    <span className="badge bg-success px-3 py-2">✓ Attempted</span>
                    <button className="btn btn-sm btn-dark"
                      onClick={() => showToast(`📊 Report for ${exam.title}`, "info")}>
                      View Report
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* ❌ NOT ATTEMPTED */}
      <Section title="❌ Not Attempted" badge={notAtt.length} badgeColor="danger">
        {notAtt.length === 0 ? <p className="text-success fw-semibold">🎉 No missed exams!</p> : (
          <div className="row g-3">
            {notAtt.map(exam => (
              <div className="col-lg-4 col-md-6" key={exam.id}>
                <div className="card shadow-sm border-0 h-100">
                  <div className="card-header text-white fw-bold"
                    style={{ background: "linear-gradient(135deg,#7f1d1d,#991b1b)" }}>
                    {exam.title} <span className="float-end">#ID {exam.id}</span>
                  </div>
                  <div className="card-body">
                    <InfoRow label="📅 Date"    val={formatDate(exam.start_date)} />
                    <InfoRow label="⏰ Start"    val={exam.start_time} />
                    <InfoRow label="🕐 End"      val={exam.end_time} />
                    <InfoRow label="⏱ Duration" val={`${exam.duration_minutes} mins`} />
                    <InfoRow label="⚠️ Status"   val="Missed" valClass="text-danger fw-bold" />
                  </div>
                  <div className="card-footer d-flex justify-content-between align-items-center">
                    <span className="badge bg-danger px-3 py-2">✗ Not Attempted</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* 📊 RESULTS */}
      <Section title="📊 Results" badge={attempted.length} badgeColor="primary">
        {attempted.length === 0 ? <p className="text-muted">No results yet.</p> : (
          <div className="row g-3">
            {attempted.map(exam => {
              const score = exam.score;
              const total = exam.total_marks || 100;
              const pct   = score != null ? Math.round((score / total) * 100) : null;
              const { grade, color } = pct != null ? getGrade(pct) : { grade: "—", color: "#6b7280" };
              return (
                <div className="col-lg-4 col-md-6" key={exam.id}>
                  <div className="card shadow-sm border-0 h-100">
                    <div className="card-header text-white fw-bold"
                      style={{ background: "linear-gradient(135deg,#111d44,#243470)" }}>
                      {exam.title} <span className="float-end">#ID {exam.id}</span>
                    </div>
                    <div className="card-body">
                      {pct != null ? (
                        <>
                          <div className="text-center mb-3">
                            <div style={{ fontSize: 36, fontWeight: 800, color: "#111d44" }}>
                              {score}<span style={{ fontSize: 16, color: "#6b7280" }}>/{total}</span>
                            </div>
                            <span className="badge px-3 py-2 mt-1" style={{ background: color, fontSize: 14 }}>
                              Grade: {grade}
                            </span>
                          </div>
                          <div className="mb-2">
                            <div className="d-flex justify-content-between mb-1">
                              <small className="text-muted">Score</small>
                              <small className="fw-bold">{pct}%</small>
                            </div>
                            <div className="progress" style={{ height: 8 }}>
                              <div className="progress-bar" style={{
                                width: `${pct}%`,
                                background: pct >= 70 ? "#22c55e" : pct >= 40 ? "#f97316" : "#ef4444"
                              }} />
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="text-center text-muted py-3">⏳ Result not yet published</div>
                      )}
                      <InfoRow label="📅 Date"    val={formatDate(exam.start_date)} />
                      <InfoRow label="⏱ Duration" val={`${exam.duration_minutes} mins`} />
                    </div>
                    <div className="card-footer d-flex justify-content-between align-items-center">
                      <span className="badge bg-primary px-3 py-2">Result Available</span>
                      <button className="btn btn-sm btn-dark">Full Report</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Section>
    </div>
  );
}

// ── Reusable section wrapper ──
function Section({ title, badge, badgeColor, children }) {
  return (
    <div className="mb-4">
      <h5 className="fw-bold mb-3">
        {title}
        <span className={`badge bg-${badgeColor} ms-2`}>{badge}</span>
      </h5>
      <hr className="mt-0 mb-3" />
      {children}
    </div>
  );
}

// ── Reusable info row ──
function InfoRow({ label, val, valClass = "fw-semibold" }) {
  return (
    <div className="d-flex justify-content-between mb-2">
      <span className="text-muted">{label}</span>
      <span className={valClass}>{val}</span>
    </div>
  );
}

// ── MCQ EXAM COMPONENT ──
function MCQExam({ exam, userId, onExit, showToast }) {
  const questions = exam.mcq_questions || [];
  const [current, setCurrent]   = useState(0);
  const [answers, setAnswers]   = useState({});
  const [timeLeft, setTimeLeft] = useState(questions[0]?.time_limit_seconds || 60);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult]     = useState(null);
  const timerRef = useRef();

  useEffect(() => {
    if (submitted) return;
    setTimeLeft(questions[current]?.time_limit_seconds || 60);
  }, [current]);

  useEffect(() => {
    if (submitted) return;
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          // Auto move to next or submit
          if (current < questions.length - 1) {
            setCurrent(c => c + 1);
          } else {
            clearInterval(timerRef.current);
            submitExam();
          }
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [current, submitted]);

  function selectAnswer(option) {
    setAnswers(prev => ({ ...prev, [questions[current].id]: option }));
  }

  function next() {
    clearInterval(timerRef.current);
    if (current < questions.length - 1) setCurrent(c => c + 1);
    else submitExam();
  }

  async function submitExam() {
    clearInterval(timerRef.current);
    setSubmitted(true);
    const payload = {
      user_id: userId,
      exam_id: exam.id,
      answers: Object.entries(answers).map(([qid, opt]) => ({
        question_id: parseInt(qid),
        selected_option: opt
      }))
    };
    try {
      const res = await fetch(`${API}/mcq/submit-exam/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      setResult(data);
    } catch {
      showToast("✗ Could not submit exam", "danger");
    }
  }

  if (questions.length === 0) return (
    <div className="container mt-4 text-center">
      <h4>No MCQ questions added for this exam yet.</h4>
      <button className="btn btn-secondary mt-3" onClick={onExit}>← Back</button>
    </div>
  );

  if (result) return (
    <div className="container mt-4" style={{ maxWidth: 600 }}>
      <div className="card shadow border-0">
        <div className="card-header text-white fw-bold text-center fs-5"
          style={{ background: "linear-gradient(135deg,#111d44,#243470)" }}>
          📊 Exam Submitted!
        </div>
        <div className="card-body text-center py-4">
          <div style={{ fontSize: 52, fontWeight: 800, color: "#111d44" }}>
            {result.total_score}
            <span style={{ fontSize: 22, color: "#6b7280" }}>/{result.total_marks}</span>
          </div>
          <div className="fs-5 mt-2">Score: <strong>{result.percentage}%</strong></div>
          <div className="progress mt-3 mb-3" style={{ height: 12 }}>
            <div className="progress-bar" style={{
              width: `${result.percentage}%`,
              background: result.percentage >= 70 ? "#22c55e" : result.percentage >= 40 ? "#f97316" : "#ef4444"
            }} />
          </div>
          <h5 className="mt-3">Question Results</h5>
          {result.results?.map((r, i) => (
            <div key={i} className={`alert py-2 ${r.is_correct ? 'alert-success' : 'alert-danger'} text-start`}>
              Q{i + 1}: You chose <strong>{r.selected}</strong> —
              Correct: <strong>{r.correct}</strong> —
              {r.is_correct ? ` +${r.marks_earned} marks` : ' 0 marks'}
            </div>
          ))}
        </div>
        <div className="card-footer text-center">
          <button className="btn btn-primary px-5" onClick={onExit}>← Back to Exams</button>
        </div>
      </div>
    </div>
  );

  const q = questions[current];
  const timerColor = timeLeft <= 10 ? "#ef4444" : timeLeft <= 20 ? "#f97316" : "#22c55e";

  return (
    <div className="container mt-3" style={{ maxWidth: 700 }}>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="fw-bold mb-0">{exam.title} — MCQ Round</h5>
        <button className="btn btn-sm btn-outline-secondary" onClick={onExit}>✕ Exit</button>
      </div>

      {/* Progress */}
      <div className="d-flex justify-content-between mb-1">
        <small className="text-muted">Question {current + 1} of {questions.length}</small>
        <small style={{ color: timerColor, fontWeight: 700 }}>⏱ {timeLeft}s</small>
      </div>
      <div className="progress mb-3" style={{ height: 6 }}>
        <div className="progress-bar bg-primary"
          style={{ width: `${((current + 1) / questions.length) * 100}%` }} />
      </div>

      <div className="card shadow-sm border-0">
        <div className="card-header fw-bold" style={{ background: "#f8fafc" }}>
          Q{current + 1}. {q.question_text}
          <span className="float-end badge bg-secondary">{q.marks} mark{q.marks > 1 ? 's' : ''}</span>
        </div>
        <div className="card-body">
          {['A', 'B', 'C', 'D'].map(opt => (
            <div key={opt}
              className={`p-3 mb-2 rounded border cursor-pointer ${answers[q.id] === opt ? 'border-primary bg-primary bg-opacity-10' : 'border-light'}`}
              style={{ cursor: 'pointer', transition: 'all .15s' }}
              onClick={() => selectAnswer(opt)}>
              <strong>{opt}.</strong> {q[`option_${opt.toLowerCase()}`]}
              {answers[q.id] === opt && <span className="float-end text-primary">✓</span>}
            </div>
          ))}
        </div>
        <div className="card-footer d-flex justify-content-between">
          <button className="btn btn-outline-secondary btn-sm"
            onClick={() => setCurrent(c => Math.max(0, c - 1))}
            disabled={current === 0}>← Prev</button>
          <span className="text-muted small">
            {Object.keys(answers).length}/{questions.length} answered
          </span>
          <button className="btn btn-primary btn-sm" onClick={next}>
            {current === questions.length - 1 ? 'Submit Exam' : 'Next →'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── CODING EXAM COMPONENT ──
function CodingExam({ exam, userId, onExit, showToast }) {
  const questions = exam.coding_questions || [];
  const [current, setCurrent]   = useState(0);
  const [language, setLanguage] = useState('python');
  const [code, setCode]         = useState('');
  const [running, setRunning]   = useState(false);
  const [runResult, setRunResult] = useState(null);

  const starterCode = {
    python: '# Write your Python solution here\n\n',
    cpp: '#include<iostream>\nusing namespace std;\nint main(){\n    // Write your C++ solution\n    return 0;\n}\n',
    java: 'import java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n        // Write your Java solution\n    }\n}\n',
  };

  useEffect(() => {
    setCode(starterCode[language]);
    setRunResult(null);
  }, [language, current]);

  async function runCode() {
    if (!code.trim()) { showToast("⚠ Write some code first", "warning"); return; }
    setRunning(true);
    setRunResult(null);
    try {
      const res = await fetch(`${API}/code/run/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          question_id: questions[current].id,
          language,
          code
        })
      });
      const data = await res.json();
      setRunResult(data);
    } catch {
      showToast("✗ Could not run code", "danger");
    } finally {
      setRunning(false);
    }
  }

  if (questions.length === 0) return (
    <div className="container mt-4 text-center">
      <h4>No coding questions added for this exam yet.</h4>
      <button className="btn btn-secondary mt-3" onClick={onExit}>← Back</button>
    </div>
  );

  const q = questions[current];

  return (
    <div className="container-fluid mt-2">
      <div className="d-flex justify-content-between align-items-center mb-2">
        <h5 className="fw-bold mb-0">{exam.title} — Coding Round</h5>
        <button className="btn btn-sm btn-outline-secondary" onClick={onExit}>✕ Exit</button>
      </div>

      {/* Question tabs */}
      <div className="mb-2">
        {questions.map((q, i) => (
          <button key={i}
            className={`btn btn-sm me-1 ${i === current ? 'btn-dark' : 'btn-outline-secondary'}`}
            onClick={() => { setCurrent(i); setRunResult(null); }}>
            Q{i + 1}
          </button>
        ))}
      </div>

      <div className="row g-2">
        {/* Left: Problem */}
        <div className="col-md-5">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header fw-bold" style={{ background: "#111d44", color: "#fff" }}>
              {q.title}
              <span className="float-end badge bg-warning text-dark">{q.marks} marks</span>
            </div>
            <div className="card-body" style={{ overflowY: 'auto', maxHeight: '70vh' }}>
              <p>{q.description}</p>
              {q.input_format && <><strong>Input Format:</strong><p>{q.input_format}</p></>}
              {q.output_format && <><strong>Output Format:</strong><p>{q.output_format}</p></>}
              {q.constraints && <><strong>Constraints:</strong><p>{q.constraints}</p></>}

              {/* Sample test cases */}
              {q.test_cases?.filter(tc => tc.is_sample).map((tc, i) => (
                <div key={i} className="mb-2">
                  <strong>Sample {i + 1}:</strong>
                  <div className="d-flex gap-2 mt-1">
                    <div className="flex-fill">
                      <small className="text-muted">Input</small>
                      <pre className="bg-light p-2 rounded" style={{ fontSize: 12 }}>{tc.input_data}</pre>
                    </div>
                    <div className="flex-fill">
                      <small className="text-muted">Output</small>
                      <pre className="bg-light p-2 rounded" style={{ fontSize: 12 }}>{tc.expected_output}</pre>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Editor + Output */}
        <div className="col-md-7">
          <div className="card border-0 shadow-sm">
            <div className="card-header d-flex justify-content-between align-items-center">
              <select className="form-select form-select-sm w-auto"
                value={language} onChange={e => setLanguage(e.target.value)}>
                <option value="python">🐍 Python</option>
                <option value="cpp">⚙️ C++</option>
                <option value="java">☕ Java</option>
              </select>
              <button className="btn btn-success btn-sm px-4"
                onClick={runCode} disabled={running}>
                {running ? '⏳ Running...' : '▶ Run Code'}
              </button>
            </div>
            <div className="card-body p-0">
              <textarea
                value={code}
                onChange={e => setCode(e.target.value)}
                style={{
                  width: '100%', height: 340,
                  fontFamily: 'monospace', fontSize: 13,
                  padding: 12, border: 'none', outline: 'none',
                  background: '#1e1e1e', color: '#d4d4d4',
                  resize: 'none'
                }}
                spellCheck={false}
                placeholder="Write your code here..."
              />
            </div>
            {/* Run Results */}
            {runResult && (
              <div className="card-footer">
                <div className="d-flex justify-content-between mb-2">
                  <strong>Test Results</strong>
                  <span className={`badge ${runResult.passed === runResult.total ? 'bg-success' : 'bg-danger'}`}>
                    {runResult.passed}/{runResult.total} Passed
                  </span>
                </div>
                <div style={{ maxHeight: 200, overflowY: 'auto' }}>
                  {runResult.case_results?.map((r, i) => (
                    <div key={i} className={`alert py-2 px-3 mb-1 ${r.passed ? 'alert-success' : 'alert-danger'}`}>
                      <div className="d-flex justify-content-between">
                        <strong>Case {i + 1}</strong>
                        <span>{r.passed ? '✓ Passed' : '✗ Failed'}</span>
                      </div>
                      {r.input !== "Hidden" && (
                        <small>Input: <code>{r.input}</code> | Expected: <code>{r.expected}</code> | Got: <code>{r.actual}</code></small>
                      )}
                      {r.error && <div className="text-danger mt-1"><small>{r.error}</small></div>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}