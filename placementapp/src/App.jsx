import { Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Dashboard from "./Layout/Dashboard";
import Dashboardsssit from "./pages/Dashboardsssit";   // ✅ ADD THIS

import ExamLeaderboard from "./pages/ExamLeaderboard";
import Jobs from "./pages/Jobs";
import AllJobs from "./pages/Alljobs";
import JobDetails from "./pages/jobDetails";
import AppliedJobs from "./pages/AppliedJobs";

import ExamReports from "./pages/ExamReports";
import DailyExamReports from "./pages/DailyExamReports";
import WeeklyExamReports from "./pages/WeeklyExamReports";
import MonthlyExamReports from "./pages/MonthlyExamReports";
import ExamReportDetail from "./pages/ExamReportDetail";
import Exams from "./pages/Exams";

import Logout from "./pages/Logout";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import PythonExam from "./pages/PythonExam";

import Playground from "./pages/Playground";
import PlaygroundDetail from "./pages/PlaygroundDetail";
import PlaygroundResults from "./pages/PlaygroundResults";
import DetailedResults from "./pages/DetailedResults";

import LeaveRequest from "./pages/Leaverequest";
import Course from "./pages/Course";
import TopicVideo from "./pages/TopicVideo";
import VideoPlayer from "./pages/VideoPlayer";

function App() {
  const isLoggedIn = localStorage.getItem("access");

  return (
    <>
      <ToastContainer position="top-right" autoClose={2000} />

      <Routes>

        {/* Login */}
        <Route path="/" element={<Login />} />

        {/* 🔥 SSSIT Landing Dashboard */}
        <Route path="/dashboardsssit" element={<Dashboardsssit />} />


        {/* Video Player (Standalone) */}
        <Route path="/video/:courseTitle/:topicName" element={<VideoPlayer />} />

        {/* Detailed Results (No Sidebar) */}

        {/* Standalone */}
        <Route path="/exam" element={<Exams />} />

        <Route path="/detailed-results/:index" element={<DetailedResults />} />

        {/* 🔐 Protected Dashboard */}
        <Route
          path="/dashboard"
          element={
            isLoggedIn ? <Dashboard /> : <Navigate to="/" />
          }
        >

          {/* Default */}
          <Route index element={<Profile />} />

          {/* Profile */}
          <Route path="profile" element={<Profile />} />

          {/* Courses */}
          <Route path="course" element={<Course />} />
          <Route path="course/:courseId" element={<Course />} />
          <Route path="course/video/:courseId/:topicId" element={<TopicVideo />} />

          {/* Jobs */}
          <Route path="jobs" element={<Jobs />} />
          <Route path="alljobs" element={<AllJobs />} />
          <Route path="appliedjobs" element={<AppliedJobs />} />
          <Route path="applied" element={<AppliedJobs />} />
          <Route path="jobs/:id" element={<JobDetails />} />

          {/* Exams */}
          <Route path="exams" element={<Exams />} />
          <Route path="exam-reports" element={<ExamReports />} />
          <Route path="reports" element={<ExamReports />} />
          <Route path="daily-exams" element={<DailyExamReports />} />
          <Route path="weekly-exams" element={<WeeklyExamReports />} />
          <Route path="monthly-exams" element={<MonthlyExamReports />} />
          <Route path="exam-leaderboard" element={<ExamLeaderboard />} />
          <Route path="leaderboard" element={<ExamLeaderboard />} />
          <Route path="exam-report-detail/:id" element={<ExamReportDetail />} />

          {/* Playground */}
          <Route path="playground" element={<Playground />} />
          <Route path="techlab" element={<Playground />} />
          <Route path="playground/:language" element={<PlaygroundDetail />} />
          <Route path="playground-results" element={<PlaygroundResults />} />
          <Route path="results" element={<PlaygroundResults />} />
          <Route path="playground/detailed-results/:index" element={<DetailedResults />} />

          {/* Python Exam */}
          <Route path="python-exam" element={<PythonExam />} />

          {/* Leave */}
          <Route path="leave-request" element={<LeaveRequest />} />
          <Route path="leave" element={<LeaveRequest />} />

          {/* Logout */}
          <Route path="logout" element={<Logout />} />

        </Route>

      </Routes>
    </>
  );
}

export default App;