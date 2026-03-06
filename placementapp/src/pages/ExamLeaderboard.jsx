import React from "react";

const leaderboard = [
  { rank: 1, name: "Neha", score: 98, time: "20s" },
  { rank: 2, name: "Kumar", score: 95, time: "22s" },
  { rank: 3, name: "Gangaprasad", score: 92, time: "25s" },
  { rank: 4, name: "Sai", score: 90, time: "30s" },
];

function ExamLeaderboard() {
  return (
    <div className="container mt-4">

      
      <div className="row mb-4">

        <div className="col-md-3">
          <label>Date</label>
          <input type="date" className="form-control"/>
        </div>

        <div className="col-md-3">
          <label>Batch</label>
          <input type="text" className="form-control" placeholder="Batch"/>
        </div>

        <div className="col-md-3">
          <label>Exam Type</label>
          <select className="form-control">
            <option>Select</option>
            <option>Daily Exam</option>
            <option>Weekly Exam</option>
            <option>Monthly Exam</option>
            <option>Grand Test</option>
          </select>
        </div>

      </div>


      
      <h3 className="text-center mb-4">Leaderboard</h3>


      
      <div className="d-flex justify-content-center align-items-end mb-5">

        <div className="text-center mx-3">
          <div className="bg-primary text-white p-4 rounded">
            <h2>2</h2>
            <p>Kumar</p>
          </div>
        </div>

        <div className="text-center mx-3">
          <div className="bg-primary text-white p-5 rounded">
            <h1>1</h1>
            <p>Neha</p>
          </div>
        </div>

        <div className="text-center mx-3">
          <div className="bg-primary text-white p-4 rounded">
            <h2>3</h2>
            <p>prasad</p>
          </div>
        </div>

      </div>


      

    </div>
  );
}

export default ExamLeaderboard;