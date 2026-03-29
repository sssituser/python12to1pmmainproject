import {
    faCamera,
    faFlag
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as faceapi from "@vladmandic/face-api";
import Editor from "@monaco-editor/react";

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

  const [timeLeft, setTimeLeft] = useState(2700); // placeholder, will be set from settings
  const [examDuration, setExamDuration] = useState(45); // default 45 min
  const [examStarted, setExamStarted] = useState(false);
  const [examSubmitted, setExamSubmitted] = useState(false);
  const examSubmittedRef = useRef(false);
  const [webcamActive, setWebcamActive] = useState(false);
  const [webcamStatus, setWebcamStatus] = useState('idle'); // 'idle' | 'loading' | 'active' | 'error'
  const [faceCount, setFaceCount] = useState(0);
  const [examFailed, setExamFailed] = useState(false);

  const [questions, setQuestions] = useState([]);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(true);

  // Custom Passing Rules from Faculty
  const [passingRule, setPassingRule] = useState("percentage"); 
  const [passingValue, setPassingValue] = useState(35); // Default 35% for weekly

  // --- COMPILER STATES ---
  const [codeAnswers, setCodeAnswers] = useState({}); // { questionId: { code: string, language: string } }
  const [executing, setExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState('python');
  const [showConsole, setShowConsole] = useState(false);

  // Fetch 50 randomized questions from backend pool
  useEffect(() => {
    const fetchQuestionsFromBackend = async () => {
      // Always clear any previous session state for fresh start
      try {
        sessionStorage.removeItem('weeklyExamState');
      } catch (e) {}

      try {
        setIsLoadingQuestions(true);

        // Fetch custom exam settings loaded manually by Faculty
        const customRes = await fetch("/api/admin/exam-settings/?category=Weekly");
        const customJson = await customRes.json();

        // 1. Prioritize Custom Questions from Exam Manager
        if (customJson.success && customJson.data && customJson.data.questions && Array.isArray(customJson.data.questions) && customJson.data.questions.length > 0) {
          
          // Helper for Fisher-Yates shuffle
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
          
          // 2. Shuffle ALL available questions from Faculty FIRST
          const allShuffled = shuffleArray(customJson.data.questions);
          
          // 3. Take the limit (e.g. random 50)
          const weeklyQuestions = allShuffled.slice(0, displayLimit);
          
          const dur = customJson.data.duration || 45;
          setExamDuration(dur);
          setTimeLeft(dur * 60);

          setPassingRule(customJson.data.passingRule || "percentage");
          setPassingValue(customJson.data.passingValue !== undefined ? customJson.data.passingValue : 35);

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
          // If no custom questions exist, leave questions array empty
          setQuestions([]);
        }
      } catch (err) {
        console.error("Failed to fetch questions from backend:", err);
      } finally {
        setIsLoadingQuestions(false);
      }
    };
    
    fetchQuestionsFromBackend();
    
    // Auto-start webcam for preparation/preview screen
    if (!webcamActive) {
      startWebcam();
    }
  }, []);

  // Control global browser back button for pre-exam screen
  useEffect(() => {
    if (!examStarted && !examSubmitted) {
      window.allowBrowserBack = true;

      const handleBrowserBack = (e) => {
        // Allow normal browser back navigation to playground
        navigate('/dashboard/playground');
      };

      window.addEventListener('popstate', handleBrowserBack);

      return () => {
        window.allowBrowserBack = false;
        window.removeEventListener('popstate', handleBrowserBack);
      };
    } else {
      window.allowBrowserBack = false;
    }

    return () => {
      window.allowBrowserBack = false;
    };
  }, [examStarted, examSubmitted, navigate]);


  // Sync state to sessionStorage whenever it changes
  useEffect(() => {
    if (examStarted && !examSubmitted && questions.length > 0) {
      const stateToSave = {
        questions,
        answers,
        markedForReview,
        visitedQuestions,
        timeLeft,
        currentQuestion,
        examStarted,
        examSubmitted
      };
      sessionStorage.setItem('weeklyExamState', JSON.stringify(stateToSave));
    }
  }, [answers, markedForReview, visitedQuestions, timeLeft, currentQuestion, examStarted, examSubmitted, questions]);

  // TIMER
  useEffect(() => {
    if (examStarted && !examSubmitted && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
    if (timeLeft === 0 && !examSubmitted) handleSubmitExam();
  }, [timeLeft, examStarted, examSubmitted]);

  // Turn off webcam when component unmounts (page closed)
  useEffect(() => {
    return () => {
      stopWebcam();
    };
  }, []);

  // Prevent browser refresh and back button during exam
  useEffect(() => {
    if (examStarted && !examSubmitted) {
      // Prevent F5, Ctrl+R, Ctrl+Shift+R refresh
      const preventRefresh = (e) => {
        if ((e.key === 'F5') || 
            (e.ctrlKey && e.key === 'r') || 
            (e.ctrlKey && e.shiftKey && e.key === 'r')) {
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

// AI-powered security monitoring
useEffect(() => {
  if (!examStarted || examSubmitted) return;

  let cleanup = () => {};
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
      const isDark = brightness < 20;
      const isFlat = variation < 15;
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
            violationStartTimeRef.current = null; // Reset to allow more warnings
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

  // WEBCAM FUNCTIONS


  const startFaceDetection = () => {
    faceDetectionIntervalRef.current = setInterval(() => {
      if (!videoRef.current || !examStarted || examSubmitted) return;
      const video = videoRef.current;
      if (video.videoWidth === 0 || video.videoHeight === 0) return;

      // Create a heavily downscaled canvas to completely destroy any Auto-ISO camera static noise
      const tinyCanvas = document.createElement("canvas");
      tinyCanvas.width = 16;
      tinyCanvas.height = 16;
      const tCtx = tinyCanvas.getContext("2d", { willReadFrequently: true });
      if (!tCtx) return;
      tCtx.drawImage(video, 0, 0, 16, 16);
      const tData = tCtx.getImageData(0, 0, 16, 16).data;

      let rMax = 0, rMin = 255;
      let gMax = 0, gMin = 255;
      let bMax = 0, bMin = 255;
      let rTotal = 0, gTotal = 0, bTotal = 0;

      for (let i = 0; i < tData.length; i += 4) {
        const r = tData[i], g = tData[i+1], b = tData[i+2];
        rTotal += r; gTotal += g; bTotal += b;

        if (r > rMax) rMax = r;
        if (r < rMin) rMin = r;
        if (g > gMax) gMax = g;
        if (g < gMin) gMin = g;
        if (b > bMax) bMax = b;
        if (b < bMin) bMin = b;
      }
      
      const pixelCount = 256; // 16x16
      const avgBrightness = (0.299 * (rTotal/pixelCount) + 0.587 * (gTotal/pixelCount) + 0.114 * (bTotal/pixelCount));

      // Neutralized Heuristics
      const isDark = avgBrightness < 45;
      const isRedDominant = (rTotal > gTotal * 1.5) && (rTotal > bTotal * 1.5);
      
      // If the maximum difference of colors across the ENTIRE VIDEO is extremely narrow (< 40),
      // it means the camera is physically covered, staring at a blank blur, or completely blocked by an object.
      const isTotallyFlat = (rMax - rMin < 45) && (gMax - gMin < 45) && (bMax - bMin < 45);

      const checkViolations = (faces) => {
        const isCameraCovered = isDark || isTotallyFlat || isRedDominant;
        const isMultipleFaces = faces && faces.length > 1;

        if (isCameraCovered || isMultipleFaces) {
          if (cleanTimeoutRef.current) {
            clearTimeout(cleanTimeoutRef.current);
            cleanTimeoutRef.current = null;
          }
          if (!violationStartTimeRef.current) {
            console.log("🚨 SECURITY VIOLATION WARNING: Condition active, waiting 2 seconds...");
            violationStartTimeRef.current = Date.now();
          } else if (Date.now() - violationStartTimeRef.current >= 2000) {
            handleSubmitExam(isCameraCovered ? "Camera covered or blocked" : "Multiple faces detected on webcam");
          }
        } else {
          if (violationStartTimeRef.current && !cleanTimeoutRef.current) {
            cleanTimeoutRef.current = setTimeout(() => {
              violationStartTimeRef.current = null;
              cleanTimeoutRef.current = null;
            }, 1000); // Require clean picture for 1s to forgive
          }
        }
      };

      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Face Detection using native Shape Detection API if available
      if (window.FaceDetector) {
        const faceDetector = new window.FaceDetector({ maxDetectedFaces: 5 });
        faceDetector.detect(canvas)
          .then(faces => {
            setFaceCount(faces.length);
            checkViolations(faces);
          })
          .catch(err => {
            console.error(err);
            checkViolations(null);
          });
      } else {
        setFaceCount(1);
        checkViolations(null);
      }
    }, 500);
  };

  // CODE EXECUTION STATE (Merged into main states above)
  const [output, setOutput] = useState("");

  const startExam = async () => {
    // Reset all exam state for fresh start
    const qLen = questions.length || 50;
    setAnswers(new Array(qLen).fill(null));
    setMarkedForReview(new Array(qLen).fill(false));
    setVisitedQuestions(new Array(qLen).fill(false));
    setCurrentQuestion(0);
    setTimeLeft(examDuration * 60);
    setExamSubmitted(false);
    examSubmittedRef.current = false;
    
    // Clear any potential cached state
    try {
      sessionStorage.removeItem('weeklyExamState');
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
    if (!examSubmittedRef.current) {
      setExamSubmitted(true);
      examSubmittedRef.current = true;
      stopWebcam(); // Stop webcam when submitting
    }
    
    const userStr = localStorage.getItem("user");
    let user = {};
    try {
      user = userStr && userStr !== "undefined" ? JSON.parse(userStr) : {};
    } catch(e) {
      console.error(e);
    }
    const randomId = Math.floor(1000 + Math.random() * 9000);

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

    // Calculate passing status based on faculty rules
    let passed = false;
    if (passingRule === "percentage") {
       const percent = maxPossibleMarks > 0 ? (earnedMarks / maxPossibleMarks) * 100 : 0;
       passed = percent >= passingValue;
    } else {
       // rule is "correct_answers"
       passed = correctCount >= passingValue;
    }

    const result = {
      status: "completed",
      correctAnswers: correctCount,
      incorrectAnswers: totalQ - correctCount,
      totalQuestions: totalQ,
      score: finalScore,
      marks: finalScore,
      totalMarks: maxPossibleMarks,
      passed: passed, // New field for backend and UI
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
      examTitle: "Weekly Exam",
      submissionReason: reason
    };

    const now = new Date().toISOString();
    const payload = {
      username: user.username || "Unknown",
      exam_title: "Weekly Python Programming Assessment",
      exam_type: "weekly",
      score: earnedMarks,
      total_questions: totalQ,
      correct_answers: correctCount,
      incorrect_answers: totalQ - correctCount,
      marks_obtained: earnedMarks,
      total_marks: maxPossibleMarks,
      passed: passed,
      time_taken: (examDuration * 60) - timeLeft,
      start_time: now,
      end_time: now,
      status: "completed",
      random_id: String(randomId),
      answers: answers,
      questions: questions
    };

    try {
      const res = await fetch("/api/save-exam-report/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        console.error("Save exam report failed:", res.status, errData);
      } else {
        const saved = await res.json().catch(() => ({}));
        console.log("✅ Exam saved for user:", saved.saved_username);
      }
    } catch (err) {
      console.error("Failed to sync exam to backend:", err);
    }

    const allResults = JSON.parse(localStorage.getItem("allExamResults") || "[]");
    allResults.unshift(result);
    localStorage.setItem("allExamResults", JSON.stringify(allResults));
    localStorage.setItem("examResult", JSON.stringify(result));

    sessionStorage.removeItem('weeklyExamState');

    // Exit full screen mode
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

    navigate("/dashboard/playground-results",{replace:true});
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  // --- COMPILER HANDLERS ---
  const handleRunCode = async (isSubmit = false) => {
    const q = questions[currentQuestion];
    if (!q || q.type !== 'code') return;

    const code = codeAnswers[q.id]?.code || q.starter_code || "";
    const lang = codeAnswers[q.id]?.language || selectedLanguage;

    setExecuting(true);
    setShowConsole(true);
    setExecutionResult(null);

    try {
      const res = await fetch("/api/run-code/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          language: lang,
          test_cases: q.test_cases || []
        })
      });

      const data = await res.json();
      if (data.success) {
        setExecutionResult(data);
        if (data.results && data.results.length > 0 && data.results[0].error) {
           setOutput(data.results[0].error);
        } else if (data.results && data.results.length > 0) {
           setOutput(data.results[0].output || "(No output)");
        }
      } else {
        const errMsg = data.error || "Execution failed";
        setExecutionResult({ error: errMsg });
        setOutput("Error: " + errMsg);
      }
    } catch (err) {
      setExecutionResult({ error: "Failed to connect to execution engine" });
      setOutput("Error: Failed to connect to execution engine");
    } finally {
      setExecuting(false);
    }
  };

  const onCodeChange = (val) => {
    const q = questions[currentQuestion];
    setCodeAnswers(prev => ({
      ...prev,
      [q.id]: {
        ...prev[q.id],
        code: val,
        language: selectedLanguage
      }
    }));
  };

  // Prevent Cheating: Tab Switching
  useEffect(() => {
    if (!examStarted || examSubmitted) return;
    const handleVisibilityChange = () => {
      if (document.hidden) {
        triggerWarning("Warning: Navigation away from the exam tab detected. This event has been logged.");
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [examStarted, examSubmitted]);

  // Prevent Cheating: Context Menu, Copy, Paste
  useEffect(() => {
    if (!examStarted || examSubmitted) return;
    const preventAction = (e) => {
      e.preventDefault();
      triggerWarning("Warning: Copying, pasting, and right-clicking are strictly prohibited during the exam.");
    };
    document.addEventListener("contextmenu", preventAction);
    document.addEventListener("copy", preventAction);
    document.addEventListener("paste", preventAction);
    return () => {
      document.removeEventListener("contextmenu", preventAction);
      document.removeEventListener("copy", preventAction);
      document.removeEventListener("paste", preventAction);
    };
  }, [examStarted, examSubmitted]);

  if (!examStarted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl shadow-blue-900/5 max-w-lg w-full text-center border border-white">
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
                   <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Activating Camera...</p>
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
              Weekly Assessment
            </h2>
            <div className="h-1 w-12 bg-indigo-600 mx-auto rounded-full mb-4"></div>
            <p className="text-gray-500 font-medium leading-relaxed px-4">
              {!isLoadingQuestions && questions.length === 0 
                ? <span className="text-red-500 font-bold">No questions uploaded yet for this week.</span>
                : `${questions.length || 0} Questions • ${examDuration} Minutes`}
              <br/>
              <span className="text-[10px] uppercase font-black tracking-widest text-indigo-600 mt-2 inline-block">Secure Proctored Mode</span>
            </p>
          </div>

          <button
            onClick={startExam}
            disabled={isLoadingQuestions || (!isLoadingQuestions && questions.length === 0) || !webcamActive}
            className={`w-full py-4 rounded-2xl text-white font-black uppercase tracking-[0.2em] transition-all shadow-lg ${(isLoadingQuestions || (!isLoadingQuestions && questions.length === 0) || !webcamActive)
              ? 'bg-gray-300 cursor-not-allowed shadow-none'
              : 'bg-indigo-600 hover:bg-indigo-700 hover:scale-[1.02] active:scale-95 shadow-indigo-100'
              }`}
          >
            {isLoadingQuestions ? 'Preparing Questions...' 
            : !webcamActive ? 'Waiting for Camera...'
            : 'Start Assessment'}
          </button>

          <button
            onClick={() => navigate("/dashboard/playground")}
            className="block mt-6 text-[10px] font-black text-gray-400 hover:text-indigo-600 uppercase tracking-widest mx-auto transition-colors"
          >
            Back to Playground
          </button>
        </div>
      </div>
    );
  }

  const currentQ = (questions && questions.length > 0) ? questions[currentQuestion] : null;

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
        {/* COMPACT STICKY HEADER matching DailyExam */}
        <div className="bg-white/80 backdrop-blur-md px-6 py-4 rounded-[1.5rem] shadow-sm border border-gray-100 flex justify-between items-center mb-6 sticky top-0 z-40">
          <div className="flex items-center gap-4">
             <div className="bg-blue-50/50 px-4 py-2 rounded-xl flex items-center gap-2.5 border border-blue-100/50">
                <FontAwesomeIcon icon={faClock} className="text-blue-500 text-xs" />
                <span className="font-black text-blue-700 tabular-nums text-base font-black">{formatTime(timeLeft)}</span>
             </div>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
             <span className="text-blue-600">Weekly</span> Assessment
          </div>
        </div>

        <div className="grid grid-cols-4 gap-6 items-start">
                   {/* Left Section: Question and Navigation Controls */}
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
                    <span className="text-[10px] font-black text-gray-800">{currentQ.marks || 2}</span>
                  </div>
                </div>

                <div className="flex-1">
                  <div className="mb-8">
                    <h3 className="text-lg font-bold text-gray-900 leading-snug mb-3">
                      {currentQ.question}
                    </h3>
                    <div className="h-0.5 w-8 bg-blue-600/40 rounded-full mb-6"></div>
                  </div>

                  {currentQ.type === 'code' && (
                    <div className="space-y-4 mb-8">
                      {/* Compiler UI Displayed for Code Questions */}
                      <div className="flex items-center justify-between mb-4 bg-gray-50/50 p-3 rounded-2xl border border-gray-100/50">
                        <div className="flex items-center gap-3">
                           <div className="flex flex-col">
                              <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Select Language</span>
                              <select 
                                value={codeAnswers[currentQ.id]?.language || selectedLanguage}
                                onChange={(e) => {
                                  setSelectedLanguage(e.target.value);
                                  setCodeAnswers(prev => ({
                                    ...prev,
                                    [currentQ.id]: {
                                      ...prev[currentQ.id],
                                      language: e.target.value
                                    }
                                  }));
                                }}
                                className="bg-white border border-gray-200 rounded-xl px-4 py-2 text-[10px] font-black uppercase text-blue-600 shadow-sm focus:ring-2 focus:ring-blue-500/20"
                              >
                                <option value="python">Python 3</option>
                                <option value="cpp">C++ (GCC 9.2)</option>
                                <option value="java">Java 13</option>
                              </select>
                           </div>
                        </div>
                        <div className="flex gap-2">
                            <button 
                              onClick={() => handleRunCode(false)}
                              disabled={executing}
                              className="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase hover:bg-blue-700 shadow-lg shadow-blue-200 flex items-center gap-2 active:scale-95 disabled:opacity-50"
                            >
                                <FontAwesomeIcon icon={faArrowRight} className={`text-[10px] ${executing ? 'animate-spin' : ''}`} />
                                {executing ? 'Executing...' : 'Run Code'}
                            </button>
                        </div>
                      </div>

                      <div className="rounded-3xl overflow-hidden border-2 border-gray-100 shadow-xl h-[400px] bg-white ring-8 ring-gray-50">
                        <Editor
                          height="100%"
                          language={ (codeAnswers[currentQ.id]?.language || selectedLanguage) === 'cpp' ? 'cpp' : (codeAnswers[currentQ.id]?.language || selectedLanguage) }
                          value={codeAnswers[currentQ.id]?.code || currentQ.starter_code || ""}
                          theme="vs-light"
                          onChange={onCodeChange}
                          options={{
                            minimap: { enabled: false },
                            fontSize: 14,
                            scrollBeyondLastLine: false,
                            padding: { top: 20 },
                            domReadOnly: false,
                            readOnly: false,
                            contextmenu: false,
                            copy: false,
                            paste: false,
                            suggestOnTriggerCharacters: true,
                            quickSuggestions: true
                          }}
                        />
                      </div>

                      {showConsole && (
                        <div className="mt-6 bg-gray-900 rounded-3xl p-6 font-mono text-xs overflow-y-auto max-h-[250px] border border-gray-800 shadow-2xl relative">
                          <div className="sticky top-0 bg-gray-900/90 backdrop-blur-sm flex items-center justify-between mb-4 border-b border-gray-800 pb-3">
                            <div className="flex items-center gap-2">
                               <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                               <span className="text-gray-400 uppercase text-[9px] font-black tracking-widest">Execution Result</span>
                            </div>
                            <button onClick={() => setShowConsole(false)} className="text-gray-500 hover:text-white transition-colors">
                              <FontAwesomeIcon icon={faCircle} className="text-[10px]" />
                            </button>
                          </div>
                          
                          {executionResult ? (
                            <div className="space-y-4">
                               {executionResult.error && (
                                 <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400">
                                    <span className="font-black uppercase text-[9px] block mb-1">Runtime/Compile Error</span>
                                    {executionResult.error}
                                 </div>
                               )}
                               
                               <div className="grid grid-cols-1 gap-3">
                                 {executionResult.results?.map((res, i) => (
                                   <div key={i} className={`p-4 rounded-2xl border transition-all ${res.passed ? 'bg-green-500/5 border-green-500/20' : 'bg-red-500/5 border-red-500/20'}`}>
                                      <div className="flex items-center justify-between mb-2">
                                         <span className={`text-[10px] font-black uppercase tracking-widest ${res.passed ? 'text-green-500' : 'text-red-500'}`}>
                                            Test Case {i+1}
                                         </span>
                                         <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase ${res.passed ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                                            {res.passed ? 'Passed' : 'Failed'}
                                         </span>
                                      </div>
                                      <div className="grid grid-cols-2 gap-4">
                                         <div>
                                            <span className="text-[8px] text-gray-500 uppercase block mb-1">Input</span>
                                            <pre className="bg-gray-800/50 p-2 rounded-lg text-gray-300 overflow-x-auto">{res.input || 'None'}</pre>
                                         </div>
                                         <div>
                                            <span className="text-[8px] text-gray-500 uppercase block mb-1">Expected Output</span>
                                            <pre className="bg-gray-800/50 p-2 rounded-lg text-gray-400 overflow-x-auto">{res.expected}</pre>
                                         </div>
                                      </div>
                                      <div className="mt-3">
                                         <span className="text-[8px] text-gray-500 uppercase block mb-1">Your Output</span>
                                         <pre className="bg-gray-950 p-3 rounded-xl text-white overflow-x-auto border border-gray-800">{res.output || 'No Output'}</pre>
                                      </div>
                                   </div>
                                 ))}
                               </div>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center justify-center py-10 gap-3">
                                <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                <p className="text-gray-500 uppercase text-[9px] font-black tracking-widest">Processing through Judge0...</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {currentQ.options && currentQ.options.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {currentQ.options.map((option, index) => (
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
                  )}
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
                         Next
                       </button>
                     ) : (
                       <button 
                        onClick={() => handleSubmitExam("Manual submission")} 
                        className="bg-green-600 text-white px-8 h-11 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-green-700 shadow-md shadow-green-100 transition-all active:scale-95"
                       >
                         Submit Exam
                       </button>
                     )}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Section: Progress Tracker & Stats */}
            <div className="col-span-1 flex flex-col gap-4 sticky top-24">
              <div className="bg-white p-6 rounded-[2rem] shadow-xl shadow-blue-900/5 border border-gray-100 flex flex-col gap-6">
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Navigator</h4>
                    <div className="bg-blue-50 text-blue-600 px-2.5 py-0.5 rounded-lg text-[9px] font-black">
                      {Math.round(((answers.filter(a => a !== null).length) / questions.length) * 100)}%
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
              I Understand & Resume
            </button>
          </div>
        </div>
      )}


      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default WeeklyExam;
