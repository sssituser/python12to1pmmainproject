import { useEffect, useRef } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

/* 🔹 STUDENT */
import StudentLayout from "./Layout/Dashboard";
import AllJobs from "./pages/Alljobs";
import AppliedJobs from "./pages/AppliedJobs";
import ChangePassword from "./pages/ChangePassword";
import Course from "./pages/Course";
import DailyExam from "./pages/DailyExam";
import DailyExamSubjects from "./pages/DailyExamSubjects";
import DailyExamReports from "./pages/DailyExamReports";
import DetailedResults from "./pages/DetailedResults";
import ExamLeaderboard from "./pages/ExamLeaderboard";
import ExamReportDetail from "./pages/ExamReportDetail";
import ExamReports from "./pages/ExamReports";
import JobDetails from "./pages/jobDetails";
import Jobs from "./pages/Jobs";
import LeaveHistory from "./pages/LeaveHistory";
import LeaveRequest from "./pages/Leaverequest";
import LeaveSummary from "./pages/LeaveSummary";
import Logout from "./pages/Logout";
import MonthlyExam from "./pages/MonthlyExam";
import MonthlyExamReports from "./pages/MonthlyExamReports";
import NewLeaveRequest from "./pages/NewLeaveRequest";
import Playground from "./pages/Playground";
import PlaygroundDetail from "./pages/PlaygroundDetail";
import PlaygroundResults from "./pages/PlaygroundResults";
import Profile from "./pages/Profile";
import TopicVideo from "./pages/TopicVideo";
import VideoPlayer from "./pages/VideoPlayer";
import WeeklyExam from "./pages/WeeklyExam";
import WeeklyExamReports from "./pages/WeeklyExamReports";

/* 🔹 ADMIN */
import AdminLogin from "./admin/AdminLogin";
import adminRoutes from "./admin/adminRoutes";

/* 🔹 FACULTY */
import Applications from "./faculty/Application";
import FacultyCourse from "./faculty/Course";
import FacultyDashboard from "./faculty/Dashboard";
import ExamFailureDashboard from "./faculty/ExamFailureDashboard";
import ExamManager from "./faculty/ExamManager";
import FacultyLayout from "./faculty/FacultyLayout";
import FacultyJobs from "./faculty/Jobs";
import Leaves from "./faculty/LeaveRequest";
import FacultyLogin from "./faculty/login";
import Stats from "./faculty/Stats";
import FacultyProfile from "./faculty/Profile";

/* 🔹 AUTH */
import VerifyFaculty from "./pages/FacultyOtp";
import Login from "./pages/Login";
import Register from "./pages/Register";

function App() {

  const location = useLocation();
  const preventBackInitialized = useRef(false);

  // Disable browser back button only on exam pages and faculty course pages
  useEffect(() => {
    if (window.allowBrowserBack) {
      return;
    }

    const isExamPage = location.pathname.includes('/python-exam') || 
                      location.pathname.includes('/weekly-exam') || 
                      location.pathname.includes('/monthly-exam');

    if (!isExamPage) {
      return;
    }

    if (preventBackInitialized.current) {
      return;
    }

    preventBackInitialized.current = true;
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
      preventBackInitialized.current = false;
    };
  }, [location]);

  const token = localStorage.getItem("access");
  let user = null;
  try {
    user = JSON.parse(localStorage.getItem("user") || "null");
  } catch (error) {
    user = null;
  }

  const userRole = user?.role?.toString().trim().toLowerCase();
  const isStudent = userRole === "student";
  const isFaculty = userRole === "faculty";
  const isAdmin = userRole === "admin";


  return (
    <>
      <ToastContainer position="top-right" autoClose={2000} />

      <Routes>

        {/* 🔐 AUTH */}
        <Route path="/" element={<Login />} />
        <Route path="/faculty/login" element={<FacultyLogin />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-faculty" element={<VerifyFaculty />} />

        {/* 🎥 Standalone */}
        <Route path="/video/:courseTitle/:topicName" element={<VideoPlayer />} />

        {/* Leave Request Redirect */}
        <Route path="/leave-request" element={<Navigate to="/dashboard/leave-request" replace />} />
        <Route path="/leave-request/new" element={<Navigate to="/dashboard/leave-request/new" replace />} />
        <Route path="/leave-request/history" element={<Navigate to="/dashboard/leave-request/history" replace />} />
        <Route path="/leave-request/summary" element={<Navigate to="/dashboard/leave-request/summary" replace />} />
        <Route path="/leave-summary" element={<LeaveSummary />} />

        {/* Exams (Fullscreen, No Sidebar/Navbar) */}

        <Route path="/dashboard/daily-exam" element={<DailyExamSubjects />} />
        <Route path="/dashboard/daily-exam/:subject" element={<DailyExam />} />
        <Route path="/dashboard/python-exam" element={<Navigate to="/dashboard/daily-exam/python" replace />} />
        <Route path="/dashboard/weekly-exam" element={<WeeklyExam />} />
        <Route path="/dashboard/monthly-exam" element={<MonthlyExam />} />

        {/* Leave History (Fullscreen, No Sidebar/Navbar) */}
        <Route path="/dashboard/leave-request/history" element={<LeaveHistory />} />

        {/* Leave Summary (Fullscreen, No Sidebar/Navbar) */}
        <Route path="/dashboard/leave-request/summary" element={<LeaveSummary />} />

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
          <Route path="leave-request/new" element={<NewLeaveRequest />} />
          <Route path="leave-request/summary" element={<LeaveSummary />} />

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
          <Route path="change-password" element={<ChangePassword />} />
          <Route path="exam-failure" element={<ExamFailureDashboard />} />
          <Route path="stats" element={<Stats />} />
          <Route path="profile" element={<FacultyProfile />} />
          <Route path="jobs" element={<FacultyJobs />} />
          <Route path="exam" element={<ExamManager />} />
          <Route path="Stats" element={<Stats />} />
          <Route path="jobs" element={<Jobs />} />
          <Route path="Exam" element={<ExamManager />} />
          <Route path="applications" element={<Applications />} />
          <Route path="leaves" element={<Leaves />} />
          <Route path="Course" element={<FacultyCourse />} />
          <Route path="Course/:courseId" element={<FacultyCourse />} />
        </Route>

        {/* 🛡️ ADMIN PANEL */}
        {adminRoutes.map((route, index) => (
          <Route key={index} path={route.path} element={route.element}>
            {route.children?.map((child, childIndex) => (
              child.path === "index" || child.index ? (
                <Route key={childIndex} index element={child.element} />
              ) : (
                <Route key={childIndex} path={child.path} element={child.element} />
              )
            ))}
          </Route>
        ))}

      </Routes>
    </>
  );
}

export default App;