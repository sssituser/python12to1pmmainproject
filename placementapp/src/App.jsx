import { Route, Routes } from "react-router-dom";
import Dashboard from "./Layout/Dashboard";
import Course from "./pages/Course";
import ExamLeaderboard from "./pages/ExamLeaderboard";
import ExamReports from "./pages/ExamReports";
import Exams from "./pages/Exams";
import Jobs from "./pages/Jobs";
import Logout from "./pages/Logout";
import Playground from "./pages/Playground";
import PlaygroundDetail from "./pages/PlaygroundDetail";
import Profile from "./pages/Profile";
import Resume from "./pages/Resume";


function App() {
  return (
<<<<<<< HEAD
      <Routes>
        <Route path="/" element={<Dashboard />}>
          <Route index element={<Profile />} />
          <Route path="profile" element={<Profile />} />
          <Route path="resume" element={<Resume/>}/>
         <Route path="jobs" element={<Jobs />} />
          <Route path="course" element={<Course />} />
          <Route path="exams" element={<Exams />} />
          <Route path="exam-reports" element={<ExamReports />} />
          <Route path="exam-leaderboard" element={<ExamLeaderboard />} />
          <Route path="playground" element={<Playground />} />
          <Route path="logout" element={<Logout />} />
=======
    <Routes>
      <Route path="/" element={<Dashboard />}>
>>>>>>> 1463e428f69de7af282a6a0ede559a815fc0c961

        <Route index element={<Profile />} />
        <Route path="profile" element={<Profile />} />
        <Route path="jobs" element={<Jobs />} />
        <Route path="course" element={<Course />} />

        {/* Exam page */}
        <Route path="exams" element={<Exams />} />

        <Route path="exam-reports" element={<ExamReports />} />
        <Route path="exam-leaderboard" element={<ExamLeaderboard />} />

        <Route path="playground" element={<Playground />} />
        <Route path="playground/:language" element={<PlaygroundDetail />} />

        <Route path="logout" element={<Logout />} />

      </Route>
    </Routes>
  );
}

export default App;