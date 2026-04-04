import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Playground() {

  const navigate = useNavigate();
  const username = localStorage.getItem("username");

  const [dailyQuestions, setDailyQuestions] = useState(20);
  const [dailyTime, setDailyTime] = useState(45);
  const [weeklyQuestions, setWeeklyQuestions] = useState(50);
  const [weeklyTime, setWeeklyTime] = useState(45);
  const [monthlyQuestions, setMonthlyQuestions] = useState(50);
  const [monthlyTime, setMonthlyTime] = useState(45);

  useEffect(() => {
    // Fetch limits safely so UI is dynamic based on Faculty settings
    const fetchSettings = async () => {
      try {
        const res = await axios.get("/api/admin/exam-settings/");
        if (res.data && res.data.success && res.data.data) {
          if (res.data.data.Daily) {
            setDailyQuestions(res.data.data.Daily.maxQuestions || 20);
            setDailyTime(res.data.data.Daily.duration || 45);
          }
          if (res.data.data.Weekly) {
            setWeeklyQuestions(res.data.data.Weekly.maxQuestions || 50);
            setWeeklyTime(res.data.data.Weekly.duration || 45);
          }
          if (res.data.data.Monthly) {
            setMonthlyQuestions(res.data.data.Monthly.maxQuestions || 50);
            setMonthlyTime(res.data.data.Monthly.duration || 45);
          }
        }
      } catch (err) {
        console.error("Could not fetch dynamic exact sizes", err);
      }
    };
    fetchSettings();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow">
        <div className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">

          <div>
            <h1 className="text-2xl font-semibold">Code Playground</h1>
            <p className="text-sm opacity-90">
              Practice coding and improve your skills
            </p>
          </div>

          <div className="text-2xl bg-white/20 px-3 py-2 rounded-lg font-mono">
            {"</>"}
          </div>

        </div>
      </header>


      {/* Main Section */}
      <main className="max-w-6xl mx-auto px-6 py-10">

        {/* Greeting */}
        <div className="mb-4">
          <p className="text-sm text-gray-500">
            Hi {username ? username : "User"},
          </p>

          <h2 className="text-3xl font-bold text-gray-800 mt-1">
            Welcome Back 👋
          </h2>

        </div>

        <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
          📚 Available Coding Sessions
        </h3>

        {/* Three Exam Cards (Daily is static, Weekly/Monthly are dynamic) */}
        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">

          {/* Daily Exam Card (Restored to its original static version) */}
          <div className="bg-white rounded-lg border shadow-md p-5 hover:shadow-lg transition duration-300 flex flex-col justify-between">

            <div>
              <div className="flex items-center justify-between mb-3">

                <h3 className="text-base font-semibold text-gray-800">
                  Daily Exam
                </h3>

                <span className="text-purple-500 text-lg">📊</span>

              </div>

              <p className="text-sm text-gray-600 mb-4">
                Daily practice exam to test your Python programming skills. Cover variables, operators, data types, control flow, functions, and more with 20 multiple choice questions.
              </p>

              <span className="inline-block bg-purple-100 text-purple-700 text-xs px-3 py-1 rounded-full">
                Daily practice exam
              </span>
            </div>

            <button
              onClick={() => navigate("/dashboard/daily-exam")}
              className="mt-4 bg-purple-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-purple-700 transition"
            >
              Start Exam
            </button>

          </div>

          {/* Weekly Exam Card */}
          <div className="bg-white rounded-lg border shadow-md p-5 hover:shadow-lg transition duration-300 flex flex-col justify-between">

            <div>
              <div className="flex items-center justify-between mb-3">

                <h3 className="text-base font-semibold text-gray-800">
                  Weekly Exam
                </h3>

                <span className="text-green-500 text-lg">📊</span>

              </div>

              <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                Comprehensive weekly exam to test your knowledge. Cover all topics with multiple choice questions for thorough assessment.
              </p>

              <span className="inline-block bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full font-semibold">
                {weeklyQuestions} MCQs • {weeklyTime} min
              </span>
            </div>

            <button
              onClick={() => navigate("/dashboard/weekly-exam")}
              className="mt-4 bg-green-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-700 transition"
            >
              Start Exam
            </button>

          </div>

          {/* Monthly Exam Card */}
          <div className="bg-white rounded-lg border shadow-md p-5 hover:shadow-lg transition duration-300 flex flex-col justify-between border-purple-50">

            <div>
              <div className="flex items-center justify-between mb-3">

                <h3 className="text-base font-semibold text-gray-800">
                  Monthly Exam
                </h3>

                <span className="text-purple-500 text-lg">📊</span>

              </div>

              <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                Extensive monthly exam for complete evaluation. Test advanced concepts with multiple choice questions for comprehensive assessment.
              </p>
              <span className="inline-block bg-purple-100 text-purple-700 text-xs px-3 py-1 rounded-full font-semibold">
                {monthlyQuestions} MCQs • {monthlyTime} min
              </span>
            </div>

            <button
              onClick={() => navigate("/dashboard/monthly-exam")}
              className="mt-4 bg-purple-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-purple-700 transition"
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
