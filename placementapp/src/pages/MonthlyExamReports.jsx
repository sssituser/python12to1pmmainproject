import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function MonthlyExamReports() {

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

  const cacheKey = `monthly-exam-reports-${getCurrentUsername() || "guest"}`;

  // FETCH DATA FROM BACKEND - Monthly exams only
  const fetchReports = async (showLoading = false) => {
    try {
      if (showLoading) setLoading(true);
      const token = localStorage.getItem("access");
      const currentUsername = getCurrentUsername();
      
      const config = {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      };

      // Use unified endpoint with monthly filter
      const url = `/api/all-exam-results/?exam_type=monthly${currentUsername ? `&username=${currentUsername}` : ''}`;
      const res = await axios.get(url, config);

      let backendList = [];
      if (res.data && Array.isArray(res.data.data)) {
        backendList = res.data.data;
      } else if (Array.isArray(res.data)) {
        backendList = res.data;
      }
      
      let localList = [];
      try {
         localList = JSON.parse(localStorage.getItem("allExamResults") || "[]");
      } catch(e) {}
      
      let examList = [...localList, ...backendList];

      // 🛡️ DEDUPLICATE: Merge local unsynced exams with backend exams based on exact ID
      const seenKeys = new Map();
      
      examList.forEach(exam => {
         const type = (exam.examType || exam.exam_type || "").toLowerCase();
         const title = (exam.examTitle || exam.title || exam.exam_title || "").toLowerCase();
         
         const isMonthly = type === 'monthly' || title.includes('monthly');
         
         // User isolation filter
         const examUsername = exam.user?.username || exam.username || "";
         const currentUsernameStr = currentUsername || ""; 
         const isOwnExam = !examUsername || examUsername.toLowerCase() === "unknown" || !currentUsernameStr || examUsername.toLowerCase() === currentUsernameStr.toLowerCase();
         
         if (!isMonthly || !isOwnExam) return;
         
         // 🛡️ UNIQUE ID DEDUPLICATION: Preserve every attempt
         const key = exam.id || exam.random_id || exam.randomId || (exam.examDate + JSON.stringify(exam));
         
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
      console.error("Failed to fetch monthly exam reports:", err);
      // keep cached data visible
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Show cached monthly data first
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
      console.error("Failed to read cached monthly reports:", e);
    }
    fetchReports(!hasCache);
  }, []);

  //  ANIMATION AFTER DATA LOAD
  useEffect(() => {
    if (!Array.isArray(exams) || exams.length === 0) return;

    exams.forEach((exam, index) => {
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
          [exam.id || index]: value,
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
              Monthly Exam Reports
            </h1>
            <p className="text-gray-500 mt-1">Review your long-term progress and monthly scores</p>
          </div>
          
          <div className="bg-purple-600 text-white px-5 py-2 rounded-full text-sm font-bold shadow-lg shadow-purple-100 flex items-center gap-2 self-start md:self-center">
            <span className="opacity-80">Full Assessments:</span>
            <span>{exams.length}</span>
          </div>
        </div>

        {loading && exams.length === 0 ? (
           <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-500 font-bold animate-pulse uppercase tracking-widest text-xs">Loading monthly reports...</p>
           </div>
        ) : exams.length > 0 ? (
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {exams.map((exam, index) => {
              const total = exam.totalMarks || 40;
              const percentage = total > 0 ? (exam.score / total) * 100 : 0;
              const value = progress[exam.id || index] || 0;
              const color = getColor(percentage);

              return (
                <div 
                   key={exam.id || index} 
                   className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col items-center hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border-b-4 border-b-purple-500"
                >
                  <div className="w-full mb-4 text-center">
                    <h3 className="text-lg font-bold text-gray-800 truncate px-2" title={`Monthly Exam ${exams.length - index}`}>
                       {`Monthly Exam ${exams.length - index}`}
                    </h3>
                    <p className="text-xs text-purple-600 font-bold tracking-wider uppercase mt-1">
                       Monthly Assessment
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
                       <span className="text-gray-500">Total Marks</span>
                       <span className="font-bold text-gray-800">{exam.score} / {total}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                       <span className="text-gray-400">Date Taken</span>
                       <span className="text-gray-600 font-medium">
                        {exam.examDate ? new Date(exam.examDate).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "N/A"}
                       </span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                        if (exam.id) {
                            navigate(`/dashboard/exam-report-detail/${exam.id}`, { state: { examNumber: exams.length - index, examType: 'Monthly' } });
                        } else {
                            // Local unsynced exam fallback
                            const localStr = localStorage.getItem("allExamResults");
                            let targetIdx = 0;
                            if (localStr) {
                                const allLocal = JSON.parse(localStr);
                                const foundIdx = allLocal.findIndex(e => (e.random_id && e.random_id === exam.random_id) || (e.randomId && e.randomId === exam.randomId));
                                if (foundIdx !== -1) targetIdx = foundIdx;
                            }
                            localStorage.setItem("selectedExamResult", JSON.stringify(exam));
                            navigate(`/dashboard/playground/detailed-results/${targetIdx}`, { 
                                state: { examTitle: `Monthly Exam ${exams.length - index}` } 
                            });
                        }
                    }}
                    className="w-full py-3 bg-purple-50 text-purple-700 rounded-xl font-bold text-sm hover:bg-purple-600 hover:text-white transition-all duration-300 shadow-sm flex items-center justify-center gap-2"
                  >
                    View Result Analysis 
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-12 text-center shadow-inner border border-dashed border-gray-200 mt-8">
            <div className="text-5xl mb-4">📊</div>
            <h3 className="text-xl font-bold text-gray-800">No monthly records found.</h3>
            <p className="text-gray-500 mt-2 max-w-sm mx-auto">
              Your comprehensive monthly summaries will appear here once you complete a monthly exam!
            </p>
            <button 
              onClick={() => navigate("/dashboard/playground")}
              className="mt-6 px-6 py-2 bg-purple-600 text-white rounded-full font-bold hover:bg-purple-700 transition-colors shadow-lg shadow-purple-200"
            >
              Back to Playground
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default MonthlyExamReports;
