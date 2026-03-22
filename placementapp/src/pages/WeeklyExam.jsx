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

const WeeklyExam = () => {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const faceDetectionIntervalRef = useRef(null);
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

  // WEEKLY EXAM QUESTIONS - Different from Daily Exam
  const questions = [
    { id:1, question:"What is the purpose of the __init__ method in Python?", options:["Constructor","Destructor","Iterator","Generator"], correct:0 },
    { id:2, question:"Which of the following is not a valid Python data type?", options:["int","float","char","str"], correct:2 },
    { id:3, question:"What does the 'self' parameter represent in Python methods?", options:["Current instance","Class name","Method name","Parent class"], correct:0 },
    { id:4, question:"Which method is used to find the index of an element in a list?", options:["index()","find()","search()","locate()"], correct:0 },
    { id:5, question:"What is the output of print(2 + 3 * 2)?", options:["10","12","8","7"], correct:0 },
    { id:6, question:"Which keyword is used to define a class in Python?", options:["class","Class","def","define"], correct:0 },
    { id:7, question:"What is the output of print(len('Python'))?", options:["5","6","7","Error"], correct:1 },
    { id:8, question:"Which method is used to sort a list in Python?", options:["sort()","sorted()","order()","arrange()"], correct:0 },
    { id:9, question:"What is the output of print(3 ** 2 ** 1)?", options:["9","27","81","3"], correct:0 },
    { id:10, question:"Which function is used to convert a string to uppercase?", options:["upper()","uppercase()","toUpper()","toUpperCase()"], correct:0 },
    { id:11, question:"What is the output of print(bool([]))?", options:["True","False","[]","Error"], correct:1 },
    { id:12, question:"Which operator is used for floor division in Python?", options:["//","/","%","%%"], correct:0 },
    { id:13, question:"What is the output of print(type(5))?", options:["<class 'int'>","<class 'float'>","<class 'number'>","<class 'digit'>"], correct:0 },
    { id:14, question:"Which method is used to remove the last element from a list?", options:["pop()","remove()","delete()","del()"], correct:0 },
    { id:15, question:"What is the output of print('Hello'[-1])?", options:["o","H","Error","Hello"], correct:0 },
    { id:16, question:"Which keyword is used to import modules in Python?", options:["import","include","require","using"], correct:0 },
    { id:17, question:"What is the output of print(list((1,2,3)))?", options:["[1, 2, 3]","(1, 2, 3)","Error","[1, 2, 3, ]"], correct:0 },
    { id:18, question:"Which method is used to join strings in a list?", options:["join()","concat()","merge()","combine()"], correct:0 },
    { id:19, question:"What is the output of print(10 % 3)?", options:["1","3","0","10"], correct:0 },
    { id:20, question:"Which function is used to get the type of a variable in Python?", options:["type()","typeof()","gettype()","vartype()"], correct:0 },
  ];

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

  // Prevent back button
  useEffect(() => {
    if (examStarted && !examSubmitted) {
      window.history.pushState(null, null, window.location.href);
      const handlePopState = (e) => {
        window.history.pushState(null, null, window.location.href);
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
        video: { width: { ideal: 320 }, height: { ideal: 240 } },
        audio: false // No audio capture
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

      // Create a heavily downscaled canvas to completely destroy any Auto-ISO camera static noise
      const tinyCanvas = document.createElement("canvas");
      tinyCanvas.width = 16;
      tinyCanvas.height = 16;
      const tCtx = tinyCanvas.getContext("2d");
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

  const startExam = () => {
    setExamStarted(true);
    startWebcam();
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
      incorrectAnswers: 20 - correctCount,
      totalQuestions: 20,
      score: correctCount * 2,
      marks: correctCount * 2,
      totalMarks: 40,
      answers: answers,
      questions: questions,
      timeTaken: 2700 - timeLeft,
      user: {
        username: user.username || "Unknown",
        email: user.email || "",
        firstName: user.firstName || user.username,
        randomId: randomId
      },
      examDate: new Date().toISOString(),
      examTitle: "Weekly Python Programming Assessment",
      examType: "weekly"
    };

    const now = new Date().toISOString();
    const payload = {
      username: user.username || "Unknown",
      exam_title: "Weekly Python Programming Assessment",
      exam_type: "weekly",
      score: correctCount * 2,
      total_questions: 20,
      correct_answers: correctCount,
      incorrect_answers: 20 - correctCount,
      marks_obtained: correctCount * 2,
      total_marks: 40,
      time_taken: 2700 - timeLeft,
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
            Weekly Python Programming Exam
          </h2>
          <p className="text-gray-600 mb-6">
            20 Questions • 45 Minutes
          </p>
          <button
            onClick={startExam}
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700"
          >
            Start Exam
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 relative">
      {/* Webcam at Top Left */}
      <div className="fixed top-4 left-4 z-50 bg-white rounded-lg shadow-lg p-2">
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

export default WeeklyExam;
