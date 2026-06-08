import {
  faArrowLeft,
  faTerminal,
  faClock,
  faFlag
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import CodeCompiler from "../components/CodeCompiler";

// Indestructible global array to catch all streams outside React DOM scope
let globalStreamsToClean = [];

const WeeklyExam = () => {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const faceDetectionIntervalRef = useRef(null);
  const violationStartTimeRef = useRef(null);
  const lastWarningTimeRef = useRef(0);
  const examSubmittedRef = useRef(false);

  const [isLoadingQuestions, setIsLoadingQuestions] = useState(true);
  const [examStarted, setExamStarted] = useState(false);
  const [examSubmitted, setExamSubmitted] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  
  const [passingValue, setPassingValue] = useState(35);
  const [answers, setAnswers] = useState([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [examDuration, setExamDuration] = useState(45);
  const [webcamActive, setWebcamActive] = useState(false);
  const [webcamStatus, setWebcamStatus] = useState("idle");
  const [compilerCode, setCompilerCode] = useState("");
  const [showCompiler, setShowCompiler] = useState(false);

  let storedUser = {};
  try {
    const userStr = localStorage.getItem("user");
    storedUser = userStr && userStr !== "undefined" ? JSON.parse(userStr) : {};
  } catch (e) { storedUser = {}; }
  
  const [studentCourse, setStudentCourse] = useState((storedUser.course || "").trim());

  const [warningCount, setWarningCount] = useState(0);
  const [warningMessage, setWarningMessage] = useState("");
  const [showWarningModal, setShowWarningModal] = useState(false);

  const [sessionId, setSessionId] = useState(null);

  // Initialize or fetch the Django ExamSession ID on start
  const registerExamSessionOnBackend = async () => {
    try {
      const res = await axios.post(`http://${window.location.hostname}:8000/api/exams/start/`, {
        student_name: storedUser.username || "Anonymous Student",
        student_email: storedUser.email || "student@example.com"
      });
      if (res.data && res.data.session_id) {
        setSessionId(res.data.session_id);
      }
    } catch (e) {
      console.error("Failed to start backend exam session:", e);
    }
  };

  const triggerWarning = async (reason, type = "TAB_SWITCH") => {
    if (examSubmittedRef.current) return;
    const now = Date.now();
    if (now - lastWarningTimeRef.current < 3000) return;
    lastWarningTimeRef.current = now;

    // Send violation log to the backend asynchronously
    if (sessionId) {
      try {
        await axios.post(`http://${window.location.hostname}:8000/api/exams/log-violation/`, {
          session_id: sessionId,
          violation_type: type,
          remarks: reason
        });
      } catch (err) {
        console.error("Failed to report proctoring violation:", err);
      }
    }

    setWarningCount(prev => {
      const next = prev + 1;
      if (next >= 5) {
        handleSubmitExam(`Exam automatically terminated due to multiple security violations: ${reason}`);
        setShowWarningModal(false);
        return next;
      }
      setWarningMessage(reason);
      setShowWarningModal(true);
      return next;
    });
  };

  const startWebcam = async () => {
    setWebcamActive(true);
    setWebcamStatus("active");
  };

  useEffect(() => {
    if (videoRef.current && globalStreamsToClean.length > 0) {
      const liveStream = globalStreamsToClean[globalStreamsToClean.length - 1];
      if (videoRef.current.srcObject !== liveStream) {
        videoRef.current.srcObject = liveStream;
      }
    }
  }, [examStarted, webcamActive, webcamStatus]);

  const stopWebcam = () => {
    setWebcamActive(false);
  };

  // Fetch Logic
  useEffect(() => {
    const fetchQuestions = async () => {
      setIsLoadingQuestions(true);
      try {
        const course = studentCourse;
        const res = await fetch(`http://${window.location.hostname}:8000/api/admin/exam-settings/?category=Weekly&course=${encodeURIComponent(course)}`);
        const data = await res.json();

        if (data.success && data.data && data.data.questions && Array.isArray(data.data.questions)) {
          const shuffleArray = (array) => {
            const shuffled = [...array];
            for (let i = shuffled.length - 1; i > 0; i--) {
              const j = Math.floor(Math.random() * (i + 1));
              [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
            }
            return shuffled;
          };

          const maxQ = data.data.maxQuestions || 80;
          const displayLimit = Math.min(data.data.questions.length, maxQ);
          const allShuffled = shuffleArray(data.data.questions);
          const weeklyQuestions = allShuffled.slice(0, displayLimit);

          const dur = data.data.duration || 45;
          setExamDuration(dur);
          setTimeLeft(dur * 60);

          const mappedQuestions = weeklyQuestions.map((q, idx) => {
            const opts = q.options || [];
            const shuffledOptions = shuffleArray(opts);
            return {
              ...q,
              id: idx + 1,
              marks: parseInt(q.marks) || 10,
              question: q.question,
              options: shuffledOptions,
              correct: shuffledOptions.indexOf(q.answer) !== -1 ? shuffledOptions.indexOf(q.answer) : 0
            };
          });
          setQuestions(mappedQuestions);
          setAnswers(new Array(mappedQuestions.length).fill(null));
        }
      } catch (err) {
        console.error("Failed to fetch questions:", err);
      } finally {
        setIsLoadingQuestions(false);
      }
    };

    fetchQuestions();
    startWebcam();
  }, [studentCourse]);

  // Timer Hook
  useEffect(() => {
    if (examStarted && !examSubmitted && timeLeft > 0) {
      const t = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(t);
    }
    if (timeLeft === 0 && examStarted && !examSubmitted) handleSubmitExam("Time Expired");
  }, [timeLeft, examStarted, examSubmitted]);

  // Security Monitoring
  useEffect(() => {
    if (!examStarted || examSubmitted) return;

    let cleanup = () => {};
    const startSecurityMonitoring = () => {
      const handleVisibilityChange = () => { 
        if (document.hidden) {
          console.warn("Security: Tab switch detected!");
          triggerWarning("Tab switching detected", "TAB_SWITCH");
        }
      };
      const handleBlur = () => { 
        if (!document.hidden) {
          console.warn("Security: Focus lost detected!");
          triggerWarning("Window focus lost", "TAB_SWITCH"); 
        }
      };
      const handleFullscreenChange = () => { 
        if (!document.fullscreenElement && examStarted) {
          console.warn("Security: Fullscreen exit detected!");
          triggerWarning("Full screen exited", "FULLSCREEN_EXIT"); 
        }
      };
      const preventAction = (e) => { 
        e.preventDefault(); 
        triggerWarning("Restricted interaction (Copy/Paste/Right-click)", "COPY_ATTEMPT"); 
      };

      document.addEventListener("visibilitychange", handleVisibilityChange);
      window.addEventListener("blur", handleBlur);
      document.addEventListener("fullscreenchange", handleFullscreenChange);
      document.addEventListener("contextmenu", preventAction);
      document.addEventListener("copy", preventAction);
      document.addEventListener("paste", preventAction);

      cleanup = () => {
        document.removeEventListener("visibilitychange", handleVisibilityChange);
        window.removeEventListener("blur", handleBlur);
        document.removeEventListener("fullscreenchange", handleFullscreenChange);
        document.removeEventListener("contextmenu", preventAction);
        document.removeEventListener("copy", preventAction);
        document.removeEventListener("paste", preventAction);
      };
    };

    startSecurityMonitoring();
    return () => cleanup();
  }, [examStarted, examSubmitted]);

  const handleCloseWarningModal = async () => {
    setShowWarningModal(false);
    if (!document.fullscreenElement) {
      try {
        const docEl = document.documentElement;
        if (docEl.requestFullscreen) await docEl.requestFullscreen();
      } catch (e) {}
    }
  };

  // Block Back/Refresh
  useEffect(() => {
    if (examStarted && !examSubmitted) {
      window.history.pushState(null, "", window.location.href);
      const blockNavigation = () => window.history.pushState(null, "", window.location.href);
      window.addEventListener("popstate", blockNavigation);
      const blockRefresh = (e) => {
        e.preventDefault();
        e.returnValue = "Warning: Your exam progress will be lost if you refresh or close this tab.";
        return e.returnValue;
      };
      window.addEventListener("beforeunload", blockRefresh);
      return () => {
        window.removeEventListener("popstate", blockNavigation);
        window.removeEventListener("beforeunload", blockRefresh);
      };
    }
  }, [examStarted, examSubmitted]);

  const handleSubmitExam = async (reason = "Manual") => {
    if (examSubmittedRef.current) return;
    examSubmittedRef.current = true;
    setExamSubmitted(true);
    stopWebcam();

    try { if (document.fullscreenElement) await document.exitFullscreen(); } catch (e) {}

    const totalPossibleMarks = questions.reduce((acc, q) => acc + (q.marks || 10), 0);
    const score = answers.reduce((acc, ans, idx) => acc + (ans === questions[idx]?.correct ? (questions[idx]?.marks || 10) : 0), 0);
    const result = {
      examTitle: `${studentCourse || 'Weekly'} Assessment`,
      examType: 'weekly',
      course: studentCourse || "",
      user: {
        username: storedUser.username || "",
        studentId: (JSON.parse(localStorage.getItem("sssit-profile") || "{}")).studentId || storedUser.studentId || storedUser.username || "",
        name: (JSON.parse(localStorage.getItem("sssit-profile") || "{}")).fullName || storedUser.fullName || storedUser.firstName || "Student"
      },
      score,
      total_marks: questions.length * 2,
      totalQuestions: questions.length,
      correctAnswers: Math.round(score / 2),
      passed: (score / (questions.length * 2)) * 100 >= 35,
      timeTaken: (examDuration * 60) - timeLeft,
      examDate: new Date().toISOString(),
      questions,
      answers
    };

    localStorage.setItem("examResult", JSON.stringify(result));
    
    const token = localStorage.getItem("access")?.replace(/^"|"$/g, "");
    if (token) {
      try {
        await axios.post(`http://${window.location.hostname}:8000/api/save-exam-report/`, result, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch (err) { console.error("Persistence failed", err); }
    }
    
    const allResults = JSON.parse(localStorage.getItem("allExamResults") || "[]");
    allResults.unshift(result);
    localStorage.setItem("allExamResults", JSON.stringify(allResults));
    window.dispatchEvent(new CustomEvent('examDataUpdated', { detail: { examType: 'weekly', result } }));
    navigate("/dashboard/playground-results", { replace: true });
  };

  const handleStartExam = async () => {
    try {
      const docEl = document.documentElement;
      if (docEl.requestFullscreen) await docEl.requestFullscreen();
    } catch (err) {}
    await registerExamSessionOnBackend();
    setExamStarted(true);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (!examStarted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-center relative">
        <div className="absolute top-8 left-8 z-50">
          <button onClick={() => navigate("/dashboard/playground")} className="flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-blue-600 transition-all bg-white px-5 py-2.5 rounded-2xl shadow-sm border border-gray-100 group">
            <FontAwesomeIcon icon={faArrowLeft} className="group-hover:-translate-x-1 transition-transform" />
            Back to Playground
          </button>
        </div>
        <div className="bg-white p-12 rounded-[3rem] shadow-2xl max-w-lg w-full">
           <div className="w-64 h-48 mx-auto mb-8 bg-blue-50 rounded-3xl overflow-hidden shadow-inner relative flex flex-col items-center justify-center border border-blue-100">
              <FontAwesomeIcon icon={faTerminal} className="text-4xl text-blue-500 mb-2" />
              <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Secure Exam Mode</span>
           </div>
           
           <h2 className="text-3xl font-black mb-2 uppercase">{studentCourse || 'Weekly'} Assessment</h2>
           <p className="text-gray-500 font-bold mb-8 uppercase text-[10px] tracking-widest">
              {isLoadingQuestions ? "Fetching Questions..." : `${questions.length} Questions • ${examDuration} Minutes`}
           </p>

           <button 
            onClick={handleStartExam} 
            disabled={isLoadingQuestions || questions.length === 0} 
            className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
           >
             Start Assessment
           </button>
        </div>
      </div>
    );
  }

  const activeQ = questions[currentQuestion];
  return (
    <div className="min-h-screen bg-gray-50 p-6 flex flex-col gap-6 relative">

      <div className="max-w-5xl mx-auto w-full bg-white/80 backdrop-blur-md px-6 py-4 rounded-[1.5rem] shadow-sm flex justify-between items-center border border-gray-100 sticky top-0 z-40">
         <div className="flex items-center gap-4">
            <div className="bg-blue-50/50 px-4 py-2 rounded-xl flex items-center gap-2.5 border border-blue-100/50">
               <FontAwesomeIcon icon={faClock} className="text-blue-500 text-xs" />
               <span className="font-black text-blue-700 tabular-nums text-base">{formatTime(timeLeft)}</span>
            </div>
         </div>
         <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
            <span className="text-blue-600">Weekly</span> Assessment
         </div>
      </div>

      <div className="max-w-5xl mx-auto w-full grid grid-cols-4 gap-6 items-start">
         <div className="col-span-3 space-y-6">
            <div className="bg-white p-6 rounded-[1.5rem] shadow-sm border border-gray-100 relative overflow-hidden flex flex-col min-h-[440px]">
               <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-10"></div>
               
               <div className="flex items-center justify-between mb-8">
                 <div className="flex items-center gap-2.5">
                   <span className="bg-blue-600 text-white h-6 w-6 rounded-lg flex items-center justify-center text-[10px] font-black shadow-md shadow-blue-200">
                     {currentQuestion + 1}
                   </span>
                   <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest pl-1">
                     Weekly Assessment
                   </span>
                 </div>
                 <div className="px-3 py-1 bg-gray-50 rounded-xl border border-gray-100">
                   <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest mr-2">Marks:</span>
                   <span className="text-[10px] font-black text-gray-800">{activeQ?.marks || 10}</span>
                 </div>
               </div>

                <div className="flex-1">
                   <div className="mb-8">
                      <h3 className="text-lg font-bold text-gray-900 leading-snug mb-3">{activeQ?.question || "Loading question..."}</h3>
                      <div className="h-0.5 w-8 bg-blue-600/40 rounded-full mb-6"></div>
                   </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                     {(activeQ?.options || []).map((opt, i) => (
                       <label 
                         key={i} 
                         className={`group relative flex items-center p-3.5 rounded-2xl border-2 transition-all cursor-pointer ${
                           answers[currentQuestion] === i 
                           ? 'bg-blue-600 border-blue-600 shadow-lg shadow-blue-100' 
                           : 'bg-white border-gray-50 hover:border-blue-100 hover:bg-blue-50/20'
                         }`}
                       >
                         <div className="flex flex-row items-center w-full gap-3">
                           <div className={`shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                              answers[currentQuestion] === i 
                              ? 'border-white bg-white/25' 
                              : 'border-gray-200 group-hover:border-blue-300'
                           }`}>
                              {answers[currentQuestion] === i && <div className="w-2 h-2 bg-white rounded-full"></div>}
                           </div>
                           <input
                             type="radio"
                             name={`q-${currentQuestion}`}
                             checked={answers[currentQuestion] === i}
                             onChange={() => { const a = [...answers]; a[currentQuestion] = i; setAnswers(a); }}
                             className="hidden"
                           />
                           <span className={`text-sm font-bold tracking-tight break-words flex-1 ${answers[currentQuestion] === i ? 'text-white' : 'text-gray-700'}`}>
                              {opt}
                           </span>
                         </div>
                       </label>
                     ))}
                  </div>

                  <div className="mt-8 pt-8 border-t border-gray-50">
                    <button 
                      onClick={() => setShowCompiler(!showCompiler)}
                      className={`flex items-center gap-3 px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${
                        showCompiler 
                        ? 'bg-slate-900 text-white shadow-xl' 
                        : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-lg flex items-center justify-center ${showCompiler ? 'bg-indigo-500' : 'bg-indigo-600 text-white'}`}>
                        <FontAwesomeIcon icon={faTerminal} className="text-[10px]" />
                      </div>
                      {showCompiler ? 'Hide compiler' : 'Open compiler'}
                    </button>

                    {showCompiler && (
                      <div className="mt-6 animate-in slide-in-from-top-4 duration-300">
                        <CodeCompiler 
                          language={studentCourse} 
                          initialCode={compilerCode}
                          onCodeChange={(newCode) => setCompilerCode(newCode)}
                          showLanguageSelect={true}
                        />
                      </div>
                    )}
                  </div>
               </div>

               <div className="mt-10 pt-6 border-t border-gray-50 flex justify-between items-center">
                  <div className="flex gap-2">
                    <button onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))} disabled={currentQuestion === 0} className="h-11 px-4 rounded-xl bg-white border border-gray-100 text-gray-600 hover:bg-gray-50 transition-all flex items-center justify-center text-sm disabled:opacity-30">←</button>
                    {currentQuestion < questions.length - 1 ? (
                      <button onClick={() => setCurrentQuestion(prev => prev + 1)} className="bg-blue-600 text-white px-6 h-11 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-700 shadow-md shadow-blue-100 transition-all active:scale-95">Next</button>
                    ) : (
                      <button onClick={() => handleSubmitExam()} className="bg-green-600 text-white px-8 h-11 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-green-700 shadow-md shadow-green-100 transition-all active:scale-95">Finish Exam</button>
                    )}
                  </div>
               </div>
            </div>
         </div>

         <div className="col-span-1 flex flex-col gap-4 sticky top-24">
            <div className="bg-white p-6 rounded-[2rem] shadow-xl shadow-blue-900/5 border border-gray-100 flex flex-col gap-6">
               <div>
                  <div className="flex items-center justify-between mb-6">
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Navigator</h4>
                    <div className="bg-blue-50 text-blue-600 px-2.5 py-0.5 rounded-lg text-[9px] font-black">
                      {questions.length > 0 ? Math.round((answers.filter(a => a !== null && a !== undefined).length / questions.length) * 100) : 0}%
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-4 gap-2">
                    {questions.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentQuestion(i)}
                        className={`w-10 h-10 rounded-lg border-2 transition-all flex items-center justify-center text-xs font-black
                          ${currentQuestion === i 
                            ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-100 scale-105 z-10' 
                            : answers[i] !== undefined && answers[i] !== null 
                              ? 'bg-green-500 text-white border-green-500' 
                              : 'bg-gray-50 text-gray-300 border-gray-50 hover:bg-gray-100 hover:text-gray-400'
                          }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>
               </div>
               
               <div className="space-y-3 border-t border-gray-50 pt-5">
                  <div className="flex items-center justify-between">
                     <div className="flex items-center gap-2.5">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Answered</span>
                     </div>
                     <span className="text-xs font-black text-gray-800">{answers.filter(a => a !== null && a !== undefined).length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                     <div className="flex items-center gap-2.5">
                        <div className="w-2 h-2 rounded-lg border-2 border-blue-600"></div>
                        <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest">Active</span>
                     </div>
                     <span className="text-xs font-black text-blue-600">{currentQuestion + 1}</span>
                  </div>
               </div>
            </div>
         </div>
      </div>

      {showWarningModal && (
        <div className="fixed inset-0 z-[10000] bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
           <div className="bg-white p-10 rounded-[2.5rem] max-w-sm w-full text-center shadow-2xl border border-amber-50 animate-in fade-in zoom-in duration-300">
              <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <FontAwesomeIcon icon={faFlag} className="text-amber-500 text-2xl" />
              </div>
              <h3 className="text-xl font-black text-gray-900 mb-2 uppercase tracking-tight">Security Warning {warningCount}/3</h3>
              <p className="text-gray-500 font-medium mb-8 leading-relaxed italic">
                Reason: <span className="text-amber-600 font-bold">{warningMessage}</span>
              </p>
              <button onClick={handleCloseWarningModal} className="w-full py-4 bg-amber-500 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-amber-600 transition-all shadow-xl shadow-amber-100 active:scale-95">Resume Session</button>
           </div>
        </div>
      )}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default WeeklyExam;
