import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

function ExamReportDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await axios.get(`http://127.0.0.1:8000/api/exam-report-detail/${id}/`);
        if (res.data && res.data.success) {
          const d = res.data.data;
          // Flatten: merge attempt fields with questions/answers/percentage/passed
          setReport({
            ...d.attempt,
            questions: d.questions || [],
            answers: d.answers || [],
            percentage: d.percentage || 0,
            passed: d.passed || false,
          });
        } else {
          setError("Report not found.");
        }
      } catch (err) {
        setError("Failed to load report.");
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  if (loading) return (
    <div className="container mt-5 text-center">
      <div className="spinner-border text-primary" role="status" />
      <p className="mt-2 text-muted">Loading report...</p>
    </div>
  );
  if (error) return <div className="container mt-5 text-center text-danger">{error}</div>;
  if (!report) return null;

  const passed = report.passed;
  const percentage = report.percentage || 0;
  let questions = report.questions || [];
  if (typeof questions === 'string') {
    try { questions = JSON.parse(questions); } catch(e) { questions = []; }
  }
  if (typeof questions === 'string') { 
    // Double serialized safety
    try { questions = JSON.parse(questions); } catch(e) { questions = []; }
  }
  if (!Array.isArray(questions)) {
    questions = typeof questions === 'object' && questions !== null ? Object.values(questions) : [];
  }

  let answers = report.answers || [];
  if (typeof answers === 'string') {
    try { answers = JSON.parse(answers); } catch(e) { answers = []; }
  }

  return (
    <div className="container mt-4 pb-5" style={{ maxWidth: "860px" }}>

      {/* Back Button */}
      <button
        className="btn btn-link text-secondary mb-3 ps-0"
        onClick={() => navigate(-1)}
      >
        ← Back to Reports
      </button>

      {/* Summary Card */}
      <div className="card shadow-sm border-0 mb-4">
        <div className={`card-header fw-bold fs-5 text-white ${passed ? "bg-success" : "bg-danger"}`}>
          {(report.exam_title || report.examTitle || "Exam Report")} &nbsp;—&nbsp; {passed ? "✅ PASS" : "❌ FAIL"}
        </div>
        <div className="card-body">
          <div className="row text-center">
            <div className="col-md-3 col-6 mb-2">
              <h4 className="text-primary fw-bold mb-0">{report.marks_obtained ?? "—"}/{report.total_marks ?? "—"}</h4>
              <small className="text-muted">Score</small>
            </div>
            <div className="col-md-3 col-6 mb-2">
              <h4 className="text-success fw-bold mb-0">{report.correct_answers ?? "—"}</h4>
              <small className="text-muted">Correct</small>
            </div>
            <div className="col-md-3 col-6 mb-2">
              <h4 className="text-danger fw-bold mb-0">{report.incorrect_answers ?? "—"}</h4>
              <small className="text-muted">Wrong</small>
            </div>
            <div className="col-md-3 col-6 mb-2">
              <h4 className="fw-bold mb-0">{percentage}%</h4>
              <small className="text-muted">Percentage</small>
            </div>
          </div>

          <div className="progress mt-3" style={{ height: "14px", borderRadius: "7px" }}>
            <div
              className={`progress-bar ${passed ? "bg-success" : "bg-danger"}`}
              style={{ width: `${percentage}%`, borderRadius: "7px" }}
            />
          </div>

          <div className="d-flex justify-content-between mt-2 flex-wrap gap-1">
            <small className="text-muted">Student: <strong>{(report.user?.username || report.user?.first_name || "Unknown").toUpperCase()}</strong></small>
            {/* <small className="text-muted">ID: <strong>{report.random_id || report.id || "N/A"}</strong></small> */}
            <small className="text-muted">Date: <strong>{report.exam_date ? new Date(report.exam_date).toLocaleDateString("en-GB") : "N/A"}</strong></small>
          </div>
        </div>
      </div>

      {/* Question Analysis */}
      {Array.isArray(questions) && questions.length > 0 ? (
        <div>
          <h5 className="fw-bold mb-3">Question Analysis</h5>
          {questions.map((q, i) => {
            const userAnswer = answers[i];
            const correctKey = q.correct;
            const isCorrect = userAnswer === correctKey;
            const options = q.options || {};

            // Get display text for user answer and correct answer
            const getLetter = (idx) => {
              if (isNaN(idx) || idx === null || idx === undefined) return idx;
              const numIdx = parseInt(idx);
              return isNaN(numIdx) ? idx : ["A","B","C","D"][numIdx] || idx;
            };
            const userAnswerText = (userAnswer !== null && userAnswer !== undefined) 
              ? `${getLetter(userAnswer)}. ${options[userAnswer] || userAnswer}` 
              : "Not answered";
            const correctAnswerText = (correctKey !== null && correctKey !== undefined) 
              ? `${getLetter(correctKey)}. ${options[correctKey] || correctKey}` 
              : "Not answered";

            const isCoding = q.type === 'coding' || !q.options || Object.keys(q.options).length === 0;

            if (isCoding) {
              // For coding questions, the status is determined by whether the student's code passed all test cases
              // or some other logic. Basic check: if it's correct in report, we honor it.
              return (
                <div key={i} className="card mb-4 border-0 shadow-sm" style={{ borderRadius: "12px", overflow: "hidden" }}>
                  <div className="card-body">
                    <div className="mb-3 d-flex justify-content-between align-items-start">
                      <div>
                        <p className="fw-bold fs-6 mb-1">Question {i + 1}: {q.question}</p>
                        <span className={`badge rounded-pill px-3 py-1 ${isCorrect ? "bg-success-soft" : "bg-danger-soft"}`}
                          style={{
                            background: isCorrect ? "#d1fae5" : "#fee2e2",
                            color: isCorrect ? "#065f46" : "#991b1b",
                            fontSize: "0.75rem", fontWeight: "600"
                          }}>
                          {isCorrect ? "✓ PASSED" : "✗ FAILED"}
                        </span>
                        <span className="ms-2 badge bg-dark text-white" style={{ fontSize: "0.7rem" }}>CODING CHALLENGE</span>
                      </div>
                    </div>

                    <div className="bg-dark rounded-3 p-3 mb-3 position-relative">
                      <div className="text-secondary text-[10px] uppercase font-bold mb-2 tracking-wider">Student Submission:</div>
                      <pre className="text-success font-monospace m-0" style={{ fontSize: "0.85rem", whiteSpace: "pre-wrap" }}>
                        {userAnswer || "# No code submitted"}
                      </pre>
                    </div>

                    {q.testCases && q.testCases.length > 0 && (
                      <div className="mt-2 text-muted small">
                        <strong>Test Case Validation:</strong> {isCorrect ? "All cases passed" : "Failed some test cases"}
                      </div>
                    )}
                  </div>
                </div>
              );
            }

            return (
              <div
                key={i}
                className="card mb-4 border-0 shadow-sm"
                style={{ borderRadius: "12px", overflow: "hidden" }}
              >
                <div className="card-body pb-0">
                  {/* Question Header */}
                  <div className="mb-3">
                    <p className="fw-bold fs-6 mb-1">
                      Question {i + 1}: {q.question}
                    </p>
                    <span
                      className={`badge rounded-pill px-3 py-1`}
                      style={{
                        background: isCorrect ? "#d1fae5" : "#fee2e2",
                        color: isCorrect ? "#065f46" : "#991b1b",
                        fontSize: "0.75rem",
                        fontWeight: "600"
                      }}
                    >
                      {isCorrect ? "✓ Correct" : "✗ Wrong"}
                    </span>
                  </div>

                  {/* Options */}
                  <div>
                    {Object.entries(options).map(([key, value], optIdx) => {
                      // Handle both letter keys (A,B,C,D) and numeric keys (0,1,2,3)
                      const displayKey = (isNaN(key) || key === null || key === undefined) ? key : ["A","B","C","D"][parseInt(key)] || key;
                      const isThisCorrect = String(key) === String(correctKey) || displayKey === correctKey;
                      const isUserSelected = String(key) === String(userAnswer) || displayKey === userAnswer;
                      const isWrongSelection = isUserSelected && !isThisCorrect;

                      let bg = "#f9fafb";
                      let borderColor = "#e5e7eb";
                      let textColor = "#374151";

                      if (isThisCorrect && isUserSelected) {
                        bg = "#d1fae5";
                        borderColor = "#10b981";
                        textColor = "#065f46";
                      } else if (isWrongSelection) {
                        bg = "#fee2e2";
                        borderColor = "#ef4444";
                        textColor = "#991b1b";
                      } else if (isThisCorrect) {
                        bg = "#d1fae5";
                        borderColor = "#10b981";
                        textColor = "#065f46";
                      }

                      return (
                        <div
                          key={key}
                          className="d-flex justify-content-between align-items-center px-3 py-2 mb-2"
                          style={{
                            background: bg,
                            border: `1.5px solid ${borderColor}`,
                            borderRadius: "8px",
                            color: textColor,
                          }}
                        >
                          <span><strong>{displayKey}.</strong> {value}</span>
                          <span className="fw-semibold" style={{ fontSize: "0.85rem", whiteSpace: "nowrap" }}>
                            {isThisCorrect && isUserSelected && "✓ Correct  ✓ Your Answer"}
                            {isWrongSelection && "✗ Your Answer"}
                            {isThisCorrect && !isUserSelected && "✓ Correct"}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                    <div
                      className="d-flex justify-content-between align-items-center mt-3 pt-2 pb-3"
                      style={{ borderTop: "1px solid #e5e7eb", fontSize: "0.9rem" }}
                    >
                      <span>
                        Your Answer:{" "}
                        <strong style={{ color: isCorrect ? "#10b981" : "#ef4444" }}>
                          {userAnswerText}
                        </strong>
                      </span>
                      <span>
                        Correct Answer:{" "}
                        <strong style={{ color: "#10b981" }}>{correctAnswerText}</strong>
                      </span>
                    </div>
                  </div>
                </div>
            );
          })}
        </div>
      ) : (
        <div className="mt-4">
          <div className="card border-0 shadow-sm overflow-hidden" style={{ borderRadius: "20px" }}>
             <div className="card-body p-4 p-md-5">
                <div className="text-center mb-5">
                   <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="fs-2">📊</span>
                   </div>
                   <h3 className="fw-black text-dark mb-2">Performance Summary Analysis</h3>
                   <p className="text-secondary small max-w-lg mx-auto">
                      Detailed question breakdown is currently unavailable for this record, but here is your comprehensive performance evaluation based on the overall assessment metrics.
                   </p>
                </div>

                <div className="row g-4 mb-5">
                   <div className="col-md-4">
                      <div className="p-4 rounded-4 bg-light border text-center h-100">
                         <div className="text-primary small uppercase font-bold tracking-wider mb-2">Accuracy Rate</div>
                         <div className="fs-2 fw-black text-dark">{report?.percentage || 0}%</div>
                         <div className="text-muted tiny mt-1">Based on {report?.total_questions || 50} questions</div>
                      </div>
                   </div>
                   <div className="col-md-4">
                      <div className="p-4 rounded-4 bg-light border text-center h-100">
                         <div className="text-success small uppercase font-bold tracking-wider mb-2">Successful Mastery</div>
                         <div className="fs-2 fw-black text-dark">{report?.correct_answers || 0} Correct</div>
                         <div className="text-muted tiny mt-1">Validated knowledge points</div>
                      </div>
                   </div>
                   <div className="col-md-4">
                      <div className="p-4 rounded-4 bg-light border text-center h-100">
                         <div className="text-danger small uppercase font-bold tracking-wider mb-2">Areas for Growth</div>
                         <div className="fs-2 fw-black text-dark">{report?.incorrect_answers || 0} Wrong</div>
                         <div className="text-muted tiny mt-1">Opportunity for review</div>
                      </div>
                   </div>
                </div>

             </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ExamReportDetail;
