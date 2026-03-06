import React from "react";
import { motion } from "framer-motion";

const leaderboard = [
  { rank: 1, name: "Neha sri", score: 98, time: "20s" },
  { rank: 2, name: "Surya Kumar", score: 95, time: "22s" },
  { rank: 3, name: "Durga prasad", score: 92, time: "25s" },
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

        {/* Filters */}
        <div className="col-md-3">
          <label>Batch</label>
          <select className="form-control" onChange={(e)=>setBatch(e.target.value)}>
            <option value="">All Batches</option>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
          </select>

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


      {/*Podiums*/}
      
        <h3 className="text-center mb-4">Leaderboard</h3>

        <div className="d-flex justify-content-center align-items-end mb-5">

          {/* Rank 2 */}
          <motion.div
            className="text-center mx-3"
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 2 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="bg-primary text-white p-4 rounded">
              <h2>2</h2>
              <p>Surya kumar</p>
            </div>
          </motion.div>

          {/* Rank 1 */}
          <motion.div
            className="text-center mx-3"
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.5 }}
          >
            <div className="bg-primary text-white p-5 rounded">
              <h1>1</h1>
              <p>Neha sri</p>
            </div>
          </motion.div>

          {/* Rank 3 */}
          <motion.div
            className="text-center mx-3"
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <div className="bg-primary text-white p-4 rounded">
              <h2>3</h2>
              <p>Durga prasad</p>
            </div>
          </motion.div>

        </div>

{/* Leaderboard Table */}
      <table className="table table-striped text-center">
        <thead className="table-primary">
          <tr>
            <th>Rank</th>
            <th>Name</th>
            <th>Time Taken</th>
            <th>Score</th>
          </tr>
        </thead>

        <tbody>
          {leaderboard.map((student) => (
            <tr key={student.rank}>
              <td>{student.rank}</td>
              <td>{student.name}</td>
              <td>{student.time}</td>
              <td>{student.score}</td>
            </tr>
          ))}
        </tbody>

      </table>



      

    </div>
  );
}

export default ExamLeaderboard;