import React from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function Course() {

  const navigate = useNavigate();
  const { courseId } = useParams();

  const courses = {
    1: {
      title: "Java",
      topics: [
        "Introduction to Java",
        "Java Operators",
        "Data Types",
        "Conditional Statements",
        "Control Statements"
      ]
    },
    2: {
      title: "Python",
      topics: [
        "Python Basics",
        "Variables and Data Types",
        "Loops",
        "Functions"
      ]
    },
    3: {
      title: "JavaScript",
      topics: [
        "JS Basics",
        "ES6",
        "DOM Manipulation",
        "React Basics"
      ]
    }
  };

  // 👉 If courseId is not present → show course list
  if (!courseId) {

    return (

      <div className="p-6">

        <h2 className="text-2xl font-bold mb-6">Courses</h2>

        <div className="grid grid-cols-3 gap-4">

          {Object.entries(courses).map(([id, course]) => (

            <div
              key={id}
              onClick={() => navigate(`/dashboard/course/${id}`)}
              className="bg-blue-600 text-white p-5 rounded cursor-pointer hover:bg-blue-700"
            >
              <h3 className="text-xl">{course.title}</h3>
            </div>
          ))}
        </div>
      </div>
    );
  }
  const course = courses[courseId];
  if (!course) {
    return <h3 className="p-6">Course not found</h3>;
  }
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">{course.title} Topics</h2>
      {course.topics.map((topic, index) => (
        <button
          key={index}
          onClick={() =>
            navigate(`/dashboard/course/video/${courseId}/${index}`)
          }
          className="block w-full text-left bg-gray-200 p-3 mb-2 rounded hover:bg-gray-300"
        >
          {index + 1}. {topic}
        </button>
      ))}
    </div>
  );

}