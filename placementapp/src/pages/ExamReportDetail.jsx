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
        const res = await axios.get(`http://${window.location.hostname}:8000/api/exam-report-detail/${id}/`);
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
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
      <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-gray-500 font-bold animate-pulse uppercase tracking-widest text-xs">Loading Detailed Report...</p>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
      <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center text-3xl mb-4 shadow-inner">⚠️</div>
      <h2 className="text-xl font-black text-gray-900 uppercase mb-2">Report Error</h2>
      <p className="text-gray-500 font-medium max-w-xs">{error}</p>
      <button onClick={() => navigate(-1)} className="mt-6 px-6 py-2 bg-indigo-600 text-white rounded-full font-bold shadow-lg">Go Back</button>
    </div>
  );

  const getPassingScore = (title) => {
    const t = (title || "").toLowerCase();
    if (t.includes("ui")) return 45;
    if (t.includes("backend") || t.includes("node") || t.includes("express") || t.includes("sql") || t.includes("db") || t.includes("database")) return 35;
    return 20;
  };

  const syncMarks = (rawMarks, totalQ) => {
    const isRaw = totalQ <= 25;
    return {
      obtained: isRaw ? (rawMarks * 2) : rawMarks,
      total: isRaw ? (totalQ * 2) : totalQ
    };
  };

  if (!report) return null;

  const currentPassThreshold = getPassingScore(report.exam_title || report.examTitle || "");
  const { obtained: displayMarks, total: displayTotal } = syncMarks(report.marks_obtained || report.score || 0, report.total_questions || report.total_marks || 25);
  const passed = displayMarks >= currentPassThreshold;
  const percentage = displayTotal > 0 ? ((displayMarks / displayTotal) * 100).toFixed(1) : 0;

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
    <div className="min-h-screen bg-gray-50 py-4 px-2 sm:px-4 lg:px-6">
      <div className="w-full max-w-[98%] mx-auto">
        
        {/* Navigation */}
        <button
          onClick={() => navigate(-1)}
          className="group flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-indigo-600 transition-all mb-8"
        >
          <span className="w-8 h-8 flex items-center justify-center rounded-full bg-white shadow-sm group-hover:bg-indigo-50 transition-colors">
            ←
          </span>
          Back to Reports History
        </button>

        {/* TOP SUMMARY CARD */}
        <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden mb-8 transform hover:scale-[1.005] transition-transform duration-300">
          <div className={`px-8 py-6 flex flex-col sm:flex-row justify-between items-center gap-4 ${passed ? "bg-emerald-600" : "bg-emerald-200 border-b border-emerald-300"}`}>
            <div className="text-center sm:text-left">
              <h1 className={`text-2xl font-black tracking-tight ${passed ? "text-white" : "text-emerald-900"}`}>
                {(report.exam_title || report.examTitle || "Assessment Report").replace(/^Daily\s+/i, "").toUpperCase()}
              </h1>
              <p className={`text-sm font-medium mt-1 ${passed ? "text-white/80" : "text-emerald-700/70"}`}>
                Completed by {(report.user?.username || report.user?.first_name || "Student").toUpperCase()}
              </p>
            </div>
            <div className={`px-6 py-2 rounded-2xl border font-bold text-lg shadow-sm transition-all ${passed ? "bg-white/20 backdrop-blur-md border-white/30 text-white" : "bg-rose-600 border-rose-500 text-white shadow-rose-200"}`}>
               {passed ? "🏆 PASSED" : "⚠️ FAILED"}
            </div>
          </div>

          <div className="p-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div className="space-y-1 p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100/50">
                <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Final Score</p>
                <p className="text-3xl font-black text-indigo-900">{displayMarks}<span className="text-indigo-300 text-lg font-bold ml-1">/{displayTotal}</span></p>
              </div>
              <div className="space-y-1 p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100/50">
                <p className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Correct</p>
                <p className="text-3xl font-black text-emerald-900">{report.correct_answers || (report.marks_obtained ?? 0)}</p>
              </div>
              <div className="space-y-1 p-4 rounded-2xl bg-rose-50/50 border border-rose-100/50">
                <p className="text-xs font-bold text-rose-400 uppercase tracking-widest">Wrong</p>
                <p className="text-3xl font-black text-rose-900">{(report.total_questions || 25) - (report.correct_answers || (report.marks_obtained ?? 0))}</p>
              </div>
              <div className="space-y-1 p-4 rounded-2xl bg-orange-50/50 border border-orange-100/50">
                <p className="text-xs font-bold text-orange-400 uppercase tracking-widest">Accuracy</p>
                <p className="text-3xl font-black text-orange-900">{percentage}%</p>
              </div>
            </div>

            {/* Progress Bar Container */}
            <div className="mt-10">
               <div className="flex justify-between items-end mb-2">
                  <span className="text-sm font-bold text-gray-400 uppercase tracking-wide">Performance Benchmark</span>
                  <span className="text-sm font-black text-gray-900">{percentage}%</span>
               </div>
               <div className="h-4 bg-gray-100 rounded-full overflow-hidden p-1 shadow-inner border border-gray-200">
                  <div 
                    className={`h-full rounded-full transition-all duration-1000 ease-out ${passed ? "bg-emerald-500" : "bg-rose-500"}`}
                    style={{ width: `${percentage}%` }}
                  />
               </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-100 flex flex-wrap justify-between gap-4">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center font-bold text-gray-500">🧑</div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Candidate Name</p>
                    <p className="text-sm font-bold text-gray-900 uppercase">{(report.user?.username || report.user?.first_name || "Unknown")}</p>
                  </div>
               </div>
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center font-bold text-gray-500">📅</div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Assessment Date</p>
                    <p className="text-sm font-bold text-gray-900">{report.exam_date ? new Date(report.exam_date).toLocaleDateString("en-GB", { day: 'numeric', month: 'short', year: 'numeric' }) : "N/A"}</p>
                  </div>
               </div>
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center font-bold text-gray-500">🆔</div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Student ID</p>
                    <p className="text-sm font-bold text-gray-900">{(report.random_id || report.studentId || report.student_id || report.id || "0")}</p>
                  </div>
               </div>
            </div>
          </div>
        </div>

        {/* DASHBOARD GRID TITLE */}
        <div className="flex items-center gap-4 mb-6">
           <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">Question Breakdown</h2>
           <div className="h-px flex-1 bg-gray-200"></div>
        </div>

        {/* Question Analysis */}
        {Array.isArray(questions) && questions.length > 0 ? (
          <div className="space-y-6">
            {questions.map((q, i) => {
              const userAnswer = answers[i];
              const correctKey = q.correct;
              const isCorrect = String(userAnswer) === String(correctKey); // Safer string comparison
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

              const isCoding = q.type === 'coding' || !q.options || (Array.isArray(q.options) && q.options.length === 0) || Object.keys(q.options).length === 0;

              if (isCoding) {
                return (
                  <div key={i} className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden hover:border-indigo-200 transition-colors">
                    <div className="p-8">
                       <div className="flex justify-between items-start mb-6">
                          <div className="flex items-center gap-3">
                             <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black">{i + 1}</div>
                             <span className="text-xs font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">Coding Challenge</span>
                          </div>
                          <div className={`px-4 py-1.5 rounded-full text-xs font-black uppercase border ${isCorrect ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-rose-50 text-rose-700 border-rose-100"}`}>
                             {isCorrect ? "✓ PASSED" : "✗ FAILED"}
                          </div>
                       </div>
                       
                       <p className="text-lg font-black text-gray-800 leading-tight mb-6">
                          {q.question}
                       </p>

                       <div className="bg-slate-900 rounded-2xl p-6 relative group overflow-hidden">
                          <div className="flex justify-between items-center mb-4">
                             <div className="flex gap-1.5">
                                <div className="w-3 h-3 rounded-full bg-rose-500/50"></div>
                                <div className="w-3 h-3 rounded-full bg-amber-500/50"></div>
                                <div className="w-3 h-3 rounded-full bg-emerald-500/50"></div>
                             </div>
                             <span className="text-[10px] font-bold text-slate-500 tracking-[0.2em] uppercase">Student Submission</span>
                          </div>
                          <pre className="text-emerald-400 font-mono text-sm leading-relaxed overflow-x-auto whitespace-pre-wrap">
                            {userAnswer || "// No code was submitted for this challenge"}
                          </pre>
                       </div>
                    </div>
                  </div>
                );
              }

              return (
                <div key={i} className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden group hover:border-gray-200 transition-all">
                  <div className="p-8 border-b border-gray-50 bg-gray-50/10">
                     <div className="flex justify-between items-start mb-6">
                        <div className="flex items-center gap-3">
                           <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black shadow-lg shadow-indigo-100">{i + 1}</div>
                           <span className="text-xs font-black uppercase tracking-widest text-gray-400">Section Question</span>
                        </div>
                        <div className={`px-4 py-1.5 rounded-full text-xs font-black uppercase border shadow-sm ${isCorrect ? "bg-emerald-50 text-emerald-700 border-emerald-100 shadow-emerald-50/50" : "bg-rose-50 text-rose-700 border-rose-100 shadow-rose-50/50"}`}>
                           {isCorrect ? "✓ CORRECT" : "✗ INCORRECT"}
                        </div>
                     </div>
                     <p className="text-lg font-bold text-gray-900 leading-snug">
                        {q.question}
                     </p>
                  </div>

                  <div className="p-8 space-y-3">
                    {Object.entries(options).map(([key, value]) => {
                      const displayKey = (isNaN(key) || key === null || key === undefined) ? key : ["A","B","C","D"][parseInt(key)] || key;
                      const isThisCorrect = String(key) === String(correctKey) || displayKey === correctKey;
                      const isUserSelected = String(key) === String(userAnswer) || displayKey === userAnswer;
                      const isWrongSelection = isUserSelected && !isThisCorrect;

                      let containerStyles = "border-gray-100 bg-white hover:bg-gray-50";
                      let indicatorColor = "text-gray-300";
                      
                      if (isThisCorrect && isUserSelected) {
                        containerStyles = "border-emerald-200 bg-emerald-50/50 ring-2 ring-emerald-500/10";
                        indicatorColor = "text-emerald-500";
                      } else if (isWrongSelection) {
                        containerStyles = "border-rose-200 bg-rose-50/50 ring-2 ring-rose-500/10";
                        indicatorColor = "text-rose-500";
                      } else if (isThisCorrect) {
                        containerStyles = "border-emerald-200 bg-emerald-50/20";
                        indicatorColor = "text-emerald-500/60";
                      }

                      return (
                        <div
                          key={key}
                          className={`flex justify-between items-center px-5 py-4 border-2 rounded-2xl transition-all duration-200 ${containerStyles}`}
                        >
                          <div className="flex items-center gap-4">
                             <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black ${isUserSelected ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100" : "bg-gray-100 text-gray-500"}`}>
                                {displayKey}
                             </div>
                             <span className="font-semibold text-gray-800">{value}</span>
                          </div>
                          
                          <div className={`text-[10px] font-black uppercase tracking-widest ${indicatorColor}`}>
                             {isThisCorrect && isUserSelected && "✓ Correct  ✓ Your Answer"}
                             {isWrongSelection && "✗ Your Choice"}
                             {isThisCorrect && !isUserSelected && "✓ Correct"}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  <div className="px-8 py-5 bg-gray-50 border-t border-gray-100 flex flex-col sm:flex-row gap-4 justify-between items-center text-xs font-bold text-gray-400 tracking-wider">
                     <div className="flex gap-2 items-center">
                        <span className="uppercase text-[10px]">Your Answer:</span>
                        <span className={`text-sm ${isCorrect ? "text-emerald-600" : "text-rose-600"} font-black`}>{userAnswerText}</span>
                     </div>
                     <div className="flex gap-2 items-center">
                        <span className="uppercase text-[10px]">Correct solution:</span>
                        <span className="text-sm text-emerald-600 font-black">{correctAnswerText}</span>
                     </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* FALLBACK UI */
          <div className="bg-white rounded-[2.5rem] p-12 text-center shadow-2xl shadow-indigo-100/50 border border-indigo-50 mt-8 group">
            <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform duration-500 shadow-inner text-5xl">📊</div>
            <h3 className="text-3xl font-black text-gray-900 mb-4 tracking-tight uppercase">Performance Insight Summary</h3>
            <p className="text-gray-500 max-w-xl mx-auto leading-relaxed mb-10 font-medium">
               Detailed question breakdown is currently being processed. Here is your high-level performance evaluation based on the overall assessment metrics for this session.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-3xl mx-auto">
               <div className="p-8 rounded-[2.5rem] bg-indigo-50/50 border border-indigo-100 text-center shadow-inner">
                  <div className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-3">Accuracy</div>
                  <div className="text-4xl font-black text-indigo-900 mb-1">{report?.percentage || 0}%</div>
               </div>
               <div className="p-8 rounded-[2.5rem] bg-emerald-50/50 border border-emerald-100 text-center shadow-inner">
                  <div className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em] mb-3">Mastery</div>
                  <div className="text-4xl font-black text-emerald-900 mb-1">{report?.correct_answers || 0}</div>
               </div>
               <div className="p-8 rounded-[2.5rem] bg-rose-50/50 border border-rose-100 text-center shadow-inner">
                  <div className="text-[10px] font-black text-rose-400 uppercase tracking-[0.2em] mb-3">Growth</div>
                  <div className="text-4xl font-black text-rose-900 mb-1">{report?.incorrect_answers || 0}</div>
               </div>
            </div>
            
            <button
               onClick={() => navigate(-1)}
               className="mt-12 px-10 py-4 bg-indigo-600 text-white rounded-full font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200"
            >
               Return to Overview
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ExamReportDetail;
