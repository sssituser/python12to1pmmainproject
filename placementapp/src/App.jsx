import { useEffect } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

/* 🔹 STUDENT */
import StudentLayout from "./Layout/Dashboard";
import AllJobs from "./pages/Alljobs";
import AppliedJobs from "./pages/AppliedJobs";
import ChangePassword from "./pages/ChangePassword";
import Course from "./pages/Course";
import DailyExamReports from "./pages/DailyExamReports";
import DetailedResults from "./pages/DetailedResults";
import ExamLeaderboard from "./pages/ExamLeaderboard";
import ExamReportDetail from "./pages/ExamReportDetail";
import ExamReports from "./pages/ExamReports";
import JobDetails from "./pages/jobDetails";
import Jobs from "./pages/Jobs";
import LeaveRequest from "./pages/Leaverequest";
import Logout from "./pages/Logout";
import MonthlyExam from "./pages/MonthlyExam";
import MonthlyExamReports from "./pages/MonthlyExamReports";
import Playground from "./pages/Playground";
import PlaygroundDetail from "./pages/PlaygroundDetail";
import PlaygroundResults from "./pages/PlaygroundResults";
import Profile from "./pages/Profile";
import PythonExam from "./pages/PythonExam";
import Register from "./pages/Register";
import Settings from "./pages/Settings";
import TopicVideo from "./pages/TopicVideo";
import VideoPlayer from "./pages/VideoPlayer";
import WeeklyExam from "./pages/WeeklyExam";
import WeeklyExamReports from "./pages/WeeklyExamReports";

/* 🔹 FACULTY */
import Applications from "./faculty/Application";
import FacultyCourse from "./faculty/Course";
import FacultyDashboard from "./faculty/Dashboard";
import ExamManager from "./faculty/ExamManager";
import FacultyLayout from "./faculty/FacultyLayout";
import Leaves from "./faculty/LeaveRequest";
import FacultyLogin from "./faculty/login";
import Stats from "./faculty/Stats";

/* 🔹 AUTH */
import Login from "./pages/Login";



function App() {

  const isLoggedIn = localStorage.getItem("access");
  const location = useLocation();

  // Disable browser back button only on exam pages and faculty course pages
  useEffect(() => {
    if (window.allowBrowserBack) {
      return;
    }

    // Block back button only on exam pages (not faculty course pages)
    const isExamPage = location.pathname.includes('/python-exam') || 
                      location.pathname.includes('/weekly-exam') || 
                      location.pathname.includes('/monthly-exam');
    
    if (isExamPage) {
      window.history.pushState(null, null, window.location.pathname + window.location.search);

      const handlePopState = (event) => {
        if (window.allowBrowserBack) {
          return;
        }
        window.history.pushState(null, null, window.location.pathname + window.location.search);
      };

      window.addEventListener("popstate", handlePopState);

      return () => {
        window.removeEventListener("popstate", handlePopState);
      };
    }
  }, [location]);

  
  const token = localStorage.getItem("access");

let user = null;

try {
  const storedUser = localStorage.getItem("user");

  if (storedUser && storedUser !== "undefined") {
    user = JSON.parse(storedUser);
  } else {
    user = null;
  }
} catch (err) {
  console.error("🔥 Invalid user JSON → FIXING...");
  localStorage.removeItem("user");
  user = null;
}

const isStudent = user?.role === "student";
const isFaculty = user?.role === "faculty";


  return (
    <>
    <div className="min-h-screen bg-gradient-to-br from-[#020617] via-[#0f172a] to-[#1e293b]">
      <ToastContainer position="top-right" autoClose={2000} />

      <Routes>

        {/* 🔐 AUTH */}
        <Route path="/" element={<Login />} />
        <Route path="/faculty/login" element={<FacultyLogin />} />
        <Route path="/register" element={<Register />} />

        {/* 🎥 Standalone */}
        <Route path="/video/:courseTitle/:topicName" element={<VideoPlayer />} />


        {/* Exams (Fullscreen, No Sidebar/Navbar) */}

        <Route path="/dashboard/python-exam" element={<PythonExam />} />
        <Route path="/dashboard/weekly-exam" element={<WeeklyExam />} />
        <Route path="/dashboard/monthly-exam" element={<MonthlyExam />} />

        {/* 🔐 Protected Dashboard */}

        {/* 👨‍🎓 STUDENT PANEL */}

        <Route
          path="/dashboard"
          element={
            token && isStudent ? <StudentLayout /> : <Navigate to="/" />
          }
        >
          <Route index element={<Profile />} />
          <Route path="profile" element={<Profile />} />
          <Route path="settings" element={<Settings />} />
          <Route path="change-password" element={<ChangePassword />} />

          {/* Courses */}
          <Route path="course" element={<Course />} />
          <Route path="course/:courseId" element={<Course />} />
          <Route path="course/video/:courseId/:topicId" element={<TopicVideo />} />

          {/* Jobs */}
          <Route path="jobs" element={<Jobs />} />
          <Route path="alljobs" element={<AllJobs />} />
          <Route path="appliedjobs" element={<AppliedJobs />} />
          <Route path="jobs/:id" element={<JobDetails />} />

          {/* Exams */}

          <Route path="exam-reports" element={<ExamReports />} />
          <Route path="daily-exams" element={<DailyExamReports />} />
          <Route path="weekly-exams" element={<WeeklyExamReports />} />
          <Route path="monthly-exams" element={<MonthlyExamReports />} />
          <Route path="exam-leaderboard" element={<ExamLeaderboard />} />
          <Route path="exam-report-detail/:id" element={<ExamReportDetail />} />

          {/* Playground */}
          <Route path="playground" element={<Playground />} />
          <Route path="playground/:language" element={<PlaygroundDetail />} />
          <Route path="playground-results" element={<PlaygroundResults />} />
          <Route path="playground/detailed-results/:index" element={<DetailedResults />} />

          {/* Leave */}
          <Route path="leave-request" element={<LeaveRequest />} />

          {/* Logout */}
          <Route path="logout" element={<Logout />} />
        </Route>

        {/* 👨‍🏫 FACULTY PANEL */}
        <Route
          path="/faculty"
          element={
            token && isFaculty ? <FacultyLayout /> : <Navigate to="/" />
          }
        >
          <Route index element={<FacultyDashboard />} />
          <Route path="dashboard" element={<FacultyDashboard />} />
          <Route path="Stats" element={<Stats />} />
          <Route path="jobs" element={<Jobs />} />
          <Route path="Exam" element={<ExamManager />} />
          <Route path="applications" element={<Applications />} />
          <Route path="leaves" element={<Leaves />} />
          <Route path="Course" element={<FacultyCourse />} />
          <Route path="Course/:courseId" element={<FacultyCourse />} />
        </Route>

      </Routes>
      </div>
    </>
  );
}

export default App;