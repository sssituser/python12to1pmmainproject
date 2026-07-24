import React, { useState, useEffect } from "react";
import { 
  BookOpen, 
  Video, 
  ClipboardList, 
  Calendar, 
  Trophy, 
  ArrowRight, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  PlayCircle,
  Code,
  Sparkles,
  UserCheck
} from "lucide-react";
import { NavLink } from "react-router-dom";

export default function StudentDashboard() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [courses, setCourses] = useState([]);
  const [liveClasses, setLiveClasses] = useState([]);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);

  const getStoredToken = () => localStorage.getItem("access")?.replace(/^"|"$/g, "");

  useEffect(() => {
    let currentUser = null;
    try {
      currentUser = JSON.parse(localStorage.getItem("user") || "null");
      setUser(currentUser);
    } catch (e) {
      console.error(e);
    }

    const fetchData = async () => {
      setLoading(true);
      const token = getStoredToken();
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const [profileRes, courseRes, liveRes, examRes] = await Promise.all([
          fetch(`http://${window.location.hostname}:8000/api/profile/`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`http://${window.location.hostname}:8000/api/student/my-courses/`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`http://${window.location.hostname}:8000/api/live-classes/`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`http://${window.location.hostname}:8000/api/exams/placement/`, { headers: { Authorization: `Bearer ${token}` } })
        ]);

        if (profileRes.ok) {
          const pData = await profileRes.json();
          setProfile(pData.profile || pData.data || pData);
          try {
            const userObj = JSON.parse(localStorage.getItem("user") || "{}");
            const enrolled = pData.enrolled_courses || (pData.course_title ? [pData.course_title] : []);
            userObj.enrolledCourses = enrolled;
            userObj.course = pData.course_title || enrolled[0] || "";
            localStorage.setItem("user", JSON.stringify(userObj));
          } catch (e) {}
        }

        if (courseRes.ok) {
          const cData = await courseRes.json();
          setCourses(cData.data || []);
        }

        if (liveRes.ok) {
          const lData = await liveRes.json();
          setLiveClasses(lData.data || []);
        }

        if (examRes.ok) {
          const eData = await examRes.json();
          setExams(eData.exams || eData.data || []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const activeBatch = courses.find(c => c.batch_name && c.batch_name !== "Unassigned");
  const activeBatchDisplay = activeBatch 
    ? `${activeBatch.batch_name} (${activeBatch.batch_code || "N/A"})`
    : "";

  return (
    <div className="p-6 bg-gray-50 min-h-screen font-sans">
      {/* WELCOME BANNER */}
      <div className="bg-gradient-to-r from-slate-900 via-purple-900 to-indigo-900 text-white rounded-3xl p-6 md:p-8 shadow-xl mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="bg-purple-500/30 text-purple-200 text-xs font-bold px-3 py-1 rounded-full border border-purple-400/30 backdrop-blur-md">
                Student Portal
              </span>
              {activeBatchDisplay && (
                <span className="bg-indigo-500/30 text-indigo-200 text-xs font-bold px-3 py-1 rounded-full border border-indigo-400/30 backdrop-blur-md">
                  {activeBatchDisplay}
                </span>
              )}
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">
              Welcome back, {user?.name || user?.username || "Student"}! 👋
            </h1>
            <p className="text-slate-300 text-sm mt-2 max-w-xl">
              Track your course progression, attend live batch lectures, solve practice code playgrounds, and monitor your placement preparation.
            </p>
          </div>

          <NavLink
            to="/dashboard/course"
            className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white px-6 py-3 rounded-2xl font-bold text-sm shadow-lg transition-all active:scale-95 shrink-0"
          >
            Continue Learning <ArrowRight className="w-4 h-4" />
          </NavLink>
        </div>
      </div>

      {/* METRICS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase">Enrolled Courses</p>
            <h3 className="text-2xl font-extrabold text-gray-900">{courses.length}</h3>
          </div>
        </div>

        <NavLink
          to="/dashboard/live-classes"
          className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4 hover:shadow-md transition cursor-pointer"
        >
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
            <Video className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase">Live Sessions</p>
            <h3 className="text-2xl font-extrabold text-gray-900">{liveClasses.length}</h3>
          </div>
        </NavLink>

        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase">Active Status</p>
            <h3 className="text-sm font-extrabold text-green-600">Approved &amp; Verified</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-green-50 text-green-600 flex items-center justify-center font-bold">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase">Student ID</p>
            <h3 className="text-lg font-extrabold text-gray-900">{profile?.student_id || user?.id || "N/A"}</h3>
          </div>
        </div>
      </div>

      {/* TWO COLUMN CONTENT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT COLUMN (2 COLS): LIVE CLASSES & ENROLLED COURSES */}
        <div className="lg:col-span-2 space-y-8">
          {/* UPCOMING / ACTIVE LIVE CLASSES */}
          <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Video className="w-5 h-5 text-purple-600" /> Upcoming &amp; Live Sessions
              </h2>
              <NavLink to="/dashboard/live-classes" className="text-xs font-bold text-purple-600 hover:underline">
                View All
              </NavLink>
            </div>

            {liveClasses.length === 0 ? (
              <div className="text-center py-8 border border-dashed border-gray-200 rounded-2xl text-gray-400 text-sm">
                No live class sessions scheduled for your batch today.
              </div>
            ) : (
              <div className="space-y-4">
                {liveClasses.slice(0, 3).map(lc => (
                  <div key={lc.id} className="p-4 rounded-2xl border border-gray-100 bg-gray-50/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-purple-100 text-purple-700">
                          {lc.batch_name}
                        </span>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                          lc.status === 'Live' ? 'bg-red-100 text-red-700 animate-pulse' : 'bg-blue-100 text-blue-700'
                        }`}>
                          {lc.status}
                        </span>
                      </div>
                      <h4 className="font-bold text-gray-900 text-sm">{lc.title}</h4>
                      <p className="text-xs text-gray-500">{lc.course_title} • {lc.start_time}</p>
                    </div>

                    {lc.is_future && lc.status !== 'Live' ? (
                      <span 
                        className="bg-slate-100 border border-slate-200 text-slate-400 px-3 py-1.5 rounded-xl text-[10px] font-bold italic cursor-not-allowed" 
                        title={`Starts at ${lc.start_time}`}
                      >
                        Join Locked
                      </span>
                    ) : (
                      <a
                        href={lc.meeting_link}
                        target="_blank"
                        rel="noreferrer"
                        className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition shadow-sm active:scale-95"
                      >
                        Join Meeting
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* MY ENROLLED COURSES */}
          <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-600" /> My Enrolled Programs
              </h2>
              <NavLink to="/dashboard/course" className="text-xs font-bold text-blue-600 hover:underline">
                Course Catalog
              </NavLink>
            </div>

            {courses.length === 0 ? (
              <div className="text-center py-8 border border-dashed border-gray-200 rounded-2xl text-gray-400 text-sm">
                No active course enrollments found.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {courses.map(c => (
                  <div key={c.enrollment_id} className="p-4 rounded-2xl border border-gray-200 bg-white hover:shadow-md transition">
                    <div className="flex justify-between items-start mb-2">
                       <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-100">
                        {c.batch_name && c.batch_code && c.batch_name !== "Unassigned" 
                          ? `${c.batch_name} (${c.batch_code})` 
                          : c.batch_name || "Assigned Batch"}
                      </span>
                      <span className="text-xs text-gray-400 font-semibold">{c.progress}% Progress</span>
                    </div>

                    <h4 className="font-bold text-gray-900 text-sm mb-1">{c.title}</h4>
                    <div className="w-full bg-gray-100 rounded-full h-2 mb-4 overflow-hidden">
                      <div className="bg-blue-600 h-2 rounded-full transition-all" style={{ width: `${c.progress || 0}%` }} />
                    </div>

                    <NavLink
                      to={`/dashboard/course`}
                      className="text-xs font-bold text-blue-600 hover:underline inline-flex items-center gap-1"
                    >
                      Resume Course <ArrowRight className="w-3 h-3" />
                    </NavLink>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN (1 COL): QUICK NAVIGATION & ACTIONS */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm">
            <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" /> Quick Actions
            </h3>

            <div className="space-y-3">
              <NavLink
                to="/dashboard/live-classes"
                className="flex items-center gap-3 p-3 rounded-2xl border border-gray-100 hover:border-purple-200 hover:bg-purple-50/50 transition font-semibold text-xs text-gray-800"
              >
                <div className="p-2 rounded-xl bg-purple-100 text-purple-700">
                  <Video className="w-4 h-4" />
                </div>
                Live Batch Lectures
              </NavLink>

              <NavLink
                to="/dashboard/attendance"
                className="flex items-center gap-3 p-3 rounded-2xl border border-gray-100 hover:border-green-200 hover:bg-green-50/50 transition font-semibold text-xs text-gray-800"
              >
                <div className="p-2 rounded-xl bg-green-100 text-green-700">
                  <Calendar className="w-4 h-4" />
                </div>
                Attendance Record
              </NavLink>

              <NavLink
                to="/dashboard/exams"
                className="flex items-center gap-3 p-3 rounded-2xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50/50 transition font-semibold text-xs text-gray-800"
              >
                <div className="p-2 rounded-xl bg-blue-100 text-blue-700">
                  <ClipboardList className="w-4 h-4" />
                </div>
                Exams Hub
              </NavLink>

              <NavLink
                to="/dashboard/playground"
                className="flex items-center gap-3 p-3 rounded-2xl border border-gray-100 hover:border-amber-200 hover:bg-amber-50/50 transition font-semibold text-xs text-gray-800"
              >
                <div className="p-2 rounded-xl bg-amber-100 text-amber-700">
                  <Code className="w-4 h-4" />
                </div>
                Coding Playground
              </NavLink>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
