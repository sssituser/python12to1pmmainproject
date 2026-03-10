import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "bootstrap-icons/font/bootstrap-icons.css";


const leaderboard = [
  { rank: 1, name: "Surya Kumar", score: 98, time: "20s" },
  { rank: 2, name: "Neha sri", score: 95, time: "22s" },
  { rank: 3, name: "Durga prasad", score: 92, time: "25s" },
]
const Examleaderboard = [
  { rank: 1, name: "Neha", score: 98, time: "20s" },
  { rank: 2, name: "Kumar", score: 95, time: "22s" },
  { rank: 3, name: "Gangaprasad", score: 92, time: "25s" },
  { rank: 4, name: "Sai", score: 90, time: "30s" },
];

function ExamLeaderboard() {

  const first = leaderboard.find(s => s.rank === 1);
  const second = leaderboard.find(s => s.rank === 2);
  const third = leaderboard.find(s => s.rank === 3);

  const [date, setDate] = useState("");
  const [batch, setBatch] = useState("");
  const [examType, setExamType] = useState("");

  const [showRules, setShowRules] = useState(true);

  useEffect(() => {
    toast.success("Leaderboard loaded successfully");

    // if (first) {
    //   toast.success(`🏆 ${first.name} is Rank 1`);
    // }
  }, []);

  return (

    <div className="container mt-4">

      <ToastContainer position="top-right" autoClose={3000} />

      Rules Popup
      {showRules && (
        <>
          <div className="modal fade show d-block">
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">

                <div className="modal-header">
                  <div className="text-center w-100">
                    <h5 className="mt-2">Leaderboard Ranking Rules</h5>
                    <i className="bi bi-stopwatch-fill text-success" style={{fontSize:"40px"}}></i>
                  </div>
                </div>

                <div className="modal-body text-start">

                  <p><b>1. Primary Rank</b></p>
                  <p>Higher score = higher rank</p>

                  <p><b>2. Tiebreakers</b></p>
                  <ul>
                    <li>Execution time (lower is better)</li>
                    <li>Time spent (faster is better)</li>
                    <li>Memory usage (lower is better)</li>
                    <li>Questions solved (more is better)</li>
                  </ul>

                  {/* <p><b>3. Difficulty Score</b></p>
                  <p>Topper = 1 | Medium = 2 | Hard = 3</p> */}

                </div>

                <div className="modal-footer">
                  <button
                    className="btn btn-primary w-100"
                    onClick={() => setShowRules(false)}
                  >
                    OK
                  </button>
                </div>

              </div>
            </div>
          </div>

          <div className="modal-backdrop fade show"></div>
        </>
      )}

      {/* Filters */}
      <div className="row mb-4">

        <div className="col-md-3">
          <label>Date</label>
          <input
            type="date"
            className="form-control"
            value={date}
            onChange={(e) => {
              setDate(e.target.value);
              // toast.info("Date filter applied");
            }}
          />
        </div>

        <div className="col-md-3">
          <label>Batch</label>
          <select
            className="form-control"
            value={batch}
            onChange={(e) => {
              setBatch(e.target.value);
              // toast.info("Batch filter applied");
            }}
          >
            <option value="">All Batches</option>
            <option value="1">Batch 1</option>
            <option value="2">Batch 2</option>
            <option value="3">Batch 3</option>
          </select>
        </div>

        <div className="col-md-3">
          <label>Exam Type</label>
          <select
            className="form-control"
            value={examType}
            onChange={(e) => {
              setExamType(e.target.value);
              // toast.info("Exam type selected");
            }}
          >
            <option value="">Select</option>
            <option value="daily">Daily Exam</option>
            <option value="weekly">Weekly Exam</option>
            <option value="monthly">Monthly Exam</option>
            <option value="grand">Grand Test</option>
          </select>
        </div>

      </div>

      <h3 className="text-center mb-4">Leaderboard</h3>

      {/* Podiums */}
      <div style={{ height: "250px" }}>
        <div className="d-flex justify-content-center align-items-end h-100">

          <motion.div
            className="text-center mx-3"
            initial={{ height: 0 }}
            animate={{ height: 120 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            style={{ width: "120px", overflow: "hidden" }}
          >
            <div className="bg-primary text-white p-4 rounded">
              <h2>{second.rank}</h2>
              <p>{second.name}</p>
            </div>
          </motion.div>

          <motion.div
            className="text-center mx-3"
            initial={{ height: 0 }}
            animate={{ height: 180 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            style={{ width: "140px", overflow: "hidden" }}
          >
            <div className="bg-warning text-dark p-5 rounded">
              <h1>{first.rank}</h1>
              <p>{first.name}</p>
            </div>
          </motion.div>

          <motion.div
            className="text-center mx-3"
            initial={{ height: 0 }}
            animate={{ height: 120 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            style={{ width: "120px", overflow: "hidden" }}
          >
            <div className="bg-primary text-white p-4 rounded">
              <h2>{third.rank}</h2>
              <p>{third.name}</p>
            </div>
          </motion.div>

        </div>
      </div>

      {/* Leaderboard Table */}
      <table className="table table-striped text-center">

        <thead className="table-dark">
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