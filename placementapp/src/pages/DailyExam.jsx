import {
  faCamera,
  faClock,
  faFlag
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

// Indestructible global array to catch all streams outside React DOM scope
let globalStreamsToClean = [];

// Subject-wise rules (marks and pass criteria)
const SUBJECT_RULES = {
  python:   { displayName: "Python",   maxQuestions: 30, passMarks: 20, durationMinutes: 75 },
  java:     { displayName: "Java",     maxQuestions: 30, passMarks: 20, durationMinutes: 75 },
  oracle:   { displayName: "Oracle",   maxQuestions: 30, passMarks: 20, durationMinutes: 75 },
  django:   { displayName: "Django",   maxQuestions: 30, passMarks: 20, durationMinutes: 75 },
  react:    { displayName: "React",    maxQuestions: 30, passMarks: 20, durationMinutes: 75 },
  agentic_ai_claude: { displayName: "Agentic AI (Claude)", maxQuestions: 30, passMarks: 20, durationMinutes: 75 },
  agentic_ai_gpt:    { displayName: "Agentic AI (GPT)",    maxQuestions: 30, passMarks: 20, durationMinutes: 75 },
  ui:       { displayName: "UI",       passMarks: 45, sections: ["html", "css", "javascript", "bootstrap", "react"], durationMinutes: 120 },
  backend:  { displayName: "Backend",  passMarks: 20, sections: ["node_js", "express_js"], durationMinutes: 120 },
};
// Default for unknown subjects
const DEFAULT_RULE = { maxQuestions: 30, passMarks: 20, durationMinutes: 75 };

// Course to subject map (keep in sync with DailyExamSubjects)
const courseMappings = {
  "java full stack": ["java", "oracle", "ui", "backend", "spring", "hibernate", "jdbc", "react"],
  "python full stack": ["python", "oracle", "django", "ui", "backend", "react", "python_data_science"],
  "mern": ["mongodb", "express_js", "react", "node_js", "backend", "web_apis", "javascript"],
  "mern stack": ["mongodb", "express_js", "react", "node_js", "backend", "web_apis", "javascript"],
  "mean": ["mongodb", "express_js", "angular", "node_js", "backend", "web_apis", "javascript"],
  "mean stack": ["mongodb", "express_js", "angular", "node_js", "backend", "web_apis", "javascript"],
  "mevn": ["mongodb", "express_js", "vue", "node_js", "backend", "web_apis", "javascript"],
  "mevn stack": ["mongodb", "express_js", "vue", "node_js", "backend", "web_apis", "javascript"],
  "full stack": ["ui", "backend", "react", "node_js", "express_js", "web_apis", "javascript", "database_basics"],
  "frontend": ["ui", "react", "javascript", "html", "css", "bootstrap"],
  "backend": ["backend", "node_js", "express_js", "web_apis", "database_basics", "oracle"],
  "data science": ["python_data_science", "numpy", "pandas", "data_visualization", "machine_learning", "ai_concepts", "generative_ai", "deep_learning"],
  "data analytics": ["python", "python_data_science", "dashboards", "oracle", "excel", "numpy", "pandas"],
  "mongo db": ["python", "java", "c_sharp", "backend", "dotnet", "mongodb"],
  "mongodb": ["python", "java", "c_sharp", "backend", "dotnet", "mongodb"],
  "power bi": ["power_query", "dax", "dashboards", "data_visualization", "reports"],
  "powerbi": ["power_query", "dax", "dashboards", "data_visualization", "reports"],
  "devops": ["git_github", "ci_cd", "docker", "kubernetes_basics", "cloud_basics", "ec2_s3", "iam", "deployment"],
  "cloud": ["cloud_basics", "ec2_s3", "iam", "google_cloud", "microsoft_azure"],
  "cyber security": ["network_security", "penetration_testing", "ethical_hacking", "cloud_basics", "iam", "ec2_s3"],
  "information security": ["network_security", "penetration_testing", "ethical_hacking", "cloud_basics", "iam", "ec2_s3"],
  "agentic ai": ["agentic_ai_claude", "agentic_ai_gpt", "generative_ai", "ai_concepts", "python"],
  "agenticai": ["agentic_ai_claude", "agentic_ai_gpt", "generative_ai", "ai_concepts", "python"],
  "autonomous agents": ["agentic_ai_claude", "agentic_ai_gpt", "generative_ai", "ai_concepts", "python"],
  "mobile full stack": ["flutter_react_native", "android", "ios_swift", "backend", "api_testing", "ui"],
  "mobile app": ["flutter_react_native", "android", "ios_swift", "backend", "api_testing", "ui"],
  "mobile application": ["flutter_react_native", "android", "ios_swift", "backend", "api_testing", "ui"],
  "flutter": ["flutter_react_native", "android", "ui"],
  "react native": ["flutter_react_native", "react", "ui"],
  "dotnet full stack": ["dotnet", "asp_net_mvc", "c_sharp", "backend", "api_testing", "web_apis", "database_basics", "ui"],
  ".net full stack": ["dotnet", "asp_net_mvc", "c_sharp", "backend", "api_testing", "web_apis", "database_basics", "ui"],
  "dot net full stack": ["dotnet", "asp_net_mvc", "c_sharp", "backend", "api_testing", "web_apis", "database_basics", "ui"],
  "dotnet fullstack": ["dotnet", "asp_net_mvc", "c_sharp", "backend", "api_testing", "web_apis", "database_basics", "ui"],
  "net fullstack": ["dotnet", "asp_net_mvc", "c_sharp", "backend", "api_testing", "web_apis", "database_basics", "ui"],
  "microsoft technologies": ["dotnet", "dotnet_mvc", "asp_net_mvc", "c_sharp", "backend", "web_apis", "database_basics", "ui"],
  "asp.net": ["asp_net_mvc", "c_sharp", "backend", "web_apis", "database_basics", "ui"],
  "asp net": ["asp_net_mvc", "c_sharp", "backend", "web_apis", "database_basics", "ui"],
  "c# full stack": ["c_sharp", "asp_net_mvc", "backend", "web_apis", "database_basics", "ui"],
  "dotnet": ["dotnet", "asp_net_mvc", "c_sharp", "backend", "api_testing", "web_apis", "database_basics", "ui"],
  "dca": ["computer_fundamentals", "programming_basics", "ms_office", "database_basics"],
  "pgdca": ["computer_fundamentals", "programming_basics", "ms_office", "database_basics"],
  "doa": ["ms_word", "excel", "powerpoint", "data_handling"]
};

const knownSubjectKeys = [
  ...Object.keys(SUBJECT_RULES),
  "node_js",
  "express_js",
  "mongodb",
  "angular",
  "vue",
  "web_apis",
  "javascript",
  "html",
  "css",
  "bootstrap",
  "google_cloud",
  "microsoft_azure",
  "network_security",
  "penetration_testing",
  "ethical_hacking",
  "cloud_basics",
  "iam",
  "ec2_s3",
  "flutter_react_native",
  "android",
  "ios_swift",
  "api_testing",
  "asp_net_mvc",
  "c_sharp",
  "web_apis",
  "database_basics",
  "backend",
  "ui",
  "dotnet",
  "dotnet_mvc",
  "agentic_ai_claude",
  "agentic_ai_gpt",
  "generative_ai",
  "ai_concepts",
  "power_query",
  "dax",
  "dashboards",
  "data_visualization",
  "reports",
  "oracle",
  "python_data_science",
  "python",
  "c_sharp",
  "dotnet",
  "backend",
  "java",
  "mongodb",
  "excel",
  "numpy",
  "pandas"
];

const getAllowedSubjects = (courseName = "") => {
  const normalized = courseName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const matchedKey = Object.keys(courseMappings).find((key) =>
    normalized.includes(key)
  );
  if (matchedKey) return courseMappings[matchedKey];

  // Synonym boost (helps when course name doesn't directly match subjects)
  const synonymMap = {
    cyber: ["network_security", "penetration_testing", "ethical_hacking", "cloud_basics", "iam", "ec2_s3"],
    security: ["network_security", "penetration_testing", "ethical_hacking", "cloud_basics", "iam", "ec2_s3"],
    hacking: ["ethical_hacking", "penetration_testing"],
    agentic: ["agentic_ai_claude", "agentic_ai_gpt", "generative_ai", "ai_concepts", "python"],
    agents: ["agentic_ai_claude", "agentic_ai_gpt", "generative_ai", "ai_concepts", "python"],
    "agentic ai": ["agentic_ai_claude", "agentic_ai_gpt", "generative_ai", "ai_concepts", "python"],
    "autonomous agents": ["agentic_ai_claude", "agentic_ai_gpt", "generative_ai", "ai_concepts", "python"],
    analytics: ["python", "python_data_science", "dashboards", "oracle", "excel", "numpy", "pandas"],
    "data analytics": ["python", "python_data_science", "dashboards", "oracle", "excel", "numpy", "pandas"],
    mongodb: ["python", "java", "c_sharp", "backend", "dotnet", "mongodb"],
    "mongo db": ["python", "java", "c_sharp", "backend", "dotnet", "mongodb"],
    powerbi: ["power_query", "dax", "dashboards", "data_visualization", "reports"],
    "power bi": ["power_query", "dax", "dashboards", "data_visualization", "reports"],
    "power query": ["power_query"],
    dax: ["dax"],
    cloud: ["cloud_basics", "ec2_s3", "iam", "google_cloud", "microsoft_azure"],
    devsecops: ["devops", "network_security", "penetration_testing"],
    mobile: ["flutter_react_native", "android", "ios_swift", "ui", "backend", "api_testing"],
    app: ["flutter_react_native", "android", "ios_swift", "ui"],
    application: ["flutter_react_native", "android", "ios_swift", "ui"],
    flutter: ["flutter_react_native", "android", "ui"],
    reactnative: ["flutter_react_native", "react", "ui"],
    dotnet: ["dotnet", "asp_net_mvc", "c_sharp", "backend", "api_testing", "web_apis", "database_basics", "ui"],
    "net fullstack": ["dotnet", "asp_net_mvc", "c_sharp", "backend", "api_testing", "web_apis", "database_basics", "ui"],
    "dot net": ["dotnet", "asp_net_mvc", "c_sharp", "backend", "api_testing", "web_apis", "database_basics", "ui"],
    "dotnet fullstack": ["dotnet", "asp_net_mvc", "c_sharp", "backend", "api_testing", "web_apis", "database_basics", "ui"],
    "asp net": ["asp_net_mvc", "c_sharp", "backend", "web_apis", "database_basics", "ui"],
    "asp.net": ["asp_net_mvc", "c_sharp", "backend", "web_apis", "database_basics", "ui"],
    csharp: ["c_sharp", "asp_net_mvc", "backend"],
  };

  // Fallback: token-based fuzzy match against known subject keys
  const tokens = normalized.split(" ").filter((t) => t.length > 2);
  const allowed = new Set();

  tokens.forEach((tok) => {
    if (synonymMap[tok]) {
      synonymMap[tok].forEach((s) => allowed.add(s));
    }
  });

  tokens.forEach((tok) => {
    knownSubjectKeys.forEach((key) => {
      if (key.toLowerCase().includes(tok) || tok.includes(key.toLowerCase())) {
        allowed.add(key);
      }
    });
  });
  return Array.from(allowed);
};

// Match arbitrary course topics to known subject keys
const matchTopicsToSubjects = (topicList = []) => {
  const results = new Set();
  topicList.forEach((t) => {
    const topic = String(t || "").toLowerCase();
    const slug = topic.replace(/[^a-z0-9]+/g, "_");
    knownSubjectKeys.forEach((key) => {
      if (
        key.includes(slug) ||
        slug.includes(key) ||
        topic.includes(key) ||
        key.includes(topic)
      ) {
        results.add(key);
      }
    });
  });
  return Array.from(results);
};

const DailyExam = () => {

  const { subject } = useParams();
  const subjectKey = (subject || "python").toLowerCase();
  const isSectionedSubject = subjectKey === "ui" || subjectKey === "backend";
  const subjectRule = SUBJECT_RULES[subjectKey] || { ...DEFAULT_RULE, displayName: subject ? subject.charAt(0).toUpperCase() + subject.slice(1).replace(/_/g, ' ') : 'Exam' };
  const sectionCount = isSectionedSubject ? (subjectRule.sections?.length || 0) : 0;
  const subjectName = subjectRule.displayName || (subject ? subject.charAt(0).toUpperCase() + subject.slice(1) : 'Python');
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(true);
  const [isAILoading, setIsAILoading] = useState(false);
  const [examStarted, setExamStarted] = useState(false);
  const [examSubmitted, setExamSubmitted] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  // Custom Passing Rules from Faculty
  const [passingRule, setPassingRule] = useState("percentage"); 
  const [passingValue, setPassingValue] = useState(50); // Default 50% for daily
  const [answers, setAnswers] = useState([]);
  const [markedForReview, setMarkedForReview] = useState([]);
  const [visitedQuestions, setVisitedQuestions] = useState([]);
  const [timeLeft, setTimeLeft] = useState(2700); // placeholder
  const [examDuration, setExamDuration] = useState(45); // default 45 min
  const [webcamActive, setWebcamActive] = useState(false);
  const [webcamStatus, setWebcamStatus] = useState('idle'); // 'idle' | 'loading' | 'active' | 'error'
  const [faceCount, setFaceCount] = useState(1);
  const [examFailed, setExamFailed] = useState(false);
  const [uiUnlockedSections, setUiUnlockedSections] = useState(isSectionedSubject ? 1 : 10); // large default for non-UI
  const [currentSectionQuestions, setCurrentSectionQuestions] = useState([]);
  const [uiCurrentSection, setUiCurrentSection] = useState(0); // 0-based, for sectioned subjects

  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const userRole = (storedUser.role || "").toLowerCase();
  const isStudent = userRole === "student";
  const [studentCourse, setStudentCourse] = useState((storedUser.course || "").trim());
  const [courseResolved, setCourseResolved] = useState(!isStudent || !!(storedUser.course || "").trim());
  const [courseId, setCourseId] = useState(null);
  const [topicsAllowed, setTopicsAllowed] = useState([]);

  const examSubmittedRef = useRef(false);
  const violationStartTimeRef = useRef(null);
  const cleanTimeoutRef = useRef(0);
  const lastWarningTimeRef = useRef(0);
  const [warningCount, setWarningCount] = useState(0);
  const [warningMessage, setWarningMessage] = useState("");
  const [showWarningModal, setShowWarningModal] = useState(false);

  // Always refresh course from profile on mount so newly registered courses reflect immediately
  useEffect(() => {
    const token = localStorage.getItem("access");
    if (!isStudent || !token) return;

    const syncCourseFromProfile = async () => {
      try {
        const res = await fetch("http://127.0.0.1:8000/api/profile/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return;
        const data = await res.json();
        const resolvedCourse = (data?.course_title || data?.course || "").trim();
        const resolvedCourseId = data?.course || null;
        if (resolvedCourse && resolvedCourse !== studentCourse) {
          setStudentCourse(resolvedCourse);
          const updatedUser = { ...storedUser, course: resolvedCourse };
          localStorage.setItem("user", JSON.stringify(updatedUser));
        }
        if (resolvedCourseId) setCourseId(resolvedCourseId);
        setCourseResolved(true);
      } catch (err) {
        console.error("Failed to sync course from profile:", err);
      }
    };

    syncCourseFromProfile();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isStudent]);

  // Ensure we know the student's course (fallback to profile if it wasn't cached)
  useEffect(() => {
    if (!isStudent) {
      if (!courseResolved) setCourseResolved(true);
      return;
    }
    if (studentCourse) {
      if (!courseResolved) setCourseResolved(true);
      return;
    }

    const token = localStorage.getItem("access");
    if (!token) {
      setCourseResolved(true);
      return;
    }

    const fetchCourseFromProfile = async () => {
      try {
        const res = await fetch("http://127.0.0.1:8000/api/profile/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          const resolvedCourse = data?.course_title || data?.course || "";
          const resolvedCourseId = data?.course || null;
          if (resolvedCourse) {
            setStudentCourse(resolvedCourse);
            const updatedUser = { ...storedUser, course: resolvedCourse };
            localStorage.setItem("user", JSON.stringify(updatedUser));
          }
          if (resolvedCourseId) {
            setCourseId(resolvedCourseId);
          }
        }
      } catch (err) {
        console.error("Failed to resolve course from profile:", err);
      } finally {
        setCourseResolved(true);
      }
    };

    fetchCourseFromProfile();
  }, [isStudent, studentCourse, courseResolved]);

  // Fetch topics for student's course to refine allowed subjects dynamically
  useEffect(() => {
    const token = localStorage.getItem("access");
    if (!isStudent || !token) return;
    if (!courseId) return;

    const fetchTopics = async () => {
      try {
        const res = await fetch(`http://127.0.0.1:8000/api/courses/${courseId}/topics/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return;
        const json = await res.json();
        const topicList = Array.isArray(json.topics) ? json.topics : [];
        const matched = matchTopicsToSubjects(topicList);
        if (matched.length > 0) setTopicsAllowed(matched);
      } catch (err) {
        console.error("Failed to fetch course topics:", err);
      }
    };

    fetchTopics();
  }, [isStudent, courseId]);

  const triggerWarning = (reason) => {
    if (examSubmittedRef.current) return;
    const now = Date.now();
    // 3-second cooldown to prevent overlapping alerts for the same event
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
    
    // Request fullscreen with comprehensive vendor prefix support
    const docEl = document.documentElement;
    if (!document.fullscreenElement && 
        !document.webkitFullscreenElement && 
        !document.mozFullScreenElement && 
        !document.msFullscreenElement) {
      
      try {
        if (docEl.requestFullscreen) {
          await docEl.requestFullscreen();
        } else if (docEl.webkitRequestFullscreen) {
          await docEl.webkitRequestFullscreen();
        } else if (docEl.mozRequestFullScreen) {
          await docEl.mozRequestFullScreen();
        } else if (docEl.msRequestFullscreen) {
          await docEl.msRequestFullscreen();
        }
      } catch (err) {
        console.error("Critical: Fullscreen restoration failed", err);
      }
    }
  };

  // Webcam functions - moved outside security monitoring scope
  const startWebcam = async () => {
    if (webcamStatus === 'active' || webcamStatus === 'loading') return;
    
    try {
      setWebcamStatus('loading');
      setWebcamActive(false);
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 640 }, 
          height: { ideal: 480 } 
        },
        audio: false 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setWebcamActive(true);
      setWebcamStatus('active');

      // Detect student physically closing/disabling camera
      stream.getVideoTracks().forEach(track => {
        track.addEventListener('ended', () => {
          if (!examSubmittedRef.current) {
            setWebcamActive(false);
            setWebcamStatus('error');
            triggerWarning("Camera was turned off or disconnected. Please keep your camera active during the exam.");
          }
        });
      });

      globalStreamsToClean.push(stream);
    } catch (err) {
      console.error("Webcam access denied:", err);
      setWebcamActive(false);
      setWebcamStatus('error');
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
    if (!courseResolved) return;

    const baseAllowed = getAllowedSubjects(studentCourse);
    let effectiveAllowed = Array.from(new Set([...(baseAllowed || []), ...(topicsAllowed || [])]));
    const courseMatch = (studentCourse || "").toLowerCase();
    if (courseMatch.match(/mobile|flutter|react\s*native/)) {
      effectiveAllowed = Array.from(new Set([...effectiveAllowed, "flutter_react_native", "android", "ios_swift"]));
    }
    if (courseMatch.match(/dotnet|\.net|asp\s*net|asp\.net|c#|csharp/)) {
      effectiveAllowed = Array.from(new Set([...effectiveAllowed, "dotnet", "asp_net_mvc", "c_sharp", "backend", "web_apis", "database_basics", "ui"]));
    }
    const shouldRestrict = isStudent && studentCourse && effectiveAllowed.length > 0;

    if (shouldRestrict && !effectiveAllowed.includes(subjectKey)) {
      navigate("/dashboard/daily-exam", { replace: true });
      return;
    }

    if (localStorage.getItem("examResult")) {
      navigate("/dashboard/playground-results", { replace: true });
      return;
    }
    // Always start fresh - don't restore previous exam state
    try {
      sessionStorage.removeItem('dailyExamState');
    } catch (e) {
      console.error("Failed to clear session storage:", e);
    }

    const fetchQuestions = async () => {
      try {
        setIsLoadingQuestions(true);

        const mapQuestionList = (data, startIndex = 0, sectionLabel = null, limit = 999) => {
          if (!Array.isArray(data)) return [];
          return data.slice(0, limit).map((q, idx) => ({
            ...q,
            id: startIndex + idx + 1,
            marks: 2, // Each question carries 2 marks
            section: sectionLabel,
            options: Array.isArray(q.options) ? q.options : [],
            correct: q.correct !== undefined
              ? q.correct
              : (Array.isArray(q.options) && q.options.indexOf(q.answer) !== -1 ? q.options.indexOf(q.answer) : 0),
          }));
        };

        let assembledQuestions = [];

        if (isSectionedSubject) {
          const sections = subjectRule.sections || [];
          let sectionLabels = [];
          
          if (subjectKey === "ui") {
             sectionLabels = [
              "Section-A (HTML)",
              "Section-B (CSS)",
              "Section-C (JavaScript)",
              "Section-D (Bootstrap)",
              "Section-E (React)"
            ];
          } else if (subjectKey === "backend") {
            sectionLabels = [
              "Section-A (Node.js)",
              "Section-B (Express.js)"
            ];
          }

          let offset = 0;
          for (let i = 0; i < sections.length; i++) {
            const secKey = sections[i];
            try {
              const res = await fetch(`/api/playground-questions/${secKey}/`);
              const json = await res.json();
              const data = json.data || json;
              let chunk = mapQuestionList(data, offset, sectionLabels[i] || secKey.toUpperCase(), 20);
              // Pad if fewer than 20
              if (chunk.length < 20 && chunk.length > 0) {
                const needed = 20 - chunk.length;
                const pad = [];
                for (let k = 0; k < needed; k++) {
                  const src = chunk[k % chunk.length];
                  pad.push({ ...src, id: offset + chunk.length + k + 1 });
                }
                chunk = [...chunk, ...pad];
              }
              assembledQuestions = assembledQuestions.concat(chunk);
              offset += chunk.length;
            } catch (err) {
              console.error(`Failed to fetch ${secKey} questions:`, err);
            }
          }
        } else {
          const res = await fetch("/api/playground-questions/" + (subjectKey || 'python') + "/");
          const json = await res.json();
          const data = json.data || json;
          const limit = subjectRule.maxQuestions || 20;
          assembledQuestions = mapQuestionList(data, 0, null, limit);
          // Pad up to limit if fewer received
          if (assembledQuestions.length < limit && assembledQuestions.length > 0) {
            const needed = limit - assembledQuestions.length;
            const pad = [];
            for (let k = 0; k < needed; k++) {
              const src = assembledQuestions[k % assembledQuestions.length];
              pad.push({ ...src, id: assembledQuestions.length + k + 1 });
            }
            assembledQuestions = [...assembledQuestions, ...pad];
          }
        }

        if (assembledQuestions.length > 0) {
          const totalQ = assembledQuestions.length;
          const totalMarks = totalQ * 2;
          const passMarks = subjectRule.passMarks || 20;
          const passPercent = totalMarks > 0 ? (passMarks / totalMarks) * 100 : 50;
          const duration = subjectRule.durationMinutes || 45;

          setQuestions(assembledQuestions);
          setExamDuration(duration);
          setTimeLeft(duration * 60);
          setPassingRule("percentage");
          setPassingValue(passPercent);
        }
      } catch (err) {
        console.error("Failed to fetch practice questions:", err);
      } finally {
        setIsLoadingQuestions(false);
      }
    };
    fetchQuestions();
    
    if (webcamStatus === 'idle') {
      startWebcam();
    }
  }, [courseResolved, subjectKey, studentCourse, isStudent, topicsAllowed]);

  // Sync stream to video element whenever it mounts (Prep or Exam)
  useEffect(() => {
    if (videoRef.current && globalStreamsToClean.length > 0) {
      videoRef.current.srcObject = globalStreamsToClean[0];
    }
  }, [examStarted, webcamStatus]);

  // TIMER
  useEffect(() => {
    if (examStarted && !examSubmitted && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
    if (timeLeft === 0 && examStarted && !examSubmitted) {
      handleSubmitExam("Time expired");
    }
  }, [timeLeft, examStarted, examSubmitted]);

  // Auto-unlock next section once the current one is fully answered
  useEffect(() => {
    if (!isSectionedSubject || !answers || answers.length === 0 || sectionCount === 0) return;
    const sectionSize = 20;
    let maxUnlocked = uiUnlockedSections;
    for (let i = 0; i < sectionCount; i++) {
      const start = i * sectionSize;
      const end = start + sectionSize;
      if (end > answers.length) break;
      const slice = answers.slice(start, end);
      const complete = slice.length === sectionSize && slice.every((a) => a !== null && a !== undefined && a !== "");
      if (complete) {
        maxUnlocked = Math.max(maxUnlocked, i + 1);
      } else {
        break;
      }
    }
    if (maxUnlocked !== uiUnlockedSections) {
      setUiUnlockedSections(maxUnlocked);
    }
  }, [answers, isSectionedSubject, uiUnlockedSections, sectionCount]);

  // Keep current question within visible slice for UI sections
  useEffect(() => {
    if (!isSectionedSubject) return;
    const sectionSize = 20;
    const start = uiCurrentSection * sectionSize;
    const end = start + sectionSize;
    if (currentQuestion >= sectionSize) {
      setCurrentQuestion(sectionSize - 1);
    }
    if (uiCurrentSection + 1 > uiUnlockedSections) {
      setUiCurrentSection(uiUnlockedSections - 1);
    }
  }, [isSectionedSubject, uiUnlockedSections, uiCurrentSection, currentQuestion]);

  // Prevent browser refresh and back button during exam
  useEffect(() => {
    if (examStarted && !examSubmitted) {
      // Prevent F5, Ctrl+R, Ctrl+Shift+R refresh
      const preventRefresh = (e) => {
  //  ESC → auto submit
  if (e.key === "Escape") {
    e.preventDefault();
    handleSubmitExam("ESC pressed");
    return;
  }

  if (
    e.key === "F5" ||
    (e.ctrlKey && e.key === "r") ||
    (e.ctrlKey && e.shiftKey && e.key === "r") ||
    ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key) ||
    (e.ctrlKey && e.key === "Tab") ||
    (e.ctrlKey && e.shiftKey && e.key === "Tab") ||
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
    const ctx = canvas.getContext("2d", { willReadFrequently: true });

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
       const isDark = brightness < 20; // More forgiving in dim rooms
       const isFlat = variation < 15; // More forgiving for low-contrast cams
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

        const isCameraCovered = isDark || isFlat;

        if (isCameraCovered || multipleFaces || noFace || faceNotCentered) {
          if (!violationStartTimeRef.current) {
            violationStartTimeRef.current = Date.now();
          } else if (Date.now() - violationStartTimeRef.current > 3000) {
            if (multipleFaces) {
              triggerWarning("⚠️ Multiple persons detected on camera. Only the student must be visible during the exam.");
            } else if (isCameraCovered) {
              triggerWarning("⚠️ Camera appears to be covered or blocked. Please ensure your face is clearly visible.");
            } else if (noFace) {
              triggerWarning("⚠️ Face not detected. Please keep your face clearly visible to the camera. Do not bend down or hide your face.");
            } else if (faceNotCentered) {
              triggerWarning("⚠️ Your face has moved off-screen. Please stay centered in front of the camera and avoid looking away.");
            }
            violationStartTimeRef.current = null; // Reset so warning can repeat
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
    stopWebcam();
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
    sessionStorage.removeItem('dailyExamState');

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
    if (isSectionedSubject) {
      setUiCurrentSection(0);
      setUiUnlockedSections(1);
    }
    // TimeLeft is already set by fetchQuestionsFromBackend based on examDuration
    setExamSubmitted(false);
    examSubmittedRef.current = false;
    
    // Clear any potential cached state
    try {
      sessionStorage.removeItem('dailyExamState');
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
    const targetIndex = isSectionedSubject ? uiSectionStart + qIndex : qIndex;
    newAnswers[targetIndex] = optionIndex;
    setAnswers(newAnswers);
  };

  const toggleMarkForReview = (index) => {
    const target = isSectionedSubject ? uiSectionStart + index : index;
    // Ensure array length matches questions length to avoid undefined accesses
    const updated = markedForReview.length === questions.length
      ? [...markedForReview]
      : Array.from({ length: questions.length }, (_, i) => markedForReview[i] || false);
    updated[target] = !updated[target];
    setMarkedForReview(updated);
  };

  const goToQuestion = (index) => {
    if (isSectionedSubject) {
      const sectionSize = 20;
      if (index < 0 || index >= sectionSize) return;
    } else {
      if (index < 0 || index >= questions.length) return;
    }
    const visited = [...visitedQuestions];
    const globalIndex = isSectionedSubject ? uiCurrentSection * 20 + index : index;
    visited[globalIndex] = true;
    setVisitedQuestions(visited);
    setCurrentQuestion(index);
  };

  const nextQuestion = () => {
    if (isSectionedSubject) {
      const sectionSize = 20;
      if (currentQuestion < sectionSize - 1) {
        goToQuestion(currentQuestion + 1);
      }
      return;
    }
    if (currentQuestion < questions.length - 1) {
      goToQuestion(currentQuestion + 1);
    }
  };

  const unlockNextSection = () => {
    if (!isSectionedSubject) return;
    const sectionSize = 20;
    const start = uiCurrentSection * sectionSize;
    const end = start + sectionSize;
    const slice = answers.slice(start, end);
    const allAnswered = slice.length === sectionSize && slice.every((a) => a !== null && a !== undefined && a !== "");
    if (!allAnswered) return;
    if (uiUnlockedSections < sectionCount) {
      setUiUnlockedSections((prev) => prev + 1);
      setUiCurrentSection((prev) => prev + 1);
      setCurrentQuestion(0);
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
    sessionStorage.removeItem('dailyExamState');

    try {
      if (document.fullscreenElement) {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        } else if (document.mozCancelFullScreen) {
          document.mozCancelFullScreen();
        } else if (document.webkitExitFullscreen) {
          document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
          document.msExitFullscreen();
        }
      }
    } catch (err) {
      console.error("Failed to exit full screen:", err);
    }

    const userStr = localStorage.getItem("user");
    let user = {};

    try {
      user = userStr && userStr !== "undefined" ? JSON.parse(userStr) : {};
    } catch (e) { }

    const randomId = Math.floor(1000 + Math.random() * 9000);
    const now = new Date().toISOString();

    let correctCount = 0;
    let earnedMarks = 0;
    let maxPossibleMarks = 0;

    answers.forEach((ans, index) => {
      const q = questions[index];
      if (!q) return;

      const qMarks = parseInt(q.marks) || 2;
      maxPossibleMarks += qMarks;

      if (ans === q.correct) {
        correctCount++;
        earnedMarks += qMarks;
      }
    });

    const totalQ = questions.length;
    const finalScore = earnedMarks;

    // Calculate passing status
    let passed = false;
    if (passingRule === "percentage") {
       const percent = maxPossibleMarks > 0 ? (earnedMarks / maxPossibleMarks) * 100 : 0;
       passed = percent >= passingValue;
    } else {
       passed = correctCount >= passingValue;
    }

    // Determine proctoring status
    const isTerminated = reason && (reason.toLowerCase().includes("terminated") || reason.toLowerCase().includes("violated") || reason.toLowerCase().includes("detected"));
    const finalStatus = isTerminated ? "Cheated" : "completed";

    const result = {
      status: finalStatus,
      correctAnswers: correctCount,
      incorrectAnswers: totalQ - correctCount,
      totalQuestions: totalQ,
      score: finalScore,
      marks: finalScore,
      total_marks: maxPossibleMarks,
      totalMarks: maxPossibleMarks, // align with results table expectation
      passed: passed,
      time_taken: (examDuration * 60) - timeLeft,
      start_time: now,
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
      examTitle: `${subjectName} Exam`,
      submissionReason: reason
    };

    try {
      await fetch("/api/save-exam-report/", {
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
    sessionStorage.removeItem('dailyExamState');

    // Remove the locked back-button state, then navigate to results replacing the exam in history
    window.history.go(-1);
    setTimeout(() => {
      navigate("/dashboard/playground-results", { replace: true });
    }, 100);
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  if (!examStarted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl shadow-blue-100 max-w-lg w-full text-center border border-white">
          
          <div className="relative w-64 h-48 mx-auto mb-8 rounded-[2rem] overflow-hidden bg-gray-900 shadow-xl ring-4 ring-white border-4 border-white">
             {webcamStatus === 'active' ? (
                <video
                  autoPlay
                  playsInline
                  muted
                  style={{ transform: 'scaleX(-1)' }}
                  className="w-full h-full object-cover"
                  ref={(el) => {
                    if (el && globalStreamsToClean.length > 0) {
                      el.srcObject = globalStreamsToClean[0];
                      // Handle play promise to avoid AbortError
                      const playPromise = el.play();
                      if (playPromise !== undefined) {
                        playPromise.catch(() => {
                          // Ignore play interruptions
                        });
                      }
                    }
                  }}
                />
             ) : webcamStatus === 'error' ? (
                <div className="w-full h-full flex flex-col items-center justify-center gap-3 bg-red-50 p-6">
                   <FontAwesomeIcon icon={faCamera} className="text-red-300 text-3xl" />
                   <p className="text-[9px] font-black text-red-600 uppercase tracking-widest leading-relaxed">Camera Blocked or Not Found</p>
                   <button 
                     onClick={() => startWebcam()}
                     className="mt-2 text-[8px] font-black text-white bg-red-600 px-4 py-2 rounded-full uppercase tracking-widest hover:bg-red-700 transition-colors"
                   >
                      Grant Camera Permission
                   </button>
                </div>
             ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-3">
                   <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                   <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Activating Camera...</p>
                </div>
             )}
             <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/20">
                <div className="flex items-center gap-1.5">
                   <div className={`w-1.5 h-1.5 rounded-full ${webcamStatus === 'active' ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}></div>
                   <span className="text-[8px] font-black text-white uppercase tracking-[0.2em]">Preview</span>
                </div>
             </div>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-black text-gray-900 mb-2 uppercase tracking-tight">
              {subjectName} Exam
            </h2>
            <div className="h-1 w-12 bg-blue-600 mx-auto rounded-full mb-4"></div>
            <p className="text-gray-500 font-medium leading-relaxed px-4">
              {!isLoadingQuestions && questions.length === 0 
                ? <span className="text-red-500 font-bold">No assessment paper currently available.</span>
                : `${questions.length || subjectRule.maxQuestions || 20} Questions • ${examDuration} Minutes`}
              <br/>
              <span className="text-[10px] uppercase font-black tracking-widest text-blue-600 mt-2 inline-block">Proctored Session</span>
            </p>
          </div>

          <button
            onClick={startExam}
            disabled={isAILoading || isLoadingQuestions || (!isLoadingQuestions && questions.length === 0) || !webcamActive}
            className={`w-full py-4 rounded-2xl text-white font-black uppercase tracking-[0.2em] transition-all shadow-lg ${(isAILoading || isLoadingQuestions || (!isLoadingQuestions && questions.length === 0) || !webcamActive)
              ? 'bg-gray-300 cursor-not-allowed shadow-none'
              : 'bg-blue-600 hover:bg-blue-700 hover:scale-[1.02] active:scale-95 shadow-blue-100'
              }`}
          >
            {isLoadingQuestions ? 'Fetching Assessment...' 
            : isAILoading ? 'Syncing Security AI...' 
            : !webcamActive ? 'Waiting for Camera...'
            : 'Start Assessment'}
          </button>

          <button
            onClick={() => navigate("/dashboard/daily-exam")}
            className="block mt-6 text-[10px] font-black text-gray-400 hover:text-blue-600 uppercase tracking-widest mx-auto transition-colors"
          >
            Back to Daily Assessment Center
          </button>

          <p className="mt-6 text-[10px] text-gray-400 font-bold uppercase tracking-widest flex items-center justify-center gap-2">
             <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
             Follow all proctoring rules during the exam
          </p>
        </div>
      </div>
    );
  }

  if (!questions || questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-center">
         <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Waking up assessment engine...</p>
         </div>
      </div>
    );
  }

  const sectionSize = 20;
  const uiSectionStart = isSectionedSubject ? uiCurrentSection * sectionSize : 0;
  const uiSectionEnd = isSectionedSubject ? uiSectionStart + sectionSize : questions.length;
  const displayQuestions = isSectionedSubject ? questions.slice(uiSectionStart, uiSectionEnd) : questions;
  const activeQuestion = displayQuestions[currentQuestion] || displayQuestions[displayQuestions.length - 1] || questions[currentQuestion];
  const sectionDisplayNames = subjectKey === "ui" ? ["HTML", "CSS", "JavaScript", "Bootstrap", "React"] : ["Node.js", "Express.js"];
  const currentSectionTitle = isSectionedSubject ? `${(sectionDisplayNames[uiCurrentSection] || `Section ${uiCurrentSection + 1}`)} Exam` : `${subjectName} Exam`;
  // Show per-section numbering 1-20, but keep global labels elsewhere
  const questionNumberLabel = isSectionedSubject ? (currentQuestion + 1) : (currentQuestion + 1);

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
          <canvas ref={canvasRef} style={{ display: "none" }} />
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

      <div className="max-w-5xl mx-auto">
        {/* COMPACT STICKY HEADER matching WeeklyExam */}
        <div className="bg-white/80 backdrop-blur-md px-6 py-4 rounded-[1.5rem] shadow-sm border border-gray-100 flex justify-between items-center mb-6 sticky top-0 z-40 mx-auto max-w-4xl w-full">
          <div className="flex items-center gap-4">
             <div className="bg-blue-50/50 px-4 py-2 rounded-xl flex items-center gap-2.5 border border-blue-100/50">
                <FontAwesomeIcon icon={faClock} className="text-blue-500 text-xs" />
                <span className="font-black text-blue-700 tabular-nums text-base font-black">{formatTime(timeLeft)}</span>
             </div>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
             <span className="text-blue-600">{subjectName} Exam</span>
          </div>
        </div>

        {isSectionedSubject && (
                  <div className="bg-gradient-to-br from-indigo-900 to-slate-900 p-8 rounded-[2.5rem] shadow-2xl border border-white/5 relative overflow-hidden group mb-6">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl group-hover:bg-white/10 transition-colors duration-700"></div>
                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                       <div className="text-center md:text-left flex flex-col items-center md:items-start gap-4">
                          <div className="bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10 inline-block mb-1">
                             <span className="text-[10px] font-black tracking-[0.2em] uppercase text-indigo-200">Technical Sections Overview</span>
                          </div>
                          <div className="flex flex-col gap-1 text-center md:text-left">
                             <h2 className="text-4xl font-black text-white uppercase tracking-tight leading-none mb-1">SECTIONAL NAVIGATION</h2>
                             <p className="text-indigo-200/60 font-black text-[11px] uppercase tracking-widest">Complete current section to unlock more technical depth</p>
                          </div>
                       </div>
                       
                       <div className="flex flex-wrap justify-center gap-3 md:gap-4 p-2.5 bg-white/5 backdrop-blur-sm rounded-[2rem] border border-white/5 self-stretch md:self-auto items-center">
                          {sectionDisplayNames.map((name, idx) => {
                            const isUnlocked = idx < uiUnlockedSections;
                            const isCurrent = idx === uiCurrentSection;
                            return (
                              <button
                                key={idx}
                                onClick={() => isUnlocked && setUiCurrentSection(idx)}
                                disabled={!isUnlocked}
                                className={`px-6 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all duration-300 transform active:scale-95 ${
                                  isCurrent 
                                    ? 'bg-white text-indigo-900 shadow-xl shadow-white/10 -translate-y-1 scale-105' 
                                    : isUnlocked 
                                      ? 'bg-indigo-700/40 text-white hover:bg-white/10 border border-white/10' 
                                      : 'bg-white/5 text-white/30 cursor-not-allowed border border-white/5'
                                }`}
                              >
                                {isUnlocked ? "" : "Locked "} Section {String.fromCharCode(65 + idx)}
                                <div className="text-[9px] mt-0.5 opacity-60 font-black tracking-[0.1em]">{name}</div>
                              </button>
                            );
                          })}
                       </div>
                    </div>
                  </div>
                )}

        <div className="grid grid-cols-4 gap-6 items-start">
          <div className="col-span-3 space-y-6">
          <div className="bg-white p-6 rounded-[1.5rem] shadow-sm border border-gray-100 relative overflow-hidden flex flex-col min-h-[440px]">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-10"></div>
                
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2.5">
                <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest pl-1">
                    {currentSectionTitle}
                </span>
              </div>
              <div className="px-3 py-1 bg-gray-50 rounded-xl border border-gray-100">
                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest mr-2">Marks:</span>
                <span className="text-[10px] font-black text-gray-800">{activeQuestion?.marks || 2}</span>
              </div>
            </div>

            <div className="flex-1">
              <div className="mb-8">
                <h3 className="text-lg font-bold text-gray-900 leading-snug mb-3">
                    {activeQuestion?.question}
                </h3>
                <div className="h-0.5 w-8 bg-blue-600/40 rounded-full"></div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {(activeQuestion?.options || []).map((option, index) => (
                    <label 
                      key={index} 
                      className={`group relative flex items-center p-3.5 rounded-2xl border-2 transition-all cursor-pointer ${
                        answers[isSectionedSubject ? uiSectionStart + currentQuestion : currentQuestion] === index 
                        ? 'bg-blue-600 border-blue-600 shadow-lg shadow-blue-100' 
                        : 'bg-white border-gray-50 hover:border-blue-100 hover:bg-blue-50/20'
                      }`}
                    >
                      <div className="flex flex-row items-center w-full gap-3">
                        <div className={`shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                           answers[isSectionedSubject ? uiSectionStart + currentQuestion : currentQuestion] === index 
                           ? 'border-white bg-white/25' 
                           : 'border-gray-200 group-hover:border-blue-300'
                        }`}>
                           {answers[isSectionedSubject ? uiSectionStart + currentQuestion : currentQuestion] === index && <div className="w-2 h-2 bg-white rounded-full"></div>}
                        </div>
                        <input
                          type="radio"
                          name={`q-${isSectionedSubject ? uiSectionStart + currentQuestion : currentQuestion}`}
                          checked={answers[isSectionedSubject ? uiSectionStart + currentQuestion : currentQuestion] === index}
                          onChange={() => handleAnswerSelect(currentQuestion, index)}
                          className="hidden"
                        />
                        <span className={`text-sm font-bold tracking-tight break-words flex-1 ${answers[isSectionedSubject ? uiSectionStart + currentQuestion : currentQuestion] === index ? 'text-white' : 'text-gray-700'}`}>
                           {option || 'Option'}
                        </span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="mt-10 pt-6 border-t border-gray-50 flex justify-between items-center">
                <button
                  onClick={() => toggleMarkForReview(currentQuestion)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                    markedForReview[isSectionedSubject ? uiSectionStart + currentQuestion : currentQuestion] 
                    ? 'bg-amber-100 text-amber-600' 
                    : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
                  }`}
                >
                  <FontAwesomeIcon icon={faFlag} className="text-[10px]" />
                  {markedForReview[isSectionedSubject ? uiSectionStart + currentQuestion : currentQuestion] ? 'Flagged' : 'Mark Review'}
                </button>
                
                <div className="flex gap-2">
                   {currentQuestion > 0 && (
                     <button 
                       onClick={previousQuestion} 
                       className="h-11 px-4 rounded-xl bg-white border border-gray-100 text-gray-600 hover:bg-gray-50 transition-all flex items-center justify-center text-sm"
                     >
                       ←
                     </button>
                   )}
                   {isSectionedSubject ? (
                      currentQuestion < (displayQuestions.length - 1) ? (
                        <button 
                         onClick={nextQuestion} 
                         className="bg-blue-600 text-white px-6 h-11 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-700 shadow-md shadow-blue-100 transition-all active:scale-95"
                        >
                          Next Question
                        </button>
                      ) : uiUnlockedSections < sectionCount ? (
                        <button 
                         onClick={unlockNextSection} 
                         className="bg-orange-500 text-white px-8 h-11 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-orange-600 shadow-md shadow-orange-100 transition-all active:scale-95"
                        >
                          Next Section
                        </button>
                      ) : (
                        <button 
                         onClick={() => handleSubmitExam("Manual submission")} 
                         className="bg-green-600 text-white px-8 h-11 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-green-700 shadow-md shadow-green-100 transition-all active:scale-95"
                        >
                          Finish Exam
                        </button>
                      )
                    ) : (
                      currentQuestion < (displayQuestions.length - 1) ? (
                        <button 
                         onClick={nextQuestion} 
                         className="bg-blue-600 text-white px-6 h-11 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-700 shadow-md shadow-blue-100 transition-all active:scale-95"
                        >
                          Next Question
                        </button>
                      ) : (
                        <button 
                         onClick={() => handleSubmitExam("Manual submission")} 
                         className="bg-green-600 text-white px-8 h-11 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-green-700 shadow-md shadow-green-100 transition-all active:scale-95"
                        >
                          Finish Exam
                        </button>
                      )
                    )}
                </div>
              </div>
            </div>
          </div>

          <aside className="col-span-1 space-y-6 lg:sticky lg:top-24">
            <div className="bg-white p-6 rounded-[2rem] shadow-xl shadow-blue-900/5 border border-gray-100 flex flex-col gap-6">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Navigator</h4>
                  <div className="bg-blue-50 text-blue-600 px-2.5 py-0.5 rounded-lg text-[9px] font-black">
                    {displayQuestions.length > 0 ? Math.round(((answers.slice(uiSectionStart, uiSectionStart + displayQuestions.length).filter(a => a !== null).length) / displayQuestions.length) * 100) : 0}%
                  </div>
                </div>
                
                <div className="grid grid-cols-4 gap-2">
                  {displayQuestions.map((_, index) => {
                    const globalIndex = isSectionedSubject ? uiSectionStart + index : index;
                    let statusColor = "bg-gray-50 text-gray-300 border-gray-50 hover:bg-gray-100 hover:text-gray-400";
                    if (currentQuestion === index) {
                      statusColor = "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-100 scale-105 z-10 pointer-events-none";
                    } else if (markedForReview[globalIndex]) {
                      statusColor = "bg-amber-500 text-white border-amber-500 shadow-sm";
                    } else if (answers[globalIndex] !== null && answers[globalIndex] !== undefined && answers[globalIndex] !== "") {
                      statusColor = "bg-green-500 text-white border-green-500 shadow-sm";
                    }

                    return (
                      <button
                        key={index}
                        onClick={() => goToQuestion(index)}
                        className={`h-10 w-full rounded-xl text-xs font-black transition-all border-2 ${statusColor} hover:scale-105 active:scale-95`}
                      >
                        {isSectionedSubject ? uiSectionStart + index + 1 : index + 1}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-3 border-t border-gray-50 pt-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Answered</span>
                  </div>
                  <span className="text-xs font-black text-gray-800">{answers.filter(a => a !== null).length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                    <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Marked</span>
                  </div>
                  <span className="text-xs font-black text-gray-800">{markedForReview.filter(f => f).length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-2 h-2 rounded-lg border-2 border-blue-600"></div>
                    <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest">Active</span>
                  </div>
                  <span className="text-xs font-black text-blue-600">{currentQuestion + 1}</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>

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

export default DailyExam;
