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
        "Learn how variables work in Python, how to write comments, and how they are used in real coding.",
      image: variablesImg,
    },
    {
      title: "Operators",
      description:
        "Understand arithmetic, logical, and comparison operators used in Python programming.",
      image: operatorsImg,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <header className="bg-white border-b shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">

          <button
            onClick={() => navigate("/playground")}
            className="text-sm text-gray-600 hover:text-blue-600"
          >
            ← Back
          </button>

          <h1 className="text-xl font-semibold text-blue-700">
            Code Playground
          </h1>

          <div className="text-blue-600 font-mono text-sm bg-blue-50 px-3 py-1 rounded-full">
            {"</>"}
          </div>

        </div>
      </header>


      {/* Main Section */}
      <main className="max-w-6xl mx-auto px-6 py-10">

        {/* Page Title */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">
            Python Essentials for Learning
          </h2>

          <p className="text-gray-600 max-w-2xl">
            Explore structured Python modules, practice coding concepts,
            and track your progress through guided sessions.
          </p>
        </div>


        {/* Sessions */}
        <div className="grid gap-6">

          {sessions.map((item, index) => (

            <div
              key={index}
              className="bg-white border rounded-xl shadow-sm p-5 flex items-center justify-between hover:shadow-md transition"
            >

              {/* Left Section */}
              <div className="flex items-center gap-5">

                <img
                  src={item.image}
                  alt={item.title}
                  width="80"
                  height="80"
                  className="w-20 h-20 rounded-lg object-cover"
                />

                <div>
                  <h3 className="font-semibold text-gray-800">
                    {item.title}
                  </h3>

                  <p className="text-sm text-gray-600 mt-1 max-w-md">
                    {item.description}
                  </p>
                </div>

              </div>


              {/* Start Button */}
              <button
                onClick={() => navigate("/exam")}
                className="bg-blue-600 text-white px-5 py-2 rounded-full text-sm hover:bg-blue-700 transition"
              >
                Start
              </button>

            </div>

          ))}

        </div>

      </main>

    </div>
  );
}

export default PlaygroundDetail;