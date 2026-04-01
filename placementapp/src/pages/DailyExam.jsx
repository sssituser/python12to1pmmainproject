import {
  faCamera,
  faClock,
  faFlag
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

// Indestructible global array to catch all streams outside React DOM scope
let globalStreamsToClean = [];

const DailyExam = () => {

  const { subject } = useParams();
  const subjectName = subject ? subject.charAt(0).toUpperCase() + subject.slice(1) : 'Python';
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(true);
  const [isAILoading, setIsAILoading] = useState(false);
  const [examStarted, setExamStarted] = useState(false);
  const [examSubmitted, setExamSubmitted] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  // Custom Passing Rules from Faculty
  const [passingRule, setPassingRule] = useState("percentage"); 
  const [passingValue, setPassingValue] = useState(50); // Default 50% for daily
  const [answers, setAnswers] = useState([]);
  const [markedForReview, setMarkedForReview] = useState([]);
  const [visitedQuestions, setVisitedQuestions] = useState([]);
  const [timeLeft, setTimeLeft] = useState(2700); // placeholder
  const [examDuration, setExamDuration] = useState(45); // default 45 min
  const [webcamActive, setWebcamActive] = useState(false);
  const [webcamStatus, setWebcamStatus] = useState('idle'); // 'idle' | 'loading' | 'active' | 'error'
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
        video: { 
          width: { ideal: 640 }, 
          height: { ideal: 480 } 
        },
        audio: false 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setWebcamActive(true);
      setWebcamStatus('active');

      // Detect student physically closing/disabling camera
      stream.getVideoTracks().forEach(track => {
        track.addEventListener('ended', () => {
          if (!examSubmittedRef.current) {
            setWebcamActive(false);
            setWebcamStatus('error');
            triggerWarning("Camera was turned off or disconnected. Please keep your camera active during the exam.");
          }
        });
      });

      globalStreamsToClean.push(stream);
    } catch (err) {
      console.error("Webcam access denied:", err);
      setWebcamActive(false);
      setWebcamStatus('error');
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
      sessionStorage.removeItem('dailyExamState');
    } catch (e) {
      console.error("Failed to clear session storage:", e);
    }

    const fetchQuestions = async () => {
      try {
        setIsLoadingQuestions(true);
        const res = await fetch("/api/playground-questions/" + (subject || 'python') + "/");
        const json = await res.json();
        const data = json.data || json;

        if (Array.isArray(data) && data.length > 0) {
          const mappedQuestions = data.map((q, idx) => ({
             ...q,
             id: idx + 1,
             marks: q.marks || 2,
             options: Array.isArray(q.options) ? q.options : [],
             correct: q.correct !== undefined ? q.correct : (Array.isArray(q.options) && q.options.indexOf(q.answer) !== -1 ? q.options.indexOf(q.answer) : 0),
          }));
          setQuestions(mappedQuestions);
          setExamDuration(45);
          setTimeLeft(45 * 60);
          setPassingRule("percentage");
          setPassingValue(50);
        }
      } catch (err) {
        console.error("Failed to fetch practice questions:", err);
      } finally {
        setIsLoadingQuestions(false);
      }
    };
    fetchQuestions();
    
    if (webcamStatus === 'idle') {
      startWebcam();
    }
  }, []);

  // Sync stream to video element whenever it mounts (Prep or Exam)
  useEffect(() => {
    if (videoRef.current && globalStreamsToClean.length > 0) {
      videoRef.current.srcObject = globalStreamsToClean[0];
    }
  }, [examStarted, webcamStatus]);

  // TIMER
  useEffect(() => {
    if (examStarted && !examSubmitted && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
    if (timeLeft === 0 && examStarted && !examSubmitted) {
      handleSubmitExam("Time expired");
    }
  }, [timeLeft, examStarted, examSubmitted]);

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
        const val = tData[i];
        brightness += val;
        if (val > max) max = val;
        if (val < min) min = val;
      }
      brightness = brightness / (tData.length / 4);
      const variation = max - min;
       const isDark = brightness < 20; // More forgiving in dim rooms
       const isFlat = variation < 15; // More forgiving for low-contrast cams
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

        const isCameraCovered = isDark || isFlat;

        if (isCameraCovered || multipleFaces || noFace || faceNotCentered) {
          if (!violationStartTimeRef.current) {
            violationStartTimeRef.current = Date.now();
          } else if (Date.now() - violationStartTimeRef.current > 3000) {
            if (multipleFaces) {
              triggerWarning("⚠️ Multiple persons detected on camera. Only the student must be visible during the exam.");
            } else if (isCameraCovered) {
              triggerWarning("⚠️ Camera appears to be covered or blocked. Please ensure your face is clearly visible.");
            } else if (noFace) {
              triggerWarning("⚠️ Face not detected. Please keep your face clearly visible to the camera. Do not bend down or hide your face.");
            } else if (faceNotCentered) {
              triggerWarning("⚠️ Your face has moved off-screen. Please stay centered in front of the camera and avoid looking away.");
            }
            violationStartTimeRef.current = null; // Reset so warning can repeat
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
    sessionStorage.removeItem('dailyExamState');

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
    examSubmittedRef.current = false;
    
    // Clear any potential cached state
    try {
      sessionStorage.removeItem('dailyExamState');
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
    sessionStorage.removeItem('dailyExamState');

    try {
      if (document.fullscreenElement) {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        } else if (document.mozCancelFullScreen) {
          document.mozCancelFullScreen();
        } else if (document.webkitExitFullscreen) {
          document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
          document.msExitFullscreen();
        }
      }
    } catch (err) {
      console.error("Failed to exit full screen:", err);
    }

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

    // Determine proctoring status
    const isTerminated = reason && (reason.toLowerCase().includes("terminated") || reason.toLowerCase().includes("violated") || reason.toLowerCase().includes("detected"));
    const finalStatus = isTerminated ? "Cheated" : "completed";

    const result = {
      status: finalStatus,
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
      examTitle: subjectName + " Daily Exam",
      submissionReason: reason
    };

    try {
      await fetch("/api/save-exam-report/", {
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
    sessionStorage.removeItem('dailyExamState');

    // Exit full screen mode logic moved to top of function

    navigate("/dashboard/playground-results", { replace: true });
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  if (!examStarted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl shadow-blue-100 max-w-lg w-full text-center border border-white">
          
          <div className="relative w-64 h-48 mx-auto mb-8 rounded-[2rem] overflow-hidden bg-gray-900 shadow-xl ring-4 ring-white border-4 border-white">
             {webcamStatus === 'active' ? (
                <video
                  autoPlay
                  playsInline
                  muted
                  style={{ transform: 'scaleX(-1)' }}
                  className="w-full h-full object-cover"
                  ref={(el) => {
                    if (el && globalStreamsToClean.length > 0) {
                      el.srcObject = globalStreamsToClean[0];
                      // Handle play promise to avoid AbortError
                      const playPromise = el.play();
                      if (playPromise !== undefined) {
                        playPromise.catch(() => {
                          // Ignore play interruptions
                        });
                      }
                    }
                  }}
                />
             ) : webcamStatus === 'error' ? (
                <div className="w-full h-full flex flex-col items-center justify-center gap-3 bg-red-50 p-6">
                   <FontAwesomeIcon icon={faCamera} className="text-red-300 text-3xl" />
                   <p className="text-[9px] font-black text-red-600 uppercase tracking-widest leading-relaxed">Camera Blocked or Not Found</p>
                   <button 
                     onClick={() => startWebcam()}
                     className="mt-2 text-[8px] font-black text-white bg-red-600 px-4 py-2 rounded-full uppercase tracking-widest hover:bg-red-700 transition-colors"
                   >
                      Grant Camera Permission
                   </button>
                </div>
             ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-3">
                   <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                   <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Activating Camera...</p>
                </div>
             )}
             <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/20">
                <div className="flex items-center gap-1.5">
                   <div className={`w-1.5 h-1.5 rounded-full ${webcamStatus === 'active' ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}></div>
                   <span className="text-[8px] font-black text-white uppercase tracking-[0.2em]">Preview</span>
                </div>
             </div>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-black text-gray-900 mb-2 uppercase tracking-tight">
              {subjectName} Daily Assessment
            </h2>
            <div className="h-1 w-12 bg-blue-600 mx-auto rounded-full mb-4"></div>
            <p className="text-gray-500 font-medium leading-relaxed px-4">
              {!isLoadingQuestions && questions.length === 0 
                ? <span className="text-red-500 font-bold">No assessment paper currently available.</span>
                : `${questions.length || 20} Questions • ${examDuration} Minutes`}
              <br/>
              <span className="text-[10px] uppercase font-black tracking-widest text-blue-600 mt-2 inline-block">Proctored Session</span>
            </p>
          </div>

          <button
            onClick={startExam}
            disabled={isAILoading || isLoadingQuestions || (!isLoadingQuestions && questions.length === 0) || !webcamActive}
            className={`w-full py-4 rounded-2xl text-white font-black uppercase tracking-[0.2em] transition-all shadow-lg ${(isAILoading || isLoadingQuestions || (!isLoadingQuestions && questions.length === 0) || !webcamActive)
              ? 'bg-gray-300 cursor-not-allowed shadow-none'
              : 'bg-blue-600 hover:bg-blue-700 hover:scale-[1.02] active:scale-95 shadow-blue-100'
              }`}
          >
            {isLoadingQuestions ? 'Fetching Assessment...' 
            : isAILoading ? 'Syncing Security AI...' 
            : !webcamActive ? 'Waiting for Camera...'
            : 'Start Assessment'}
          </button>

          <p className="mt-6 text-[10px] text-gray-400 font-bold uppercase tracking-widest flex items-center justify-center gap-2">
             <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
             Follow all proctoring rules during the exam
          </p>
        </div>
      </div>
    );
  }

  if (!questions || questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-center">
         <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Waking up assessment engine...</p>
         </div>
      </div>
    );
  }

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

      <div className="max-w-5xl mx-auto">
        {/* COMPACT STICKY HEADER matching WeeklyExam */}
        <div className="bg-white/80 backdrop-blur-md px-6 py-4 rounded-[1.5rem] shadow-sm border border-gray-100 flex justify-between items-center mb-6 sticky top-0 z-40 mx-auto max-w-4xl w-full">
          <div className="flex items-center gap-4">
             <div className="bg-blue-50/50 px-4 py-2 rounded-xl flex items-center gap-2.5 border border-blue-100/50">
                <FontAwesomeIcon icon={faClock} className="text-blue-500 text-xs" />
                <span className="font-black text-blue-700 tabular-nums text-base font-black">{formatTime(timeLeft)}</span>
             </div>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
             <span className="text-blue-600">{subjectName}</span> Daily Assessment
          </div>
        </div>

        <div className="grid grid-cols-4 gap-6 items-start">
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
                  <span className="text-[10px] font-black text-gray-800">{questions[currentQuestion]?.marks || 2}</span>
                </div>
              </div>

              <div className="flex-1">
                <div className="mb-8">
                  <h3 className="text-lg font-bold text-gray-900 leading-snug mb-3">
                    {questions[currentQuestion].question}
                  </h3>
                  <div className="h-0.5 w-8 bg-blue-600/40 rounded-full"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {questions[currentQuestion].options.map((option, index) => (
                    <label 
                      key={index} 
                      className={`group relative flex items-center p-3.5 rounded-2xl border-2 transition-all cursor-pointer ${
                        answers[currentQuestion] === index 
                        ? 'bg-blue-600 border-blue-600 shadow-lg shadow-blue-100' 
                        : 'bg-white border-gray-50 hover:border-blue-100 hover:bg-blue-50/20'
                      }`}
                    >
                      <div className="flex flex-row items-center w-full gap-3">
                        <div className={`shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                           answers[currentQuestion] === index 
                           ? 'border-white bg-white/25' 
                           : 'border-gray-200 group-hover:border-blue-300'
                        }`}>
                           {answers[currentQuestion] === index && <div className="w-2 h-2 bg-white rounded-full"></div>}
                        </div>
                        <input
                          type="radio"
                          name={`q-${currentQuestion}`}
                          checked={answers[currentQuestion] === index}
                          onChange={() => handleAnswerSelect(currentQuestion, index)}
                          className="hidden"
                        />
                        <span className={`text-sm font-bold tracking-tight ${answers[currentQuestion] === index ? 'text-white' : 'text-gray-700'}`}>
                           {option}
                        </span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="mt-10 pt-6 border-t border-gray-50 flex justify-between items-center">
                <button
                  onClick={() => toggleMarkForReview(currentQuestion)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                    markedForReview[currentQuestion] 
                    ? 'bg-amber-100 text-amber-600' 
                    : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
                  }`}
                >
                  <FontAwesomeIcon icon={faFlag} className="text-[10px]" />
                  {markedForReview[currentQuestion] ? 'Flagged' : 'Mark Review'}
                </button>
                
                <div className="flex gap-2">
                   {currentQuestion > 0 && (
                     <button 
                       onClick={previousQuestion} 
                       className="h-11 px-4 rounded-xl bg-white border border-gray-100 text-gray-600 hover:bg-gray-50 transition-all flex items-center justify-center text-sm"
                     >
                       ←
                     </button>
                   )}
                   {currentQuestion < questions.length - 1 ? (
                     <button 
                      onClick={nextQuestion} 
                      className="bg-blue-600 text-white px-6 h-11 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-700 shadow-md shadow-blue-100 transition-all active:scale-95"
                     >
                       Next Question
                     </button>
                   ) : (
                     <button 
                      onClick={() => handleSubmitExam("Manual submission")} 
                      className="bg-green-600 text-white px-8 h-11 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-green-700 shadow-md shadow-green-100 transition-all active:scale-95"
                     >
                       Finish Exam
                     </button>
                   )}
                </div>
              </div>
            </div>
          </div>

          <aside className="col-span-1 space-y-6 lg:sticky lg:top-24">
            <div className="bg-white p-6 rounded-[2rem] shadow-xl shadow-blue-900/5 border border-gray-100 flex flex-col gap-6">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Navigator</h4>
                  <div className="bg-blue-50 text-blue-600 px-2.5 py-0.5 rounded-lg text-[9px] font-black">
                    {questions.length > 0 ? Math.round(((answers.filter(a => a !== null).length) / questions.length) * 100) : 0}%
                  </div>
                </div>
                
                <div className="grid grid-cols-4 gap-2">
                  {questions.map((_, index) => {
                    let statusColor = "bg-gray-50 text-gray-300 border-gray-50 hover:bg-gray-100 hover:text-gray-400";
                    if (currentQuestion === index) {
                      statusColor = "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-100 scale-105 z-10 pointer-events-none";
                    } else if (markedForReview[index]) {
                      statusColor = "bg-amber-500 text-white border-amber-500 shadow-sm";
                    } else if (answers[index] !== null && answers[index] !== undefined && answers[index] !== "") {
                      statusColor = "bg-green-500 text-white border-green-500 shadow-sm";
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
              </div>

              <div className="space-y-3 border-t border-gray-50 pt-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Answered</span>
                  </div>
                  <span className="text-xs font-black text-gray-800">{answers.filter(a => a !== null).length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                    <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Marked</span>
                  </div>
                  <span className="text-xs font-black text-gray-800">{markedForReview.filter(f => f).length}</span>
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
          </aside>
        </div>
      </div>

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
              I Understand & Resume
            </button>
          </div>
        </div>
      )}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default DailyExam;
