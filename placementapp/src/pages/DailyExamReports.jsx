import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const exams = [
  { id: 1, score: 15, total: 30 },
  { id: 2, score: 20, total: 30 },
  { id: 3, score: 15, total: 30 },
  { id: 4, score: 10, total: 30 },
  { id: 5, score: 25, total: 30 },
];

function DailyExamReports() {
  const [progress, setProgress] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    exams.forEach((exam) => {
      const percentage = (exam.score / exam.total) * 100;

      if (percentage === 0) {
        setProgress((prev) => ({
          ...prev,
          [exam.id]: 0,
        }));
        return;
      }

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
  }, []);

  const getColor = (percentage) => {
    if (percentage >= 80) return "#198754";
    if (percentage >= 60) return "#ffc107";
    return "#dc3545";
  };

  return (
    <div className="container mt-4">
      <button
        onClick={() => navigate("/dashboard/exam-reports")}
        className="text-sm text-gray-600 hover:text-blue-600"
      >
        ← Back
      </button>

      <div className="row mt-3">
        {exams.map((exam, index) => {
          const percentage = (exam.score / exam.total) * 100;
          const value = progress[exam.id] || 0;
          const color = getColor(percentage);

          return (
            <div className="col-md-3 mb-4" key={exam.id}>
              <div className="card text-center shadow-sm p-3">
                <h6 className="mb-3">Daily-Exam-{exam.id}</h6>

                <div style={{ width: "90px", margin: "auto" }}>
                  <CircularProgressbar
                    value={value}
                    text={`${value.toFixed(1)}%`}
                    styles={buildStyles({
                      pathColor: color,
                      textColor: color,
                      trailColor: "#e5e7eb",
                    })}
                  />
                </div>

                <p className="mt-3 text-muted">
                  Score {exam.score}/{exam.total}
                </p>

                {/* ✅ Fixed: using index for 0-based URL */}
                <button
                  className="btn btn-primary btn-sm mt-2"
                  onClick={() =>
                    navigate(`/dashboard/playground/detailed-results/${index}`)
                  }
                >
                  VIEW REPORT
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default DailyExamReports;