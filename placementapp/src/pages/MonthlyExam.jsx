import {
  faCamera,
  faFlag,
  faClock,
  faArrowRight,
  faCircle,
  faCode,
  faTerminal
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as faceapi from "@vladmandic/face-api";
import Editor from "@monaco-editor/react";
import CodeCompiler from "../components/CodeCompiler";

// Indestructible global array to catch all streams outside React DOM scope
let globalStreamsToClean = [];

const MonthlyExam = () => {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const faceDetectionIntervalRef = useRef(null);
  const violationStartTimeRef = useRef(null);
  const lastWarningTimeRef = useRef(0);
  const examSubmittedRef = useRef(false);

  const [warningCount, setWarningCount] = useState(0);
  const [warningMessage, setWarningMessage] = useState("");
  const [showWarningModal, setShowWarningModal] = useState(false);

  const triggerWarning = (reason) => {
    if (examSubmittedRef.current) return;
    const now = Date.now();
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

  const startWebcam = async () => {
    if (webcamStatus === 'active' || webcamStatus === 'loading') return;
    try {
      setWebcamStatus('loading');
      setWebcamActive(false);
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false 
      });
      setWebcamActive(true);
      setWebcamStatus('active');

      stream.getVideoTracks().forEach(track => {
        track.onended = () => {
          if (!examSubmittedRef.current) {
            setWebcamActive(false);
            setWebcamStatus('error');
            triggerWarning("Camera was disconnected.");
          }
        };
      });

      globalStreamsToClean.push(stream);
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) {
      console.error(err);
      setWebcamActive(false);
      setWebcamStatus('error');
    }
  };

  useEffect(() => {
    if (videoRef.current && globalStreamsToClean.length > 0) {
      const liveStream = globalStreamsToClean[globalStreamsToClean.length - 1];
      if (videoRef.current.srcObject !== liveStream) videoRef.current.srcObject = liveStream;
    }
  }, [examStarted, webcamActive, webcamStatus]);

  const stopWebcam = () => {
    globalStreamsToClean.forEach(s => s.getTracks().forEach(t => t.stop()));
    globalStreamsToClean = [];
    setWebcamActive(false);
  };

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [markedForReview, setMarkedForReview] = useState([]);
  const [visitedQuestions, setVisitedQuestions] = useState([]);

  const [timeLeft, setTimeLeft] = useState(4500); 
  const [examDuration, setExamDuration] = useState(75); 
  const [examStarted, setExamStarted] = useState(false);
  const [examSubmitted, setExamSubmitted] = useState(false);
  const [webcamActive, setWebcamActive] = useState(false);
  const [webcamStatus, setWebcamStatus] = useState('idle'); 
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(true);
  const [studentCourse, setStudentCourse] = useState("");
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    if (localStorage.getItem("examResult")) {
      navigate("/dashboard/playground-results", { replace: true });
      return;
    }
    const fetchQ = async () => {
      setIsLoadingQuestions(true);
      try {
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        const course = user.course || "";
        setStudentCourse(course);

        const res = await fetch(`/api/admin/exam-settings/?category=Monthly&course=${course}`);
        const data = await res.json();

        if (data.success && data.data && data.data.questions) {
            const shuffled = data.data.questions.sort(() => 0.5 - Math.random()).slice(0, data.data.maxQuestions || 50);
            setExamDuration(data.data.duration || 75);
            setTimeLeft((data.data.duration || 75) * 60);
            setQuestions(shuffled.map((q, i) => ({
              ...q, id: i + 1, marks: parseInt(q.marks) || 10,
              correct: q.options ? (q.options.indexOf(q.answer) !== -1 ? q.options.indexOf(q.answer) : 0) : 0
            })));
        }
      } catch (e) {} finally { setIsLoadingQuestions(false); }
    };
    fetchQ();
    startWebcam();
  }, []);

  useEffect(() => {
    if (examStarted && !examSubmitted && timeLeft > 0) {
      const t = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(t);
    }
    if (timeLeft === 0 && !examSubmitted) handleSubmitExam();
  }, [timeLeft, examStarted, examSubmitted]);

  // 🔐 SECURITY: Block Back, Forward, and Refresh
  useEffect(() => {
    if (examStarted && !examSubmitted) {
      // 1. Block BACK/FORWARD navigation
      const blockNavigation = () => {
        window.history.pushState(null, "", window.location.href);
      };
      
      window.history.pushState(null, "", window.location.href);
      window.addEventListener("popstate", blockNavigation);

      // 2. Block REFRESH / CLOSE
      const blockRefresh = (e) => {
        e.preventDefault();
        e.returnValue = "Warning: Your exam progress will be lost if you refresh or close this tab.";
        return e.returnValue;
      };
      window.addEventListener("beforeunload", blockRefresh);

      return () => {
        window.removeEventListener("popstate", blockNavigation);
        window.removeEventListener("beforeunload", blockRefresh);
      };
    } else if (!examStarted && !examSubmitted) {
       // Allow going back to dashboard if not started yet
       const handleBrowserBack = () => navigate('/dashboard/playground');
       window.addEventListener('popstate', handleBrowserBack);
       return () => window.removeEventListener('popstate', handleBrowserBack);
    }
  }, [examStarted, examSubmitted, navigate]);

  useEffect(() => {
    if (!examStarted || examSubmitted) return;
    const detectFaces = async () => {
        if (!videoRef.current) return;
        const video = videoRef.current;
        if (!video.videoWidth) return;

        const canvas = document.createElement("canvas");
        canvas.width = 16; canvas.height = 16;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        ctx.drawImage(video, 0, 0, 16, 16);
        const tData = ctx.getImageData(0, 0, 16, 16).data;
        let brightness = 0; let max = 0, min = 255;
        for (let i = 0; i < tData.length; i += 4) {
          const val = tData[i]; brightness += val;
          if (val > max) max = val; if (val < min) min = val;
        }
        brightness = brightness / 64;
        const isDark = brightness < 20;
        const isFlat = (max - min) < 20;

        const isTrackActive = globalStreamsToClean[0]?.getVideoTracks().every(t => t.enabled && t.readyState === 'live');
        if (!isTrackActive && webcamActive) triggerWarning("Webcam inactive");

        const checkViolations = (faces) => {
          if (!faces || faces.length === 0) triggerWarning("Face not detected");
          else if (faces.length > 1) triggerWarning("Multiple persons detected");
          else if (isDark || isFlat) triggerWarning("Camera covered");
        };

        if (window.FaceDetector) {
          const detector = new window.FaceDetector();
          detector.detect(video).then(checkViolations).catch(() => checkViolations(null));
        } else { checkViolations([{ boundingBox: {} }]); }
    };
    const interval = setInterval(detectFaces, 1500);
    return () => clearInterval(interval);
  }, [examStarted, examSubmitted, webcamActive]);

  const handleSubmitExam = async () => {
    if (examSubmittedRef.current) return;
    setExamSubmitted(true);
    examSubmittedRef.current = true;
    stopWebcam();
    try { if (document.fullscreenElement) await document.exitFullscreen(); } catch (e) {}

    const score = answers.reduce((acc, ans, idx) => acc + (ans === questions[idx]?.correct ? (questions[idx]?.marks || 2) : 0), 0);
    const result = { 
      examTitle: `${studentCourse || 'Monthly'} Assessment`, 
      user: {
        firstName: (JSON.parse(localStorage.getItem("sssit-profile") || "{}")).fullName || "Student"
      },
      score, 
      totalQuestions: questions.length, 
      examType: 'monthly',
      examDate: new Date().toISOString(), 
      passed: true 
    };
    
    localStorage.setItem("examResult", JSON.stringify(result));
    
    // 🛡️ SERVER-SIDE PERSISTENCE
    const token = localStorage.getItem("access")?.replace(/^"|"$/g, "");
    if (token) {
      try {
        await axios.post(`http://${window.location.hostname}:8000/api/save-exam-report/`, result, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch (err) {
        console.error("Persist failed", err);
      }
    }

    const allResults = JSON.parse(localStorage.getItem("allExamResults") || "[]");
    allResults.unshift(result);
    localStorage.setItem("allExamResults", JSON.stringify(allResults));
    window.dispatchEvent(new CustomEvent('examDataUpdated', { detail: { examType: 'monthly', result } }));
    navigate("/dashboard/playground-results", { replace: true });
  };

  const startExam = async () => {
    try { if (document.documentElement.requestFullscreen) await document.documentElement.requestFullscreen(); } catch (e) {}
    setExamStarted(true);
    setAnswers(new Array(questions.length).fill(null));
    window.history.pushState(null, null, window.location.href);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (!examStarted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6 text-center">
        <div className="bg-white p-12 rounded-[3rem] shadow-2xl max-w-lg w-full">
           <div className="w-64 h-48 mx-auto mb-8 bg-gray-900 rounded-[2rem] overflow-hidden shadow-inner relative">
              {webcamActive ? <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" /> : <div className="h-full flex items-center justify-center text-white text-[10px] font-black uppercase tracking-widest">Activating Feed...</div>}
           </div>
           <h2 className="text-3xl font-black mb-2 uppercase">{studentCourse || 'Monthly'} Assessment</h2>
           <p className="text-gray-500 font-bold mb-8 uppercase text-[10px] tracking-widest">{questions.length} Questions • {examDuration} Minutes</p>
           {webcamStatus === 'error' && <p className="mb-4 text-rose-500 font-black text-xs">Webcam Required</p>}
           <button onClick={startExam} disabled={isLoadingQuestions || !webcamActive} className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl hover:bg-indigo-700 transition-all disabled:opacity-50">Start Assessment</button>
        </div>
      </div>
    );
  }

  const activeQ = questions[currentQuestion];
  return (
    <div className="min-h-screen bg-gray-50 p-6 relative">
      <div className="fixed top-6 right-6 z-[9999] bg-white rounded-[2rem] shadow-2xl p-2.5 border border-gray-50">
        <video ref={videoRef} autoPlay playsInline muted className="w-40 h-28 object-cover rounded-2xl bg-gray-900" style={{ transform: 'scaleX(-1)' }} />
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="bg-white/80 backdrop-blur-md px-6 py-4 rounded-3xl shadow-sm border border-gray-100 flex justify-between items-center mb-6">
           <div className="bg-indigo-50 px-4 py-2 rounded-xl"><span className="font-black text-indigo-700">{formatTime(timeLeft)}</span></div>
           <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Monthly Exam</span>
        </div>

        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 min-h-[400px]">
          <div className="flex items-center justify-between mb-8">
            <span className="text-[10px] font-black text-indigo-600 uppercase">Question {currentQuestion + 1} of {questions.length}</span>
            <span className="text-[10px] font-black text-gray-400 uppercase">Marks: {activeQ?.marks || 10}</span>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-8">{activeQ?.question}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeQ?.options?.map((opt, i) => (
              <label key={i} className={`p-4 rounded-2xl border-2 transition-all cursor-pointer font-bold text-sm ${answers[currentQuestion] === i ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-white border-gray-50 hover:bg-gray-50'}`}>
                <input type="radio" checked={answers[currentQuestion] === i} onChange={() => { const a = [...answers]; a[currentQuestion] = i; setAnswers(a); }} className="hidden" />
                {opt}
              </label>
            ))}
          </div>
          <div className="mt-20 flex justify-between">
            <button onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))} className="h-11 px-6 rounded-xl border border-gray-100 font-black text-[10px] uppercase">Prev</button>
            {currentQuestion < questions.length - 1 ? (
              <button onClick={() => setCurrentQuestion(prev => prev + 1)} className="bg-indigo-600 text-white px-8 h-11 rounded-xl font-black text-[10px] uppercase">Next</button>
            ) : (
              <button onClick={handleSubmitExam} className="bg-green-600 text-white px-8 h-11 rounded-xl font-black text-[10px] uppercase">Submit</button>
            )}
          </div>
        </div>
      </div>

      {showWarningModal && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 text-center">
          <div className="bg-white rounded-3xl p-10 max-w-sm w-full shadow-2xl animate-in zoom-in duration-300">
            <h3 className="text-xl font-black text-gray-800 mb-2 uppercase tracking-tight">Violation {warningCount}/3</h3>
            <p className="text-gray-500 mb-8 italic">{warningMessage}</p>
            <button onClick={() => setShowWarningModal(false)} className="w-full bg-amber-500 text-white py-4 rounded-2xl font-black uppercase">Resume Exam</button>
          </div>
        </div>
      )}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default MonthlyExam;
