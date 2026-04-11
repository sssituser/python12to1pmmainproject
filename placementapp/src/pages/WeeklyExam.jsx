import {
  faCamera,
  faClock,
  faFlag,
  faArrowRight,
  faCircle,
  faCheck,
  faCode,
  faTerminal,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as faceapi from "@vladmandic/face-api";
import Editor from "@monaco-editor/react";
import axios from "axios";
import CodeCompiler from "../components/CodeCompiler";

// Indestructible global array to catch all streams outside React DOM scope
let globalStreamsToClean = [];

const WeeklyExam = () => {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const faceDetectionIntervalRef = useRef(null);
  const violationStartTimeRef = useRef(null);
  const cleanTimeoutRef = useRef(null);
  const lastWarningTimeRef = useRef(0);
  const [timeLeft, setTimeLeft] = useState(2700); 
  const [examDuration, setExamDuration] = useState(45); 
  const [examStarted, setExamStarted] = useState(false);
  const [examSubmitted, setExamSubmitted] = useState(false);
  const examSubmittedRef = useRef(false);
  const [webcamActive, setWebcamActive] = useState(false);
  const [webcamStatus, setWebcamStatus] = useState('idle'); 
  const [faceCount, setFaceCount] = useState(1);
  const [examFailed, setExamFailed] = useState(false);
  const [warningCount, setWarningCount] = useState(0);
  const [warningMessage, setWarningMessage] = useState("");
  const [showWarningModal, setShowWarningModal] = useState(false);

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

  const handleCloseWarningModal = async () => {
    setShowWarningModal(false);
    
    // Request fullscreen with comprehensive vendor prefix support
    const docEl = document.documentElement;
    if (!document.fullscreenElement && 
        !document.webkitFullscreenElement && 
        !document.mozFullScreenElement && 
        !document.msFullscreenElement) {
      
      try {
        if (docEl.requestFullscreen) {
          await docEl.requestFullscreen();
        } else if (docEl.webkitRequestFullscreen) {
          await docEl.webkitRequestFullscreen();
        } else if (docEl.mozRequestFullScreen) {
          await docEl.mozRequestFullScreen();
        } else if (docEl.msRequestFullscreen) {
          await docEl.msRequestFullscreen();
        }
      } catch (err) {
        console.error("Critical: Fullscreen restoration failed", err);
      }
    }
  };

  // Webcam functions - moved outside security monitoring scope
  const startWebcam = async () => {
    if (webcamStatus === 'active' || webcamStatus === 'loading') return;
    
    try {
      setWebcamStatus('loading');
      setWebcamActive(false);
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false 
      });
      
      setWebcamActive(true);
      setWebcamStatus('active');

      // Detect if user turns off camera via OS/hardware
      stream.getVideoTracks().forEach(track => {
        track.onended = () => {
          if (!examSubmittedRef.current) {
            setWebcamActive(false);
            setWebcamStatus('error');
            triggerWarning("Camera was turned off or disconnected. Please keep your camera active during the exam.");
          }
        };
      });

      globalStreamsToClean.push(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Webcam access denied:", err);
      setWebcamActive(false);
      setWebcamStatus('error');
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
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject;
      const tracks = stream.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setWebcamActive(false);
      setWebcamStatus('idle');
    }
    // Clean all potentially leaked streams
    globalStreamsToClean.forEach(stream => {
      try {
        stream.getTracks().forEach(track => track.stop());
      } catch (e) {}
    });
    globalStreamsToClean = [];
  };

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [markedForReview, setMarkedForReview] = useState([]);
  const [visitedQuestions, setVisitedQuestions] = useState([]);


  const [studentCourse, setStudentCourse] = useState("");
  const [questions, setQuestions] = useState([]);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(true);

  const [passingRule, setPassingRule] = useState("percentage"); 
  const [passingValue, setPassingValue] = useState(35); 

  const [codeAnswers, setCodeAnswers] = useState({}); 
  const [executing, setExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState('python');
  const [showConsole, setShowConsole] = useState(false);
  const [scratchpadCode, setScratchpadCode] = useState("");
  const [showCompiler, setShowCompiler] = useState(false);

  useEffect(() => {
    if (localStorage.getItem("examResult")) {
      navigate("/dashboard/playground-results", { replace: true });
      return;
    }
    const fetchQuestionsFromBackend = async () => {
        setIsLoadingQuestions(true);
        try {
          const userStr = localStorage.getItem("user");
          let course = "";
          try {
            const user = userStr && userStr !== "undefined" ? JSON.parse(userStr) : {};
            course = user.course || "";
            setStudentCourse(course);
          } catch (e) {}

          const customRes = await fetch(`/api/admin/exam-settings/?category=Weekly&course=${encodeURIComponent(course)}`);
          const customJson = await customRes.json();

          if (customJson.success && customJson.data && customJson.data.questions && Array.isArray(customJson.data.questions) && customJson.data.questions.length > 0) {
            const shuffleArray = (array) => {
              const shuffled = [...array];
              for (let i = shuffled.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
              }
              return shuffled;
            };

            const maxQ = customJson.data.maxQuestions || 50;
            const displayLimit = Math.min(customJson.data.questions.length, maxQ);
            const allShuffled = shuffleArray(customJson.data.questions);
            const weeklyQuestions = allShuffled.slice(0, displayLimit);

            const dur = customJson.data.duration || 45;
            setExamDuration(dur);
            setTimeLeft(dur * 60);

            const mappedQuestions = weeklyQuestions.map((q, idx) => ({
              ...q,
              id: idx + 1,
              marks: parseInt(q.marks) || 10,
              question: q.question,
              options: q.options || [],
              type: q.question_type || 'mcq',
              starter_code: q.starter_code || '',
              test_cases: q.test_cases || [],
              correct: q.options ? (q.options.indexOf(q.answer) !== -1 ? q.options.indexOf(q.answer) : 0) : 0
            }));
            setQuestions(mappedQuestions);
          } else {
            setQuestions([]);
          }
        } catch (err) {
          console.error("Failed to fetch questions:", err);
        } finally {
          setIsLoadingQuestions(false);
        }
      };
    
    fetchQuestionsFromBackend();
    
    if (!webcamActive) {
      startWebcam();
    }
  }, []);

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
    } else if (!examStarted && !examSubmitted) {
       // Allow going back to playground if not started yet
       const handleBrowserBack = () => navigate('/dashboard/playground');
       window.addEventListener('popstate', handleBrowserBack);
       return () => window.removeEventListener('popstate', handleBrowserBack);
    }
  }, [examStarted, examSubmitted, navigate]);

  useEffect(() => {
    if (examStarted && !examSubmitted && questions.length > 0) {
      const stateToSave = {
        questions, answers, markedForReview, visitedQuestions,
        timeLeft, currentQuestion, examStarted, examSubmitted, scratchpadCode
      };
      sessionStorage.setItem('weeklyExamState', JSON.stringify(stateToSave));
    }
  }, [answers, markedForReview, visitedQuestions, timeLeft, currentQuestion, examStarted, examSubmitted, questions, scratchpadCode]);

  useEffect(() => {
    if (examStarted && !examSubmitted && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
    if (timeLeft === 0 && !examSubmitted) handleSubmitExam();
  }, [timeLeft, examStarted, examSubmitted]);

  useEffect(() => {
    return () => stopWebcam();
  }, []);

  useEffect(() => {
    if (examStarted && !examSubmitted) {
      const preventRefresh = (e) => {
        if ((e.key === 'F5') || (e.ctrlKey && e.key === 'r') || (e.ctrlKey && e.shiftKey && e.key === 'r')) {
          e.preventDefault();
        }
      };
      const preventContextMenu = (e) => e.preventDefault();
      document.addEventListener('keydown', preventRefresh);
      document.addEventListener('contextmenu', preventContextMenu);
      return () => {
        document.removeEventListener('keydown', preventRefresh);
        document.removeEventListener('contextmenu', preventContextMenu);
      };
    }
  }, [examStarted, examSubmitted]);

  useEffect(() => {
    if (!examStarted || examSubmitted) return;
    const startSecurityMonitoring = () => {
      if (!videoRef.current || !canvasRef.current) return;
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });

      const detectFaces = async () => {
        if (!video.videoWidth || !video.videoHeight) return;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const tData = ctx.getImageData(0, 0, 16, 16).data;
        let brightness = 0;
        let max = 0, min = 255;
        for (let i = 0; i < tData.length; i += 4) {
          const val = tData[i]; brightness += val;
          if (val > max) max = val; if (val < min) min = val;
        }
        brightness = brightness / (tData.length / 4);
        const variation = max - min;
        
        const isDark = brightness < 20;
        const isFlat = variation < 20;

        const isTrackActive = globalStreamsToClean[0]?.getVideoTracks().every(t => t.enabled && t.readyState === 'live');
        if (!isTrackActive && webcamActive) {
           triggerWarning("Webcam feed lost or inactive");
        }

        const checkViolations = (faces) => {
          const noFace = !faces || faces.length === 0;
          const multipleFaces = faces && faces.length > 1;
          let faceNotCentered = false;
          if (faces && faces.length === 1) {
            const f = faces[0].boundingBox;
            const centerX = f.x + f.width / 2;
            const centerY = f.y + f.height / 2;
            if (centerX < canvas.width * 0.2 || centerX > canvas.width * 0.8 || centerY < canvas.height * 0.2 || centerY > canvas.height * 0.8) {
              faceNotCentered = true;
            }
          }
          const isCameraCovered = isDark || isFlat;
          if (isCameraCovered || noFace || multipleFaces || faceNotCentered) {
            if (!violationStartTimeRef.current) violationStartTimeRef.current = Date.now();
            else if (Date.now() - violationStartTimeRef.current > 3000) {
              if (multipleFaces) triggerWarning("Multiple persons detected");
              else if (isCameraCovered) triggerWarning("Camera covered or blocked");
              else if (noFace) triggerWarning("Face not detected");
              else if (faceNotCentered) triggerWarning("Face moved off-screen");
              violationStartTimeRef.current = null;
            }
          } else { violationStartTimeRef.current = null; }
        };

        if (window.FaceDetector) {
          const detector = new window.FaceDetector({ maxDetectedFaces: 2 });
          detector.detect(canvas).then(faces => { setFaceCount(faces.length); checkViolations(faces); }).catch(() => checkViolations(null));
        } else { checkViolations([{ boundingBox: { x: 100, y: 100, width: 100, height: 100 } }]); }
      };
      const interval = setInterval(detectFaces, 1000);
      return () => clearInterval(interval);
    };
    const c = startSecurityMonitoring();
    return () => c && c();
  }, [examStarted, examSubmitted, webcamActive]);

  const startExam = async () => {
    const qLen = questions.length || 50;
    setAnswers(new Array(qLen).fill(null));
    setMarkedForReview(new Array(qLen).fill(false));
    setVisitedQuestions(new Array(qLen).fill(false));
    setCurrentQuestion(0);
    setTimeLeft(examDuration * 60);
    setExamSubmitted(false);
    examSubmittedRef.current = false;
    try {
      if (document.documentElement.requestFullscreen) await document.documentElement.requestFullscreen();
    } catch (err) {}
    setExamStarted(true);
    window.history.pushState(null, null, window.location.href);
  };

  const handleAnswerSelect = (qIndex, optionIndex) => {
    const newAnswers = [...answers];
    newAnswers[qIndex] = optionIndex;
    setAnswers(newAnswers);
  };

  const toggleMarkForReview = (index) => {
    const updated = [...markedForReview];
    updated[index] = !updated[index];
    setMarkedForReview(updated);
  };

  const goToQuestion = (index) => {
    const visited = [...visitedQuestions];
    visited[index] = true;
    setVisitedQuestions(visited);
    setCurrentQuestion(index);
  };

  const handleSubmitExam = async () => {
    if (examSubmittedRef.current) return;
    setExamSubmitted(true);
    examSubmittedRef.current = true;
    stopWebcam();
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
    } catch (err) {}

    const totalPossibleMarks = questions.reduce((acc, q) => acc + (q.marks || 2), 0);
    const score = answers.reduce((acc, ans, idx) => acc + (ans === questions[idx]?.correct ? (questions[idx]?.marks || 2) : 0), 0);
    
    // Get professional name and ID from profile
    const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
    const profile = JSON.parse(localStorage.getItem("sssit-profile") || "{}");
    const studentName = profile.fullName || profile.name || storedUser.fullName || storedUser.firstName || "Student";
    const studentId = profile.studentId || profile.student_id || storedUser.student_id || "";

    const result = { 
      examTitle: `${studentCourse || 'Weekly'} Assessment`, 
      user: {
        username: storedUser.username || "",
        firstName: studentName,
        randomId: studentId
      },
      score, 
      total_marks: totalPossibleMarks,
      totalQuestions: questions.length, 
      correctAnswers: answers.filter((ans, idx) => ans === questions[idx]?.correct).length,
      examType: 'weekly',
      examDate: new Date().toISOString(), 
      passed: totalPossibleMarks > 0 ? (score / totalPossibleMarks) * 100 >= 35 : false,
      questions,
      answers
    };
    
    localStorage.setItem("examResult", JSON.stringify(result));

    // 🛡️ SERVER-SIDE PERSISTENCE (Single source of truth)
    const token = localStorage.getItem("access")?.replace(/^"|"$/g, "");
    if (token) {
      try {
        console.log("Saving weekly assessment report...");
        await axios.post(`http://${window.location.hostname}:8000/api/save-exam-report/`, result, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch (err) {
        console.error("Critical: Backend persistence failed for weekly report.", err);
      }
    }

    const allResults = JSON.parse(localStorage.getItem("allExamResults") || "[]");
    allResults.unshift(result);
    localStorage.setItem("allExamResults", JSON.stringify(allResults));
    window.dispatchEvent(new CustomEvent('examDataUpdated', { detail: { examType: 'weekly', result } }));
    navigate("/dashboard/playground-results", { replace: true });
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (!examStarted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl max-w-lg w-full text-center">
          <div className="relative w-64 h-48 mx-auto mb-8 rounded-[2rem] overflow-hidden bg-gray-900 shadow-xl border-4 border-white">
             {webcamStatus === 'active' ? (
                <video autoPlay playsInline muted style={{ transform: 'scaleX(-1)' }} className="w-full h-full object-cover" ref={videoRef} />
             ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-3">
                   <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Activating Camera...</p>
                </div>
             )}
          </div>
          <h2 className="text-3xl font-black mb-2 uppercase">{studentCourse || 'Weekly'} Assessment</h2>
          <p className="text-gray-500 font-bold mb-8 uppercase text-[10px] tracking-widest">
            {isLoadingQuestions ? "Preparing..." : `${questions.length} Questions • ${examDuration} Minutes`}
          </p>
          {webcamStatus === 'error' && <p className="mb-4 text-red-500 font-bold text-xs">Webcam Required</p>}
          <button
            onClick={startExam}
            disabled={isLoadingQuestions || questions.length === 0 || !webcamActive}
            className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-blue-700 shadow-xl transition-all disabled:opacity-50"
          >
            Start Assessment
          </button>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentQuestion];
  return (
    <div className="min-h-screen bg-gray-50 p-6 relative">
      <div className="fixed top-6 right-6 z-[9999] bg-white rounded-[2rem] shadow-2xl p-2.5 border border-gray-50 flex flex-col items-center">
        <div className="relative overflow-hidden rounded-[1.5rem] shadow-inner">
          <video ref={videoRef} autoPlay playsInline muted className="w-40 h-28 object-cover bg-gray-900" style={{ transform: 'scaleX(-1)' }} />
          <div className="absolute top-2 right-2">
            <div className={`w-2 h-2 rounded-full ${webcamActive ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}></div>
          </div>
        </div>
        <div className="flex items-center gap-1.5 py-2">
           <span className="text-[9px] font-black text-blue-900/60 uppercase tracking-widest">Recording Live</span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="bg-white/80 backdrop-blur-md px-6 py-4 rounded-3xl shadow-sm border border-gray-100 flex justify-between items-center mb-6">
           <div className="bg-blue-50 px-4 py-2 rounded-xl border border-blue-100">
              <span className="font-black text-blue-700 tabular-nums">{formatTime(timeLeft)}</span>
           </div>
           <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Weekly Assessment</span>
        </div>

        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 min-h-[400px]">
          <div className="flex items-center justify-between mb-8">
            <span className="bg-blue-600 text-white h-6 w-6 rounded-lg flex items-center justify-center text-[10px] font-black">{currentQuestion + 1}</span>
            <span className="text-[10px] font-black text-gray-400 uppercase">Marks: {currentQ?.marks || 2}</span>
          </div>

          <h3 className="text-xl font-bold text-gray-900 mb-8">{currentQ?.question}</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentQ?.options?.map((opt, i) => (
              <label 
                key={i} 
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer font-bold text-sm ${
                  answers[currentQuestion] === i ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-100' : 'bg-white border-gray-50 hover:bg-gray-50'
                }`}
              >
                <input type="radio" checked={answers[currentQuestion] === i} onChange={() => handleAnswerSelect(currentQuestion, i)} className="hidden" />
                {opt}
              </label>
            ))}
          </div>

          <div className="mt-20 border-t pt-8 flex justify-between items-center">
            <div className="flex gap-2">
              <button onClick={() => goToQuestion(currentQuestion - 1)} disabled={currentQuestion === 0} className="h-11 px-4 rounded-xl border border-gray-100 disabled:opacity-30">←</button>
              {currentQuestion < questions.length - 1 ? (
                <button onClick={() => goToQuestion(currentQuestion + 1)} className="bg-blue-600 text-white px-6 h-11 rounded-xl font-black text-[10px] uppercase">Next</button>
              ) : (
                <button onClick={handleSubmitExam} className="bg-green-600 text-white px-8 h-11 rounded-xl font-black text-[10px] uppercase">Finish</button>
              )}
            </div>
            <button onClick={() => toggleMarkForReview(currentQuestion)} className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase ${markedForReview[currentQuestion] ? 'bg-amber-100 text-amber-600' : 'bg-gray-50 text-gray-400'}`}>Review</button>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-10 gap-2">
          {questions.map((_, i) => (
            <button key={i} onClick={() => goToQuestion(i)} className={`h-10 rounded-lg border-2 text-[10px] font-black transition-all ${currentQuestion === i ? 'border-blue-600 bg-blue-600 text-white' : answers[i] !== null ? 'bg-green-500 border-green-500 text-white' : 'bg-white text-gray-300'}`}>{i + 1}</button>
          ))}
        </div>
      </div>

      {showWarningModal && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 text-center">
          <div className="bg-white rounded-3xl p-10 max-w-sm w-full shadow-2xl animate-in zoom-in duration-300">
            <h3 className="text-xl font-black text-gray-800 mb-2 uppercase">Security Warning {warningCount}/3</h3>
            <p className="text-gray-500 mb-8 italic">Reason: {warningMessage}</p>
            <button onClick={handleCloseWarningModal} className="w-full bg-amber-500 text-white py-4 rounded-2xl font-black uppercase">Resume Exam</button>
          </div>
        </div>
      ) }
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default WeeklyExam;
