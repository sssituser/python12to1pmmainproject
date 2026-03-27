import {
  faCamera,
  faClock
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

// Indestructible global array to catch all streams outside React DOM scope
let globalStreamsToClean = [];

const PythonExam = () => {

  const navigate = useNavigate();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(true);
  const [isAILoading, setIsAILoading] = useState(false);
  const [examStarted, setExamStarted] = useState(false);
  const [examSubmitted, setExamSubmitted] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [loadError, setLoadError] = useState(null);
  // Custom Passing Rules from Faculty
  const [passingRule, setPassingRule] = useState("percentage"); 
  const [passingValue, setPassingValue] = useState(50); // Default 50% for daily
  const [answers, setAnswers] = useState([]);
  const [markedForReview, setMarkedForReview] = useState([]);
  const [visitedQuestions, setVisitedQuestions] = useState([]);
  const [timeLeft, setTimeLeft] = useState(2700); // placeholder
  const [examDuration, setExamDuration] = useState(45); // default 45 min
  const [webcamActive, setWebcamActive] = useState(false);
  const [faceCount, setFaceCount] = useState(1);
  const [examFailed, setExamFailed] = useState(false);

  const examSubmittedRef = useRef(false);
  const violationStartTimeRef = useRef(null);
  const cleanTimeoutRef = useRef(0);
  const lastWarningTimeRef = useRef(0);
  const [warningCount, setWarningCount] = useState(0);
  const [warningMessage, setWarningMessage] = useState("");
  const [showWarningModal, setShowWarningModal] = useState(false);

  const triggerWarning = (reason) => {
    if (examSubmittedRef.current) return;
    const now = Date.now();
    // 3-second cooldown to prevent overlapping alerts for the same event
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
    // Request fullscreen as this is now a fresh user gesture (button click)
    if (document.documentElement.requestFullscreen && !document.fullscreenElement) {
      try {
        await document.documentElement.requestFullscreen();
      } catch (err) {
        console.error("Failed to restore fullscreen", err);
      }
    }
  };

  // Webcam functions - moved outside security monitoring scope
  const startWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 640 }, 
          height: { ideal: 480 } 
        },
        audio: false // Disable audio capture permanently
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setWebcamActive(true);
      }

      globalStreamsToClean.push(stream);
    } catch (err) {
      console.error("Webcam access denied:", err);
      setWebcamActive(false);
    }
  };

  const stopWebcam = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject;
      const tracks = stream.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setWebcamActive(false);
    }
    globalStreamsToClean.forEach(stream => {
      stream.getTracks().forEach(track => track.stop());
    });
    globalStreamsToClean = [];
  };

  // Fetch questions from backend
  useEffect(() => {
    // Always start fresh - don't restore previous exam state
    try {
      sessionStorage.removeItem('pythonExamState');
    } catch (e) {
      console.error("Failed to clear session storage:", e);
    }

    const fetchQuestions = async () => {
      try {
        setIsLoadingQuestions(true);
        const res = await fetch("http://127.0.0.1:8000/api/playground-questions/");
        const json = await res.json();
        const data = json.data || json;

        if (data && data.length > 0) {
          const mappedQuestions = data.map((q, idx) => ({
            ...q,
            id: idx + 1,
            marks: 2,
          }));
          setQuestions(mappedQuestions);
          setExamDuration(45);
          setTimeLeft(45 * 60);
          setPassingRule("percentage");
          setPassingValue(50);
          setLoadError(null);
        } else {
          setQuestions([]);
          setLoadError("No exam questions are available right now.");
        }
      } catch (err) {
        console.error("Failed to fetch practice questions:", err);
        setLoadError("Failed to load exam questions. Please try again.");
      } finally {
        setIsLoadingQuestions(false);
      }
    };
    fetchQuestions();
  }, []);

  // Prevent browser refresh and back button during exam
  useEffect(() => {
    if (examStarted && !examSubmitted) {
      // Prevent F5, Ctrl+R, Ctrl+Shift+R refresh
      const preventRefresh = (e) => {
  //  ESC → auto submit
  if (e.key === "Escape") {
    e.preventDefault();
    handleSubmitExam("ESC pressed");
    return;
  }

  if (
    e.key === "F5" ||
    (e.ctrlKey && e.key === "r") ||
    (e.ctrlKey && e.shiftKey && e.key === "r") ||
    ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key) ||
    (e.ctrlKey && e.key === "Tab") ||
    (e.ctrlKey && e.shiftKey && e.key === "Tab") ||
    (e.altKey && e.key === "ArrowLeft")
  ) {
    e.preventDefault();
    e.stopPropagation();
    return false;
  }
};

      // Prevent backspace from triggering navigation
      const preventBackspace = (e) => {
        if (e.key === 'Backspace' && !e.target.matches('input, textarea')) {
          e.preventDefault();
          e.stopPropagation();
          return false;
        }
      };

      // Prevent Alt+Left Arrow (back)
      const preventAltBack = (e) => {
        if (e.altKey && e.key === 'ArrowLeft') {
          e.preventDefault();
          e.stopPropagation();
          return false;
        }
      };

      // Prevent context menu (right-click refresh)
      const preventContextMenu = (e) => {
        e.preventDefault();
        e.stopPropagation();
        return false;
      };

      document.addEventListener('keydown', preventRefresh);
      document.addEventListener('keydown', preventBackspace);
      document.addEventListener('keydown', preventAltBack);
      document.addEventListener('contextmenu', preventContextMenu);

      return () => {
        document.removeEventListener('keydown', preventRefresh);
        document.removeEventListener('keydown', preventBackspace);
        document.removeEventListener('keydown', preventAltBack);
        document.removeEventListener('contextmenu', preventContextMenu);
      };
    }
  }, [examStarted, examSubmitted]);

  // Prevent back button
  useEffect(() => {
    if (examStarted && !examSubmitted) {
      window.history.pushState(null, null, window.location.href);
      const handlePopState = (e) => {
        e.preventDefault();
        window.history.pushState(null, null, window.location.href);
        return false;
      };
      window.addEventListener('popstate', handlePopState);
      return () => window.removeEventListener('popstate', handlePopState);
    }
  }, [examStarted, examSubmitted]);

// AI-powered security monitoring
useEffect(() => {
  if (!examStarted || examSubmitted) return;

  let cleanup = () => {};
  let violationCount = 0;
  const startSecurityMonitoring = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const detectFaces = async () => {
      if (!video.videoWidth || !video.videoHeight) return;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const tData = ctx.getImageData(0, 0, 16, 16).data;
      let brightness = 0;
      let max = 0, min = 255;
      for (let i = 0; i < tData.length; i += 4) {
        const val = tData[i];
        brightness += val;
        if (val > max) max = val;
        if (val < min) min = val;
      }
      brightness = brightness / (tData.length / 4);
      const variation = max - min;
      const isDark = brightness < 40;
      const isFlat = variation < 30;
      const checkViolations = (faces) => {
        const noFace = !faces || faces.length === 0;
        const multipleFaces = faces && faces.length > 1;
        let faceNotCentered = false;
        if (faces && faces.length === 1) {
          const f = faces[0].boundingBox;
          const centerX = f.x + f.width / 2;
          const centerY = f.y + f.height / 2;
          if (
            centerX < canvas.width * 0.2 ||
            centerX > canvas.width * 0.8 ||
            centerY < canvas.height * 0.2 ||
            centerY > canvas.height * 0.8
          ) {
            faceNotCentered = true;
          }
        }

        const violation =
          isDark || isFlat || noFace || multipleFaces || faceNotCentered;
        if (violation) {
          if (!violationStartTimeRef.current) {
            violationStartTimeRef.current = Date.now();
          } else if (Date.now() - violationStartTimeRef.current > 3000) {
            triggerWarning("Camera/face violation detected");
            violationStartTimeRef.current = null;
          }
        } else {
          violationStartTimeRef.current = null;
        }
      };

      if (window.FaceDetector) {
        const detector = new window.FaceDetector({ maxDetectedFaces: 5 });
        detector
          .detect(canvas)
          .then((faces) => {
            setFaceCount(faces.length);
            checkViolations(faces);
          })
          .catch(() => checkViolations(null));
      } else {
      checkViolations([{ boundingBox: { x: 100, y: 100, width: 100, height: 100 } }]);
      }
    };

    const interval = setInterval(detectFaces, 500);

    // TAB SWITCH
    const handleVisibility = () => {
      if (document.hidden && !examSubmittedRef.current) {
        triggerWarning("Tab switching detected");
      }
    };

    // ALT+TAB / MINIMIZE
    const handleBlur = () => {
      if (!document.hidden && !examSubmittedRef.current) {
        triggerWarning("Window focus lost");
      }
    };

    //  DEVTOOLS DETECTION
    const detectDevTools = () => {
      if (
        (window.outerWidth - window.innerWidth > 160 ||
        window.outerHeight - window.innerHeight > 160) && !examSubmittedRef.current
      ) {
        triggerWarning("Possible DevTools detected");
      }
    };

    // FULLSCREEN DETECTION
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && !examSubmittedRef.current && examStarted) {
        triggerWarning("Full screen exited");
      }
    };

    const devtoolsInterval = setInterval(detectDevTools, 1000);
    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("blur", handleBlur);
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    
    cleanup = () => {
      clearInterval(interval);
      clearInterval(devtoolsInterval);
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("blur", handleBlur);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  };
  startSecurityMonitoring();
  return () => {
    stopWebcam();
    cleanup();
  };
}, [examStarted, examSubmitted]);

// Detect reload / tab close
useEffect(() => {
  const handleBeforeUnload = (e) => {
    if (examStarted && !examSubmittedRef.current) {
      triggerWarning("Page reload attempt");
      e.preventDefault();
      e.returnValue = "";
      return "";
    }
  };
  window.addEventListener("beforeunload", handleBeforeUnload);
  return () => {
    window.removeEventListener("beforeunload", handleBeforeUnload);
  };
}, [examStarted, examSubmitted]);

  const playAlarmSound = () => {
    // Create a simple beep sound
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 800; // 800Hz beep sound
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  };

  const handleExamFailure = () => {
    setExamFailed(true);
    stopWebcam();
    playAlarmSound();
    sessionStorage.removeItem('pythonExamState');

    try {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      }
    } catch (err) { }

    // Store failure reason
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const failureResult = {
      status: "failed",
      reason: "Exam rules violated",
      faceCount: faceCount,
      user: {
        username: user.username || "Unknown",
        email: user.email || "",
        firstName: user.firstName || user.username,
        randomId: Math.floor(1000 + Math.random() * 9000)
      },
      examDate: new Date().toISOString(),
      examTitle: "Daily Exam"
    };

    localStorage.setItem("examFailure", JSON.stringify(failureResult));
    navigate("/dashboard/exam-failed");
  };

  const startExam = async () => {
    // Reset all exam state for fresh start
    const qLen = questions.length || 20;
    setAnswers(new Array(qLen).fill(null));
    setMarkedForReview(new Array(qLen).fill(false));
    setVisitedQuestions(new Array(qLen).fill(false));
    setCurrentQuestion(0);
    // TimeLeft is already set by fetchQuestionsFromBackend based on examDuration
    setExamSubmitted(false);
    if (questions.length === 0) {
      setLoadError("Cannot start exam because no questions are loaded.");
      return;
    }

    examSubmittedRef.current = false;
    
    // Clear any potential cached state
    try {
      sessionStorage.removeItem('pythonExamState');
      localStorage.removeItem('examResult');
    } catch (e) {}
    
    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      }
    } catch (err) {
      console.error("Error enabling fullscreen", err);
    }
    setExamStarted(true);
    startWebcam(); // Start webcam when exam begins
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

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      goToQuestion(currentQuestion + 1);
    }
  };

  const previousQuestion = () => {
    if (currentQuestion > 0) {
      goToQuestion(currentQuestion - 1);
    }
  };

  // SUBMIT EXAM
  const handleSubmitExam = async (reason = "Manual submission") => {
    if (examSubmittedRef.current) return;

    examSubmittedRef.current = true;
    setExamSubmitted(true);

    stopWebcam();
    sessionStorage.removeItem('pythonExamState');

    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      }
    } catch (err) { }

    const userStr = localStorage.getItem("user");
    let user = {};

    try {
      user = userStr && userStr !== "undefined" ? JSON.parse(userStr) : {};
    } catch (e) { }

    const randomId = Math.floor(1000 + Math.random() * 9000);
    const now = new Date().toISOString();

    let correctCount = 0;
    let earnedMarks = 0;
    let maxPossibleMarks = 0;

    answers.forEach((ans, index) => {
      const q = questions[index];
      if (!q) return;

      const qMarks = parseInt(q.marks) || 2;
      maxPossibleMarks += qMarks;

      if (ans === q.correct) {
        correctCount++;
        earnedMarks += qMarks;
      }
    });

    const totalQ = questions.length;
    const finalScore = earnedMarks;

    // Calculate passing status
    let passed = false;
    if (passingRule === "percentage") {
       const percent = maxPossibleMarks > 0 ? (earnedMarks / maxPossibleMarks) * 100 : 0;
       passed = percent >= passingValue;
    } else {
       passed = correctCount >= passingValue;
    }

    const result = {
      status: "completed",
      correctAnswers: correctCount,
      incorrectAnswers: totalQ - correctCount,
      totalQuestions: totalQ,
      score: finalScore,
      marks: finalScore,
      total_marks: maxPossibleMarks,
      passed: passed,
      time_taken: (examDuration * 60) - timeLeft,
      start_time: now,
      answers,
      questions,
      timeTaken: (examDuration * 60) - timeLeft,
      user: {
        username: user.username || "Unknown",
        email: user.email || "",
        firstName: user.firstName || user.username,
        randomId
      },
      examDate: new Date().toISOString(),
      examTitle: "Daily Exam",
      submissionReason: reason
    };

    try {
      await fetch("http://127.0.0.1:8000/api/save-exam-report/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(result)
      });
    } catch (err) {
      console.error("Backend error:", err);
    }

    const allResults = JSON.parse(localStorage.getItem("allExamResults") || "[]");
    allResults.unshift(result);

    localStorage.setItem("allExamResults", JSON.stringify(allResults));
    localStorage.setItem("examResult", JSON.stringify(result));

    // Clear session storage so a new start will shuffle fresh questions
    sessionStorage.removeItem('pythonExamState');

    navigate("/dashboard/playground-results", { replace: true });
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  if (!examStarted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">

        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center">
          {loadError && (
            <div className="mb-4 text-red-600 bg-red-100 p-3 rounded">
              {loadError}
            </div>
          )}

          <FontAwesomeIcon icon={faCamera} className="text-4xl text-indigo-600 mb-4" />

          <h2 className="text-2xl font-bold mb-2">
            Daily Exam
          </h2>

          <p className="text-gray-600 mb-6">
            20 Questions • 45 Minutes
          </p>

          <button
            onClick={startExam}
            disabled={isAILoading || isLoadingQuestions}
            className={`px-6 py-3 rounded-lg text-white font-semibold transition-all ${(isAILoading || isLoadingQuestions)
              ? 'bg-gray-400 cursor-not-allowed animate-pulse'
              : 'bg-indigo-600 hover:bg-indigo-700 shadow-md'
              }`}
          >
            {isLoadingQuestions ? 'Fetching Paper...' 
            : isAILoading ? 'Loading Security AI...' 
            : 'Start Exam'}
          </button>
        </div>

      </div>
    );
  }

  const questionData = questions[currentQuestion] || {};
  const questionOptions = questionData.options || [];

  const questionPanel = questions.length === 0 ? (
    <div className="col-span-4 bg-white p-6 rounded shadow text-center text-red-600">
      Unable to display exam questions. Please refresh and try again.
    </div>
  ) : (
    <div className="grid grid-cols-4 gap-4">
      <div className="col-span-3 bg-white p-6 rounded shadow">
        <h3 className="font-semibold mb-4">
          Q{currentQuestion + 1}: {questionData.question || "Question data unavailable"}
        </h3>
        {questionOptions.map((option, index) => (
          <label key={index} className="block border p-3 rounded mb-3 cursor-pointer">
            <input
              type="radio"
              name={`q-${currentQuestion}`}
              checked={answers[currentQuestion] === index}
              onChange={() => handleAnswerSelect(currentQuestion, index)}
              className="mr-2"
            />
            {option}
          </label>
        ))}

        <div className="flex justify-between mt-6">
          <button
            onClick={() => toggleMarkForReview(currentQuestion)}
            className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
          >
            Mark for Review
          </button>

          <div className="flex gap-2">
            {currentQuestion > 0 && (
              <button
                onClick={previousQuestion}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                Previous
              </button>
            )}
            {currentQuestion < questions.length - 1 ? (
              <button
                onClick={nextQuestion}
                className="bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700"
              >
                Next
              </button>
            ) : (
              <button
                onClick={() => handleSubmitExam("Manual submission")}
                className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
              >
                Submit Exam
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white p-4 rounded shadow">
        <h4 className="font-semibold mb-3">Questions</h4>
        <div className="grid grid-cols-5 gap-2">
          {questions.map((_, index) => {
            let buttonClass = "p-2 rounded text-sm font-semibold ";
            if (markedForReview[index]) {
              buttonClass += "bg-violet-500 text-white hover:bg-violet-600";
            } else if (answers[index] !== null) {
              buttonClass += "bg-green-500 text-white hover:bg-green-600";
            } else if (visitedQuestions[index]) {
              buttonClass += "bg-red-500 text-white hover:bg-red-600";
            } else {
              buttonClass += "bg-gray-200 text-gray-700 hover:bg-gray-300";
            }
            return (
              <button
                key={index}
                onClick={() => goToQuestion(index)}
                className={buttonClass}
              >
                {index + 1}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6 relative">

      {/* Settled Webcam overlay positioned at top-right */}
      <div className="fixed top-6 right-6 z-[9999] bg-white rounded-[2rem] shadow-2xl p-2.5 border border-gray-50 flex flex-col items-center">
        <div className="relative overflow-hidden rounded-[1.5rem] shadow-inner">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-40 h-28 object-cover bg-gray-900"
            style={{ transform: 'scaleX(-1)' }}
          />
          <canvas ref={canvasRef} style={{ display: "none" }} />
          {!webcamActive && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
              <FontAwesomeIcon icon={faCamera} className="text-gray-300 text-xl" />
            </div>
          )}
          <div className="absolute top-2 right-2">
            <div className={`w-2 h-2 rounded-full ${webcamActive ? 'bg-green-500 shadow-[0_0_8px_#22c55e]' : 'bg-red-500'} animate-pulse`}></div>
          </div>
        </div>
        <div className="flex items-center gap-1.5 py-2">
          <div className="w-2 h-2 rounded-full bg-indigo-100 flex items-center justify-center">
             <div className="w-1 h-1 rounded-full bg-indigo-500"></div>
          </div>
          <span className="text-[9px] font-black tracking-[0.1em] text-indigo-900/60 uppercase">
             Recording Live
          </span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto">

        {/* COMPACT STICKY HEADER */}
        <div className="bg-white/80 backdrop-blur-md px-6 py-4 rounded-[1.5rem] shadow-sm border border-gray-100 flex justify-between items-center mb-6 sticky top-0 z-40">
          <div className="flex items-center gap-4">
             <div className="bg-blue-50/50 px-4 py-2 rounded-xl flex items-center gap-2.5 border border-blue-100/50">
                <FontAwesomeIcon icon={faClock} className="text-blue-500 text-xs" />
                <span className="font-black text-blue-700 tabular-nums text-base">{formatTime(timeLeft)}</span>
             </div>
          </div>
        </div>
        {questionPanel}
        <div className="grid grid-cols-4 gap-4">
          <div className="col-span-3 space-y-6">
            <div className="bg-white p-6 rounded-[1.5rem] shadow-sm border border-gray-100 relative overflow-hidden">
               {/* Accent line */}
               <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 opacity-10"></div>
               
               <div className="flex items-center justify-between mb-8">
                  <span className="px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest bg-blue-50 text-blue-500 border border-blue-100">
                     Multiple Choice Question
                  </span>
                  <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">
                     Worth 2 Marks
                  </span>
               </div>

              <h3 className="text-xl font-bold text-gray-800 mb-8 whitespace-pre-wrap leading-relaxed">
                {questions[currentQuestion].question}
              </h3>

              <div className="grid gap-3">
                {questions[currentQuestion].options.map((option, index) => (
                  <label 
                    key={index} 
                    className={`flex items-center p-3 rounded-xl border-2 transition-all cursor-pointer group ${
                      answers[currentQuestion] === index 
                      ? 'bg-blue-50 border-blue-500 shadow-sm' 
                      : 'bg-white border-gray-100 hover:border-gray-300'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center transition-all ${
                       answers[currentQuestion] === index ? 'border-blue-500 bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.3)]' : 'border-gray-200'
                    }`}>
                       {answers[currentQuestion] === index && <div className="w-1.5 h-1.5 bg-white rounded-full"></div>}
                    </div>
                    <input
                      type="radio"
                      name={`q-${currentQuestion}`}
                      checked={answers[currentQuestion] === index}
                      onChange={() => handleAnswerSelect(currentQuestion, index)}
                      className="hidden"
                    />
                    <span className={`text-sm font-semibold tracking-tight ${answers[currentQuestion] === index ? 'text-blue-900' : 'text-gray-600'}`}>
                       {option}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex justify-between items-center bg-white p-4 rounded-[1.5rem] shadow-sm border border-gray-100 mt-6">
              <button
                onClick={() => toggleMarkForReview(currentQuestion)}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all ${
                  markedForReview[currentQuestion] 
                  ? 'bg-amber-100 text-amber-700 border border-amber-200' 
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                <FontAwesomeIcon icon={faFlag} className={markedForReview[currentQuestion] ? 'text-amber-500' : 'text-gray-400'} />
                {markedForReview[currentQuestion] ? 'Flagged' : 'Mark for Review'}
              </button>
              
              <div className="flex gap-3">
                {currentQuestion > 0 && (
                  <button
                    onClick={previousQuestion}
                    className="bg-white border border-gray-200 text-gray-700 px-6 py-2.5 rounded-xl font-bold hover:bg-gray-50 transition-all active:scale-95"
                  >
                    Previous
                  </button>
                )}
                {currentQuestion === questions.length - 1 ? (
                  <button
                    onClick={() => handleSubmitExam("Manual submission")}
                    className="bg-green-600 text-white px-8 py-2.5 rounded-xl font-bold hover:bg-green-700 transition-all shadow-lg shadow-green-100 active:scale-95"
                  >
                    Submit Exam
                  </button>
                ) : (
                  <button
                    onClick={nextQuestion}
                    className="bg-blue-600 text-white px-8 py-2.5 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 active:scale-95"
                  >
                    Next Question
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-[1.5rem] shadow-sm border border-gray-100">
            <h4 className="text-lg font-black text-gray-800 uppercase tracking-[0.1em] mb-8">
              Navigator
            </h4>

            <div className="grid grid-cols-4 gap-2.5">
              {questions.map((_, index) => {
                let statusColor = "bg-gray-50 text-gray-300 border-gray-100";
                
                if (currentQuestion === index) {
                  statusColor = "bg-white text-blue-600 border-blue-600 shadow-[0_0_10px_rgba(37,99,235,0.2)]";
                } else if (markedForReview[index]) {
                  statusColor = "bg-amber-500 text-white border-amber-500 shadow-md shadow-amber-100";
                } else if (answers[index] !== null) {
                  statusColor = "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-100";
                } else if (visitedQuestions[index]) {
                  statusColor = "bg-red-50 text-red-400 border-red-100";
                }

                return (
                  <button
                    key={index}
                    onClick={() => goToQuestion(index)}
                    className={`h-10 w-full rounded-xl text-xs font-black transition-all border-2 ${statusColor} hover:scale-105 active:scale-95`}
                  >
                    {index + 1}
                  </button>
                );
              })}
            </div>
            
            <div className="mt-8 pt-6 border-t border-gray-100 grid grid-cols-2 gap-y-4 gap-x-2">
               <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-600"></div>
                  <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Answered</span>
               </div>
               <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>
                  <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Flagged</span>
               </div>
               <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-100"></div>
                  <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Skipped</span>
               </div>
               <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded border-2 border-blue-600 bg-white"></div>
                  <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest">Current</span>
               </div>
            </div>
          </div>
        </div>
      </div>
      {/* PROCTORING WARNING MODAL */}
      {showWarningModal && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full text-center border border-amber-100 animate-in fade-in zoom-in duration-300">
            <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <FontAwesomeIcon icon={faFlag} className="text-amber-500 text-2xl" />
            </div>
            <h3 className="text-xl font-black text-gray-800 mb-2 uppercase tracking-tight">Security Warning {warningCount}/3</h3>
            <p className="text-gray-600 mb-8 leading-relaxed">
              Violation: <span className="font-bold text-amber-600">{warningMessage}</span>.
              <br/><br/>
              Your exam will be automatically submitted after 3 warnings. Please strictly follow exam rules.
            </p>
            <button
              onClick={handleCloseWarningModal}
              className="w-full bg-amber-500 text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-amber-600 transition-all shadow-lg shadow-amber-100 active:scale-95"
            >
              Resume
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PythonExam;
