import { Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";

import Dashboard from "./Layout/Dashboard";
import Course from "./pages/Course";
import ExamLeaderboard from "./pages/ExamLeaderboard";
import ExamReports from "./pages/ExamReports";
import Exams from "./pages/Exams";
import ExamsList from "./pages/ExamsList";

import Logout from "./pages/Logout";
import Playground from "./pages/Playground";
import PlaygroundDetail from "./pages/PlaygroundDetail";
import LeaveRequest from "./pages/Leaverequest";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import PythonExam from "./pages/PythonExam";
import Reports from "./pages/Reports";

import Jobs from "./pages/Jobs";
import AllJobs from "./pages/Alljobs";
import JobDetails from "./pages/jobDetails";
import AppliedJobs from "./pages/AppliedJobs";

function App() {
  return (
    <>
      <ToastContainer position="top-right" autoClose={2000} />

      <Routes>

        {/* Login Page */}
        <Route path="/" element={<Login />} />
        {/* Standalone Exam Page (No Dashboard Layout) */}
        <Route path="/exam" element={<Exams />} />
        {/* Dashboard Layout Routes */}
        <Route path="/dashboard" element={<Dashboard />}>
          <Route index element={<Profile />} />
          <Route path="/dashboard/profile" element={<Profile />} />
          <Route path="/dashboard/jobs" element={<Jobs />} />
          <Route path="alljobs" element={<AllJobs />} />
          <Route path="appliedjobs" element={<AppliedJobs />} />
          <Route path="jobdetails/:id" element={<JobDetails />} />
          <Route path="/dashboard/course" element={<Course />} />
          <Route path="/dashboard/exams" element={<Exams />} />
          <Route path="/dashboard/exams" element={<ExamsList />} />
          <Route path="/dashboard/exam-reports" element={<ExamReports />} />
          <Route path="/dashboard/exam-leaderboard" element={<ExamLeaderboard />} />
          <Route path="/dashboard/playground" element={<Playground />} />
          <Route path="/dashboard/playground/:language" element={<PlaygroundDetail />} />
          <Route path="/dashboard/python-exam" element={<PythonExam />} />
          <Route path="/dashboard/reports" element={<Reports />} />
          <Route path="/dashboard/leave-request" element={<LeaveRequest />} />
          <Route path="/dashboard/logout" element={<Logout />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;