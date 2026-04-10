import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChartLine, faChartSimple, faTerminal } from "@fortawesome/free-solid-svg-icons";

function Playground() {

  const navigate = useNavigate();
  const username = localStorage.getItem("username");

  const [dailyQuestions, setDailyQuestions] = useState(20);
  const [dailyTime, setDailyTime] = useState(45);
  const [weeklyQuestions, setWeeklyQuestions] = useState(50);
  const [weeklyTime, setWeeklyTime] = useState(45);
  const [monthlyQuestions, setMonthlyQuestions] = useState(50);
  const [monthlyTime, setMonthlyTime] = useState(45);
  const [studentCourse, setStudentCourse] = useState("");

  useEffect(() => {
    // Fetch limits safely so UI is dynamic based on Faculty settings
    const fetchSettings = async (courseToUse) => {
      try {
        // Fetch all settings
        const res = await axios.get("/api/admin/exam-settings/");
        if (res.data && res.data.success && res.data.data) {
          const s = res.data.data;
          
          // Helper to find setting either as 'Course_Category' or just 'Category'
          const getVal = (cat) => {
            const prioritized = courseToUse ? s[`${courseToUse}_${cat}`] : null;
            return prioritized || s[cat] || null;
          };

          const daily = getVal('Daily');
          if (daily) {
            setDailyQuestions(daily.maxQuestions || 20);
            setDailyTime(daily.duration || 45);
          }

          const weekly = getVal('Weekly');
          if (weekly) {
            setWeeklyQuestions(weekly.maxQuestions || 50);
            setWeeklyTime(weekly.duration || 45);
          }

          const monthly = getVal('Monthly');
          if (monthly) {
            setMonthlyQuestions(monthly.maxQuestions || 50);
            setMonthlyTime(monthly.duration || 45);
          }
        }
      } catch (err) {
        console.error("Could not fetch dynamic exam settings", err);
      }
    };

    const userStr = localStorage.getItem("user");
    let currentCourse = "";
    if (userStr && userStr !== "undefined") {
      try {
        const user = JSON.parse(userStr);
        currentCourse = user.course || "";
        setStudentCourse(currentCourse);
      } catch (e) {}
    }
    
    fetchSettings(currentCourse);
    
    // Clear any stale exam result flag when entering the playground
    localStorage.removeItem("examResult");
  }, []);

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* 🔹 Header */}
      <header className="bg-blue-600 text-white shadow-sm overflow-hidden">
        <div className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Code Playground</h1>
            <p className="text-sm text-blue-100 mt-0.5">
              Practice coding and improve your skills
            </p>
          </div>
          <div className="text-2xl bg-white/20 px-3 py-2 rounded-lg font-mono tracking-tighter shadow-inner">
            {"</>"}
          </div>
        </div>
      </header>

      {/* 🔹 Main Section */}
      <main className="max-w-6xl mx-auto px-6 py-10">
        {/* Greeting */}
        <div className="mb-8">
          <p className="text-sm text-slate-500 font-medium">
            Hi {username || "User"},
          </p>
          <h2 className="text-3xl font-bold text-slate-800 mt-1">
            Welcome Back 👋
          </h2>
        </div>

        <h3 className="text-xl font-bold text-slate-700 mb-6 flex items-center gap-2">
          📚 Available Coding Sessions
        </h3>

        {/* 🔹 Assessment Cards Grid */}
        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          
          {/* Daily Exam Card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col justify-between hover:shadow-md transition duration-300">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-slate-800 tracking-tight">
                  Daily Exam
                </h3>
                 <span className="text-lg bg-blue-50 w-10 h-10 flex items-center justify-center rounded-xl text-blue-600">
                  <FontAwesomeIcon icon={faTerminal} />
                </span>
              </div>

              <p className="text-sm text-slate-500 mb-6 leading-relaxed font-medium">
                A daily practice exam designed to evaluate programming skills. It helps improve problem-solving ability and strengthen coding proficiency.
              </p>

              <span className="inline-block bg-blue-50 text-blue-600 text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider border border-blue-100">
                Daily practice exam
              </span>
            </div>

            <button
              onClick={() => navigate("/dashboard/daily-exam")}
              className="mt-6 bg-blue-600 text-white py-2.5 px-4 rounded-xl font-bold hover:bg-blue-700 transition shadow-sm hover:shadow-blue-200 active:scale-[0.98]"
            >
              Start Exam
            </button>
          </div>

          {/* Weekly Exam Card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col justify-between hover:shadow-md transition duration-300">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-slate-800 tracking-tight">
                  Weekly Exam
                </h3>
                 <span className="text-lg bg-emerald-50 w-10 h-10 flex items-center justify-center rounded-xl text-emerald-600">
                  <FontAwesomeIcon icon={faChartSimple} />
                </span>
              </div>

              <p className="text-sm text-slate-500 mb-6 leading-relaxed font-medium">
                Comprehensive weekly exam to test your knowledge. Cover all topics with multiple choice questions for thorough assessment.
              </p>

              <span className="inline-block bg-emerald-50 text-emerald-600 text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider border border-emerald-100">
                {weeklyQuestions} MCQs • {weeklyTime} min
              </span>
            </div>

            <button
              onClick={() => navigate("/dashboard/weekly-exam")}
              className="mt-6 bg-emerald-600 text-white py-2.5 px-4 rounded-xl font-bold hover:bg-emerald-700 transition shadow-sm hover:shadow-emerald-200 active:scale-[0.98]"
            >
              Start Exam
            </button>
          </div>

          {/* Monthly Exam Card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col justify-between hover:shadow-md transition duration-300">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-slate-800 tracking-tight">
                  Monthly Exam
                </h3>
                 <span className="text-lg bg-indigo-50 w-10 h-10 flex items-center justify-center rounded-xl text-indigo-600">
                  <FontAwesomeIcon icon={faChartSimple} />
                </span>
              </div>

              <p className="text-sm text-slate-500 mb-6 leading-relaxed font-medium">
                Extensive monthly exam for complete evaluation. Test advanced concepts with multiple choice questions for comprehensive assessment.
              </p>

              <span className="inline-block bg-indigo-50 text-indigo-600 text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider border border-indigo-100">
                 {monthlyQuestions} MCQs • {monthlyTime} min
              </span>
            </div>

            <button
              onClick={() => navigate("/dashboard/monthly-exam")}
              className="mt-6 bg-indigo-600 text-white py-2.5 px-4 rounded-xl font-bold hover:bg-indigo-700 transition shadow-sm hover:shadow-indigo-200 active:scale-[0.98]"
            >
              Start Exam
            </button>
          </div>

        </div>
      </main>
    </div>
  );
}

export default Playground;
