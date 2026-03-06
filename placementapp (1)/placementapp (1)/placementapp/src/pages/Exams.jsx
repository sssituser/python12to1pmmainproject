import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

function ExamPage() {
  const navigate = useNavigate();
  const videoRef = useRef(null);

  const questions = [
    {
      question: "Which of the following is NOT a core principle of RESTful APIs?",
      options: ["Statelessness", "Client-Server Architecture", "Cacheability", "Session Affinity"],
      answer: 3
    },
    {
      question: "In Python, which keyword is used to define a function?",
      options: ["func", "define", "def", "function"],
      answer: 2
    },
    {
      question: "Which of these is a popular Python framework for web development?",
      options: ["React", "Angular", "Django", "Vue"],
      answer: 2
    },
    {
      question: "What does ORM stand for in the context of databases and Python?",
      options: ["Object-Relational Mapping", "Operational Reference Model", "Ordered Relation Management", "Object-Resource Model"],
      answer: 0
    },
    {
      question: "Which HTTP method is typically used to retrieve data from a server?",
      options: ["POST", "PUT", "GET", "DELETE"],
      answer: 2
    },
    {
      question: "What is the purpose of 'pip' in Python?",
      options: ["Python Installation Program", "Preferred Installer Program", "Package Installer for Python", "Pre-installed Python"],
      answer: 2
    },
    {
      question: "Which of the following is used for front-end development in a full-stack application?",
      options: ["Node.js", "Express.js", "React.js", "MongoDB"],
      answer: 2
    },
    {
      question: "In Django, what is the primary role of the 'models.py' file?",
      options: ["Defining URL routes", "Handling HTTP requests", "Defining database schema", "Managing static files"],
      answer: 2
    },
    {
      question: "Which database type is generally NOT considered a NoSQL database?",
      options: ["MongoDB", "Cassandra", "PostgreSQL", "Redis"],
      answer: 2
    },
    {
      question: "What does the 'virtualenv' tool in Python create?",
      options: ["A virtual machine", "An isolated Python environment", "A web server", "A database connection"],
      answer: 1
    },
    {
      question: "Which status code indicates a successful HTTP request?",
      options: ["200 OK", "404 Not Found", "500 Internal Server Error", "301 Moved Permanently"],
      answer: 0
    },
    {
      question: "What is the main advantage of using a framework like Flask or Django?",
      options: ["Faster code execution", "Automated testing", "Provides structure and common tools", "Reduces memory usage"],
      answer: 2
    },
    {
      question: "Which Python library is commonly used for making HTTP requests?",
      options: ["http", "urllib", "requests", "socket"],
      answer: 2
    },
    {
      question: "In Flask, what decorator is used to define a route?",
      options: ["@route", "@app.route", "@path", "@url"],
      answer: 1
    },
    {
      question: "Which of the following is a NoSQL database?",
      options: ["MySQL", "PostgreSQL", "MongoDB", "SQLite"],
      answer: 2
    },
    {
      question: "What is the purpose of JWT in authentication?",
      options: ["JavaScript Web Template", "JSON Web Token", "Java Web Toolkit", "JavaScript Web Token"],
      answer: 1
    },
    {
      question: "Which command is used to start a Django development server?",
      options: ["python start", "python runserver", "django start", "python manage.py runserver"],
      answer: 3
    },
    {
      question: "What is the main use of React in full-stack development?",
      options: ["Backend database", "Server-side logic", "Building user interfaces", "API development"],
      answer: 2
    },
    {
      question: "Which of the following is a Python testing framework?",
      options: ["Jest", "Mocha", "Pytest", "Selenium"],
      answer: 2
    },
    {
      question: "What is the purpose of CORS in web development?",
      options: ["Cross-Origin Resource Sharing", "Client-Origin Response System", "Cross-Origin Request Security", "Client-Origin Resource System"],
      answer: 0
    }
  ];

  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [time, setTime] = useState(90);
  const [questionStatus, setQuestionStatus] = useState(
    questions.map(() => ({ status: 'neutral', marked: false }))
  );
  const [userAnswers, setUserAnswers] = useState(
    questions.map(() => null)
  );
  const [referenceFace, setReferenceFace] = useState(null);
  const [faceValidationStatus, setFaceValidationStatus] = useState('pending'); // pending, validated, failed
  const [examTerminated, setExamTerminated] = useState(false);

  // Get username dynamically
  const username = localStorage.getItem("username") || "Karthik";

  // Face detection and monitoring functions
  const playAlarmSound = () => {
    const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT');
    audio.play();
  };

  const terminateExamForFaceViolation = () => {
    playAlarmSound();
    setExamTerminated(true);
    setFaceValidationStatus('failed');
    
    // Force fail result
    const failResults = {
      attempted: 0,
      correct: 0,
      wrong: 0,
      score: 0,
      totalMarks: questions.length * 2,
      violation: true
    };
    
    // Store fail results
    localStorage.setItem('examResults', JSON.stringify({
      studentName: username,
      ...failResults,
      totalQuestions: questions.length,
      timestamp: new Date().toISOString(),
      reason: 'Face verification failed - Different person detected'
    }));

    // Stop webcam
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject;
      const tracks = stream.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }

    // Navigate to exam reports after a delay
    setTimeout(() => {
      navigate("/exam-reports");
    }, 2000);
  };

  const detectFace = () => {
    // This is a simplified face detection simulation
    // In a real implementation, you would use a face detection library like face-api.js
    if (!videoRef.current) return null;
    
    // Simulate face detection with random confidence
    const confidence = Math.random();
    if (confidence > 0.3) {
      // Face detected
      return {
        detected: true,
        confidence: confidence,
        descriptor: `face_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      };
    }
    return null;
  };

  const compareFaces = (currentFace, referenceFace) => {
    // Simplified face comparison logic
    // In a real implementation, this would use facial recognition algorithms
    if (!currentFace || !referenceFace) return false;
    
    // Simulate face matching with some tolerance
    const similarity = Math.random();
    return similarity > 0.7; // 70% similarity threshold
  };

  // TIMER
  useEffect(() => {
    const timer = setInterval(() => {
      setTime((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Auto-submit exam when time ends
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  // WEBCAM
  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true })
      .then((stream) => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          
          // Start face validation after webcam is ready
          setTimeout(() => {
            const face = detectFace();
            if (face) {
              setReferenceFace(face);
              setFaceValidationStatus('validated');
              console.log('Face validated successfully');
            } else {
              setFaceValidationStatus('failed');
              console.log('No face detected, please ensure your face is visible');
            }
          }, 2000); // Wait 2 seconds for webcam to initialize
        }
      })
      .catch((err) => {
        console.log("Webcam access denied:", err);
        setFaceValidationStatus('failed');
      });
  }, []);

  // Face monitoring effect
  useEffect(() => {
    if (faceValidationStatus !== 'validated' || examTerminated) return;

    const monitoringInterval = setInterval(() => {
      const currentFace = detectFace();
      
      if (!currentFace) {
        // No face detected
        console.log('No face detected');
        return;
      }
      
      if (!compareFaces(currentFace, referenceFace)) {
        // Different face detected
        console.log('Different face detected - terminating exam');
        terminateExamForFaceViolation();
      }
    }, 3000); // Check every 3 seconds

    return () => clearInterval(monitoringInterval);
  }, [faceValidationStatus, referenceFace, examTerminated]);

  const handleNext = () => {
    // Mark current question as attempted if an option is selected
    if (selected !== null) {
      updateQuestionStatus(current, 'attempted', questionStatus[current].marked);
    } else {
      // Mark as not attempted if skipped without answering
      updateQuestionStatus(current, 'not_attempted', questionStatus[current].marked);
    }
    
    if (current < questions.length - 1) {
      setSelected(null);
      setCurrent(current + 1);
    } else {
      // Last question - submit the exam
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    // Save current answer before submitting
    if (selected !== null) {
      const newAnswers = [...userAnswers];
      newAnswers[current] = selected;
      setUserAnswers(newAnswers);
      updateQuestionStatus(current, 'attempted', questionStatus[current].marked);
    } else {
      updateQuestionStatus(current, 'not_attempted', questionStatus[current].marked);
    }
    
    // Stop webcam stream
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject;
      const tracks = stream.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    
    // Calculate and submit results
    const results = calculateResults();
    
    // Store results in localStorage for exam reports page
    localStorage.setItem('examResults', JSON.stringify({
      studentName: username,
      ...results,
      totalQuestions: questions.length,
      timestamp: new Date().toISOString()
    }));

    navigate("/exam-reports");
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const updateQuestionStatus = (questionIndex, status, marked) => {
    setQuestionStatus(prev => {
      const newStatus = [...prev];
      newStatus[questionIndex] = { status, marked };
      return newStatus;
    });
  };

  const handleOptionSelect = (optionIndex) => {
    setSelected(optionIndex);
    updateQuestionStatus(current, 'attempted', questionStatus[current].marked);
    // Save user answer
    const newAnswers = [...userAnswers];
    newAnswers[current] = optionIndex;
    setUserAnswers(newAnswers);
  };

  const handleMarkForReview = () => {
    updateQuestionStatus(current, questionStatus[current].status, !questionStatus[current].marked);
  };

  const getQuestionColor = (index) => {
    const status = questionStatus[index];
    if (status.marked) return 'bg-violet-500'; // Violet for marked
    if (status.status === 'attempted') return 'bg-green-500'; // Green for attempted
    if (status.status === 'not_attempted') return 'bg-red-500'; // Red for not attempted
    return 'bg-gray-400'; // Gray for neutral/unvisited
  };

  const handleQuestionClick = (index) => {
    setCurrent(index);
    setSelected(userAnswers[index]); // Restore selected answer for this question
  };

  const calculateResults = () => {
    let correctCount = 0;
    let wrongCount = 0;
    let attemptedCount = 0;

    questions.forEach((question, index) => {
      if (userAnswers[index] !== null) {
        attemptedCount++;
        if (userAnswers[index] === question.answer) {
          correctCount++;
        } else {
          wrongCount++;
        }
      }
    });

    return {
      attempted: attemptedCount,
      correct: correctCount,
      wrong: wrongCount,
      score: correctCount * 2, // 2 marks per correct answer
      totalMarks: questions.length * 2 // 40 marks total
    };
  };

  const isAllQuestionsAttempted = questionStatus.every(q => q.status === 'attempted');
  const isOnLastQuestion = current === questions.length - 1;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Online Exam</h1>
          
          <div className="flex items-center space-x-4">
            {/* Webcam */}
            <div className="relative">
              <video
                ref={videoRef}
                autoPlay
                width="150"
                height="100"
                className="border-2 border-gray-300 rounded-lg shadow-md"
                style={{ backgroundColor: '#f3f4f6' }}
              />
              <p className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-gray-600">Webcam Monitoring</p>
              
              {/* Face Validation Status */}
              <div className="absolute -top-2 -right-2">
                {faceValidationStatus === 'pending' && (
                  <div className="w-4 h-4 bg-yellow-500 rounded-full animate-pulse" title="Face validation in progress..."></div>
                )}
                {faceValidationStatus === 'validated' && (
                  <div className="w-4 h-4 bg-green-500 rounded-full" title="Face validated"></div>
                )}
                {faceValidationStatus === 'failed' && (
                  <div className="w-4 h-4 bg-red-500 rounded-full" title="Face validation failed"></div>
                )}
              </div>
            </div>

            {/* Timer */}
            <div className="bg-red-100 text-red-700 px-4 py-2 rounded-lg font-semibold">
              Time Left: {formatTime(time)}
            </div>
            
            {/* Notifications */}
            <button className="relative p-2 text-gray-500 hover:text-gray-700">
              🔔
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            
            {/* Profile */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                {username.charAt(0).toUpperCase()}
              </div>
              <span className="text-gray-700 font-medium">{username}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Face Validation Alert */}
      {faceValidationStatus === 'failed' && !examTerminated && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mx-6 mt-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">
                Face validation failed. Please ensure your face is clearly visible in the webcam.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Exam Terminated Alert */}
      {examTerminated && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mx-6 mt-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">
                Exam terminated due to face verification violation. Redirecting to results...
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Exam Content */}
      <main className="p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            
            {/* Color Status Indicators */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-2">
                {/* Question Number Buttons */}
                {questions.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuestionClick(index)}
                    className={`w-8 h-8 rounded-lg font-semibold text-white text-xs transition-all ${
                      index === current 
                        ? 'ring-2 ring-blue-600 ring-offset-2' 
                        : 'hover:opacity-80'
                    } ${getQuestionColor(index)}`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
              
              <span className="text-sm text-gray-500">
                Question {current + 1} of {questions.length}
              </span>
            </div>

            {/* Questions Section - Full Width */}
            <div className="space-y-6">
              {/* Question */}
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                {questions[current].question}
              </h2>

              {/* Options */}
              <div className="space-y-3">
                {questions[current].options.map((option, index) => (
                  <label
                    key={index}
                    className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                      selected === index
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="option"
                      value={index}
                      checked={selected === index}
                      onChange={() => handleOptionSelect(index)}
                      className="mr-3"
                    />
                    <span className="text-gray-700">{option}</span>
                  </label>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between items-center pt-6">
                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      if (current > 0) {
                        setSelected(null);
                        setCurrent(current - 1);
                      }
                    }}
                    disabled={current === 0}
                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>

                  <button
                    onClick={handleMarkForReview}
                    className={`px-6 py-2 rounded-lg font-semibold ${
                      questionStatus[current].marked
                        ? 'bg-violet-600 text-white hover:bg-violet-700'
                        : 'border border-violet-600 text-violet-600 hover:bg-violet-50'
                    }`}
                  >
                    {questionStatus[current].marked ? 'Unmark' : 'Mark & Review'}
                  </button>
                </div>

                <div className="flex space-x-3">
                  {/* Show Finish button only when all questions are attempted */}
                  {isAllQuestionsAttempted && (
                    <button
                      onClick={handleFinish}
                      className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
                    >
                      Finish
                    </button>
                  )}
                  
                  {/* Next/Submit button */}
                  <button
                    onClick={handleNext}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
                  >
                    {current === questions.length - 1 ? 'Submit' : 'Next'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default ExamPage;