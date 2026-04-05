import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function WeeklyExamReports() {

  const [exams, setExams] = useState([]);
  const [progress, setProgress] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const getCurrentUsername = () => {
    try {
      const userStr = localStorage.getItem("user");
      if (userStr && userStr !== "undefined") {
        const parsedUser = JSON.parse(userStr);
        return parsedUser?.username?.toLowerCase() || null;
      }
    } catch (e) {
      console.error("User parse error:", e);
    }
    return null;
  };

  const cacheKey = `weekly-exam-reports-${getCurrentUsername() || "guest"}`;

  // FETCH DATA FROM BACKEND - Weekly exams only
  const fetchReports = async (showLoading = false) => {
    try {
      if (showLoading) setLoading(true);
      const token = localStorage.getItem("access");
      const currentUsername = getCurrentUsername();
      
      const config = {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      };

      // Use unified endpoint with weekly filter
      const url = `/api/all-exam-results/?exam_type=weekly${currentUsername ? `&username=${currentUsername}` : ''}`;
      const res = await axios.get(url, config);

      let examList = [];
      if (res.data && Array.isArray(res.data.data)) {
        examList = res.data.data;
      } else if (Array.isArray(res.data)) {
        examList = res.data;
      }

      // 🛡️ SMART DEDUPLICATE: Keep single best weekly result per day
      const seenKeys = new Map();
      
      examList.forEach(exam => {
         const type = (exam.examType || exam.exam_type || "").toLowerCase();
         const title = (exam.examTitle || exam.title || "").toLowerCase();
         
         const isWeekly = type === 'weekly' || title.includes('weekly');
         const isExcluded = title.includes('monthly');
         
         if (!isWeekly || isExcluded) return;
         
         // 🛡️ UNIQUE ATTEMPT DEDUPLICATION: Use the database ID to 
         // ensure every unique attempt is shown in the history.
         const key = exam.id || (exam.random_id + exam.examDate);
         
         if (!seenKeys.has(key)) {
           seenKeys.set(key, exam);
         }
      });

      const uniqueExams = Array.from(seenKeys.values());

      // 🛡️ SORT (Most Recent First)
      uniqueExams.sort((a, b) => {
        const dateA = new Date(a.examDate || 0);
        const dateB = new Date(b.examDate || 0);
        if (dateB - dateA !== 0) return dateB - dateA;
        return (b.id || 0) - (a.id || 0);
      });

      setExams(uniqueExams);
      localStorage.setItem(cacheKey, JSON.stringify(uniqueExams));

    } catch (err) {
      console.error("Failed to fetch weekly exam reports:", err);
      // keep existing cache on screen
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Load cached weekly reports first
    let hasCache = false;
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setExams(parsed);
          hasCache = true;
        }
      }
    } catch (e) {
      console.error("Failed to read cached weekly reports:", e);
    }
    fetchReports(!hasCache);
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

  //  COLOR LOGIC
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
              Weekly Exam Reports
            </h1>
            <p className="text-gray-500 mt-1">Track your weekly performance and assessments</p>
          </div>
          
          <div className="bg-green-600 text-white px-5 py-2 rounded-full text-sm font-bold shadow-lg shadow-green-100 flex items-center gap-2 self-start md:self-center">
            <span className="opacity-80">Completed:</span>
            <span>{exams.length}</span>
          </div>
        </div>

        {loading && exams.length === 0 ? (
           <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-500 font-bold animate-pulse uppercase tracking-widest text-xs">Loading reports...</p>
           </div>
        ) : exams.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {exams.map((exam, index) => {
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
                    <h3 className="text-lg font-bold text-gray-800 truncate px-2">
                       {`Weekly Exam ${exams.length - index}`}
                    </h3>
                    <p className="text-xs text-green-600 font-bold tracking-wider uppercase mt-1">
                       Weekly Exam
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
                       <span className="text-gray-500">Marks</span>
                       <span className="font-bold text-gray-800">{exam.score} / {total}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                       <span className="text-gray-400">Recorded</span>
                       <span className="text-gray-600 font-medium">
                        {exam.examDate ? new Date(exam.examDate).toLocaleDateString() : "N/A"}
                       </span>
                    </div>
                  </div>

                  <button
                    onClick={() => navigate(`/dashboard/exam-report-detail/${exam.id}`, { state: { examNumber: exams.length - index, examType: 'Weekly' } })}
                    className="w-full py-3 bg-gray-50 text-green-600 rounded-xl font-bold text-sm hover:bg-green-600 hover:text-white transition-all duration-300 shadow-sm flex items-center justify-center gap-2"
                  >
                    View Report 
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-12 text-center shadow-inner border border-dashed border-gray-200 mt-8">
            <div className="text-5xl mb-4">📊</div>
            <h3 className="text-xl font-bold text-gray-800">No weekly reports found.</h3>
            <p className="text-gray-500 mt-2 max-w-sm mx-auto">
              Finish your weekly assessment to see your detailed breakdown here!
            </p>
            <button 
              onClick={() => navigate("/dashboard/playground")}
              className="mt-6 px-6 py-2 bg-green-600 text-white rounded-full font-bold hover:bg-green-700 transition-colors shadow-lg shadow-green-200"
            >
              Playground
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default WeeklyExamReports;
