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
  const canvasRef = useRef(null);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
  const [isAILoading, setIsAILoading] = useState(false);
  const [examStarted, setExamStarted] = useState(false);
  const [examSubmitted, setExamSubmitted] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [markedForReview, setMarkedForReview] = useState([]);
  const [visitedQuestions, setVisitedQuestions] = useState([]);
  const [timeLeft, setTimeLeft] = useState(2700);
  const [webcamActive, setWebcamActive] = useState(false);
  const [faceCount, setFaceCount] = useState(1);
  const [examFailed, setExamFailed] = useState(false);

  const examSubmittedRef = useRef(false);
  const violationStartTimeRef = useRef(null);
  const cleanTimeoutRef = useRef(null);

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
    const fetchQuestionsFromBackend = async () => {
      // Always start fresh - don't restore previous exam state
      try {
        sessionStorage.removeItem('pythonExamState');
      } catch (e) {}

      try {
        setIsLoadingQuestions(true);
        const res = await fetch("http://127.0.0.1:8000/api/playground-questions/");
        const json = await res.json();
        
        if (json.success && json.data && json.data.length > 0) {
          // For daily exam, use all returned questions (typically 20)
          const dailyQuestions = json.data.slice(0, 20);
          const mappedQuestions = dailyQuestions.map((q, idx) => ({ ...q, id: idx + 1 }));
          setQuestions(mappedQuestions);
        }
      } catch (err) {
        console.error("Failed to fetch questions from backend:", err);
      } finally {
        setIsLoadingQuestions(false);
      }
    };
    
    fetchQuestionsFromBackend();
  }, []);

  // Prevent browser refresh and back button during exam
  useEffect(() => {
    if (examStarted && !examSubmitted) {
      // Prevent F5, Ctrl+R, Ctrl+Shift+R refresh
      const preventRefresh = (e) => {
  if (
    e.key === "F5" ||
    (e.ctrlKey && e.key === "r") ||
    (e.ctrlKey && e.shiftKey && e.key === "r") ||
    // arrow keys
    ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key) ||
    // ctrl + tab
    (e.ctrlKey && e.key === "Tab") ||
    // ctrl + shift + tab
    (e.ctrlKey && e.shiftKey && e.key === "Tab") ||
    // alt back
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
          } else if (Date.now() - violationStartTimeRef.current > 2000) {
            handleSubmitExam("Camera/face violation detected");
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
      if (document.hidden) {
        violationCount++;
        handleSubmitExam("Tab switching detected");
      }
    };

    // ALT+TAB / MINIMIZE
    const handleBlur = () => {
      violationCount++;
      handleSubmitExam("Window focus lost");
    };

    //  DEVTOOLS DETECTION
    const detectDevTools = () => {
      if (
        window.outerWidth - window.innerWidth > 160 ||
        window.outerHeight - window.innerHeight > 160
      ) {
        handleSubmitExam("DevTools opened");
      }
    };

    const devtoolsInterval = setInterval(detectDevTools, 1000);
    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("blur", handleBlur);
    cleanup = () => {
      clearInterval(interval);
      clearInterval(devtoolsInterval);
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("blur", handleBlur);
    };
  };
  startSecurityMonitoring();
  return () => {
    stopWebcam();
    cleanup();
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
    setTimeLeft(2700);
    setExamSubmitted(false);
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

    let correctCount = 0;

    answers.forEach((ans, index) => {
      if (questions[index] && ans === questions[index].correct) correctCount++;
    });

    const totalQ = questions.length || 20;

    const result = {
      status: "completed",
      correctAnswers: correctCount,
      incorrectAnswers: totalQ - correctCount,
      totalQuestions: totalQ,
      score: correctCount * 2,
      marks: correctCount * 2,
      totalMarks: totalQ * 2,
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

  return (
    <div className="min-h-screen bg-gray-50 p-6 relative">

      {/* Webcam overlay positioned at bottom-left */}
      <div className="fixed bottom-4 left-4 z-50 bg-white rounded-lg shadow-lg p-2">
        <div className="relative">
        <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-48 h-36 rounded border-2 border-gray-300"
        style={{ transform: 'scaleX(-1)' }}/>

  {/* ✅ ADD HERE */}
  <canvas ref={canvasRef} style={{ display: "none" }} />

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
