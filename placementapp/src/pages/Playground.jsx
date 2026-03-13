import React from "react";
import { useNavigate } from "react-router-dom";

function Playground() {

  const navigate = useNavigate();
  const username = localStorage.getItem("username");

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
        <div className="mb-10">
          <p className="text-sm text-gray-500">
            Hi {username ? username : "User"},
          </p>

          <h2 className="text-3xl font-bold text-gray-800 mt-1">
            Welcome Back 👋
          </h2>

          <p className="text-gray-600 mt-2 max-w-2xl">
            Continue your coding journey with structured modules.
            Practice problems, complete sessions, and track your progress.
          </p>
        </div>


        {/* Section Title */}
        <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
          📚 Available Coding Sessions
        </h3>


        {/* Cards */}
        <div className="grid md:grid-cols-2 gap-6">

          {/* Python Variables Card */}
          <div className="bg-white rounded-xl border shadow-sm p-6 hover:shadow-lg transition duration-300 flex flex-col justify-between">

            <div>
              <div className="flex items-center justify-between mb-3">

                <h3 className="text-lg font-semibold text-gray-800">
                  Introduction to Variables, Comments and Usage
                </h3>

                <span className="text-green-500 text-xl">�</span>

              </div>

              <p className="text-sm text-gray-600 mb-5">
                Master the fundamentals of Python variables, comments, and their practical usage in programming.
              </p>

              <span className="inline-block bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full">
                20 MCQs • 45 min
              </span>
            </div>

            <button
              onClick={() => navigate("/dashboard/python-exam")}
              className="mt-6 bg-green-600 text-white py-2 rounded-lg font-medium hover:bg-green-700 transition"
            >
              Start
            </button>

          </div>

          {/* Python Operators Card */}
          <div className="bg-white rounded-xl border shadow-sm p-6 hover:shadow-lg transition duration-300 flex flex-col justify-between">

            <div>
              <div className="flex items-center justify-between mb-3">

                <h3 className="text-lg font-semibold text-gray-800">
                  Operators
                </h3>

                <span className="text-blue-500 text-xl">⚡</span>

              </div>

              <p className="text-sm text-gray-600 mb-5">
                Test your knowledge of Python operators including arithmetic, logical, and comparison operators.
              </p>

              <span className="inline-block bg-blue-100 text-blue-700 text-xs px-3 py-1 rounded-full">
                20 MCQs • 1:30 min
              </span>
            </div>

            <button
              onClick={() => navigate("/dashboard/python-exam")}
              className="mt-6 bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition"
            >
              Start
            </button>

          </div>

        </div>

      </main>

    </div>
  );
}

export default Playground;