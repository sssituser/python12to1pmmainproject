import React from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function CourseTopics() {

  const { courseId } = useParams();
  const navigate = useNavigate();

  const topics = {
    1: ["1.  Introduction to Java","2.  java operators" ,"3.  Boot basics", "4.  Data Types","5.  Conditional Statements","6.  Control Statements","7. Logical coding","8. Inheritance","9.   Polymorphism","10.  Constructors"],
    2: ["1. Python Basics","2. Introduction to variables,data types,operators","3. Loops","4. Advanced Java"],
    3: ["1. JS Basics", "2. ES6", "3. React JS"],
    4: ["1. Introduction to .Net","2.Data types","3.Operators"],
    5: ["1. Html Heading Tags","2. Inline elements","3. Block level Elements","4.Anchor Tags"],
    6: ["1.Mongodb basics","2.basic commands","3.sorting,filter","4.Nodejs introduction"],
    7: ["1.Introduction to Data science","2.python basics","3.Looping statements"]
  };

  return (
    <div className="container mt-4">

      <h3>Course Topics</h3>

      {topics[courseId]?.map((topic, index) => (
        <div key={index} className="mb-2">

          <button
            className="btn btn-secondary"
            onClick={() => navigate(`/course/video/${index}`)}
          >
            {topic}
          </button>

        </div>
      ))}

    </div>
  );
}