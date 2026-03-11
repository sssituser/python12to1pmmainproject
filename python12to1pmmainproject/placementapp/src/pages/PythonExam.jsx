import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClock, faUser, faCircle, faFlag, faArrowRight, faCamera } from "@fortawesome/free-solid-svg-icons";

const PythonExam = () => {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const faceDetectionIntervalRef = useRef(null);
  
  // Exam state
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState(new Array(20).fill(null));
  const [markedForReview, setMarkedForReview] = useState(new Array(20).fill(false));
  const [visitedQuestions, setVisitedQuestions] = useState(new Array(20).fill(false));
  const [timeLeft, setTimeLeft] = useState(90); // 1:30 in seconds
  const [examStarted, setExamStarted] = useState(false);
  const [examSubmitted, setExamSubmitted] = useState(false);
  const [webcamActive, setWebcamActive] = useState(false);
  const [faceCount, setFaceCount] = useState(0);
  const [examFailed, setExamFailed] = useState(false);

  // Python MCQ Questions
  const questions = [
    {
      id: 1,
      question: "What is the output of print(2 ** 3)?",
      options: ["6", "8", "9", "12"],
      correct: 1
    },
    {
      id: 2,
      question: "Which keyword is used to define a function in Python?",
      options: ["func", "def", "function", "define"],
      correct: 1
    },
    {
      id: 3,
      question: "What is the correct file extension for Python files?",
      options: [".py", ".python", ".pt", ".pyth"],
      correct: 0
    },
    {
      id: 4,
      question: "Which of the following is a mutable data type in Python?",
      options: ["Tuple", "String", "List", "Integer"],
      correct: 2
    },
    {
      id: 5,
      question: "What does len() function do in Python?",
      options: ["Returns the length of an object", "Deletes an object", "Creates an object", "Copies an object"],
      correct: 0
    },
    {
      id: 6,
      question: "Which operator is used for exponentiation in Python?",
      options: ["^", "**", "*", "^^"],
      correct: 1
    },
    {
      id: 7,
      question: "What is the output of print(type('Hello'))?",
      options: ["<class 'int'>", "<class 'str'>", "<class 'string'>", "<class 'char'>"],
      correct: 1
    },
    {
      id: 8,
      question: "Which method is used to add an element to the end of a list?",
      options: ["add()", "append()", "insert()", "extend()"],
      correct: 1
    },
    {
      id: 9,
      question: "What is the correct way to create a dictionary in Python?",
      options: ["{}", "[]", "()", "||"],
      correct: 0
    },
    {
      id: 10,
      question: "Which statement is used to exit a loop in Python?",
      options: ["exit", "break", "continue", "return"],
      correct: 1
    },
    {
      id: 11,
      question: "What is the output of print(10 // 3)?",
      options: ["3.33", "3", "4", "Error"],
      correct: 1
    },
    {
      id: 12,
      question: "Which function is used to get input from user in Python 3?",
      options: ["input()", "raw_input()", "scanf()", "cin()"],
      correct: 0
    },
    {
      id: 13,
      question: "What is the default value of a parameter if not specified?",
      options: ["0", "None", "null", "undefined"],
      correct: 1
    },
    {
      id: 14,
      question: "Which module is used for mathematical operations in Python?",
      options: ["math", "cmath", "maths", "calc"],
      correct: 0
    },
    {
      id: 15,
      question: "What is the output of print(bool(0))?",
      options: ["True", "False", "0", "Error"],
      correct: 1
    },
    {
      id: 16,
      question: "Which method is used to remove whitespace from both ends of a string?",
      options: ["trim()", "strip()", "remove()", "clean()"],
      correct: 1
    },
    {
      id: 17,
      question: "What is the output of print(range(5))?",
      options: ["[0, 1, 2, 3, 4]", "range(0, 5)", "0, 1, 2, 3, 4", "Error"],
      correct: 1
    },
    {
      id: 18,
      question: "Which keyword is used to handle exceptions in Python?",
      options: ["try", "except", "catch", "handle"],
      correct: 1
    },
    {
      id: 19,
      question: "What is the output of print('Hello' * 3)?",
      options: ["HelloHelloHello", "Hello 3", "Hello3", "Error"],
      correct: 0
    },
    {
      id: 20,
      question: "Which function is used to open a file in Python?",
      options: ["open()", "file()", "read()", "load()"],
      correct: 0
    }
  ];

  // Start webcam
  const startWebcam = async () => {
    try {
      // First, check if mediaDevices is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert("Your browser doesn't support camera access. Please try a modern browser like Chrome, Firefox, or Edge.");
        return false;
      }

      // List available devices to help debug
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      
      console.log('Available video devices:', videoDevices);
      
      if (videoDevices.length === 0) {
        alert("No camera devices found. Please connect a camera and refresh the page.");
        return false;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: 320, 
          height: 240,
          facingMode: 'user'
        } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      } else {
        console.error("videoRef.current is null. Cannot set srcObject.");
        alert("Error: Video element not found. Please refresh the page.");
        return false;
      }
      streamRef.current = stream;
      setWebcamActive(true);
      
      // Start face detection simulation (in real app, you'd use face-api.js or similar)
      faceDetectionIntervalRef.current = setInterval(() => {
        // Simulate face detection - in real implementation, use actual face detection
        const random = Math.random();
        let detectedFaces = 1;
        
        // Simulate multiple faces detection (5% chance)
        if (random > 0.95) {
          detectedFaces = 2;
        }
        
        setFaceCount(detectedFaces);
        
        if (detectedFaces > 1) {
          // Play alarm sound
          playAlarmSound();
          handleExamFailure();
        }
      }, 2000);
      
      return true;
    } catch (error) {
      console.error("Error accessing webcam:", error);
      
      // Provide detailed error message based on error type
      let errorMessage = "Unable to access webcam. ";
      
      if (error.name === 'NotAllowedError') {
        errorMessage += "Camera permission denied. Please click the camera icon in your browser's address bar and select 'Allow'.\n\nIf you don't see a camera icon, go to your browser settings and manually allow camera access for localhost:5173.";
      } else if (error.name === 'NotFoundError') {
        errorMessage += "No camera found. Please ensure your camera is connected and not used by another app.";
      } else if (error.name === 'NotReadableError') {
        errorMessage += "Camera is already in use by another application. Please close other video apps.";
      } else if (error.name === 'OverconstrainedError') {
        errorMessage += "Camera doesn't support required settings. Trying with basic settings...";
        
        // Try with basic constraints
        try {
          const basicStream = await navigator.mediaDevices.getUserMedia({ 
            video: true 
          });
          if (videoRef.current) {
            videoRef.current.srcObject = basicStream;
          } else {
            console.error("videoRef.current is null during basic stream attempt. Cannot set srcObject.");
            alert("Error: Video element not found during basic stream attempt. Please refresh the page.");
            return false;
          }
          streamRef.current = basicStream;
          setWebcamActive(true);
          alert("Camera started with basic settings. Exam can proceed.");
          return true;
        } catch (basicError) {
          errorMessage += "Failed even with basic settings.";
        }
      } else {
        errorMessage += `Unknown error: ${error.name} - ${error.message}\n\nPlease try:\n1. Refreshing the page\n2. Using a different browser\n3. Checking system camera permissions`;
      }
      
      alert(errorMessage);
      
      // Don't proceed with exam if webcam fails
      return false;
    }
  };

  // Play alarm sound
  const playAlarmSound = () => {
    // Create alarm sound using Web Audio API
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800; // Alarm frequency
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
    
    // Play multiple beeps
    setTimeout(() => {
      const osc2 = audioContext.createOscillator();
      const gain2 = audioContext.createGain();
      osc2.connect(gain2);
      gain2.connect(audioContext.destination);
      osc2.frequency.value = 800;
      osc2.type = 'sine';
      gain2.gain.setValueAtTime(0.3, audioContext.currentTime);
      gain2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      osc2.start(audioContext.currentTime);
      osc2.stop(audioContext.currentTime + 0.5);
    }, 600);
    
    setTimeout(() => {
      const osc3 = audioContext.createOscillator();
      const gain3 = audioContext.createGain();
      osc3.connect(gain3);
      gain3.connect(audioContext.destination);
      osc3.frequency.value = 800;
      osc3.type = 'sine';
      gain3.gain.setValueAtTime(0.3, audioContext.currentTime);
      gain3.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      osc3.start(audioContext.currentTime);
      osc3.stop(audioContext.currentTime + 0.5);
    }, 1200);
  };

  // Stop webcam
  const stopWebcam = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      setWebcamActive(false);
    }
    if (faceDetectionIntervalRef.current) {
      clearInterval(faceDetectionIntervalRef.current);
    }
  };

  // Handle exam failure due to multiple faces
  const handleExamFailure = () => {
    setExamFailed(true);
    setExamSubmitted(true);
    stopWebcam();
    
    // Store failed result
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const result = {
      status: 'fail',
      reason: 'Multiple faces detected',
      score: 0,
      totalQuestions: 20,
      correctAnswers: 0,
      timeTaken: 90 - timeLeft,
      user: {
        username: user.username || 'Unknown',
        email: user.email || '',
        firstName: user.firstName || user.first_name || user.username || '',
        lastName: user.lastName || user.last_name || ''
      },
      examDate: new Date().toISOString(),
      examTitle: 'Python Programming Assessment'
    };
    // Get all existing exam results from localStorage
    const existingResults = JSON.parse(localStorage.getItem('allExamResults') || '[]');
    
    // Add this failed result to the beginning of the array
    existingResults.unshift(result);
    
    // Keep only the last 10 results to prevent storage overflow
    if (existingResults.length > 10) {
      existingResults.pop();
    }
    
    // Save all results back to localStorage
    localStorage.setItem('allExamResults', JSON.stringify(existingResults));
    
    // Also save the current result for immediate display
    localStorage.setItem('examResult', JSON.stringify(result));
    
    setTimeout(() => {
      navigate('/dashboard/reports');
    }, 2000);
  };

  // Timer effect
  useEffect(() => {
    if (examStarted && !examSubmitted && timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !examSubmitted) {
      handleSubmitExam();
    }
  }, [timeLeft, examStarted, examSubmitted]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopWebcam();
    };
  }, [videoRef]);

  // Start webcam when exam starts and video element is available
  useEffect(() => {
    if (examStarted && videoRef.current && !webcamActive) {
      startWebcam();
    }
  }, [examStarted, videoRef, webcamActive]);

  // Start exam
  const startExam = async () => {
    setExamStarted(true);
  };

  // Handle answer selection
  const handleAnswerSelect = (questionIndex, optionIndex) => {
    const newAnswers = [...answers];
    newAnswers[questionIndex] = optionIndex;
    setAnswers(newAnswers);
  };

  // Mark for review
  const toggleMarkForReview = (questionIndex) => {
    const newMarked = [...markedForReview];
    newMarked[questionIndex] = !newMarked[questionIndex];
    setMarkedForReview(newMarked);
  };

  // Navigate to question
  const goToQuestion = (index) => {
    const newVisited = [...visitedQuestions];
    newVisited[index] = true;
    setVisitedQuestions(newVisited);
    setCurrentQuestion(index);
  };

  // Next question
  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      const newVisited = [...visitedQuestions];
      newVisited[currentQuestion + 1] = true;
      setVisitedQuestions(newVisited);
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  // Submit exam
  const handleSubmitExam = () => {
    setExamSubmitted(true);
    stopWebcam();
    
    // Get user information from localStorage
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    // Calculate results
    let correctCount = 0;
    answers.forEach((answer, index) => {
      if (answer === questions[index].correct) {
        correctCount++;
      }
    });
    
    const result = {
      status: 'completed',
      score: correctCount,
      totalQuestions: 20,
      correctAnswers: correctCount,
      incorrectAnswers: 20 - correctCount,
      timeTaken: 90 - timeLeft,
      answers: answers,
      questions: questions,
      user: {
        username: user.username || 'Unknown',
        email: user.email || '',
        firstName: user.firstName || user.first_name || user.username || '',
        lastName: user.lastName || user.last_name || ''
      },
      examDate: new Date().toISOString(),
      examTitle: 'Python Programming Assessment'
    };
    
    // Get all existing exam results from localStorage
    const existingResults = JSON.parse(localStorage.getItem('allExamResults') || '[]');
    
    // Add this new result to the beginning of the array
    existingResults.unshift(result);
    
    // Keep only the last 10 results to prevent storage overflow
    if (existingResults.length > 10) {
      existingResults.pop();
    }
    
    // Save all results back to localStorage
    localStorage.setItem('allExamResults', JSON.stringify(existingResults));
    
    // Also save the current result for immediate display
    localStorage.setItem('examResult', JSON.stringify(result));
    navigate('/dashboard/reports');
  };

  // Get question status color
  const getQuestionStatus = (index) => {
    if (markedForReview[index]) return 'violet';
    if (answers[index] !== null) return 'green';
    if (visitedQuestions[index]) return 'red';
    return 'grey';
  };

  // Format time
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (examFailed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50">
        <div className="bg-white p-8 rounded-xl shadow-lg text-center">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-red-600 mb-2">Exam Terminated</h2>
          <p className="text-gray-600 mb-4">Multiple faces detected during the exam</p>
          <p className="text-sm text-gray-500">Redirecting to reports page...</p>
        </div>
      </div>
    );
  }

  if (!examStarted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full">
          <div className="text-center mb-6">
            <FontAwesomeIcon icon={faCamera} className="text-4xl text-indigo-600 mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Python Programming Exam</h2>
            <p className="text-gray-600">20 Questions • 1:30 Minutes</p>
          </div>
          
          <div className="space-y-4 mb-6">
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h3 className="font-semibold text-yellow-800 mb-2">Exam Instructions:</h3>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• Webcam must be enabled throughout the exam</li>
                <li>• Only one face should be visible</li>
                <li>• Exam will auto-submit when time expires</li>
                <li>• Multiple faces detection will fail the exam</li>
              </ul>
            </div>
          </div>
          
          <button
            onClick={startExam}
            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition"
          >
            Start Exam
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 relative">
      {/* Webcam - Top Right Corner - Always Rendered */}
      <div className="fixed top-4 right-4 z-50 bg-white rounded-lg shadow-lg p-2 border-2 border-gray-200">
        <div className="text-xs text-center font-semibold text-gray-600 mb-1">Proctoring</div>
        <video
          ref={videoRef}
          autoPlay
          className="w-32 h-24 rounded-lg"
        />
        <div className={`text-xs text-center mt-1 font-semibold ${
          faceCount === 1 ? 'text-green-600' : faceCount > 1 ? 'text-red-600' : 'text-gray-600'
        }`}>
          {faceCount === 1 ? '✓ 1 Face' : faceCount > 1 ? `⚠ ${faceCount} Faces` : 'No Face'}
        </div>
      </div>

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <FontAwesomeIcon icon={faClock} className="text-red-500" />
              <span className={`font-bold ${timeLeft < 30 ? 'text-red-600' : 'text-gray-700'}`}>
                {formatTime(timeLeft)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <FontAwesomeIcon icon={faUser} className="text-green-500" />
              <span className="text-sm text-gray-600">
                {faceCount === 1 ? '1 Face Detected' : faceCount > 1 ? `${faceCount} Faces - WARNING!` : 'No Face Detected'}
              </span>
            </div>
          </div>
          
          <div className="text-sm text-gray-600">
            Question {currentQuestion + 1} of {questions.length}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">
                Q{currentQuestion + 1}: {questions[currentQuestion].question}
              </h3>
              
              <div className="space-y-3 mb-6">
                {questions[currentQuestion].options.map((option, index) => (
                  <label
                    key={index}
                    className={`block p-4 rounded-lg border-2 cursor-pointer transition ${
                      answers[currentQuestion] === index
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name={`question-${currentQuestion}`}
                      value={index}
                      checked={answers[currentQuestion] === index}
                      onChange={() => handleAnswerSelect(currentQuestion, index)}
                      className="mr-3"
                    />
                    {option}
                  </label>
                ))}
              </div>

              <div className="flex justify-between items-center">
                <button
                  onClick={() => toggleMarkForReview(currentQuestion)}
                  className={`px-4 py-2 rounded-lg font-medium transition ${
                    markedForReview[currentQuestion]
                      ? 'bg-violet-100 text-violet-700 border border-violet-300'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <FontAwesomeIcon icon={faFlag} className="mr-2" />
                  {markedForReview[currentQuestion] ? 'Marked for Review' : 'Mark for Review'}
                </button>

                <div className="flex gap-3">
                  {currentQuestion === questions.length - 1 ? (
                    <button
                      onClick={handleSubmitExam}
                      className="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700 transition"
                    >
                      Submit Exam
                    </button>
                  ) : (
                    <button
                      onClick={nextQuestion}
                      className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition flex items-center gap-2"
                    >
                      Next
                      <FontAwesomeIcon icon={faArrowRight} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar - Question Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h4 className="font-semibold mb-3">Question Navigation</h4>
              <div className="grid grid-cols-5 gap-2 mb-4">
                {questions.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToQuestion(index)}
                    className={`p-2 rounded-lg text-sm font-medium transition ${
                      currentQuestion === index
                        ? 'ring-2 ring-indigo-500'
                        : ''
                    }`}
                    style={{
                      backgroundColor: getQuestionStatus(index),
                      color: (getQuestionStatus(index) === 'green' || getQuestionStatus(index) === 'violet') ? 'white' : 'black'
                    }}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
              
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-500 rounded"></div>
                  <span>Not Visited</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-500 rounded"></div>
                  <span>Visited Not Answered</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-500 rounded"></div>
                  <span>Attempted</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-violet-500 rounded"></div>
                  <span>Mark for Review</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PythonExam;
