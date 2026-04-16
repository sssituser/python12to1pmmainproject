import {
  faArrowLeft,
  faTerminal,
  faClock,
  faFlag
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import CodeCompiler from "../components/CodeCompiler";

// Indestructible global array to catch all streams outside React DOM scope
let globalStreamsToClean = [];

const DailyExam = () => {
  const { subject } = useParams();
  const subjectKey = (subject || "python").toLowerCase();
  const subjectName = subject ? subject.charAt(0).toUpperCase() + subject.slice(1).replace(/_/g, " ") : "Assessment";
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const faceDetectionIntervalRef = useRef(null);
  const violationStartTimeRef = useRef(null);
  const cleanTimeoutRef = useRef(null);
  const lastWarningTimeRef = useRef(0);
  const examSubmittedRef = useRef(false);

  const [isLoadingQuestions, setIsLoadingQuestions] = useState(true);
  const [examStarted, setExamStarted] = useState(false);
  const [examSubmitted, setExamSubmitted] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  
  const [passingRule, setPassingRule] = useState("percentage");
  const [passingValue, setPassingValue] = useState(50);
  const [answers, setAnswers] = useState([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [examDuration, setExamDuration] = useState(0);
  const [webcamActive, setWebcamActive] = useState(false);
  const [webcamStatus, setWebcamStatus] = useState("idle");
  const [marksPerQuestion, setMarksPerQuestion] = useState(2);
  const [compilerCode, setCompilerCode] = useState("");
  const [showCompiler, setShowCompiler] = useState(false);

  let storedUser = {};
  try {
    const userStr = localStorage.getItem("user");
    storedUser = userStr && userStr !== "undefined" ? JSON.parse(userStr) : {};
  } catch (e) { storedUser = {}; }
  
  const isStudent = (storedUser.role || "").toLowerCase() === "student";
  const [studentCourse, setStudentCourse] = useState((storedUser.course || "").trim());
  const [courseResolved, setCourseResolved] = useState(false);

  const [warningCount, setWarningCount] = useState(0);
  const [warningMessage, setWarningMessage] = useState("");
  const [showWarningModal, setShowWarningModal] = useState(false);

  // Sync Course
  useEffect(() => {
    const token = localStorage.getItem("access")?.replace(/^"|"$/g, "");
    if (!isStudent || !token) { setCourseResolved(true); return; }
    const sync = async () => {
       try {
         const res = await fetch(`http://${window.location.hostname}:8000/api/profile/`, { 
           headers: { Authorization: `Bearer ${token}` } 
         });
         if (res.ok) {
           const d = await res.json();
           setStudentCourse((d.course_title || d.course || "").trim());
         }
       } catch (e) {} finally { setCourseResolved(true); }
    };
    sync();
  }, [isStudent]);

  const triggerWarning = (reason) => {
    if (examSubmittedRef.current) return;
    const now = Date.now();
    // 3-second cooldown to prevent overlapping alerts
    if (now - lastWarningTimeRef.current < 3000) return;
    lastWarningTimeRef.current = now;

    setWarningCount(prev => {
      const next = prev + 1;
      if (next >= 4) {
        handleSubmitExam(`Exam terminated: ${reason}`);
        setShowWarningModal(false);
        return next;
      }
      setWarningMessage(reason);
      setShowWarningModal(true);
      return next;
    });
  };

  const startWebcam = async () => {
    if (webcamStatus === "active" || webcamStatus === "loading") return;
    try {
      setWebcamStatus("loading");
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: { ideal: 640 }, height: { ideal: 480 } } 
      });
      
      setWebcamActive(true);
      setWebcamStatus("active");
      globalStreamsToClean.push(stream);

      // Detect if user turns off camera via OS/hardware
      stream.getVideoTracks().forEach(track => {
        track.onended = () => {
          if (!examSubmittedRef.current) {
            setWebcamActive(false);
            setWebcamStatus("error");
            triggerWarning("Webcam disconnected or disabled.");
          }
        };
      });

      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (e) { 
      console.error("Webcam Error:", e);
      setWebcamStatus("error"); 
      setWebcamActive(false);
    }
  };

  // Sync webcam stream to video element whenever it mounts/remounts
  useEffect(() => {
    if (videoRef.current && globalStreamsToClean.length > 0) {
      const liveStream = globalStreamsToClean[globalStreamsToClean.length - 1];
      if (videoRef.current.srcObject !== liveStream) {
        videoRef.current.srcObject = liveStream;
      }
    }
  }, [examStarted, webcamActive, webcamStatus]);

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
        const saved = localStorage.getItem('dailyExamState');
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
            setCompilerCode(s.compilerCode || "");
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
        const normCourse = (studentCourse || "").toUpperCase();
        
        let cnf = null;
        try {
          const r = await fetch(`http://${window.location.hostname}:8000/api/automated-exam-config/?course_name=${encodeURIComponent(normCourse)}`);
          if (r.ok) cnf = await r.json();
        } catch (e) {}

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
          const res = await fetch(`http://${window.location.hostname}:8000/api/playground-questions/${slug}/`);
          const d = await res.json();
          pool = d.data || d.questions || d || [];
        } catch (e) {}

        if (!Array.isArray(pool) || pool.length === 0) {
          try {
            const res = await fetch(`http://${window.location.hostname}:8000/api/playground-questions/general_programming/`);
            const d = await res.json();
            pool = d.data || d.questions || d || [];
          } catch (e) {}
        }

        if (Array.isArray(pool) && pool.length > 0) {
          const shuffleArray = (array) => {
            const shuffled = [...array];
            for (let i = shuffled.length - 1; i > 0; i--) {
              const j = Math.floor(Math.random() * (i + 1));
              [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
            }
            return shuffled;
          };

          const shuffled = shuffleArray(pool).slice(0, qLim);
          setQuestions(shuffled.map((q, i) => {
            const opts = q.options || [];
            const shuffledOptions = shuffleArray(opts);
            return {
              ...q,
              id: i + 1,
              marks: weight,
              options: shuffledOptions,
              correct: shuffledOptions.indexOf(q.answer) !== -1 ? shuffledOptions.indexOf(q.answer) : (q.correct ?? 0)
            };
          }));
        } else {
          setQuestions(Array.from({ length: qLim }, (_, i) => ({
            id: i + 1,
            title: `Assessment: ${subjectName}`,
            question: `Explain core concepts of ${subjectName} in depth.`,
            options: ["Option A", "Option B", "Option C", "Option D"],
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

  // Advanced Security Monitoring
  useEffect(() => {
    if (!examStarted || examSubmitted) return;

    let cleanup = () => {};
    const startSecurityMonitoring = () => {
      if (!videoRef.current) return;
      const video = videoRef.current;

      const prevFrameRef = { data: null };

      faceDetectionIntervalRef.current = setInterval(() => {
        if (!video.videoWidth || !video.videoHeight) return;
        
        const canvas = document.createElement("canvas");
        canvas.width = 16;
        canvas.height = 16;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        ctx.drawImage(video, 0, 0, 16, 16);
        const tData = ctx.getImageData(0, 0, 16, 16).data;
        
        let brightness = 0;
        let rMax = 0, rMin = 255;
        let topVariance = 0, botVariance = 0;
        let motionDelta = 0;

        for (let i = 0; i < tData.length; i += 4) {
          const r = tData[i], g = tData[i+1], b = tData[i+2];
          const luma = (0.299 * r + 0.587 * g + 0.114 * b);
          brightness += luma;
          if (r > rMax) rMax = r; if (r < rMin) rMin = r;
          
          if (prevFrameRef.data) {
            motionDelta += Math.abs(luma - prevFrameRef.data[i/4]);
          }

          if (i < tData.length / 2) topVariance += luma;
          else botVariance += luma;
        }
        brightness = brightness / 256;
        
        const isDark = brightness < 15; 
        const isFlat = (rMax - rMin < 15);
        const isStatic = prevFrameRef.data && (motionDelta < 30);
        const topAvg = topVariance / 128;
        const botAvg = botVariance / 128;
        const misalignment = Math.abs(topAvg - botAvg) > 95;

        prevFrameRef.data = Array.from(tData).filter((_, i) => i % 4 === 0);

        const checkViolations = (faces) => {
          const noFace = !faces || faces.length === 0;
          const isMultipleFaces = faces && faces.length > 1;
          let faceNotCentered = false;
          
          if (faces && faces.length === 1) {
            const f = faces[0].boundingBox;
            const centerX = f.x + f.width / 2;
            const centerY = f.y + f.height / 2;
            if (centerX < video.videoWidth * 0.15 || centerX > video.videoWidth * 0.85 ||
                centerY < video.videoHeight * 0.15 || centerY > video.videoHeight * 0.85) {
              faceNotCentered = true;
            }
          }

          const proctoringAIFailed = !window.FaceDetector;
          const userHiding = proctoringAIFailed && misalignment;

          if (isDark || isFlat || isMultipleFaces || noFace || faceNotCentered || userHiding || (isStatic && proctoringAIFailed)) {
            if (!violationStartTimeRef.current) {
              violationStartTimeRef.current = Date.now();
            } else if (Date.now() - violationStartTimeRef.current >= 7000) {
              if (isMultipleFaces) triggerWarning("Multiple persons detected");
              else if (isDark) triggerWarning("Environment too dark - Please turn on lights");
              else if (isFlat) triggerWarning("Camera covered or blocked");
              else if (userHiding) triggerWarning("Face not visible - Adjust your position");
              else if (isStatic) triggerWarning("Static background detected - Please move");
              else if (noFace && !proctoringAIFailed) triggerWarning("Face not visible in camera"); 
              else if (faceNotCentered) triggerWarning("Face moved off-center");
              violationStartTimeRef.current = null;
            }
          } else {
            violationStartTimeRef.current = null;
          }
        };

        if (window.FaceDetector) {
          const faceDetector = new window.FaceDetector({ maxDetectedFaces: 2 });
          faceDetector.detect(video).then(checkViolations).catch(() => checkViolations(null));
        } else {
          // Fallback heuristic: if it's very dark or the feed is flat, it's a violation
          checkViolations([]); 
        }
      }, 1000);

      const handleVisibilityChange = () => { if (document.hidden) triggerWarning("Tab switching detected"); };
      const handleBlur = () => { if (!document.hidden) triggerWarning("Window focus lost"); };
      const handleFullscreenChange = () => { if (!document.fullscreenElement && examStarted) triggerWarning("Full screen exited"); };
      const preventAction = (e) => { e.preventDefault(); triggerWarning("Restricted interaction (Copy/Paste/Right-click)"); };

      document.addEventListener("visibilitychange", handleVisibilityChange);
      window.addEventListener("blur", handleBlur);
      document.addEventListener("fullscreenchange", handleFullscreenChange);
      document.addEventListener("contextmenu", preventAction);
      document.addEventListener("copy", preventAction);
      document.addEventListener("paste", preventAction);

      cleanup = () => {
        clearInterval(faceDetectionIntervalRef.current);
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
  }, [examStarted, examSubmitted, webcamActive]);

  // State Persistence
  useEffect(() => {
    if (examStarted && !examSubmitted) {
      const state = {
        examStarted, questions, answers, timeLeft, examDuration,
        warningCount, currentQuestion, subjectKey,
        marksPerQuestion, passingRule, passingValue, compilerCode
      };
      localStorage.setItem('dailyExamState', JSON.stringify(state));
    }
  }, [examStarted, questions, answers, timeLeft, currentQuestion, warningCount, compilerCode, subjectKey, examDuration, marksPerQuestion, passingRule, passingValue]);

  // 🔐 SECURITY: Block Back, Forward, and Refresh
  useEffect(() => {
    if (examStarted && !examSubmitted) {
      // 1. Block BACK/FORWARD navigation
      const blockNavigation = () => {
        window.history.pushState(null, "", window.location.href);
      };
      
      window.history.pushState(null, "", window.location.href);
      window.addEventListener("popstate", blockNavigation);

      // 2. Block REFRESH / CLOSE
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

    try {
      if (document.fullscreenElement) {
        if (document.exitFullscreen) await document.exitFullscreen();
        else if (document.webkitExitFullscreen) await document.webkitExitFullscreen();
        else if (document.msExitFullscreen) await document.msExitFullscreen();
      }
    } catch (e) {}

    localStorage.removeItem("dailyExamState");

    let score = 0;
    answers.forEach((ans, idx) => {
      const q = questions[idx];
      if (q && String(ans) === String(q.correct)) score += marksPerQuestion;
    });

    const result = {
      examTitle: `${studentCourse || "General"} | ${subjectName} Assessment`,
      examType: 'daily',
      course: studentCourse || "General",
      user: {
        username: storedUser.username || "",
        studentId: (JSON.parse(localStorage.getItem("sssit-profile") || "{}")).studentId || storedUser.studentId || storedUser.username || "",
        fullName: (JSON.parse(localStorage.getItem("sssit-profile") || "{}")).fullName || storedUser.fullName || storedUser.firstName || "Student"
      },
      score,
      total_marks: questions.length * marksPerQuestion,
      totalQuestions: questions.length,
      correctAnswers: Math.round(score / marksPerQuestion),
      passed: (score / (questions.length * marksPerQuestion)) * 100 >= passingValue,
      timeTaken: (examDuration * 60) - timeLeft,
      examDate: new Date().toISOString(),
      questions,
      answers
    };

    localStorage.setItem("examResult", JSON.stringify(result));
    
    // 🛡️ PERMANENT PERSISTENCE: Save to server database
    const token = localStorage.getItem("access")?.replace(/^"|"$/g, "");
    if (token) {
      try {
        console.log("🚀 Saving daily exam report to server...");
        await axios.post(`http://${window.location.hostname}:8000/api/save-exam-report/`, result, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log("✅ Report saved successfully");
      } catch (err) {
        console.error("❌ Failed to persist to server", err);
      }
    }
    
    // Maintain history in allExamResults
    const allResults = JSON.parse(localStorage.getItem("allExamResults") || "[]");
    allResults.unshift(result);
    localStorage.setItem("allExamResults", JSON.stringify(allResults));

    // Trigger automatic update event for other components
    window.dispatchEvent(new CustomEvent('examDataUpdated', { 
      detail: { examType: 'daily', result: result } 
    }));

    navigate("/dashboard/playground-results", { replace: true });
  };

  const handleStartExam = async () => {
    try {
      const docEl = document.documentElement;
      if (docEl.requestFullscreen) await docEl.requestFullscreen();
      else if (docEl.webkitRequestFullscreen) await docEl.webkitRequestFullscreen();
      else if (docEl.msRequestFullscreen) await docEl.msRequestFullscreen();
    } catch (err) {}
    setExamStarted(true);
  };

  const handleCloseWarningModal = async () => {
    setShowWarningModal(false);
    if (!document.fullscreenElement) {
      try {
        const docEl = document.documentElement;
        if (docEl.requestFullscreen) await docEl.requestFullscreen();
      } catch (e) {}
    }
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
          <button onClick={() => navigate("/dashboard/daily-exam")} className="flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-blue-600 transition-all bg-white px-5 py-2.5 rounded-2xl shadow-sm border border-gray-100 group">
            <FontAwesomeIcon icon={faArrowLeft} className="group-hover:-translate-x-1 transition-transform" />
            Back to Topics
          </button>
        </div>
        <div className="bg-white p-12 rounded-[3rem] shadow-2xl max-w-lg w-full">
           <div className="w-64 h-48 mx-auto mb-8 bg-black rounded-3xl overflow-hidden shadow-inner relative group">
              {webcamActive ? (
                <video 
                  ref={videoRef}
                  autoPlay 
                  playsInline 
                  muted 
                  className="w-full h-full object-cover" 
                />
              ) : (
                <div className="h-full flex items-center justify-center text-white text-[10px] font-black uppercase tracking-widest">Activating Secure Feed...</div>
              )}
              <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/20">
                 <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                 <span className="text-[8px] font-black text-white uppercase tracking-widest">Preview</span>
              </div>
           </div>
           
           <h2 className="text-3xl font-black mb-2 uppercase">{subjectName}</h2>
           <p className="text-gray-500 font-bold mb-8 uppercase text-[10px] tracking-widest">
              {isLoadingQuestions ? "Fetching Configuration..." : `${questions.length} Questions • ${examDuration} Minutes`}
           </p>

           {webcamStatus === "error" && (
             <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-xs font-bold uppercase tracking-wider leading-relaxed">
               Camera Access Error: Ensure your webcam is connected and allowed in browser settings.
             </div>
           )}

           <button 
            onClick={handleStartExam} 
            disabled={isLoadingQuestions || !webcamActive || webcamStatus === "error"} 
            className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:grayscale disabled:scale-100"
           >
             {webcamStatus === "error" ? "Webcam Required" : "Start Assessment"}
           </button>
        </div>
      </div>
    );
  }

  const activeQ = questions[currentQuestion];
  return (
    <div className="min-h-screen bg-gray-50 p-6 flex flex-col gap-6 relative">
      <div className="fixed top-6 right-6 z-[9999] bg-white rounded-[2rem] shadow-2xl p-2.5 border border-gray-50 flex flex-col items-center">
        <div className="relative overflow-hidden rounded-[1.5rem] shadow-inner">
          <video 
            ref={videoRef}
            autoPlay 
            playsInline 
            muted 
            style={{ transform: 'scaleX(-1)' }} 
            className="w-40 h-28 object-cover bg-gray-900" 
          />
          <div className="absolute top-2 right-2">
            <div className={`w-2 h-2 rounded-full ${webcamActive ? 'bg-green-500' : 'bg-red-500'} animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]`}></div>
          </div>
        </div>
        <div className="flex items-center gap-1.5 py-2">
          <div className="w-2 h-2 rounded-full bg-blue-100 flex items-center justify-center"><div className="w-1 h-1 rounded-full bg-blue-500"></div></div>
          <span className="text-[9px] font-black tracking-widest text-blue-900/60 uppercase">Recording Live</span>
        </div>
      </div>

      <div className="max-w-5xl mx-auto w-full bg-white/80 backdrop-blur-md px-6 py-4 rounded-[1.5rem] shadow-sm flex justify-between items-center border border-gray-100 sticky top-0 z-40">
         <div className="flex items-center gap-4">
            <div className="bg-blue-50/50 px-4 py-2 rounded-xl flex items-center gap-2.5 border border-blue-100/50">
               <FontAwesomeIcon icon={faClock} className="text-blue-500 text-xs" />
               <span className="font-black text-blue-700 tabular-nums text-base">{formatTime(timeLeft)}</span>
            </div>
         </div>
         <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
            <span className="text-blue-600">Daily</span> Assessment
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
                     Daily Assessment
                   </span>
                 </div>
                 <div className="px-3 py-1 bg-gray-50 rounded-xl border border-gray-100">
                   <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest mr-2">Marks:</span>
                   <span className="text-[10px] font-black text-gray-800">{marksPerQuestion || 2}</span>
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
                          language={subjectKey || studentCourse} 
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
                      <button onClick={handleSubmitExam} className="bg-green-600 text-white px-8 h-11 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-green-700 shadow-md shadow-green-100 transition-all active:scale-95">Finish Exam</button>
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
                      {Math.round((answers.filter(a => a !== null && a !== undefined).length / questions.length) * 100)}%
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
        <div className="fixed inset-0 z-[9999] bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
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

export default DailyExam;
