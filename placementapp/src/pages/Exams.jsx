import React, { useEffect, useState } from "react";

const API = "http://127.0.0.1:8000/api";

function Exams() {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // Get userId from localStorage (set this when user logs in)
  const userId = localStorage.getItem("userId") || 1;

  useEffect(() => {
    fetchExams();
  }, []);

  async function fetchExams() {
    setLoading(true);
    try {
      const res = await fetch(`${API}/exams/all/?user_id=${userId}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setExams(data);
    } catch {
      showToast("⚠ Could not connect to API", "danger");
    } finally {
      setLoading(false);
    }
  }

  async function handleMarkAttempted(examId) {
    try {
      const res = await fetch(`${API}/exams/${examId}/attempt/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "attempted" }),
      });
      if (!res.ok) throw new Error();
      showToast("✓ Marked as attempted!", "success");
      fetchExams();
    } catch {
      showToast("✗ Could not update. Check API.", "danger");
    }
  }

  function showToast(msg, type) {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  function formatDate(d) {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("en-GB", {
      day: "2-digit", month: "short", year: "numeric",
    });
  }

  function getGrade(pct) {
    if (pct >= 80) return { grade: "A", color: "#22c55e" };
    if (pct >= 65) return { grade: "B", color: "#4d6ef5" };
    if (pct >= 50) return { grade: "C", color: "#f97316" };
    if (pct >= 35) return { grade: "D", color: "#f59e0b" };
    return { grade: "F", color: "#ef4444" };
  }

  const attempted    = exams.filter(e => e.attempt?.status === "attempted");
  const notAttempted = exams.filter(e => !e.attempt || e.attempt.status === "unattempted");

  if (loading) {
    return (
      <div className="container mt-4 text-center">
        <div className="spinner-border text-primary" role="status" />
        <p className="mt-2 text-muted">Loading exams...</p>
      </div>
    );
  }

  return (
    <div className="container mt-3">

      {/* Toast */}
      {toast && (
        <div className={`alert alert-${toast.type} alert-dismissible position-fixed`}
          style={{ top: 20, right: 20, zIndex: 9999, minWidth: 280 }}>
          {toast.msg}
        </div>
      )}

      <h2 className="mb-1 fw-bold">My Exams</h2>
      <p className="text-muted mb-4">Dashboard / Exams</p>

      {/* STATS ROW */}
      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="card border-0 shadow-sm text-center py-3">
            <div style={{ fontSize: 32 }}>📝</div>
            <h3 className="fw-bold mb-0">{exams.length}</h3>
            <small className="text-muted">Total Exams</small>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card border-0 shadow-sm text-center py-3">
            <div style={{ fontSize: 32 }}>✅</div>
            <h3 className="fw-bold mb-0 text-success">{attempted.length}</h3>
            <small className="text-muted">Attempted</small>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card border-0 shadow-sm text-center py-3">
            <div style={{ fontSize: 32 }}>❌</div>
            <h3 className="fw-bold mb-0 text-danger">{notAttempted.length}</h3>
            <small className="text-muted">Not Attempted</small>
          </div>
        </div>
      </div>

      {/* ✅ ATTEMPTED EXAMS */}
      <div className="mb-4">
        <h5 className="fw-bold mb-3">
          ✅ Attempted Exams
          <span className="badge bg-success ms-2">{attempted.length}</span>
        </h5>
        {attempted.length === 0 ? (
          <p className="text-muted">No attempted exams yet.</p>
        ) : (
          <div className="row g-3">
            {attempted.map((exam) => (
              <div className="col-lg-4 col-md-6" key={exam.id}>
                <div className="card shadow-sm border-0 h-100">
                  <div className="card-header text-white fw-bold"
                    style={{ background: "linear-gradient(135deg,#064e3b,#065f46)" }}>
                    {exam.title}
                    <span className="float-end">#ID {exam.id}</span>
                  </div>
                  <div className="card-body">
                    <div className="d-flex justify-content-between mb-2">
                      <span className="text-muted">📅 Start Date</span>
                      <span className="fw-semibold">{formatDate(exam.start_date)}</span>
                    </div>
                    <div className="d-flex justify-content-between mb-2">
                      <span className="text-muted">⏰ Start Time</span>
                      <span className="fw-semibold">{exam.start_time}</span>
                    </div>
                    <div className="d-flex justify-content-between mb-2">
                      <span className="text-muted">🕐 End Time</span>
                      <span className="fw-semibold">{exam.end_time}</span>
                    </div>
                    <div className="d-flex justify-content-between mb-2">
                      <span className="text-muted">⏱ Duration</span>
                      <span className="fw-semibold">{exam.duration_minutes} mins</span>
                    </div>
                    <div className="d-flex justify-content-between">
                      <span className="text-muted">🗓 Attempted On</span>
                      <span className="fw-semibold">
                        {exam.attempt?.attempted_at
                          ? formatDate(exam.attempt.attempted_at)
                          : "—"}
                      </span>
                    </div>
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
      </div>

      {/* ❌ NOT ATTEMPTED EXAMS */}
      <div className="mb-4">
        <h5 className="fw-bold mb-3">
          ❌ Not Attempted Exams
          <span className="badge bg-danger ms-2">{notAttempted.length}</span>
        </h5>
        {notAttempted.length === 0 ? (
          <p className="text-success fw-semibold">🎉 Great job! No missed exams.</p>
        ) : (
          <div className="row g-3">
            {notAttempted.map((exam) => (
              <div className="col-lg-4 col-md-6" key={exam.id}>
                <div className="card shadow-sm border-0 h-100">
                  <div className="card-header text-white fw-bold"
                    style={{ background: "linear-gradient(135deg,#7f1d1d,#991b1b)" }}>
                    {exam.title}
                    <span className="float-end">#ID {exam.id}</span>
                  </div>
                  <div className="card-body">
                    <div className="d-flex justify-content-between mb-2">
                      <span className="text-muted">📅 Start Date</span>
                      <span className="fw-semibold">{formatDate(exam.start_date)}</span>
                    </div>
                    <div className="d-flex justify-content-between mb-2">
                      <span className="text-muted">⏰ Start Time</span>
                      <span className="fw-semibold">{exam.start_time}</span>
                    </div>
                    <div className="d-flex justify-content-between mb-2">
                      <span className="text-muted">🕐 End Time</span>
                      <span className="fw-semibold">{exam.end_time}</span>
                    </div>
                    <div className="d-flex justify-content-between mb-2">
                      <span className="text-muted">⏱ Duration</span>
                      <span className="fw-semibold">{exam.duration_minutes} mins</span>
                    </div>
                    <div className="d-flex justify-content-between">
                      <span className="text-muted">⚠️ Status</span>
                      <span className="text-danger fw-bold">Missed</span>
                    </div>
                  </div>
                  <div className="card-footer d-flex justify-content-between align-items-center">
                    <span className="badge bg-danger px-3 py-2">✗ Not Attempted</span>
                    <button className="btn btn-sm btn-outline-success"
                      onClick={() => handleMarkAttempted(exam.id)}>
                      Mark Done
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 📊 RESULTS */}
      <div className="mb-4">
        <h5 className="fw-bold mb-3">
          📊 Results
          <span className="badge bg-primary ms-2">{attempted.length}</span>
        </h5>
        {attempted.length === 0 ? (
          <p className="text-muted">No results available yet.</p>
        ) : (
          <div className="row g-3">
            {attempted.map((exam) => {
              const score = exam.score;
              const total = exam.total_marks || 100;
              const pct   = score != null ? Math.round((score / total) * 100) : null;
              const { grade, color } = pct != null ? getGrade(pct) : { grade: "—", color: "#6b7280" };

              return (
                <div className="col-lg-4 col-md-6" key={exam.id}>
                  <div className="card shadow-sm border-0 h-100">
                    <div className="card-header text-white fw-bold"
                      style={{ background: "linear-gradient(135deg,#111d44,#243470)" }}>
                      {exam.title}
                      <span className="float-end">#ID {exam.id}</span>
                    </div>
                    <div className="card-body">
                      {pct != null ? (
                        <>
                          {/* Score display */}
                          <div className="text-center mb-3">
                            <div style={{ fontSize: 36, fontWeight: 800, color: "#111d44" }}>
                              {score}
                              <span style={{ fontSize: 16, color: "#6b7280", fontWeight: 400 }}>
                                /{total}
                              </span>
                            </div>
                            <span className="badge px-3 py-2 mt-1"
                              style={{ background: color, fontSize: 14 }}>
                              Grade: {grade}
                            </span>
                          </div>
                         
                          <div className="mb-3">
                            <div className="d-flex justify-content-between mb-1">
                              <small className="text-muted">Score</small>
                              <small className="fw-bold">{pct}%</small>
                            </div>
                            <div className="progress" style={{ height: 8 }}>
                              <div className="progress-bar"
                                role="progressbar"
                                style={{
                                  width: `${pct}%`,
                                  background: pct >= 70 ? "#22c55e" : pct >= 40 ? "#f97316" : "#ef4444",
                                }}
                              />
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="text-center text-muted py-3">
                           Result not yet published
                        </div>
                      )}
                      <div className="d-flex justify-content-between mb-2">
                        <span className="text-muted"> Date</span>
                        <span className="fw-semibold">{formatDate(exam.start_date)}</span>
                      </div>
                      <div className="d-flex justify-content-between">
                        <span className="text-muted"> Duration</span>
                        <span className="fw-semibold">{exam.duration_minutes} mins</span>
                      </div>
                    </div>
                    <div className="card-footer d-flex justify-content-between align-items-center">
                      <span className="badge bg-primary px-3 py-2">Result Available</span>
                      <button className="btn btn-sm btn-dark"
                        onClick={() => showToast(` Full report for ${exam.title}`, "info")}>
                        Full Report
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}

export default Exams;