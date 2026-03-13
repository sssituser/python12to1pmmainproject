import { Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";

import Dashboard from "./Layout/Dashboard";
import Course from "./pages/Course";
import ExamLeaderboard from "./pages/ExamLeaderboard";
import ExamReports from "./pages/ExamReports";
import DailyExamReports from "./pages/DailyExamReports";
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

    <Route path="/" element={<Login />} />

    <Route path="/exam" element={<Exams />} />

    <Route path="/dashboard" element={<Dashboard />}>

      <Route index element={<Profile />} />

      <Route path="profile" element={<Profile />} />

      <Route path="jobs" element={<Jobs />} />
      <Route path="alljobs" element={<AllJobs />} />
      <Route path="appliedjobs" element={<AppliedJobs />} />
      <Route path="jobs/:id" element={<JobDetails />} />

      <Route path="course" element={<Course />} />

      <Route path="exams" element={<ExamsList />} />

      <Route path="exam-reports" element={<ExamReports />} />
      <Route path="daily-exams" element={<DailyExamReports />} />
      <Route path="exam-leaderboard" element={<ExamLeaderboard />} />
      <Route path="playground" element={<Playground />} />
      <Route path="playground/:language" element={<PlaygroundDetail />} />

      <Route path="python-exam" element={<PythonExam />} />

      <Route path="reports" element={<Reports />} />

      <Route path="leave-request" element={<LeaveRequest />} />

      <Route path="logout" element={<Logout />} />

    </Route>

  </Routes>
</>

);
}

export default App;