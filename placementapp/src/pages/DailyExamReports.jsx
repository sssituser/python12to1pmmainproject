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
      const res = await axios.get("/api/all-exam-results/");

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
        examList = examList.filter(
          (e) => e.user?.username?.toLowerCase() === currentUsername
        );
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
    <div className="min-h-screen bg-gray-50 py-10 px-6">
      <div className="max-w-7xl mx-auto">
        
        {/* BACK BUTTON */}
        <button
          onClick={() => navigate("/dashboard/exam-reports")}
          className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-indigo-600 transition-colors mb-6 group"
        >
          <span className="group-hover:-translate-x-1 transition-transform">←</span> 
          Back to Reports Overview
        </button>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              Daily Exam Reports
            </h1>
            <p className="text-gray-500 mt-1">Review your daily practice history and progress</p>
          </div>
          
          <div className="bg-indigo-600 text-white px-5 py-2 rounded-full text-sm font-bold shadow-lg shadow-indigo-100 flex items-center gap-2 self-start md:self-center">
            <span className="opacity-80">Total Attempts:</span>
            <span>{exams.length}</span>
          </div>
        </div>

        {exams.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {exams.map((exam) => {
              const total = exam.totalMarks || 40;
              const percentage = total > 0 ? (exam.score / total) * 100 : 0;
              const value = progress[exam.id] || 0;
              const color = getColor(percentage);

              return (
                <div 
                  key={exam.id} 
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col items-center hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="w-full mb-4 text-center">
                    <h3 className="text-lg font-bold text-gray-800 truncate px-2" title={exam.examTitle}>
                      {exam.examTitle || `Daily Practice #${exam.id}`}
                    </h3>
                    <p className="text-xs text-gray-400 font-medium tracking-wide uppercase mt-1">
                      {exam.user?.username || "Practice User"}
                    </p>
                  </div>

                  <div className="w-24 h-24 mb-6 transform hover:scale-110 transition-transform duration-500">
                    <CircularProgressbar
                      value={value}
                      text={`${Math.round(value)}%`}
                      styles={buildStyles({
                        pathColor: color,
                        textColor: color,
                        trailColor: "#f1f5f9",
                        textSize: "24px",
                        pathTransitionDuration: 0.5,
                      })}
                    />
                  </div>

                  <div className="w-full space-y-3 mb-6">
                    <div className="flex justify-between items-center text-sm border-b border-gray-50 pb-2">
                       <span className="text-gray-500">Score</span>
                       <span className="font-bold text-gray-800">{exam.score} / {total}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                       <span className="text-gray-400">Date</span>
                       <span className="text-gray-600 font-medium">
                        {exam.examDate ? new Date(exam.examDate).toLocaleDateString() : "N/A"}
                       </span>
                    </div>
                  </div>

                  <button
                    onClick={() => navigate(`/dashboard/exam-report-detail/${exam.id}`)}
                    className="w-full py-3 bg-gray-50 text-indigo-600 rounded-xl font-bold text-sm hover:bg-indigo-600 hover:text-white transition-all duration-300 shadow-sm flex items-center justify-center gap-2"
                  >
                    View Analysis 
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-12 text-center shadow-inner border border-dashed border-gray-200 mt-8">
            <div className="text-5xl mb-4">📊</div>
            <h3 className="text-xl font-bold text-gray-800">No practice reports yet.</h3>
            <p className="text-gray-500 mt-2 max-w-sm mx-auto">
              Ready to sharp your skills? Take a Daily Exam from the playground and your results will appear here!
            </p>
            <button 
              onClick={() => navigate("/dashboard/playground")}
              className="mt-6 px-6 py-2 bg-indigo-600 text-white rounded-full font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
            >
              Go to Playground
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default DailyExamReports;