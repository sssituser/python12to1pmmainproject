import { Route, Routes } from "react-router-dom";
import Dashboard from "./Layout/Dashboard";
import Course from "./pages/Course";
import CourseTopics from "./pages/CourseTopics";
import TopicVideo from "./pages/TopicVideo";

import ExamLeaderboard from "./pages/ExamLeaderboard";
import ExamReports from "./pages/ExamReports";
import Exams from "./pages/Exams";
import Jobs from "./pages/Jobs";
import Logout from "./pages/Logout";
import Playground from "./pages/Playground";
import PlaygroundDetail from "./pages/PlaygroundDetail";
import Profile from "./pages/Profile";
import Resume from "./pages/Resume";

import AllJobs from "./pages/Alljobs";
import JobDetails from "./pages/jobDetails";
import AppliedJobs from "./pages/AppliedJobs";



function App() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />}>

        <Route index element={<Profile />} />
        <Route path="profile" element={<Profile />} />
        <Route path="resume" element={<Resume />} />
        <Route path="jobs" element={<Jobs />} />

        <Route path="jobs/all" element={<AllJobs />} />


        {/* COURSE */}

        <Route path="course" element={<Course />} />
        <Route path="course/:courseId" element={<CourseTopics />} />
        <Route path="course/video/:topicId" element={<TopicVideo />} />



        {/* EXAMS */}

        <Route path="exams" element={<Exams />} />
        <Route path="exam-reports" element={<ExamReports />} />
        <Route path="exam-leaderboard" element={<ExamLeaderboard />} />

        {/* PLAYGROUND */}
        <Route path="playground" element={<Playground />} />
        <Route path="playground/:language" element={<PlaygroundDetail />} />
        {/* jobs */}
        <Route path="jobs" element={<Jobs />} />
        <Route path="jobs/all" element={<AllJobs />} />
        <Route path="jobs/applied" element={<AppliedJobs />} />

      </Route>
    </Routes>
  );
}

export default App;