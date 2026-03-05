import React from "react";
import { useNavigate } from "react-router-dom";

import variablesImg from "../assets/variables.jpg";
import operatorsImg from "../assets/operators.jpg";

function PlaygroundDetail() {
  const navigate = useNavigate();
  const sessions = [
    {
      title: "Introduction to Variables, Comments and Usage",
      description:
        "Explore the key concepts and subtopics under Introduction to Variables, Comments and Usage.",
      image: variablesImg,
    },
    {
      title: "Operators",
      description: "Explore the key concepts and subtopics under Operators.",
      image: operatorsImg,
    },
  ];
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      
      {/* Top bar */}
      <header className="w-full bg-white shadow-sm border-b border-gray-200">
        <div className="relative max-w-6xl mx-auto px-4 py-4 flex items-center justify-center">
          {/* Back button */}
          <button
            type="button"
            className="absolute left-4 btn btn-outline-primary btn-sm rounded-pill px-3 py-1"
            onClick={() => navigate("/playground")}
          >
            ← Back
          </button>
          {/* Title */}
          <div className="flex flex-col items-center justify-center text-center">
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
        </div>
      </header>
      {/* Main content */}
      <main className="flex-1 w-full">
        <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
          {/* Title and description */}
          <div>
            <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-1">
              Python Essentials for Learning
            </h3>
            <p className="text-sm text-gray-600 max-w-3xl">
              Dive into curated coding modules, complete sessions, and celebrate
              your progress. Engage with structured modules, track completion,
              and stay ahead in your journey.
            </p>
          </div>
          {/* Sessions */}
          <div className="space-y-4">
            {sessions.map((item, index) => (
              <div
                key={index}
                className="bg-white rounded-xl border border-gray-200 shadow-sm px-4 py-4 md:px-6 md:py-5 flex items-center justify-between hover:shadow-md transition"
              >
                
                <div className="flex items-start gap-4">
                  {/* Image */}
                  <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 flex items-center justify-center">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {/* Text */}
                  <div>
                    <h2 className="text-sm font-semibold text-gray-900">
                      {item.title}
                    </h2>
                    <p className="text-xs md:text-sm text-gray-600 mt-1">
                      {item.description}
                    </p>
                  </div>
                </div>
                {/* Start button */}
                <button
                  type="button"
                  className="btn btn-primary btn-sm rounded-pill px-4"
                >
                  Start
                </button>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

export default PlaygroundDetail;