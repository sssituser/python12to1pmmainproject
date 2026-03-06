import React from "react";
import { useNavigate } from "react-router-dom";

export default function Course() {

  const navigate = useNavigate();

  const courses = [
    {
      id: 1,
      title: "Java FullStack",
      description: "Learn Java from basics to advanced",
    },
    {
      id: 2,
      title: "Python FullStack",
      description: "Complete Python programming course",
    },
    {
      id: 3,
      title: "JavaScript",
      description: "Master JavaScript concepts",
    },
    {
      id: 4,
      title: ".Net FullStack",
      description: "Learn .Net from basics understand all concepts",
    },
    {
      id: 5,
      title: "UI FullStack",
      description: "Learn complete ui html,css,js,angular js,vuejs",
    },
    {
      id: 6,
      title: "MERN Stack",
      description: "Master MongoDB,Node Js,Express Js,React Js concepts",
    },
    {
      id: 7,
      title: "Data Science",
      description: "Data Science is explained clearly",
    }
  ];

  return (
    <div className="container mt-4">

      <h2>Courses</h2>

      <div className="row">

        {courses.map((course) => (
          <div className="col-md-4" key={course.id}>

            <div className="card mb-3">

              <div className="card-body">
                <h5 className="card-title">{course.title}</h5>
                <p className="card-text">{course.description}</p>

                <button
                  className="btn btn-primary"
                  onClick={() => navigate(`/course/${course.id}`)}
                >
                  View Course
                </button>

              </div>

            </div>

          </div>
        ))}

      </div>

    </div>
  );
}