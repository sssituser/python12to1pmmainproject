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

const PythonExam = () => {

  const navigate = useNavigate();
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const faceDetectionIntervalRef = useRef(null);

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState(new Array(20).fill(null));
  const [markedForReview, setMarkedForReview] = useState(new Array(20).fill(false));
  const [visitedQuestions, setVisitedQuestions] = useState(new Array(20).fill(false));

  const [timeLeft, setTimeLeft] = useState(2700);
  const [examStarted, setExamStarted] = useState(false);
  const [examSubmitted, setExamSubmitted] = useState(false);
  const [webcamActive, setWebcamActive] = useState(false);
  const [faceCount, setFaceCount] = useState(0);
  const [examFailed, setExamFailed] = useState(false);

  // QUESTIONS
  const questions = [
    { id:1, question:"What is the output of print(2 ** 3)?", options:["6","8","9","12"], correct:1 },
    { id:2, question:"Which keyword is used to define a function in Python?", options:["func","def","function","define"], correct:1 },
    { id:3, question:"What is the correct file extension for Python files?", options:[".py",".python",".pt",".pyth"], correct:0 },
    { id:4, question:"Which of the following is a mutable data type in Python?", options:["Tuple","String","List","Integer"], correct:2 },
    { id:5, question:"What does len() function do in Python?", options:["Returns the length of an object","Deletes an object","Creates an object","Copies an object"], correct:0 },
    { id:6, question:"Which operator is used for exponentiation in Python?", options:["^","**","*","^^"], correct:1 },
    { id:7, question:"What is the output of print(type('Hello'))?", options:["<class 'int'>","<class 'str'>","<class 'string'>","<class 'char'>"], correct:1 },
    { id:8, question:"Which method is used to add an element to the end of a list?", options:["add()","append()","insert()","extend()"], correct:1 },
    { id:9, question:"What is the correct way to create a dictionary in Python?", options:["{}","[]","()","||"], correct:0 },
    { id:10, question:"Which statement is used to exit a loop in Python?", options:["exit","break","continue","return"], correct:1 },
    { id:11, question:"What is the output of print(10 // 3)?", options:["3.33","3","4","Error"], correct:1 },
    { id:12, question:"Which function is used to get input from user in Python 3?", options:["input()","raw_input()","scanf()","cin()"], correct:0 },
    { id:13, question:"What is the default value of a parameter if not specified?", options:["0","None","null","undefined"], correct:1 },
    { id:14, question:"Which module is used for mathematical operations in Python?", options:["math","cmath","maths","calc"], correct:0 },
    { id:15, question:"What is the output of print(bool(0))?", options:["True","False","0","Error"], correct:1 },
    { id:16, question:"Which method removes whitespace from both ends of a string?", options:["trim()","strip()","remove()","clean()"], correct:1 },
    { id:17, question:"What is the output of print(range(5))?", options:["[0,1,2,3,4]","range(0,5)","0,1,2,3,4","Error"], correct:1 },
    { id:18, question:"Which keyword is used to handle exceptions in Python?", options:["try","except","catch","handle"], correct:1 },
    { id:19, question:"What is the output of print('Hello' * 3)?", options:["HelloHelloHello","Hello 3","Hello3","Error"], correct:0 },
    { id:20, question:"Which function is used to open a file in Python?", options:["open()","file()","read()","load()"], correct:0 },
  ];

  // TIMER
  useEffect(() => {
    if (examStarted && !examSubmitted && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
    if (timeLeft === 0 && !examSubmitted) handleSubmitExam();
  }, [timeLeft, examStarted, examSubmitted]);

  // WEBCAM FUNCTIONS
  const startWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 320 },
          height: { ideal: 240 }
        } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setWebcamActive(true);
        
        // Start face detection interval
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
      setWebcamActive(false);
    }
    
    if (faceDetectionIntervalRef.current) {
      clearInterval(faceDetectionIntervalRef.current);
      faceDetectionIntervalRef.current = null;
    }
  };

  const startFaceDetection = () => {
    // Simple face detection simulation (you can replace with actual face detection)
    faceDetectionIntervalRef.current = setInterval(() => {
      // Simulate random face count between 0-2
      const randomFaceCount = Math.floor(Math.random() * 3);
      setFaceCount(randomFaceCount);
      
      // If no face detected for more than 5 seconds, you can add logic here
      if (randomFaceCount === 0) {
        console.log("No face detected");
      }
    }, 2000);
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

  const startExam = () => {
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
  const handleSubmitExam = async () => {
    setExamSubmitted(true);
    stopWebcam(); // Stop webcam when submitting

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
      score: correctCount * 2, // Each question carries 2 marks (total 40)
      marks: correctCount * 2, // Total marks obtained
      totalMarks: 40, // Total possible marks
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
      examTitle: "Python Programming Assessment"
    };

    const now = new Date().toISOString();
    const payload = {
      username: user.username || "Unknown",
      exam_title: "Python Programming Assessment",
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
      // No auth header — token expires during a 45-min exam.
      // Backend uses 'username' field in the payload to identify the user.
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
            Python Programming Exam
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
                    onClick={handleSubmitExam}
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
}

export default PythonExam;