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

// Indestructible global array to catch all streams outside React DOM scope
let globalStreamsToClean = [];

const MonthlyExam = () => {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const faceDetectionIntervalRef = useRef(null);
  const violationStartTimeRef = useRef(null);
  const cleanTimeoutRef = useRef(null);

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState(new Array(50).fill(null));
  const [markedForReview, setMarkedForReview] = useState(new Array(50).fill(false));
  const [visitedQuestions, setVisitedQuestions] = useState(new Array(50).fill(false));

  const [timeLeft, setTimeLeft] = useState(4500); // 75 minutes for monthly exam
  const [examStarted, setExamStarted] = useState(false);
  const [examSubmitted, setExamSubmitted] = useState(false);
  const examSubmittedRef = useRef(false);
  const [webcamActive, setWebcamActive] = useState(false);
  const [faceCount, setFaceCount] = useState(0);
  const [examFailed, setExamFailed] = useState(false);

  const [questions, setQuestions] = useState([]);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(true);

  // Fetch 50 randomized questions from backend pool
  useEffect(() => {
    const fetchQuestionsFromBackend = async () => {
      // Always clear any previous session state for fresh start
      try {
        sessionStorage.removeItem('monthlyExamState');
      } catch (e) {}

      try {
        setIsLoadingQuestions(true);
        const res = await fetch("http://127.0.0.1:8000/api/playground-questions/");
        const json = await res.json();
        
        if (json.success && json.data && json.data.length > 0) {
          // For monthly exam, ensure we have 50 questions
          let monthlyQuestions;
          
          if (json.data.length >= 50) {
            // If backend has 50+ questions, use first 50
            monthlyQuestions = json.data.slice(0, 50);
          } else {
            // If backend has less than 50 questions,
            const targetCount = 50;
            const availableQuestions = json.data;
            monthlyQuestions = [];
            
            // Calculate how many times we need to repeat the available questions
            const repeatTimes = Math.ceil(targetCount / availableQuestions.length);
            
            // Add questions until we reach target count
            for (let i = 0; i < repeatTimes; i++) {
              monthlyQuestions.push(...availableQuestions);
            }
            
            // Trim to exactly 50 questions
            monthlyQuestions = monthlyQuestions.slice(0, targetCount);
          }
          
          const mappedQuestions = monthlyQuestions.map((q, idx) => ({ ...q, id: idx + 1 }));
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

  const startExam = async () => {
    // Reset all exam state for fresh start
    setAnswers(new Array(50).fill(null));
    setMarkedForReview(new Array(50).fill(false));
    setVisitedQuestions(new Array(50).fill(false));
    setCurrentQuestion(0);
    setTimeLeft(4500);
    setExamSubmitted(false);
    examSubmittedRef.current = false;
    
    // Clear any potential cached state
    try {
      sessionStorage.removeItem('monthlyExamState');
      localStorage.removeItem('examResult');
      localStorage.removeItem('allExamResults');
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

    answers.forEach((ans, index) => {
      if (ans === questions[index].correct) correctCount++;
    });

    const result = {
      status: "completed",
      correctAnswers: correctCount,
      incorrectAnswers: 50 - correctCount,
      totalQuestions: 50,
      score: correctCount * 2,
      marks: correctCount * 2,
      totalMarks: 100,
      answers,
      questions,
      timeTaken: 4500 - timeLeft,
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
      score: correctCount * 2,
      total_questions: 50,
      correct_answers: correctCount,
      incorrect_answers: 50 - correctCount,
      marks_obtained: correctCount * 2,
      total_marks: 100,
      time_taken: 4500 - timeLeft,
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
            50 Questions • 75 Minutes
          </p>
          <button
            onClick={startExam}
            disabled={isLoadingQuestions}
            className={`px-6 py-3 rounded-lg text-white font-semibold transition-all ${
              isLoadingQuestions ? 'bg-gray-400 cursor-not-allowed animate-pulse' : 'bg-indigo-600 hover:bg-indigo-700 shadow-md'
            }`}
          >
            {isLoadingQuestions ? 'Fetching Assessment Paper...' : 'Start Exam'}
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
            <FontAwesomeIcon icon={faClock}/>
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
                {currentQuestion === questions.length - 1 ? (
  <button
    onClick={() => handleSubmitExam("Manual submission")}
    className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
  >
    Submit Exam
  </button>
) : (
  <button
    onClick={nextQuestion}
    className="bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700"
  >
    Next
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
      </div>
    </div>
  );
};

export default MonthlyExam;
