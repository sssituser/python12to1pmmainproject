import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import React, { useState, useEffect, useMemo } from "react";
import { Activity, ArrowLeft, BarChart3, Clock, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function DailyExamReports() {
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
    } catch (e) {}
    return null;
  };

  const cacheKey = `daily-exam-reports-${getCurrentUsername() || "guest"}`;

  const fetchReports = async (showLoading = false) => {
    try {
      if (showLoading) setLoading(true);
      const token = localStorage.getItem("access");
      const currentUsername = getCurrentUsername();
      
      const config = { headers: token ? { Authorization: `Bearer ${token}` } : {} };
      const url = `http://${window.location.hostname}:8000/api/all-exam-results/?exam_type=daily&username=${currentUsername}`;
      
      let backendList = [];
      try {
        const res = await axios.get(url, config);
        backendList = res.data?.data || res.data || [];
        if (!Array.isArray(backendList) && backendList.results) backendList = backendList.results;
      } catch (e) { console.error("Backend fetch failed", e); }
      
      const localList = JSON.parse(localStorage.getItem("allExamResults") || "[]");
      const localDaily = localList.filter(e => {
        const type = (e.examType || e.exam_type || '').toLowerCase();
        const title = (e.examTitle || e.title || '').toLowerCase();
        // Permissive match: explicit daily type, daily in title, OR missing type entirely
        return type === 'daily' || title.includes('daily') || type === '';
      });
      const examList = [...localDaily, ...backendList];

      const seenKeys = new Map();
      examList.forEach(exam => {
         const type = (exam.examType || exam.exam_type || "").toLowerCase();
         if (type !== 'daily' && type !== '') return;
         
         const timestamp = exam.examDate || exam.date || exam.start_time || '0';
         const cleanTimestamp = new Date(timestamp).getTime();
         const minuteBucket = Math.floor(cleanTimestamp / 60000);
         const title = (exam.examTitle || exam.exam_title || "Daily Exam").toLowerCase();
         
         const fingerprint = `${minuteBucket}_${title}`;
         
         if (seenKeys.has(fingerprint)) {
            const existing = seenKeys.get(fingerprint);
            const incomingTotal = exam.totalMarks || exam.total_marks || 0;
            const existingTotal = existing.totalMarks || existing.total_marks || 0;
            if ((exam.id && !existing.id) || (incomingTotal > existingTotal)) {
               seenKeys.set(fingerprint, exam);
            }
         } else {
            seenKeys.set(fingerprint, exam);
         }
      });

      const sorted = Array.from(seenKeys.values()).sort((a, b) => {
         const dA = new Date(a.examDate || a.date || a.start_time || 0);
         const dB = new Date(b.examDate || b.date || b.start_time || 0);
         return dB - dA;
      });
      setExams(sorted);
      localStorage.setItem(cacheKey, JSON.stringify(sorted));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed)) setExams(parsed);
      } catch (e) {}
    }
    fetchReports(!cached);

    const handleUpdate = () => fetchReports(false);
    window.addEventListener('examDataUpdated', handleUpdate);
    return () => window.removeEventListener('examDataUpdated', handleUpdate);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      const finalProgress = {};
      exams.forEach((exam, index) => {
        const score = exam.marks_obtained ?? exam.score ?? 0;
        const total = (exam.total_marks ?? exam.totalMarks ?? ((exam.totalQuestions || 20) * 2)) || 40;
        const percentage = total > 0 ? (score / total) * 100 : 0;
        finalProgress[exam.id || index || exam.examDate] = percentage;
      });
      setProgress(finalProgress);
    }, 100);
    return () => clearTimeout(timer);
  }, [exams]);

  const getColor = (percentage) => {
    if (percentage >= 80) return "#10b981";
    if (percentage >= 60) return "#f59e0b";
    return "#ef4444";
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <button
          onClick={() => navigate("/dashboard/exam-reports")}
          className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-indigo-600 transition-all mb-8 group bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-100"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> 
          Back to Reports
        </button>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">
              Daily <span className="text-indigo-600">Analytics</span>
            </h1>
            <p className="text-slate-500 font-medium">Detailed performance breakdown of your daily assessments.</p>
          </div>
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
               <Activity className="w-6 h-6" />
            </div>
            <div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Attempts</p>
               <p className="text-xl font-black text-slate-900">{exams.length}</p>
            </div>
          </div>
        </div>

        {loading && exams.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 gap-6">
            <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin shadow-lg"></div>
            <p className="text-slate-400 font-black text-xs uppercase tracking-[0.3em] animate-pulse">Syncing Reports...</p>
          </div>
        ) : exams.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {exams.map((exam, index) => {
              const scoreValue = exam.marks_obtained ?? exam.score ?? 0;
              const total = (exam.total_marks ?? exam.totalMarks ?? ((exam.totalQuestions || 20) * 2)) || 40;
              const percentage = total > 0 ? (scoreValue / total) * 100 : 0;
              const value = progress[exam.id || index || exam.examDate] || 0;
              const color = getColor(percentage);

              return (
                <div 
                  key={exam.id || index || exam.examDate} 
                  className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/40 border border-slate-100 p-8 flex flex-col items-center group hover:scale-[1.03] transition-all duration-500 relative overflow-hidden"
                >
                  <div className={`absolute top-0 left-0 w-full h-1.5 ${percentage >= 80 ? 'bg-emerald-500' : percentage >= 60 ? 'bg-amber-500' : 'bg-rose-500'}`}></div>
                  
                  <div className="w-full mb-8 text-center">
                    <h3 className="text-xl font-black text-slate-900 truncate mb-1 uppercase tracking-tight">
                       {(exam.examTitle || exam.title || "Exam").replace(/^Daily\s+/i, "")}
                    </h3>
                  </div>

                  <div className="w-28 h-28 mb-8 relative">
                    <CircularProgressbar
                      value={value}
                      text={`${Math.round(value)}%`}
                      styles={buildStyles({
                        pathColor: color,
                        textColor: color,
                        trailColor: "#F1F5F9",
                        textSize: "24px",
                        pathTransitionDuration: 1.5,
                        strokeLinecap: 'round'
                      })}
                    />
                    <div className="absolute inset-0 rounded-full shadow-inner pointer-events-none"></div>
                  </div>

                  <div className="w-full grid grid-cols-2 gap-4 mb-8">
                    <div className="bg-slate-50 p-3 rounded-2xl text-center border border-slate-100/50">
                       <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Score</p>
                       <p className="text-sm font-black text-slate-700">{scoreValue}<span className="text-slate-300 mx-1">/</span>{total}</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-2xl text-center border border-slate-100/50">
                       <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</p>
                       <p className={`text-[10px] font-black uppercase ${percentage >= 40 ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {percentage >= 40 ? 'Pass ✓' : 'Fail ✗'}
                       </p>
                    </div>
                  </div>

                  <div className="w-full flex items-center gap-3 text-slate-400 mb-8 border-t border-slate-50 pt-6">
                     <Clock className="w-4 h-4" />
                     <span className="text-xs font-bold">
                        {exam.examDate ? new Date(exam.examDate).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "Recently Completed"}
                     </span>
                  </div>

                  <button
                    onClick={() => {
                      const rId = exam.id || exam.report_id || exam.pk;
                      // Fallback for local exams: navigate to DetailedResults
                      if (!rId || rId === "undefined") {
                         const identifier = exam.examDate || index;
                         // Save to local for pick-up if needed
                         localStorage.setItem("selectedExamResult", JSON.stringify(exam));
                         navigate(`/dashboard/playground/detailed-results/${identifier}`, {
                            state: { resultData: exam }
                         });
                         return;
                      }
                      navigate(`/dashboard/exam-report-detail/${rId}`, { 
                        state: { examNumber: exams.length - index, examType: 'Daily' } 
                      });
                    }}
                    className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-600 transition-all active:scale-95 shadow-lg shadow-slate-200 flex items-center justify-center gap-2 group/btn"
                  >
                    <BarChart3 className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                    View Analysis 
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-[3rem] p-16 text-center shadow-xl shadow-slate-200/50 border border-slate-100 mt-8 flex flex-col items-center">
            <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 mb-8">
               <Activity size={48} />
            </div>
            <h3 className="text-3xl font-black text-slate-900 mb-4 tracking-tight uppercase">No Reports Available</h3>
            <p className="text-slate-400 font-medium max-w-md mx-auto leading-relaxed mb-10">
              Start your journey by completing a daily assessment in the playground. Your analytical breakdown will appear here.
            </p>
            <button 
              onClick={() => navigate("/dashboard/playground")}
              className="px-10 py-4 bg-indigo-600 text-white rounded-full font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 active:scale-95"
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
