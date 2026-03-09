import { Route, Routes } from "react-router-dom";
import Dashboard from "./Layout/Dashboard";
import Course from "./pages/Course";
import ExamLeaderboard from "./pages/ExamLeaderboard";
import ExamReports from "./pages/ExamReports";
import Exams from "./pages/Exams";
import ExamsList from "./pages/ExamsList";
import Jobs from "./pages/Jobs";
import Logout from "./pages/Logout";
import Playground from "./pages/Playground";
import AllJobs from "./pages/Alljobs";
import JobDetails from "./pages/jobDetails";
import AppliedJobs from "./pages/AppliedJobs";
import PlaygroundDetail from "./pages/PlaygroundDetail";
import LeaveRequest from "./pages/Leaverequest";
import Profile from "./pages/Profile";

function App() {
  return (
    <Routes>
      {/* Standalone exam page — no sidebar/layout */}
      <Route path="/exam" element={<Exams />} />

      {/* All routes wrapped in Dashboard layout */}
      <Route path="/" element={<Dashboard />}>
        <Route index element={<Profile />} />
        <Route path="profile" element={<Profile />} />
        <Route path="jobs" element={<Jobs />} />
        <Route path="course" element={<Course />} />
        <Route path="exams" element={<ExamsList />} />
        <Route path="exam-reports" element={<ExamReports />} />
        <Route path="exam-leaderboard" element={<ExamLeaderboard />} />
        <Route path="playground" element={<Playground />} />
        <Route path="playground/:language" element={<PlaygroundDetail />} />  {/* relative path ✓ */}
        <Route path="leave-request" element={<LeaveRequest />} />
        <Route path="logout" element={<Logout />} />
      </Route>
    </Routes>
  );
}

export default App;