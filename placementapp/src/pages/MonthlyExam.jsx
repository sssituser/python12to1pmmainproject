import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faClock,
  faUser,
  faCircle,
  faFlag,
  faArrowRight,
  faCamera,
} from "@fortawesome/free-solid-svg-icons";

import * as faceapi from "@vladmandic/face-api";

// Indestructible global array to catch all streams outside React DOM scope
let globalStreamsToClean = [];

const MonthlyExam = () => {
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
  const [faceCount, setFaceCount] = useState(0);
  const [examFailed, setExamFailed] = useState(false);

  const [questions, setQuestions] = useState([]);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(true);

  // Custom Passing Rules from Faculty
  const [passingRule, setPassingRule] = useState("percentage"); 
  const [passingValue, setPassingValue] = useState(35); // Default 35% for Monthly

  // Fetch 50 randomized questions from backend pool
  useEffect(() => {
    const fetchQuestionsFromBackend = async () => {
      // Always clear any previous session state for fresh start
      try {
        sessionStorage.removeItem('monthlyExamState');
      } catch (e) {}

      try {
        setIsLoadingQuestions(true);

        // Fetch custom exam settings loaded manually by Faculty
        const customRes = await fetch("http://127.0.0.1:8000/api/admin/exam-settings/?category=Monthly");
        const customJson = await customRes.json();

        // 1. Prioritize Custom Questions from Exam Manager
        if (customJson.success && customJson.data && customJson.data.questions && customJson.data.questions.length > 0) {
          
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
          const monthlyQuestions = allShuffled.slice(0, displayLimit);
          
          const dur = customJson.data.duration || 45;
          setExamDuration(dur);
          setTimeLeft(dur * 60);

          setPassingRule(customJson.data.passingRule || "percentage");
          setPassingValue(customJson.data.passingValue !== undefined ? customJson.data.passingValue : 35);

          const mappedQuestions = monthlyQuestions.map((q, idx) => ({
             ...q, 
             id: idx + 1,
             marks: parseInt(q.marks) || 2,
             question: q.question,
             options: q.options,
             correct: q.options.indexOf(q.answer) !== -1 ? q.options.indexOf(q.answer) : 0
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

  // Load state from sessionStorage - DISABLED for fresh starts
  // useEffect(() => {
  //   const savedStateStr = sessionStorage.getItem('monthlyExamState');
  //   if (savedStateStr) {
  //     try {
  //       const savedState = JSON.parse(savedStateStr);
  //       if (savedState.examStarted && !savedState.examSubmitted) {
  //         setAnswers(savedState.answers);
  //         setMarkedForReview(savedState.markedForReview);
  //         setVisitedQuestions(savedState.visitedQuestions);
  //         setTimeLeft(savedState.timeLeft);
  //         setCurrentQuestion(savedState.currentQuestion);
  //         setExamStarted(true);
  //         examSubmittedRef.current = false;
  //         // Resume webcam if not already active
  //         setTimeout(() => {
  //           if (videoRef.current && !webcamActive) {
  //             startWebcam();
  //           }
  //         }, 500);
  //       }
  //     } catch (e) {}
  //   }
  // }, []);

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
      sessionStorage.setItem('monthlyExamState', JSON.stringify(stateToSave));
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
  const startWebcam = async () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 640 }, 
          height: { ideal: 480 } 
        },
        audio: false // Disable audio capture permanently
      });
      
      globalStreamsToClean.push(stream);
      
      // Stop stream immediately if the exam was already submitted or window unmounted
      if (examSubmittedRef.current || !videoRef.current) {
        stopWebcam();
        return;
      }

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setWebcamActive(true);
        startFaceDetection();
      }
    } catch (err) {
      console.error("Error accessing webcam:", err);
      alert("Unable to access webcam. Please ensure camera permissions are granted.");
    }
  };

  const stopWebcam = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    globalStreamsToClean.forEach(s => {
      s.getTracks().forEach(track => track.stop());
    });
    globalStreamsToClean = []; // reset
    setWebcamActive(false);

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    if (faceDetectionIntervalRef.current) {
      clearInterval(faceDetectionIntervalRef.current);
      faceDetectionIntervalRef.current = null;
    }
    if (cleanTimeoutRef.current) {
      clearTimeout(cleanTimeoutRef.current);
      cleanTimeoutRef.current = null;
    }
    violationStartTimeRef.current = null;
  };

  const startFaceDetection = () => {
    faceDetectionIntervalRef.current = setInterval(() => {
      if (!videoRef.current || !examStarted || examSubmitted) return;
      const video = videoRef.current;
      if (video.videoWidth === 0 || video.videoHeight === 0) return;

      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

      let rTotal = 0, gTotal = 0, bTotal = 0;
      let maxAdjacentDiff = 0;

      for (let i = 0; i < data.length - 4; i += 4) {
        const r = data[i], g = data[i+1], b = data[i+2];
        rTotal += r; gTotal += g; bTotal += b;

        // Prevent false edge-jumps by skipping the right-most pixel wrapping around to the left
        if (((i / 4) + 1) % canvas.width === 0) continue;

        // Calculate absolute contrast jump between this pixel and the immediate next pixel
        const diff = Math.abs(r - data[i+4]) + Math.abs(g - data[i+5]) + Math.abs(b - data[i+6]);
        if (diff > maxAdjacentDiff) {
            maxAdjacentDiff = diff;
        }
      }
      
      const pixelCount = canvas.width * canvas.height;
      const avgBrightness = (0.299 * (rTotal/pixelCount) + 0.587 * (gTotal/pixelCount) + 0.114 * (bTotal/pixelCount));

      const isDark = avgBrightness < 40;
      const isRedDominant = (rTotal > gTotal * 2) && (rTotal > bTotal * 2);
      
      // If the absolutely sharpest edge in the entire video feed is extremely weak (< 85 combined RGB difference),
      // the video is definitively blurred out by Software (e.g., OBS Gaussian Blur) or physically blocked by an object at 0mm focal depth.
      // Normal human features (like eyes, hair, teeth) create native pixel jumps well over 150+.
      const isBlurred = maxAdjacentDiff < 85;

      const checkViolations = (faces) => {
        const isCameraCovered = isDark || isBlurred || isRedDominant;
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

  // CODE EXECUTION STATE
  const [executing, setExecuting] = useState(false);
  const [output, setOutput] = useState("");
  const [executionResult, setExecutionResult] = useState(null);

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
    setOutput("");
    setExecutionResult(null);
    
    // Clear any potential cached state
    try {
      sessionStorage.removeItem('monthlyExamState');
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

  const handleCodeChange = (qIndex, code) => {
    const newAnswers = [...answers];
    newAnswers[qIndex] = code;
    setAnswers(newAnswers);
  };

  const runCode = async () => {
    const q = questions[currentQuestion];
    const code = answers[currentQuestion] || "";
    if (!code.trim()) return alert("Please write some code before running!");

    setExecuting(true);
    setOutput("Running code...");
    try {
       const res = await fetch("http://127.0.0.1:8000/api/execute-code-api/", {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({
            code: code,
            language: q.language || 'python',
            test_cases: q.testCases || []
         })
       });
       const data = await res.json();
       if (data.success) {
          let out = data.data.output || data.data.error || "";
          
          if (data.data.test_results && data.data.test_results.length > 0) {
             const passedCount = data.data.test_results.filter(r => r.passed).length;
             const totalCount = data.data.test_results.length;
             
             let testDetails = `[Verification Summary: ${passedCount}/${totalCount} Passed]\n\n`;
             
             data.data.test_results.forEach((res, idx) => {
                testDetails += `Case ${idx + 1}:\n`;
                testDetails += `-> Provided Input  : ${res.input || '(None)'}\n`;
                testDetails += `-> Expected Result : ${res.expected || '(None)'}\n`;
                testDetails += `-> Actual Output   : ${res.actual || (res.error ? 'Error: ' + res.error : '(No Output)')}\n`;
                testDetails += `-> Status          : ${res.passed ? '✅ SUCCESS' : '❌ FAILED'}\n`;
                testDetails += `-------------------\n`;
             });
             
             out = testDetails + (out.trim() ? "\nDefault Output:\n" + out : "");
          } else if (!out) {
             out = "Code executed successfully (no test cases defined).";
          }
          
          setOutput(out);
          setExecutionResult(data.data);
        } else {
          setOutput("Runtime Error: " + data.error);
       }
    } catch (err) {
       setOutput("Error: Could not connect to execution server.");
    } finally {
       setExecuting(false);
    }
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
    // Reset output when switching questions
    setOutput("");
    setExecutionResult(null);
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

      if (q.type === 'mcq') {
        if (ans === q.correct) {
          correctCount++;
          earnedMarks += qMarks;
        }
      } else if (q.type === 'coding') {
        // Simple heuristic for coding
        if (ans && ans.length > 20) {
           correctCount++;
           earnedMarks += qMarks;
        }
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
      passed: passed,
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
      examTitle: "Monthly Exam",
      submissionReason: reason
    };

    const now = new Date().toISOString();
    const payload = {
      username: user.username || "Unknown",
      exam_title: "Monthly Python Programming Assessment",
      exam_type: "monthly",
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
      const res = await fetch("http://127.0.0.1:8000/api/save-exam-report/", {
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

    sessionStorage.removeItem('monthlyExamState');

    navigate("/dashboard/playground-results",{replace:true});
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
          <FontAwesomeIcon icon={faCamera} className="text-4xl text-indigo-600 mb-4"/>
          <h2 className="text-2xl font-bold mb-2">
            Monthly Exam
          </h2>

          <p className="text-gray-600 mb-6">
            {!isLoadingQuestions && questions.length === 0 
              ? <span className="text-red-600 font-semibold">No questions uploaded yet.</span>
              : `${questions.length || 0} Questions • ${examDuration} Minutes`}
          </p>
          <button
            onClick={startExam}
            disabled={isLoadingQuestions || (!isLoadingQuestions && questions.length === 0)}
            className={`px-6 py-3 rounded-lg text-white font-semibold transition-all ${
              isLoadingQuestions || (!isLoadingQuestions && questions.length === 0) 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-indigo-600 hover:bg-indigo-700 shadow-md'
            }`}
          >
            {isLoadingQuestions ? 'Fetching Assessment Paper...' : 'Start Exam'}
          </button>
          
          <button
            onClick={() => navigate("/dashboard/playground")}
            className="block mt-4 text-sm text-gray-500 hover:text-indigo-600 mx-auto"
          >
            Back to Playground
          </button>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentQuestion];

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
        {/* COMPACT STICKY HEADER */}
        <div className="bg-white/80 backdrop-blur-md px-6 py-4 rounded-[1.5rem] shadow-sm border border-gray-100 flex justify-between items-center mb-6 sticky top-0 z-40">
          <div className="flex items-center gap-4">
             <div className="bg-blue-50/50 px-4 py-2 rounded-xl flex items-center gap-2.5 border border-blue-100/50">
                <FontAwesomeIcon icon={faClock} className="text-blue-500 text-xs" />
                <span className="font-black text-blue-700 tabular-nums text-base">{formatTime(timeLeft)}</span>
             </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          <div className="xl:col-span-3 space-y-6">
            <div className="bg-white p-6 rounded-[1.5rem] shadow-sm border border-gray-100 relative overflow-hidden">
              <div className="flex items-center justify-between mb-6">
                 <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${currentQ.type === 'coding' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                    {currentQ.type === 'coding' ? `Coding Assessment (${currentQ.language})` : 'Multiple Choice Question'}
                 </span>
                 <span className="text-sm font-bold text-gray-400">
                    Worth {currentQ.marks || 2} Marks
                 </span>
              </div>

              <h3 className="text-xl font-bold text-gray-800 mb-8 whitespace-pre-wrap leading-relaxed">
                {currentQ.question}
              </h3>

              {currentQ.type === 'coding' ? (
                <div className="space-y-4">
                   <div className="relative group">
                      <div className="absolute top-4 right-4 z-10 opacity-30 group-hover:opacity-100 transition-opacity">
                         <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest bg-white/10 px-2 py-1 rounded">{currentQ.language} Editor</span>
                      </div>
                      <textarea
                        value={answers[currentQuestion] || ""}
                        onChange={(e) => handleCodeChange(currentQuestion, e.target.value)}
                        placeholder={`Write your ${currentQ.language} code here...`}
                        className="w-full h-80 p-6 bg-[#1e1e1e] text-blue-100 font-mono text-sm rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 transition-all shadow-inner"
                        spellCheck="false"
                      />
                   </div>

                   <div className="flex items-center gap-4">
                      <button
                        onClick={runCode}
                        disabled={executing}
                        className="bg-gray-800 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-black transition-all active:scale-95 disabled:opacity-50"
                      >
                         <FontAwesomeIcon icon={faArrowRight} spin={executing} />
                         {executing ? 'Executing...' : 'Run & Test'}
                      </button>
                      <div className="flex-1 bg-gray-100 h-px"></div>
                   </div>

                   {output && (
                     <div className="bg-gray-900 rounded-2xl p-6 overflow-hidden">
                        <div className="flex items-center justify-between mb-4">
                           <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Execution Output</span>
                           <button onClick={() => setOutput("")} className="text-gray-500 hover:text-white text-xs">Clear</button>
                        </div>
                        <pre className="text-green-400 font-mono text-xs overflow-x-auto whitespace-pre-wrap">
                           {output}
                        </pre>
                     </div>
                   )}
                </div>
              ) : (
                <div className="grid gap-3">
                  {currentQ.options.map((option, index) => (
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
              )}
            </div>

            <div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
              <button
                onClick={() => toggleMarkForReview(currentQuestion)}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all ${
                  markedForReview[currentQuestion] 
                  ? 'bg-amber-100 text-amber-700 border border-amber-200' 
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                <FontAwesomeIcon icon={faFlag} className={markedForReview[currentQuestion] ? 'text-amber-500' : 'text-gray-400'} />
                {markedForReview[currentQuestion] ? 'Flagged for Review' : 'Mark for Review'}
              </button>
              
              <div className="flex gap-3">
                {currentQuestion > 0 && (
                  <button
                    onClick={previousQuestion}
                    className="bg-white border border-gray-200 text-gray-700 px-6 py-2.5 rounded-xl font-bold hover:bg-gray-50 transition-all"
                  >
                    Previous
                  </button>
                )}
                {currentQuestion === questions.length - 1 ? (
                  <button
                    onClick={() => handleSubmitExam("Manual submission")}
                    className="bg-green-600 text-white px-8 py-2.5 rounded-xl font-bold hover:bg-green-700 transition-all shadow-lg shadow-green-100 active:scale-95"
                  >
                    Submit Final Exam
                  </button>
                ) : (
                  <button
                    onClick={nextQuestion}
                    className="bg-blue-600 text-white px-8 py-2.5 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 active:scale-95 flex items-center gap-2"
                  >
                    Next Question
                    <FontAwesomeIcon icon={faArrowRight} />
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white p-6 rounded-[1.5rem] shadow-sm border border-gray-100">
              <h4 className="text-sm font-black text-gray-800 uppercase tracking-widest mb-6 flex items-center gap-2">
                 <FontAwesomeIcon icon={faUser} className="text-blue-500" />
                 Question Navigator
              </h4>
              <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 xl:grid-cols-4 gap-2">
                {questions.map((_, index) => {
                  let statusColor = "bg-gray-100 text-gray-400";
                  let borderColor = "border-transparent";
                  
                  if (currentQuestion === index) {
                    borderColor = "border-blue-500 ring-4 ring-blue-50";
                  }

                  if (markedForReview[index]) {
                    statusColor = "bg-amber-500 text-white";
                  } else if (answers[index] !== null) {
                    statusColor = "bg-blue-600 text-white shadow-md";
                  } else if (visitedQuestions[index]) {
                    statusColor = "bg-red-50 text-red-400";
                  }

                  return (
                    <button
                      key={index}
                      onClick={() => goToQuestion(index)}
                      className={`h-10 w-full rounded-lg text-xs font-black transition-all border-2 ${statusColor} ${borderColor}`}
                    >
                      {index + 1}
                    </button>
                  );
                })}
              </div>
              
              <div className="mt-8 pt-6 border-t border-gray-100 grid grid-cols-2 gap-4">
                 <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-600"></div>
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">Answered</span>
                 </div>
                 <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">Flagged</span>
                 </div>
                 <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-100"></div>
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">Skipped</span>
                 </div>
                 <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-gray-100"></div>
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">Pending</span>
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

export default MonthlyExam;
