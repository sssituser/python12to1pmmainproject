import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function DailyExamReports() {

  const [exams, setExams] = useState([]);
  const [progress, setProgress] = useState({});
  const navigate = useNavigate();

  //  FETCH DATA FROM BACKEND (no auth header — public endpoint, token may expire during exam)
  const fetchReports = async () => {
    try {
      // Always fetch without auth so expired tokens don't block the page
      const res = await axios.get("http://127.0.0.1:8000/api/all-exam-results/");

      let examList = [];
      if (res.data && Array.isArray(res.data.data)) {
        examList = res.data.data;
      } else if (Array.isArray(res.data)) {
        examList = res.data;
      }

      // Filter by logged-in username from localStorage (case-insensitive)
      let currentUsername = null;
      try {
        const userStr = localStorage.getItem("user");
        if (userStr && userStr !== "undefined") {
          const parsedUser = JSON.parse(userStr);
          currentUsername = parsedUser?.username?.toLowerCase() || null;
        }
      } catch (e) {
        console.error("User parse error:", e);
      }

      if (currentUsername) {
        const filtered = examList.filter(
          (e) => e.user?.username?.toLowerCase() === currentUsername
        );
        // If filtered has results use them, otherwise show all (username mismatch guard)
        examList = filtered.length > 0 ? filtered : examList;
      }

      setExams(examList);

    } catch (err) {
      console.error("Failed to fetch exam reports:", err);
      setExams([]);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  // ANIMATION AFTER DATA LOAD
  useEffect(() => {
    if (!Array.isArray(exams) || exams.length === 0) return;

    exams.forEach((exam) => {
      const total = exam.totalMarks || 40;
      const percentage = total > 0 ? (exam.score / total) * 100 : 0;

      let value = 0;
      const interval = setInterval(() => {
        value += 2;
        if (value >= percentage) {
          value = percentage;
          clearInterval(interval);
        }
        setProgress((prev) => ({
          ...prev,
          [exam.id]: value,
        }));
      }, 20);
    });

  }, [exams]);

  // COLOR LOGIC
  const getColor = (percentage) => {
    if (percentage >= 80) return "#198754";
    if (percentage >= 60) return "#ffc107";
    return "#dc3545";
  };

  return (
    <div className="container mt-4">

      {/* BACK BUTTON */}
      <button
        onClick={() => navigate("/dashboard/exam-reports")}
        className="text-sm text-gray-600 hover:text-blue-600"
      >
        ← Back
      </button>

      <div className="d-flex justify-content-between align-items-center mt-3 mb-4">
        <h3 className="mb-0 text-dark font-weight-bold">Daily Exam Reports</h3>
        <span className="badge bg-primary fs-6 py-2 px-3 shadow-sm rounded-pill text-white">
          Total Exams Written: {exams.length}
        </span>
      </div>

      <div className="row mt-3">

        {exams.length > 0 ? (
          exams.map((exam) => {
            const total = exam.totalMarks || 40;
            const percentage = total > 0 ? (exam.score / total) * 100 : 0;
            const value = progress[exam.id] || 0;
            const color = getColor(percentage);

            return (
              <div className="col-md-3 mb-4" key={exam.id}>
                <div className="card text-center shadow-sm p-3">

                  <h6 className="mb-1 fw-bold text-truncate">
                    {exam.examTitle || `Exam-${exam.id}`}
                  </h6>

                  <small className="text-muted mb-2">
                    {exam.user?.username || "Unknown"}
                  </small>

                  <div style={{ width: "90px", margin: "auto" }}>
                    <CircularProgressbar
                      value={value}
                      text={`${Math.round(value)}%`}
                      styles={buildStyles({
                        pathColor: color,
                        textColor: color,
                        trailColor: "#e5e7eb",
                      })}
                    />
                  </div>

                  <p className="mt-3 text-muted mb-1">
                    Score: <strong>{exam.score}/{total}</strong>
                  </p>

                  <small className="text-muted">
                    {exam.examDate ? new Date(exam.examDate).toLocaleDateString() : ""}
                  </small>

                  <button
                    className="btn btn-primary btn-sm mt-2"
                    onClick={() =>
                      navigate(`/dashboard/exam-report-detail/${exam.id}`)
                    }
                  >
                    VIEW REPORT
                  </button>

                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center mt-5">
            <p className="text-muted fs-5">No exam reports found.</p>
            <p className="text-muted">Take a Daily Exam to see your results here!</p>
          </div>
        )}

      </div>

    </div>
  );
}

export default DailyExamReports;