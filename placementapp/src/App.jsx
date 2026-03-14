import { Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";

import Dashboard from "./Layout/Dashboard";
import Course from "./pages/Course";
import ExamLeaderboard from "./pages/ExamLeaderboard";
import Jobs from "./pages/Jobs";
import AllJobs from "./pages/Alljobs";
import JobDetails from "./pages/jobDetails";
import AppliedJobs from "./pages/AppliedJobs";

import ExamReports from "./pages/ExamReports";
import Exams from "./pages/Exams";
import ExamsList from "./pages/ExamsList";

import Logout from "./pages/Logout";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import PythonExam from "./pages/PythonExam";
import Reports from "./pages/Reports";

import Playground from "./pages/Playground";
import PlaygroundDetail from "./pages/PlaygroundDetail";
import PlaygroundResults from "./pages/PlaygroundResults";
import DetailedResults from "./pages/DetailedResults";

import LeaveRequest from "./pages/Leaverequest";

function App() {
  return (
    <>
      <ToastContainer position="top-right" autoClose={2000} />

      <Routes>

        {/* Login Page */}
        <Route path="/" element={<Login />} />

        {/* Standalone Exam */}
        <Route path="/exam" element={<Exams />} />

        {/* ✅ Detailed Results WITHOUT sidebar */}
        <Route
          path="/detailed-results/:index"
          element={<DetailedResults />}
        />

        {/* Dashboard Layout */}
        <Route path="/dashboard" element={<Dashboard />}>

          {/* Default */}
          <Route index element={<Profile />} />

          {/* Profile */}
          <Route path="profile" element={<Profile />} />

          {/* Jobs */}
          <Route path="jobs" element={<Jobs />} />
          <Route path="alljobs" element={<AllJobs />} />
          <Route path="appliedjobs" element={<AppliedJobs />} />
          <Route path="jobs/:id" element={<JobDetails />} />

          {/* Course */}
          <Route path="course" element={<Course />} />

          {/* Exams */}
          <Route path="exams" element={<ExamsList />} />
          <Route path="exam-reports" element={<ExamReports />} />
          <Route path="exam-leaderboard" element={<ExamLeaderboard />} />

          {/* Playground */}
          <Route path="playground" element={<Playground />} />
          <Route path="playground/:language" element={<PlaygroundDetail />} />

          {/* Playground Results */}
          <Route path="playground-results" element={<PlaygroundResults />} />
          <Route path="playground/detailed-results/:index" element={<DetailedResults />} />

          {/* Python Exam */}
          <Route path="python-exam" element={<PythonExam />} />

          {/* Reports */}
          <Route path="reports" element={<Reports />} />

          {/* Leave */}
          <Route path="leave-request" element={<LeaveRequest />} />

          {/* Logout */}
          <Route path="logout" element={<Logout />} />

        </Route>

      </Routes>
    </>
  );
}

export default App;