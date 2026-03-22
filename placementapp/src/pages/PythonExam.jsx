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

const PythonExam = () => {

  const navigate = useNavigate();
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const faceDetectionIntervalRef = useRef(null);
  const fingerDetectionTimerRef = useRef(null);
  const violationStartTimeRef = useRef(null);
  const cleanTimeoutRef = useRef(null);

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState(new Array(20).fill(null));
  const [markedForReview, setMarkedForReview] = useState(new Array(20).fill(false));
  const [visitedQuestions, setVisitedQuestions] = useState(new Array(20).fill(false));

  const [timeLeft, setTimeLeft] = useState(2700);
  const [examStarted, setExamStarted] = useState(false);
  const [examSubmitted, setExamSubmitted] = useState(false);
  const examSubmittedRef = useRef(false);
  const [webcamActive, setWebcamActive] = useState(false);
  const [faceCount, setFaceCount] = useState(0);
  const [examFailed, setExamFailed] = useState(false);
  const [isAILoading, setIsAILoading] = useState(true);
  const isUnloadingRef = useRef(false);

  // Vladmandic FaceAPI AI
  const faceApiReadyRef = useRef(false);

  useEffect(() => {
    const loadAI = async () => {
      try {
        setIsAILoading(true);
        // Load modernized models with perfect CORS & MIME types hosted on Github Pages
        await faceapi.nets.tinyFaceDetector.loadFromUri('https://vladmandic.github.io/face-api/model/');
        faceApiReadyRef.current = true;
        setIsAILoading(false);
        console.log("Modern FaceAPI AI Armed!");
      } catch (err) {
        console.error("Failed to arm FaceAPI AI:", err);
        setIsAILoading(false); // Fallback to let them test anyway
      }
    };
    loadAI();
  }, []);

  // Enhanced security states
  const [fingerDetectionTimer, setFingerDetectionTimer] = useState(null);
  const [noFaceTimer, setNoFaceTimer] = useState(null);

  // Control global browser back button for pre-exam screen
  useEffect(() => {
    if (!examStarted && !examSubmitted) {
      window.allowBrowserBack = true;

      const handleBrowserBack = (e) => {
        // Explicitly intercept the back action and aggressively route to techlab
        navigate('/dashboard/techlab');

        // Safety fallback in case React Router's internal state is corrupted
        setTimeout(() => {
          if (!window.location.pathname.includes('techlab')) {
            window.location.href = '/dashboard/techlab';
          }
        }, 50);
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

  // Get exam type from URL or localStorage (default to daily)
  const getExamType = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const urlExamType = urlParams.get('type');
    if (urlExamType) return urlExamType;

    const storedExamType = localStorage.getItem('currentExamType');
    return storedExamType || 'daily';
  };

  const examType = getExamType();

  // CONNECTED TO DJANGO PLAYGROUND API
  const [questions, setQuestions] = useState([]);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(true);

  // Fetch 20 randomized questions from the 50 static backend pool
  useEffect(() => {
    const fetchQuestionsFromBackend = async () => {
      // Very Important: Check session cache FIRST! If user hits 'refresh', we MUST keep their existing shuffled 20 questions!
      const savedStateStr = sessionStorage.getItem('pythonExamState');
      if (savedStateStr) {
        try {
          const savedState = JSON.parse(savedStateStr);
          // ONLY restore if the exam is active and hasn't been submitted!
          if (savedState.questions && savedState.questions.length > 0 && savedState.examStarted && !savedState.examSubmitted) {
            setQuestions(savedState.questions);
            setIsLoadingQuestions(false);
            return;
          }
        } catch (e) {}
      }

      try {
        setIsLoadingQuestions(true);
        const res = await fetch("http://127.0.0.1:8000/api/playground-questions/");
        const json = await res.json();
        
        if (json.success && json.data && json.data.length > 0) {
          // Re-map internal ID just in case existing logic relies on sequential 1-20 IDs
          const mappedQuestions = json.data.map((q, idx) => ({ ...q, id: idx + 1 }));
          setQuestions(mappedQuestions);
        }
      } catch (err) {
        console.error("Failed to fetch 50 static questions from backend:", err);
      } finally {
        setIsLoadingQuestions(false);
      }
    };
    
    fetchQuestionsFromBackend();
  }, [examType]);

  // Load state from sessionStorage if it exists
  useEffect(() => {
    const savedStateStr = sessionStorage.getItem('pythonExamState');
    if (savedStateStr) {
      try {
        const savedState = JSON.parse(savedStateStr);
        if (savedState.examStarted && !savedState.examSubmitted) {
          setAnswers(savedState.answers);
          setMarkedForReview(savedState.markedForReview);
          setVisitedQuestions(savedState.visitedQuestions);
          setTimeLeft(savedState.timeLeft);
          setCurrentQuestion(savedState.currentQuestion);
          setExamStarted(true);
          examSubmittedRef.current = false;
          // Resume webcam if not already active
          setTimeout(() => {
            if (videoRef.current && !webcamActive) {
              startWebcam();
            }
          }, 500);
        }
      } catch (e) {
        console.error("Failed to restore exam state", e);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      sessionStorage.setItem('pythonExamState', JSON.stringify(stateToSave));
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

  // Security locks: backspace, context menu, mouse back buttons
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Block ALL back button combinations - MORE AGGRESSIVE
      if (e.key === 'Backspace' ||
        e.key === 'browserBack' ||
        (e.altKey && e.key === 'ArrowLeft') ||
        (e.altKey && e.keyCode === 37) ||
        (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA' && e.keyCode === 8)) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        return false;
      }
    };

    // Handle browser back/forward buttons
    const handlePopState = (e) => {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();

      // Push state again to block the navigation without reloading the page
      window.history.pushState(null, null, window.location.href);
      return false;
    };

    // Block mouse back button
    const handleMouseUp = (e) => {
      if (e.button === 3 || e.button === 4) { // Mouse back/forward buttons
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        return false;
      }
    };

    // Block right-click context menu
    const handleContextMenu = (e) => {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      return false;
    };

    // Only add event listeners if exam has started
    if (examStarted && !examSubmitted) {
      window.addEventListener('keydown', handleKeyDown, true);
      window.addEventListener('contextmenu', handleContextMenu, true);
      window.addEventListener('popstate', handlePopState, true);
      window.addEventListener('mouseup', handleMouseUp, true);

      // Push multiple states to completely block back navigation
      window.history.pushState({ examActive: true, timestamp: Date.now() }, '', window.location.href);
      window.history.pushState({ examActive: true, timestamp: Date.now() + 1 }, '', window.location.href);

      // Override history methods - MORE AGGRESSIVE
      const originalBack = window.history.back;
      const originalGo = window.history.go;
      const originalForward = window.history.forward;

      window.history.back = () => {
        window.history.pushState(null, null, window.location.href);
        return false;
      };

      window.history.go = (delta) => {
        if (delta < 0) {
          window.history.pushState(null, null, window.location.href);
          return false;
        }
        return originalGo.call(window.history, delta);
      };

      window.history.forward = () => {
        return false;
      };

      return () => {
        window.removeEventListener('keydown', handleKeyDown, true);
        window.removeEventListener('contextmenu', handleContextMenu, true);
        window.removeEventListener('popstate', handlePopState, true);
        window.removeEventListener('mouseup', handleMouseUp, true);

        // Restore original methods
        window.history.back = originalBack;
        window.history.go = originalGo;
        window.history.forward = originalForward;
      };
    }
  }, [examStarted, examSubmitted]);

  // Block Tab Switching, but NOT when the user is genuinely refreshing the page!
  useEffect(() => {
    const handleBeforeUnload = () => {
      isUnloadingRef.current = true;
    };
    window.addEventListener("beforeunload", handleBeforeUnload);

    const handleVisibilityChange = () => {
      if (!isUnloadingRef.current && document.hidden && document.visibilityState === 'hidden' && examStarted && !examSubmitted) {
        handleSubmitExam("Tab switched or window minimized");
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [examStarted, examSubmitted]);

  // WEBCAM FUNCTIONS
  const startWebcam = async () => {
    // Attempt proactive cleanup of any existing local resources
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 320 },
          height: { ideal: 240 }
        },
        audio: false // No audio capture
      });

      // Inject directly into global cleanup trap
      globalStreamsToClean.push(stream);

      // Stop stream immediately if the exam was already submitted or window unmounted
      if (examSubmittedRef.current || !videoRef.current) {
        stopWebcam(); // Fire the global nuke
        return;
      }

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setWebcamActive(true);

        // Start enhanced face detection
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

    // Nuke all trapped background streams
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

    if (fingerDetectionTimer) {
      clearTimeout(fingerDetectionTimer);
      setFingerDetectionTimer(null);
    }
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
        const r = data[i], g = data[i + 1], b = data[i + 2];
        rTotal += r; gTotal += g; bTotal += b;

        // Prevent false edge-jumps by skipping the right-most pixel wrapping around to the left
        if (((i / 4) + 1) % canvas.width === 0) continue;

        // Calculate absolute contrast jump between this pixel and the immediate next pixel
        const diff = Math.abs(r - data[i + 4]) + Math.abs(g - data[i + 5]) + Math.abs(b - data[i + 6]);
        if (diff > maxAdjacentDiff) {
          maxAdjacentDiff = diff;
        }
      }

      const pixelCount = canvas.width * canvas.height;
      const avgBrightness = (0.299 * (rTotal / pixelCount) + 0.587 * (gTotal / pixelCount) + 0.114 * (bTotal / pixelCount));

      const isDark = avgBrightness < 40;
      const isRedDominant = (rTotal > gTotal * 2) && (rTotal > bTotal * 2);

      // If the absolutely sharpest edge in the entire video feed is extremely weak (< 85 combined RGB difference),
      // the video is definitively blurred out by Software (e.g., OBS Gaussian Blur) or physically blocked by an object at 0mm focal depth.
      // Normal human features (like eyes, hair, teeth) create native pixel jumps well over 150+.
      const isBlurred = maxAdjacentDiff < 85;

      const checkViolations = (detectedCount) => {
        const isCameraCovered = isDark || isBlurred || isRedDominant;
        const isMultipleFaces = detectedCount > 1;

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
              console.log("✅ Security violation condition cleared.");
            }, 1000); // Require 1 full second of clean image to reset the penalty
          }
        }
      };

      // Deep-Learning Face Detection built for slanted/tilted faces
      if (faceApiReadyRef.current && videoRef.current) {
        const video = videoRef.current;
        // The DOM must be fully buffered before AI can scan it
        if (video.readyState < 2 || video.videoWidth === 0) {
          return;
        }

        try {
          // Highly tuned detector specific for tricky angles: High Input Size, low threshold
          // 🔥 MORE ACCURATE DETECTOR SETTINGS
          const options = new faceapi.TinyFaceDetectorOptions({
            inputSize: 512,
            scoreThreshold: 0.05
          });

          faceapi.detectAllFaces(video, options).then(predictions => {
            const totalFacesDetected = predictions.length || 0;

            // ✅ DEBUG (VERY IMPORTANT)
            console.log("Faces detected:", totalFacesDetected);

            setFaceCount(totalFacesDetected);

            // 🔥 FORCE MULTIPLE FACE CHECK
            if (totalFacesDetected >= 2) {
              console.log("🚨 MULTIPLE FACES DETECTED");

              if (!violationStartTimeRef.current) {
                violationStartTimeRef.current = Date.now();
              } else if (Date.now() - violationStartTimeRef.current >= 2000) {
                handleSubmitExam("Multiple faces detected");
              }
            } else {
              // Reset timer if normal
              violationStartTimeRef.current = null;
            }

            // ✅ Keep existing checks also
            checkViolations(totalFacesDetected);

          }).catch(e => {
            console.error("Face scan error", e);
            checkViolations(1);
          });
        } catch (err) {
          checkViolations(1);
        }
      } else {
        checkViolations(1);
      }
    }, 100); // 5 frames per second for ultra-accurate mapping
  };

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
      examTitle: "Python Programming Assessment"
    };

    localStorage.setItem("examFailure", JSON.stringify(failureResult));
    navigate("/dashboard/exam-failed");
  };

  const startExam = async () => {
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

    let correctCount = 0;

    answers.forEach((ans, index) => {
      if (ans === questions[index].correct) correctCount++;
    });

    const result = {
      status: "completed",
      correctAnswers: correctCount,
      incorrectAnswers: 20 - correctCount,
      totalQuestions: 20,
      score: correctCount * 2,
      marks: correctCount * 2,
      totalMarks: 40,
      answers,
      questions,
      timeTaken: 2700 - timeLeft,
      user: {
        username: user.username || "Unknown",
        email: user.email || "",
        firstName: user.firstName || user.username,
        randomId
      },
      examDate: new Date().toISOString(),
      examTitle: "Python Programming Assessment",
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

          <FontAwesomeIcon icon={faCamera} className="text-4xl text-indigo-600 mb-4" />

          <h2 className="text-2xl font-bold mb-2">
            {examType === 'daily' ? 'Python Programming Assessment' : `${examType.charAt(0).toUpperCase() + examType.slice(1)} Python Programming Assessment`}
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

  return (
    <div className="min-h-screen bg-gray-50 p-6 relative">

      {/* Webcam overlay (moved to bottom right so it doesn't obscure questions) */}
      <div className="fixed bottom-8 right-8 z-50 bg-white rounded-lg shadow-lg p-2">
        <div className="relative">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-48 h-36 rounded border-2 border-gray-300"
            style={{ transform: 'scaleX(-1)' }}
          />
          {!webcamActive && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-200 rounded">
              <FontAwesomeIcon icon={faCamera} className="text-gray-400 text-2xl" />
            </div>
          )}
          <div className="absolute top-1 right-1">
            <div className={`w-3 h-3 rounded-full ${webcamActive ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}></div>
          </div>
        </div>
        <div className="text-xs text-center mt-1">
          {webcamActive ? 'Recording' : 'Inactive'}
        </div>
      </div>

      <div className="max-w-6xl mx-auto">

        <div className="bg-white p-4 rounded shadow flex justify-between mb-4">

          <div className="flex items-center gap-2">
            <FontAwesomeIcon icon={faClock} />
            {formatTime(timeLeft)}
          </div>

          <div>
            Question {currentQuestion + 1} / {questions.length}
          </div>

        </div>

        <div className="grid grid-cols-4 gap-4">

          <div className="col-span-3 bg-white p-6 rounded shadow">

            <h3 className="font-semibold mb-4">
              Q{currentQuestion + 1}: {questions[currentQuestion].question}
            </h3>

            {questions[currentQuestion].options.map((option, index) => (

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

            <h4 className="font-semibold mb-3">
              Questions
            </h4>

            <div className="grid grid-cols-5 gap-2">

              {questions.map((_, index) => {
                // Determine button color based on state
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

      </div>

    </div>
  );
};

export default PythonExam;