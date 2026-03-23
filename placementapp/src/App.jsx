import { Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

/* 🔹 STUDENT */
import StudentLayout from "./Layout/Dashboard";
import Profile from "./pages/Profile";
import Jobs from "./pages/Jobs";
import AllJobs from "./pages/Alljobs";
import JobDetails from "./pages/jobDetails";
import AppliedJobs from "./pages/AppliedJobs";
import Exams from "./pages/Exams";
import ExamReports from "./pages/ExamReports";
import DailyExamReports from "./pages/DailyExamReports";
import WeeklyExamReports from "./pages/WeeklyExamReports";
import MonthlyExamReports from "./pages/MonthlyExamReports";
import ExamLeaderboard from "./pages/ExamLeaderboard";
import ExamReportDetail from "./pages/ExamReportDetail";
import PythonExam from "./pages/PythonExam";
import Playground from "./pages/Playground";
import PlaygroundDetail from "./pages/PlaygroundDetail";
import PlaygroundResults from "./pages/PlaygroundResults";
import DetailedResults from "./pages/DetailedResults";
import LeaveRequest from "./pages/Leaverequest";
import Course from "./pages/Course";
import TopicVideo from "./pages/TopicVideo";
import VideoPlayer from "./pages/VideoPlayer";
import Logout from "./pages/Logout";

/* 🔹 FACULTY */
import FacultyLayout from "./faculty/FacultyLayout";
import FacultyDashboard from "./faculty/Dashboard";
import Stats from "./faculty/Stats";
import Applications from "./faculty/Application";
import Leaves from "./faculty/LeaveRequest";
import ExamManager from "./faculty/ExamManager";

/* 🔹 AUTH */
import Login from "./pages/Login";

function App() {
  const token = localStorage.getItem("access");
  const user = JSON.parse(localStorage.getItem("user"));

  const isStudent = user?.role === "student";
  const isFaculty = user?.role === "faculty";

  return (
    <>
      <ToastContainer position="top-right" autoClose={2000} />

      <Routes>

        {/* 🔐 LOGIN */}
        <Route path="/" element={<Login />} />

        {/* 🎥 Standalone */}
        <Route path="/video/:courseTitle/:topicName" element={<VideoPlayer />} />
        <Route path="/exam" element={<Exams />} />
        <Route path="/detailed-results/:index" element={<DetailedResults />} />

        {/* 👨‍🎓 STUDENT PANEL */}
        <Route
          path="/dashboard"
          element={
            token && isStudent ? <StudentLayout /> : <Navigate to="/" />
          }
        >
          <Route index element={<Profile />} />
          <Route path="profile" element={<Profile />} />

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
          <Route path="exams" element={<Exams />} />
          <Route path="exam-reports" element={<ExamReports />} />
          <Route path="daily-exams" element={<DailyExamReports />} />
          <Route path="weekly-exams" element={<WeeklyExamReports />} />
          <Route path="monthly-exams" element={<MonthlyExamReports />} />
          <Route path="Exam-leaderboard" element={<ExamLeaderboard />} />
          <Route path="exam-report-detail/:id" element={<ExamReportDetail />} />

          {/* Playground */}
          <Route path="playground" element={<Playground />} />
          <Route path="playground/:language" element={<PlaygroundDetail />} />
          <Route path="playground-results" element={<PlaygroundResults />} />

          {/* Python Exam */}
          <Route path="python-exam" element={<PythonExam />} />

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
          <Route path="stats" element={<Stats />} />
          <Route path="jobs" element={<Jobs />} />
          <Route path="exam" element={<ExamManager />} />
          <Route path="applications" element={<Applications />} />
          <Route path="leaves" element={<Leaves />} />
        </Route>

      </Routes>
    </>
  );
}

export default App;