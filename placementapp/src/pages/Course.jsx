import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function Course() {
  const navigate = useNavigate();
  const { courseId } = useParams();

  // ✅ Dynamic state
  const [courses, setCourses] = useState({
    1: {
      title: "Java",
      color: "from-orange-500 to-red-500",
      icon: "☕",
      progress: 60,
      topics: [
        "Introduction to Java",
        "Java Operators",
        "Data Types"
      ]
    },
    2: {
      title: "Python",
      color: "from-green-500 to-emerald-600",
      icon: "🐍",
      progress: 40,
      topics: [
        "Python Basics",
        "Variables and Data Types",
        "Loops",
        "Functions"
      ]
    },
    3: {
      title: "JavaScript",
      color: "from-yellow-400 to-yellow-600",
      icon: "🟨",
      progress: 75,
      topics: [
        "JS Basics",
        "ES6",
        "DOM Manipulation",
        "React Basics"
      ]
    }
  });

  const [newTopic, setNewTopic] = useState("");

  // ✅ Add Topic
  const addTopic = () => {
    if (!newTopic.trim()) return;

    setCourses((prev) => ({
      ...prev,
      [courseId]: {
        ...prev[courseId],
        topics: [...prev[courseId].topics, newTopic]
      }
    }));

    setNewTopic("");
  };

  // =========================
  // 👉 COURSE LIST
  // =========================
  if (!courseId) {
    return (
      <div className="p-6 bg-gray-100 min-h-screen">
        <h2 className="text-3xl font-bold mb-8">Courses</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(courses).map(([id, course]) => (
            <div
              key={id}
              onClick={() => navigate(`/dashboard/course/${id}`)}
              className={`bg-gradient-to-r ${course.color} 
                          text-white p-6 rounded-2xl cursor-pointer 
                          shadow-lg hover:shadow-2xl 
                          transform hover:-translate-y-2 hover:scale-105 
                          transition duration-300`}
            >
              <div className="flex justify-between mb-4">
                <span className="text-4xl">{course.icon}</span>
                <span className="text-sm bg-white/20 px-2 py-1 rounded">
                  {course.progress}%
                </span>
              </div>

              <h3 className="text-2xl font-semibold mb-2">
                {course.title}
              </h3>

              <div className="w-full bg-white/30 h-2 rounded-full">
                <div
                  className="bg-white h-2 rounded-full"
                  style={{ width: `${course.progress}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // =========================
  // 👉 SINGLE COURSE
  // =========================
  const course = courses[courseId];

  if (!course) {
    return <h3 className="p-6 text-red-500">Course not found</h3>;
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">
          {course.title} Topics
        </h2>

        <button
          onClick={() => navigate("/dashboard/course")}
          className="text-blue-600 hover:underline"
        >
          ← Back
        </button>
      </div>

      {/* Add Topic */}
      <div className="flex gap-3 mb-6">
        <input
          type="text"
          value={newTopic}
          onChange={(e) => setNewTopic(e.target.value)}
          placeholder="Enter new topic..."
          className="flex-1 p-3 rounded-lg border outline-none"
        />

        <button
          onClick={addTopic}
          className="bg-blue-600 text-white px-5 rounded-lg hover:bg-blue-700"
        >
          Add
        </button>
      </div>

      {/* Topics */}
      <div className="space-y-4">
        {course.topics.map((topic, index) => (
          <div
            key={index}
            onClick={() =>
              navigate(`/dashboard/course/video/${courseId}/${index}`)
            }
            className="flex justify-between items-center 
                       bg-white p-4 rounded-xl shadow 
                       hover:shadow-md hover:bg-gray-50 
                       cursor-pointer transition"
          >
            <span>{index + 1}. {topic}</span>

            <span className="text-blue-500 text-sm">
              Watch →
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}