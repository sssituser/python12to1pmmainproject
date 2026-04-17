import React, { Suspense, lazy, useEffect, useRef } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

/* 🔹 LOADING FALLBACK */
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-black">
    <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
  </div>
);

/* 🔹 STUDENT (LAZY) */
const StudentLayout = lazy(() => import("./Layout/Dashboard"));
const AllJobs = lazy(() => import("./pages/Alljobs"));
const AppliedJobs = lazy(() => import("./pages/AppliedJobs"));
const ChangePassword = lazy(() => import("./pages/ChangePassword"));
const Course = lazy(() => import("./pages/Course"));
const DailyExam = lazy(() => import("./pages/DailyExam"));
const DailyExamSubjects = lazy(() => import("./pages/DailyExamSubjects"));
const DailyExamReports = lazy(() => import("./pages/DailyExamReports"));
const DetailedResults = lazy(() => import("./pages/DetailedResults"));
const ExamLeaderboard = lazy(() => import("./pages/ExamLeaderboard"));
const ExamReportDetail = lazy(() => import("./pages/ExamReportDetail"));
const ExamReports = lazy(() => import("./pages/ExamReports"));
const JobDetails = lazy(() => import("./pages/jobDetails"));
const Jobs = lazy(() => import("./pages/Jobs"));
const LeaveHistory = lazy(() => import("./pages/LeaveHistory"));
const LeaveRequest = lazy(() => import("./pages/Leaverequest"));
const LeaveSummary = lazy(() => import("./pages/LeaveSummary"));
const Logout = lazy(() => import("./pages/Logout"));
const MonthlyExam = lazy(() => import("./pages/MonthlyExam"));
const MonthlyExamReports = lazy(() => import("./pages/MonthlyExamReports"));
const NewLeaveRequest = lazy(() => import("./pages/NewLeaveRequest"));
const Playground = lazy(() => import("./pages/Playground"));
const PlaygroundDetail = lazy(() => import("./pages/PlaygroundDetail"));
const PlaygroundResults = lazy(() => import("./pages/PlaygroundResults"));
const Profile = lazy(() => import("./pages/Profile"));
const TopicVideo = lazy(() => import("./pages/TopicVideo"));
const VideoPlayer = lazy(() => import("./pages/VideoPlayer"));
const WeeklyExam = lazy(() => import("./pages/WeeklyExam"));
const WeeklyExamReports = lazy(() => import("./pages/WeeklyExamReports"));

/* 🔹 ADMIN (LAZY/DIRECT) */
import AdminLogin from "./admin/AdminLogin";
// adminRoutes needs to stay as is if it's data, or be refactored. 
// For now let's assume it exports an array of route objects.
import adminRoutes from "./admin/adminRoutes";

/* 🔹 FACULTY (LAZY) */
const Applications = lazy(() => import("./faculty/Application"));
const FacultyCourse = lazy(() => import("./faculty/Course"));
const FacultyDashboard = lazy(() => import("./faculty/Dashboard"));
const ExamFailureDashboard = lazy(() => import("./faculty/ExamFailureDashboard"));
const ExamManager = lazy(() => import("./faculty/ExamManager"));
const FacultyLayout = lazy(() => import("./faculty/FacultyLayout"));
const FacultyJobs = lazy(() => import("./faculty/Jobs"));
const Leaves = lazy(() => import("./faculty/LeaveRequest"));
const FacultyLogin = lazy(() => import("./faculty/login"));
const Stats = lazy(() => import("./faculty/Stats"));
const FacultyProfile = lazy(() => import("./faculty/Profile"));
const StudentReport = lazy(() => import("./faculty/StudentReport"));

/* 🔹 AUTH (LAZY) */
const VerifyFaculty = lazy(() => import("./pages/FacultyOtp"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));

function App() {

  const location = useLocation();
  const preventBackInitialized = useRef(false);

  // Disable browser back button only on exam pages and faculty course pages
  useEffect(() => {
    if (window.allowBrowserBack) {
      return;
    }

    const isExamPage = location.pathname.includes('/python-exam') || 
                      location.pathname.includes('/daily-exam') || 
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

      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* 🔐 AUTH */}
          <Route path="/" element={<Login />} />
          <Route path="/faculty/login" element={<FacultyLogin />} />
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
            <Route path="applications" element={<Applications />} />
            <Route path="student-report/:username" element={<StudentReport />} />
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
      </Suspense>
    </>
  );
}

export default App;
