import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "bootstrap-icons/font/bootstrap-icons.css";

const leaderboard = [
  { rank: 1, name: "Surya Kumar", score: 98, time: "20s" },
  { rank: 2, name: "Neha sri", score: 95, time: "22s" },
  { rank: 3, name: "Durga prasad", score: 92, time: "25s" },
];

function ExamLeaderboard() {

  const first = leaderboard.find((s) => s.rank === 1);
  const second = leaderboard.find((s) => s.rank === 2);
  const third = leaderboard.find((s) => s.rank === 3);

  const [date, setDate] = useState("");
  const [batch, setBatch] = useState("");
  const [examType, setExamType] = useState("");
  const [showRules, setShowRules] = useState(true);

  useEffect(() => {
    toast.success("Leaderboard loaded successfully");
  }, []);

  return (
    <div className="p-6 max-w-6xl mx-auto">

      <ToastContainer position="top-right" autoClose={3000} />

      {/* Rules Popup */}
      {showRules && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm z-50">

          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">

            <div className="text-center mb-4">
              <h2 className="text-xl font-semibold">
                Leaderboard Ranking Rules
              </h2>
              <i className="bi bi-stopwatch-fill text-green-500 text-4xl mt-2"></i>
            </div>

            <div className="text-sm text-gray-700 space-y-3">

              <p><b>1. Primary Rank</b></p>
              <p>Higher score = higher rank</p>

              <p><b>2. Tiebreakers</b></p>
              <ul className="list-disc ml-5">
                <li>Execution time (lower is better)</li>
                <li>Time spent (faster is better)</li>
                <li>Memory usage (lower is better)</li>
                <li>Questions solved (more is better)</li>
              </ul>

              <p><b>3. Difficulty Score</b></p>
              <p>Topper = 1 | Medium = 2 | Hard = 3</p>

            </div>

            <button
              onClick={() => setShowRules(false)}
              className="mt-5 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
            >
              OK
            </button>

          </div>

        </div>
      )}

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">

        <div>
          <label className="text-sm font-medium">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => {
              setDate(e.target.value);
              // toast.info("Date filter applied");
            }}
            className="w-full border rounded-lg px-3 py-2 mt-1"
          />
        </div>

        <div>
          <label className="text-sm font-medium">Batch</label>
          <select
            value={batch}
            onChange={(e) => {
              setBatch(e.target.value);
              // toast.info("Batch filter applied");
            }}
            className="w-full border rounded-lg px-3 py-2 mt-1"
          >
            <option value="">All Batches</option>
            <option value="1">Batch 1</option>
            <option value="2">Batch 2</option>
            <option value="3">Batch 3</option>
          </select>
        </div>

        <div>
          <label className="text-sm font-medium">Exam Type</label>
          <select
            value={examType}
            onChange={(e) => {
              setExamType(e.target.value);
              // toast.info("Exam type selected");
            }}
            className="w-full border rounded-lg px-3 py-2 mt-1"
          >
            <option value="">Select</option>
            <option value="daily">Daily Exam</option>
            <option value="weekly">Weekly Exam</option>
            <option value="monthly">Monthly Exam</option>
            <option value="grand">Grand Test</option>
          </select>
        </div>

      </div>

      <h2 className="text-center text-2xl font-semibold mb-8">
        Leaderboard
      </h2>

      {/* Podium */}
      <div className="mt-6 flex justify-center items-end gap-10">

        {/* Rank 2 */}
        <motion.div
          initial={{ y: 60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center"
        >
          <div className="bg-blue-500 text-white rounded-xl w-32 h-36 flex flex-col items-center justify-center shadow-lg">
            <span className="text-3xl font-bold">2</span>
            <p className="text-sm">{second.name}</p>
          </div>
        </motion.div>

        {/* Rank 1 */}
        <motion.div
          initial={{ y: 60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center"
        >
          <div className="bg-yellow-400 text-black rounded-xl w-36 h-48 flex flex-col items-center justify-center shadow-xl">
            <span className="text-4xl font-bold">1</span>
            <p className="text-sm font-semibold">{first.name}</p>
          </div>
        </motion.div>

        {/* Rank 3 */}
        <motion.div
          initial={{ y: 60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7 }}
          className="flex flex-col items-center"
        >
          <div className="bg-blue-500 text-white rounded-xl w-32 h-36 flex flex-col items-center justify-center shadow-lg">
            <span className="text-3xl font-bold">3</span>
            <p className="text-sm">{third.name}</p>
          </div>
        </motion.div>

      </div>

      {/* Leaderboard Table */}
      <div className="mt-10 max-w-4xl mx-auto overflow-x-auto">

        <table className="w-full border rounded-lg shadow-md">

          <thead className="bg-gray-800 text-white">
            <tr>
              <th className="p-3">Rank</th>
              <th className="p-3">Name</th>
              <th className="p-3">Time Taken</th>
              <th className="p-3">Score</th>
            </tr>
          </thead>

          <tbody>
            {leaderboard.map((student) => (
              <tr
                key={student.rank}
                className="text-center border-t hover:bg-gray-100"
              >
                <td className="p-3 font-medium">{student.rank}</td>
                <td className="p-3">{student.name}</td>
                <td className="p-3">{student.time}</td>
                <td className="p-3">{student.score}</td>
              </tr>
            ))}
          </tbody>

        </table>

      </div>

    </div>
  );
}

export default ExamLeaderboard;