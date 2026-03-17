import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function DailyExamReports() {

  const [exams, setExams] = useState([]);
  const [progress, setProgress] = useState({});
  const navigate = useNavigate();

  // ✅ FETCH DATA FROM BACKEND
  const fetchReports = async () => {
  try {
    const res = await axios.get("http://127.0.0.1:8000/api/exam-reports/");

    console.log("API DATA:", res.data); // 🔥 ADD THIS

    // ✅ ensure it's array
    if (Array.isArray(res.data)) {
      setExams(res.data);
    } else {
      setExams([]);
    }

  } catch (err) {
    console.error(err);
    setExams([]);
  }
};

  useEffect(() => {
    fetchReports();
  }, []);

  // ✅ ANIMATION AFTER DATA LOAD
 useEffect(() => {
  if (!Array.isArray(exams)) return; // 🔥 prevent crash

  exams.forEach((exam) => {

    const percentage = exam.total
      ? (exam.score / exam.total) * 100
      : exam.score;

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

  // ✅ COLOR LOGIC
  const getColor = (percentage) => {
    if (percentage >= 80) return "#198754"; // green
    if (percentage >= 60) return "#ffc107"; // yellow
    return "#dc3545"; // red
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

      <div className="row mt-3">

        {exams.length > 0 ? (
          exams.map((exam) => {

            const percentage = exam.total
              ? (exam.score / exam.total) * 100
              : exam.score;

            const value = progress[exam.id] || 0;
            const color = getColor(percentage);

            return (
              <div className="col-md-3 mb-4" key={exam.id}>
                <div className="card text-center shadow-sm p-3">

                  <h6 className="mb-3">
                    {exam.exam || `Exam-${exam.id}`}
                  </h6>

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
                    Score {exam.score}
                    {exam.total ? `/${exam.total}` : ""}
                  </p>

                  <button
                    className="btn btn-primary btn-sm mt-2"
                    onClick={() =>
                      navigate(`/dashboard/playground/detailed-results/${exam.id}`)
                    }
                  >
                    VIEW REPORT
                  </button>

                </div>
              </div>
            );
          })
        ) : (
          <p className="text-center mt-5">No reports available</p>
        )}

      </div>

    </div>
  );
}

export default DailyExamReports;