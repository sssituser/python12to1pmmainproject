import React from "react";

import { useNavigate } from "react-router-dom";

function Playground() {
  const navigate = useNavigate();

  // Get username dynamically
  const username = localStorage.getItem("username");

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      
      {/* Top bar / header */}
      <header className="w-full bg-white shadow-sm border-b border-gray-200">
        <div className="w-full py-4 flex flex-col items-center justify-center text-center">
          
          <span className="text-xl font-semibold text-blue-700">
            Code Playground
          </span>

          <button
            type="button"
            className="btn btn-outline-primary btn-sm rounded-full mt-2 text-blue-600 border-blue-400"
          >
            {"</>"}
          </button>

        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 w-full">
        <div className="max-w-6xl mx-auto px-4 py-10">

          {/* Greeting */}
          <p className="text-sm text-gray-500 mb-1">
            Hi {username ? username : "User"},
          </p>

          <h1 className="text-2xl font-semibold text-gray-900 mb-2">
            Welcome Back
          </h1>

          <p className="text-sm text-gray-500 mb-3 max-w-3xl">
            Start learning through well-organized coding lessons, complete each
            session, and feel proud of your progress. Follow the structured
            modules, check your completed tasks, and continue improving your
            coding skills step by step.
          </p>

          {/* Sessions tab */}
          <div className="border-b border-gray-200 mb-2">
            <button
              type="button"
              className="btn btn-link px-0 pb-3 border-b-2 border-blue-600 text-blue-600 font-medium rounded-none inline-flex items-center gap-2"
            >
              🔹 Sessions
            </button>
          </div>

          {/* Card */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col justify-between">
              
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-1">
                  Python Programming
                </h2>

                <p className="text-sm text-gray-500 mb-4">
                  Dive into essentials for development
                </p>

                {/* Python Tag with Fire Symbol */}
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-gray-100 text-xs font-medium text-gray-700">
                  
                  <span className="mr-2 text-orange-500 text-sm">
                    🔥
                  </span>

                  <span>Python</span>

                </div>
              </div>

              {/* Start Button */}
              <div className="mt-6">
                <button
                  type="button"
                  className="btn btn-primary w-full md:w-auto px-5 py-2 rounded-lg font-semibold shadow-sm"
                  onClick={() => navigate("/playground/python")}
                >
                  Start
                </button>
              </div>

            </div>

          </div>

        </div>
      </main>
    </div>
  );
}


export default Playground;


