import React, { Suspense, useEffect, useRef } from "react";
import { lazyWithRetry as lazy } from "./utils/lazyWithRetry";
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
const JobRoundsDetails = lazy(() => import("./pages/JobRoundsDetails"));
const ChangePassword = lazy(() => import("./pages/ChangePassword"));
const Course = lazy(() => import("./pages/Course"));
const DailyExam = lazy(() => import("./pages/DailyExam"));
const DailyExamSubjects = lazy(() => import("./pages/DailyExamSubjects"));
const DailyExamReports = lazy(() => import("./pages/DailyExamReports"));
const DetailedResults = lazy(() => import("./pages/DetailedResults"));
const ExamLeaderboard = lazy(() => import("./pages/ExamLeaderboard"));
const ExamReportDetail = lazy(() => import("./pages/ExamReportDetail"));
const ExamReports = lazy(() => import("./pages/ExamReports"));
const ExamsList = lazy(() => import("./pages/ExamsList"));
const JobDetails = lazy(() => import("./pages/JobDetails"));
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
const StudentDashboard = lazy(() => import("./pages/StudentDashboard"));
const TopicVideo = lazy(() => import("./pages/TopicVideo"));
const VideoPlayer = lazy(() => import("./pages/VideoPlayer"));
const WeeklyExam = lazy(() => import("./pages/WeeklyExam"));
const WeeklyExamReports = lazy(() => import("./pages/WeeklyExamReports"));

/* 🔹 AI MODULE (LAZY) */
const AIResumeAnalyzer = lazy(() => import("./pages/AIResumeAnalyzer"));
const AIJobRecommendations = lazy(() => import("./pages/AIJobRecommendations"));
const AIChatAssistant = lazy(() => import("./pages/AIChatAssistant"));
const AICandidateRanker = lazy(() => import("./pages/AICandidateRanker"));
const AIFacultyReports = lazy(() => import("./pages/AIFacultyReports"));

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
const MarksUpload = lazy(() => import("./faculty/MarksUpload"));
import LiveClasses from "./faculty/LiveClasses";
import StudentApproval from "./admin/StudentApproval";
import StudentHub from "./admin/StudentHub";
import ManageStudentCourses from "./admin/ManageStudentCourses";
import BatchManagement from "./admin/BatchManagement";
import AttendanceManagement from "./admin/AttendanceManagement";

/* 🔹 AUTH (LAZY) */
const VerifyFaculty = lazy(() => import("./pages/FacultyOtp"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));

import axios from "axios";

function App() {

  const location = useLocation();
  const preventBackInitialized = useRef(false);

  // Global Axios Interceptors for JWT auth & recovery
  useEffect(() => {
    const requestInterceptor = axios.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem("access")?.replace(/^"|"$/g, "");
        if (token) {
          config.headers["Authorization"] = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    const responseInterceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          try {
            const refreshToken = localStorage.getItem("refresh")?.replace(/^"|"$/g, "");
            if (refreshToken) {
              const res = await axios.post(
                `http://${window.location.hostname}:8000/api/jwt/refresh/`,
                { refresh: refreshToken },
                { _retry: true }
              );
              if (res.data?.access) {
                localStorage.setItem("access", res.data.access);
                originalRequest.headers["Authorization"] = `Bearer ${res.data.access}`;
                return axios(originalRequest);
              }
            }
          } catch (refreshError) {
            console.error("Token refresh failed:", refreshError);
            localStorage.removeItem("access");
            localStorage.removeItem("refresh");
            localStorage.removeItem("user");
            window.location.href = "/";
          }
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.request.eject(requestInterceptor);
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, []);

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
          <Route path="/profile" element={<Navigate to="/dashboard/profile" replace />} />

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
            <Route index element={<StudentDashboard />} />
            <Route path="overview" element={<StudentDashboard />} />
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
            <Route path="appliedjobs/rounds/:id" element={<JobRoundsDetails />} />
            <Route path="jobs/:id" element={<JobDetails />} />

            {/* Exams */}
            <Route path="exams" element={<ExamsList />} />
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

            {/* Live Classes & Attendance */}
            <Route path="live-classes" element={<LiveClasses />} />
            <Route path="attendance" element={<AttendanceManagement />} />

            {/* 🤖 AI MODULE — Student Routes */}
            <Route path="ai/resume" element={<AIResumeAnalyzer />} />
            <Route path="ai/jobs" element={<AIJobRecommendations />} />
            <Route path="ai/chat" element={<AIChatAssistant />} />
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
            <Route path="upload-marks" element={<MarksUpload />} />
            <Route path="student-report/:username" element={<StudentReport />} />
            <Route path="leaves" element={<Leaves />} />
            <Route path="Course" element={<FacultyCourse />} />
            <Route path="Course/:courseId" element={<FacultyCourse />} />
            <Route path="batches" element={<BatchManagement />} />
            <Route path="student-approvals" element={<StudentHub defaultTab="approvals" />} />
            <Route path="students" element={<StudentHub />} />
            <Route path="student-courses" element={<ManageStudentCourses />} />
            <Route path="attendance" element={<AttendanceManagement />} />
            <Route path="live-classes" element={<LiveClasses />} />

            {/* 🤖 AI MODULE — Faculty Routes */}
            <Route path="ai/reports" element={<AIFacultyReports />} />
            <Route path="ai/candidates" element={<AICandidateRanker />} />
            <Route path="ai/chat" element={<AIChatAssistant />} />
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
