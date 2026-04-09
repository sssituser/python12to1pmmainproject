import {
  faArrowLeft,
  faCamera,
  faClock,
  faFlag
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

// Indestructible global array to catch all streams outside React DOM scope
let globalStreamsToClean = [];

// 🛡️ 1000% DYNAMIC CURRICULUM OVERRIDE
let dynamicGlobalCourses = [];

const DailyExam = () => {
  const { subject } = useParams();
  const subjectKey = (subject || "python").toLowerCase();
  const isSectionedSubject = false;
  const subjectName = subject ? subject.charAt(0).toUpperCase() + subject.slice(1).replace(/_/g, " ") : "Assessment";
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(true);
  const [isAILoading, setIsAILoading] = useState(false);
  const [examStarted, setExamStarted] = useState(false);
  const [examSubmitted, setExamSubmitted] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  
  // Custom Rules
  const [passingRule, setPassingRule] = useState("percentage");
  const [passingValue, setPassingValue] = useState(50);
  const [answers, setAnswers] = useState([]);
  const [markedForReview, setMarkedForReview] = useState([]);
  const [visitedQuestions, setVisitedQuestions] = useState([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [examDuration, setExamDuration] = useState(0);
  const [webcamActive, setWebcamActive] = useState(false);
  const [webcamStatus, setWebcamStatus] = useState("idle");
  const [faceCount, setFaceCount] = useState(1);
  const [examFailed, setExamFailed] = useState(false);
  const [uiUnlockedSections, setUiUnlockedSections] = useState(10);
  const [uiCurrentSection, setUiCurrentSection] = useState(0);
  const [marksPerQuestion, setMarksPerQuestion] = useState(2);

  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const userRole = (storedUser.role || "").toLowerCase();
  const isStudent = userRole === "student";
  const [studentCourse, setStudentCourse] = useState((storedUser.course || "").trim());
  const [courseResolved, setCourseResolved] = useState(false);
  const [courseId, setCourseId] = useState(null);

  const examSubmittedRef = useRef(false);
  const lastWarningTimeRef = useRef(0);
  const [warningCount, setWarningCount] = useState(0);
  const [warningMessage, setWarningMessage] = useState("");
  const [showWarningModal, setShowWarningModal] = useState(false);

  // Sync Course
  useEffect(() => {
    const token = localStorage.getItem("access")?.replace(/^"|"$/g, "");
    if (!isStudent || !token) { setCourseResolved(true); return; }
    const sync = async () => {
       try {
         const res = await fetch("http://127.0.0.1:8000/api/profile/", { headers: { Authorization: `Bearer ${token}` } });
         if (res.ok) {
           const d = await res.json();
           setStudentCourse((d.course_title || d.course || "").trim());
           setCourseId(d.course || null);
         }
       } catch (e) {} finally { setCourseResolved(true); }
    };
    sync();
  }, [isStudent]);

  const triggerWarning = (reason) => {
    if (examSubmittedRef.current) return;
    const now = Date.now();
    if (now - lastWarningTimeRef.current < 3000) return;
    lastWarningTimeRef.current = now;
    const nextCount = warningCount + 1;
    if (nextCount > 3) { handleSubmitExam("Exam Terminated: Security Violation"); return; }
    setWarningMessage(reason);
    setShowWarningModal(true);
    setWarningCount(nextCount);
  };

  const startWebcam = async () => {
    if (webcamStatus === "active" || webcamStatus === "loading") return;
    try {
      setWebcamStatus("loading");
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) videoRef.current.srcObject = stream;
      setWebcamActive(true);
      setWebcamStatus("active");
      globalStreamsToClean.push(stream);
    } catch (e) { setWebcamStatus("error"); }
  };

  const stopWebcam = () => {
    globalStreamsToClean.forEach(s => s.getTracks().forEach(t => t.stop()));
    globalStreamsToClean = [];
    setWebcamActive(false);
  };

  // Fetch Logic
  useEffect(() => {
    if (!courseResolved) return;

    const restoreState = () => {
      try {
        const saved = sessionStorage.getItem('dailyExamState');
        if (saved) {
          const s = JSON.parse(saved);
          if (s.subjectKey === subjectKey) {
            setExamStarted(s.examStarted);
            setQuestions(s.questions);
            setAnswers(s.answers);
            setTimeLeft(s.timeLeft);
            setExamDuration(s.examDuration);
            setWarningCount(s.warningCount || 0);
            setCurrentQuestion(s.currentQuestion || 0);
            setMarksPerQuestion(s.marksPerQuestion || 2);
            setPassingRule(s.passingRule || 'percentage');
            setPassingValue(s.passingValue || 50);
            setIsLoadingQuestions(false);
            return true;
          }
        }
      } catch (e) {}
      return false;
    };

    if (restoreState()) return;

    const fetchQ = async () => {
      try {
        setIsLoadingQuestions(true);
        const tok = localStorage.getItem("access")?.replace(/^"|"$/g, "");
        const normCourse = (studentCourse || "").toUpperCase();
        
        let cnf = null;
        try {
          const r = await fetch(`http://127.0.0.1:8000/api/automated-exam-config/?course_name=${encodeURIComponent(normCourse)}`);
          if (r.ok) cnf = await r.json();
        } catch (e) {}

        // 🛡️ PERMANENT STRICTURE: 80 Minutes, 25 Questions, 2 Marks (FORCE RESET)
        const qLim = 25;
        const dur = 80;
        const weight = 2;

        setExamDuration(dur);
        setTimeLeft(dur * 60);
        setMarksPerQuestion(weight);
        setPassingRule(cnf?.passing_strategy || "percentage");
        setPassingValue(cnf?.requirement || 50);

        const slug = subjectKey.replace(/\s+/g, "_");
        let pool = [];
        try {
          const res = await fetch(`http://127.0.0.1:8000/api/playground-questions/${slug}/`);
          const d = await res.json();
          pool = d.data || d.questions || d || [];
        } catch (e) {}

        if (!Array.isArray(pool) || pool.length === 0) {
          try {
            const res = await fetch("http://127.0.0.1:8000/api/playground-questions/general_programming/");
            const d = await res.json();
            pool = d.data || d.questions || d || [];
          } catch (e) {}
        }

        if (Array.isArray(pool) && pool.length > 0) {
          const shuffled = pool.sort(() => 0.5 - Math.random()).slice(0, qLim);
          setQuestions(shuffled.map((q, i) => ({ ...q, id: i + 1, marks: weight, options: q.options || [], correct: q.correct ?? 0 })));
        } else {
          setQuestions(Array.from({ length: qLim }, (_, i) => ({
            id: i + 1,
            title: `Conceptual Assessment: ${subjectName}`,
            question: `Explain the fundamental architecture behind ${subjectName} and how it handles concurrency.`,
            options: ["Optimized Execution", "Linear Processing", "Distributed Management", "Atomic Transactions"],
            correct: 0,
            marks: weight
          })));
        }
      } catch (e) {} finally { setIsLoadingQuestions(false); }
    };
    fetchQ();
    startWebcam();
  }, [courseResolved, subjectKey, studentCourse]);

  // Timer Hook
  useEffect(() => {
    if (examStarted && !examSubmitted && timeLeft > 0) {
      const t = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(t);
    }
    if (timeLeft === 0 && examStarted && !examSubmitted) handleSubmitExam("Time Expired");
  }, [timeLeft, examStarted, examSubmitted]);

  // 🛡️ SECURITY WATCHDOG (Tab switching, Focus, Fullscreen)
  useEffect(() => {
    if (!examStarted || examSubmitted) return;
    const handleVisibility = () => { if (document.hidden) triggerWarning("Tab switching detected"); };
    const handleBlur = () => triggerWarning("Window focus lost");
    const handleFullscreen = () => { if (!document.fullscreenElement) triggerWarning("Full screen exited"); };

    window.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("blur", handleBlur);
    document.addEventListener("fullscreenchange", handleFullscreen);

    return () => {
      window.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("blur", handleBlur);
      document.removeEventListener("fullscreenchange", handleFullscreen);
    };
  }, [examStarted, examSubmitted]);

  // Submit Hook
  const handleSubmitExam = async (reason = "Manual") => {
    if (examSubmittedRef.current) return;
    examSubmittedRef.current = true;
    setExamSubmitted(true);
    stopWebcam();
    sessionStorage.removeItem("dailyExamState");

    let score = 0;
    answers.forEach((ans, idx) => {
      const q = questions[idx];
      if (q && String(ans) === String(q.correct)) score += marksPerQuestion;
    });

    const result = {
      examTitle: `${subjectName} Exam`,
      score,
      totalQuestions: questions.length,
      correctAnswers: Math.round(score / marksPerQuestion),
      passed: (score / (questions.length * marksPerQuestion)) * 100 >= passingValue,
      timeTaken: (examDuration * 60) - timeLeft,
      examDate: new Date().toISOString(),
      questions,
      answers
    };

    localStorage.setItem("examResult", JSON.stringify(result));
    navigate("/dashboard/playground-results", { replace: true });
  };

  const goToQ = (i) => { if (i >= 0 && i < questions.length) setCurrentQuestion(i); };

  if (!examStarted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-center relative">
        <div className="absolute top-8 left-8 z-50">
          <button
            onClick={() => navigate("/dashboard/daily-exam")}
            className="flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-blue-600 transition-all bg-white px-5 py-2.5 rounded-2xl shadow-sm border border-gray-100 group"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="group-hover:-translate-x-1 transition-transform" />
            Back to Topics
          </button>
        </div>

        <div className="bg-white p-12 rounded-[3rem] shadow-2xl max-w-lg w-full">
           <div className="w-64 h-48 mx-auto mb-8 bg-black rounded-3xl overflow-hidden shadow-inner">
              {webcamActive ? <video autoPlay playsInline muted className="w-full h-full object-cover" ref={el => { if(el) el.srcObject = globalStreamsToClean[0] }} /> : <div className="h-full flex items-center justify-center text-white text-[10px] font-black uppercase tracking-widest">Activating Secure Feed...</div>}
           </div>
           <h2 className="text-3xl font-black mb-2 uppercase">{subjectName}</h2>
           <p className="text-gray-500 font-bold mb-8 uppercase text-[10px] tracking-widest">
              {isLoadingQuestions ? "Fetching Configuration..." : `${questions.length} Questions • ${examDuration} Minutes • 2 Marks`}
           </p>
           <button onClick={() => setExamStarted(true)} disabled={isLoadingQuestions || !webcamActive} className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all">Start Assessment</button>
        </div>
      </div>
    );
  }

  const activeQ = questions[currentQuestion];
  return (
    <div className="min-h-screen bg-gray-50 p-6 flex flex-col gap-6">
      <div className="max-w-4xl mx-auto w-full bg-white p-6 rounded-2xl shadow-sm flex justify-between items-center border border-gray-100 relative">
         <div className="bg-blue-50 px-6 py-2 rounded-xl text-blue-700 font-black tabular-nums">TIME LEFT: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</div>
         
         {/* Live Proctoring Overlay */}
         <div className="absolute -top-4 -right-4 w-32 h-24 bg-black rounded-2xl overflow-hidden shadow-2xl border-4 border-white rotate-3">
            <video autoPlay playsInline muted style={{ transform: 'scaleX(-1)' }} className="w-full h-full object-cover" ref={el => { if(el && globalStreamsToClean[0]) el.srcObject = globalStreamsToClean[0] }} />
         </div>

         <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mr-32">{subjectName} Exam Session</div>
      </div>

      <div className="max-w-4xl mx-auto w-full grid grid-cols-1 md:grid-cols-4 gap-6">
         <div className="md:col-span-3 bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100 min-h-[500px] flex flex-col">
            <div className="mb-10">
               <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest block mb-4">Question {currentQuestion + 1} of {questions.length}</span>
               <h3 className="text-xl font-bold text-gray-900 leading-snug">{activeQ?.question}</h3>
            </div>
            <div className="grid grid-cols-1 gap-4 flex-1">
               {(activeQ?.options || []).map((opt, i) => (
                 <button key={i} onClick={() => { const a = [...answers]; a[currentQuestion] = i; setAnswers(a); }} className={`p-5 rounded-2xl border-2 text-left font-bold transition-all ${answers[currentQuestion] === i ? 'bg-blue-600 border-blue-600 text-white shadow-lg' : 'bg-white border-gray-50 hover:bg-gray-100'}`}>{opt}</button>
               ))}
            </div>
            <div className="flex justify-between mt-12 gap-4">
               <button onClick={() => goToQ(currentQuestion - 1)} disabled={currentQuestion === 0} className="px-8 py-3 bg-gray-100 rounded-xl font-bold disabled:opacity-30">PREVIOUS</button>
               {currentQuestion < questions.length - 1 ? <button onClick={() => goToQ(currentQuestion + 1)} className="px-10 py-3 bg-blue-600 text-white rounded-xl font-black uppercase tracking-widest">NEXT</button> : <button onClick={() => handleSubmitExam()} className="px-12 py-3 bg-green-600 text-white rounded-xl font-black uppercase tracking-widest">FINISH EXAM</button>}
            </div>
         </div>

         <aside className="md:col-span-1 bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100">
            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6 border-b pb-4">Navigator</h4>
            <div className="grid grid-cols-4 gap-2">
               {questions.map((_, i) => (
                 <button key={i} onClick={() => goToQ(i)} className={`h-10 rounded-xl text-xs font-black transition-all ${currentQuestion === i ? 'bg-blue-600 text-white scale-110 shadow-lg' : answers[i] !== undefined ? 'bg-green-500 text-white' : 'bg-gray-50 text-gray-400'}`}>{i + 1}</button>
               ))}
            </div>
         </aside>
      </div>

      {showWarningModal && (
        <div className="fixed inset-0 z-[9999] bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
           <div className="bg-white p-10 rounded-[2.5rem] max-w-sm w-full text-center shadow-2xl">
              <h3 className="text-xl font-black text-gray-900 mb-2 uppercase">Security Alert</h3>
              <p className="text-gray-500 font-medium mb-8 leading-relaxed italic">Reason: {warningMessage}</p>
              <button onClick={() => setShowWarningModal(false)} className="w-full py-4 bg-amber-500 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-amber-600 transition-all shadow-xl shadow-amber-100">Resume Session</button>
           </div>
        </div>
      )}
    </div>
  );
};

export default DailyExam;
