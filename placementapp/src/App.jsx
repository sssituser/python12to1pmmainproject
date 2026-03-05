import { Route, Routes } from "react-router-dom";
import Dashboard from "./Layout/Dashboard";
import Course from "./pages/Course";
import ExamLeaderboard from "./pages/ExamLeaderboard";
import ExamReports from "./pages/ExamReports";
import Exams from "./pages/Exams";
import Jobs from "./pages/Jobs";
import Logout from "./pages/Logout";
import Playground from "./pages/Playground";
import Profile from "./pages/Profile";

function App() {
  return (
      <Routes>
        <Route path="/" element={<Dashboard />}>
          <Route index element={<Profile />} />
          <Route path="profile" element={<Profile />} />
          <Route path="jobs" element={<Jobs />} />
          <Route path="course" element={<Course />} />
          <Route path="exams" element={<Exams />} />
          <Route path="exam-reports" element={<ExamReports />} />
          <Route path="exam-leaderboard" element={<ExamLeaderboard />} />
          <Route path="playground" element={<Playground />} />
          <Route path="logout" element={<Logout />} />

        </Route>
      </Routes>
  );
}

export default App;