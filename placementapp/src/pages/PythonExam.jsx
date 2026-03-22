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

  // Enhanced security states
  const [fingerDetectionTimer, setFingerDetectionTimer] = useState(null);
  const [noFaceTimer, setNoFaceTimer] = useState(null);
  const [showRefreshWarning, setShowRefreshWarning] = useState(false);
  const [refreshWarningShown, setRefreshWarningShown] = useState(false); // Prevent multiple triggers
  const [isPageBlocked, setIsPageBlocked] = useState(false); // Block page completely

  // Check for reload using URL parameter (most reliable method)
  const urlParams = new URLSearchParams(window.location.search);
  const isReloaded = urlParams.get('reloaded') === 'true';

  // Get exam type from URL or localStorage (default to daily)
  const getExamType = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const urlExamType = urlParams.get('type');
    if (urlExamType) return urlExamType;
    
    const storedExamType = localStorage.getItem('currentExamType');
    return storedExamType || 'daily';
  };
  
  const examType = getExamType();

  // MULTIPLE QUESTION PAPERS (Hidden feature - doesn't disturb existing code)
  const questionPapers = {
    daily: [
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
    ],
    weekly: [
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
    ],
    monthly: [
      { id:1, question:"What is the difference between list and tuple in Python?", options:["List is mutable, tuple is immutable","Tuple is mutable, list is immutable","Both are mutable","Both are immutable"], correct:0 },
      { id:2, question:"Which of the following is a built-in Python function?", options:["print()","printf()","cout()","System.out.println()"], correct:0 },
      { id:3, question:"What is the output of print([1,2,3] + [4,5,6])?", options:["[1, 2, 3, 4, 5, 6]","[1, 2, 3, [4, 5, 6]]","Error","[1, 2, 3] + [4, 5, 6]"], correct:0 },
      { id:4, question:"Which method is used to copy a list in Python?", options:["copy()","clone()","duplicate()","replicate()"], correct:0 },
      { id:5, question:"What is the output of print(dict(zip(['a','b'],[1,2])))?", options:["{'a': 1, 'b': 2}","{'a': 1, 'b': 2, }","Error","{'a': 1, 'b': 2}"], correct:0 },
      { id:6, question:"Which of the following is a valid Python variable name?", options:["my_var","2var","var-name","class"], correct:0 },
      { id:7, question:"What is the output of print(set([1,2,2,3,3]))?", options:["{1, 2, 3}","{1, 2, 2, 3, 3}","[1, 2, 3]","Error"], correct:0 },
      { id:8, question:"Which method is used to add elements to a set?", options:["add()","append()","insert()","push()"], correct:0 },
      { id:9, question:"What is the output of print('Python'[2:5])?", options:["tho","th","hon","hon"], correct:0 },
      { id:10, question:"Which keyword is used to define a generator function?", options:["yield","return","generate","gen"], correct:0 },
      { id:11, question:"What is the output of print(0.1 + 0.2 == 0.3)?", options:["False","True","Error","None"], correct:0 },
      { id:12, question:"Which function is used to read a file in Python?", options:["read()","open()","load()","get()"], correct:1 },
      { id:13, question:"What is the output of print(list(range(3)))?", options:["[0, 1, 2]","[1, 2, 3]","[0, 1, 2, 3]","Error"], correct:0 },
      { id:14, question:"Which method is used to reverse a list in Python?", options:["reverse()","reversed()","invert()","flip()"], correct:0 },
      { id:15, question:"What is the output of print('2' + '2')?", options:["22","4","Error","None"], correct:0 },
      { id:16, question:"Which operator is used for membership testing in Python?", options:["in","has","contains","exists"], correct:0 },
      { id:17, question:"What is the output of print([x for x in range(3)])?", options:["[0, 1, 2]","[0, 1, 2, 3]","Error","None"], correct:0 },
      { id:18, question:"Which method is used to count elements in a list?", options:["count()","len()","size()","length()"], correct:0 },
      { id:19, question:"What is the output of print(type(lambda x: x))?", options:["<class 'function'>","<class 'lambda'>","<class 'type'>","Error"], correct:0 },
      { id:20, question:"Which function is used to get the maximum value from a list?", options:["max()","maximum()","largest()","biggest()"], correct:0 },
    ]
  };

  // SMART QUESTION SELECTION (Uses existing 'questions' variable to maintain code compatibility)
  const questions = questionPapers[examType] || questionPapers.daily;

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
    if (examStarted && !examSubmitted) {
      const stateToSave = {
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
  }, [answers, markedForReview, visitedQuestions, timeLeft, currentQuestion, examStarted, examSubmitted]);

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

  // Custom refresh protection with permanent dialog
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Detect F5, Ctrl+R, Ctrl+F5 refresh combinations
      if (e.key === 'F5' || 
          (e.ctrlKey && e.key === 'r') || 
          (e.ctrlKey && e.key === 'R') ||
          (e.ctrlKey && e.key === 'f5') ||
          (e.ctrlKey && e.key === 'F5')) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        // Show custom dialog
        setRefreshWarningShown(true);
        setShowRefreshWarning(true);
        setIsPageBlocked(true);
        return false;
      }
      
      // Block ALL back button combinations - MORE AGGRESSIVE
      if (e.key === 'Backspace' || 
          e.key === 'browserBack' ||
          (e.altKey && e.key === 'ArrowLeft') ||
          (e.altKey && e.keyCode === 37) ||
          e.keyCode === 8) { // Backspace key code
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

    // Handle beforeunload - set flag and show dialog
    const handleBeforeUnload = (e) => {
      if (examStarted && !examSubmitted && !refreshWarningShown) {
        // Set flag to show dialog after page reload
        sessionStorage.setItem('showRefreshDialog', 'true');
        
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        e.returnValue = 'exam will be submitted automatically';
        return 'exam will be submitted automatically';
      }
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

    // Check for dialog flag on component mount
    const shouldShowDialog = sessionStorage.getItem('showRefreshDialog') === 'true';
    if (shouldShowDialog && !refreshWarningShown && examStarted) {
      setRefreshWarningShown(true);
      setShowRefreshWarning(true);
      setIsPageBlocked(true);
      sessionStorage.removeItem('showRefreshDialog');
    }

    // Only add event listeners if exam has started
    if (examStarted && !examSubmitted) {
      window.addEventListener('keydown', handleKeyDown, true);
      window.addEventListener('beforeunload', handleBeforeUnload, true);
      window.addEventListener('contextmenu', handleContextMenu, true);
      window.addEventListener('popstate', handlePopState, true);
      window.addEventListener('mouseup', handleMouseUp, true);
      
      // Push multiple states to completely block back navigation
      window.history.pushState({ examActive: true, timestamp: Date.now() }, '', window.location.href);
      window.history.pushState({ examActive: true, timestamp: Date.now() + 1 }, '', window.location.href);
      window.history.pushState({ examActive: true, timestamp: Date.now() + 2 }, '', window.location.href);
      window.history.pushState({ examActive: true, timestamp: Date.now() + 3 }, '', window.location.href);
      window.history.pushState({ examActive: true, timestamp: Date.now() + 4 }, '', window.location.href);
      
      // Override history methods - MORE AGGRESSIVE
      const originalBack = window.history.back;
      const originalGo = window.history.go;
      const originalForward = window.history.forward;
      
      window.history.back = () => {
        console.log(' Back button blocked during exam');
        window.history.pushState(null, null, window.location.href);
        return false;
      };
      
      window.history.go = (delta) => {
        if (delta < 0) {
          console.log(' Back navigation blocked during exam');
          window.history.pushState(null, null, window.location.href);
          return false;
        }
        return originalGo.call(window.history, delta);
      };
      
      window.history.forward = () => {
        console.log(' Forward navigation blocked during exam');
        return false;
      };
      
      return () => {
        window.removeEventListener('keydown', handleKeyDown, true);
        window.removeEventListener('beforeunload', handleBeforeUnload, true);
        window.removeEventListener('contextmenu', handleContextMenu, true);
        window.removeEventListener('popstate', handlePopState, true);
        window.removeEventListener('mouseup', handleMouseUp, true);
        
        // Restore original methods
        window.history.back = originalBack;
        window.history.go = originalGo;
        window.history.forward = originalForward;
      };
    }
  }, [examStarted, examSubmitted, refreshWarningShown]);

  // Handle refresh warning response
  const handleRefreshResponse = (submit) => {
    if (submit) {
      handleSubmitExam("Page refresh detected");
    } else {
      setShowRefreshWarning(false);
      setRefreshWarningShown(false); // Reset the flag
      setIsPageBlocked(false); // Unblock the page
      // User chose to continue - don't submit the exam
    }
  };

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
              console.log("✅ Security violation condition cleared.");
            }, 1000); // Require 1 full second of clean image to reset the penalty
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
    }, 500); // Check frame more frequently for accurate 2s timing
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
  const handleSubmitExam = async (reason = "Manual submission") => {
    if (!examSubmittedRef.current) {
      setExamSubmitted(true);
      examSubmittedRef.current = true;
      stopWebcam(); // Stop webcam when submitting
      sessionStorage.removeItem('pythonExamState');

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
        examTitle: `${examType.charAt(0).toUpperCase() + examType.slice(1)} Python Programming Assessment`,
        examType: examType,
        submissionReason: reason
      };

      const now = new Date().toISOString();
      const payload = {
        username: user.username || "Unknown",
        exam_title: `${examType.charAt(0).toUpperCase() + examType.slice(1)} Python Programming Assessment`,
        exam_type: examType,
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
        questions: questions,
        submission_reason: reason
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
    }
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
            {examType === 'daily' ? 'Python Programming Assessment' : `${examType.charAt(0).toUpperCase() + examType.slice(1)} Python Programming Assessment`}
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

        {/* Refresh Warning with Page Blocking */}
        {showRefreshWarning && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
            <div className="relative bg-white p-6 rounded-lg shadow-xl max-w-md text-center z-20">
              <FontAwesomeIcon icon={faClock} className="text-4xl text-orange-500 mb-4"/>
              <h2 className="text-xl font-bold mb-4 text-gray-800">
                Exam Refresh Detected
              </h2>
              <p className="text-gray-600 mb-6 font-semibold">
                exam will be submitted automatically
              </p>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => handleRefreshResponse(true)}
                  className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 font-semibold"
                >
                  OK
                </button>
                <button
                  onClick={() => handleRefreshResponse(false)}
                  className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 font-semibold"
                >
                  Cancel
                </button>
              </div>
              <p className="text-sm text-gray-500 mt-4">
                This dialog will wait for your response permanently
              </p>
            </div>
          </div>
        )}

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