import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import "bootstrap-icons/font/bootstrap-icons.css";

function ExamLeaderboard() {

  //  STATE
  const [leaderboard, setLeaderboard] = useState([]);
  const [date, setDate] = useState("");
  const [batch, setBatch] = useState("");
  const [examType, setExamType] = useState("");
  const [showRules, setShowRules] = useState(true);
  const [loading, setLoading] = useState(true);       // only true on first load
  const [isRefreshing, setIsRefreshing] = useState(false); // silent background refresh

  //  FETCH FUNCTION
  const fetchLeaderboard = async (isInitial = false) => {
    try {
      if (isInitial) setLoading(true);
      else setIsRefreshing(true);

      const params = new URLSearchParams();
      if (date) params.append('date', date);
      if (batch) params.append('batch', batch);
      if (examType) params.append('exam_type', examType);

      const res = await fetch(`http://127.0.0.1:8000/api/leaderboard/?${params.toString()}`);
      const data = await res.json();

      if (data.success) {
        setLeaderboard(data.data || []);
        // Only show toast on manual/initial load, not on every 15-sec refresh
        if (isInitial) toast.success("Leaderboard loaded", { toastId: "leaderboardToast" });
      } else {
        if (isInitial) toast.error("Failed to load leaderboard", { toastId: "leaderboardToast" });
      }
    } catch (error) {
      console.error(error);
      if (isInitial) toast.error("Failed to load leaderboard", { toastId: "leaderboardToast" });
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  //  AUTO LOAD + SILENT AUTO REFRESH every 30 sec
  useEffect(() => {
    fetchLeaderboard(true); // initial load — shows spinner + toast

    const interval = setInterval(() => fetchLeaderboard(false), 30000); // silent refresh
    return () => clearInterval(interval);
  }, [date, batch, examType]);

  //  SAFE PODIUM
  const first = leaderboard.find((s) => s.rank === 1) || {};
  const second = leaderboard.find((s) => s.rank === 2) || {};
  const third = leaderboard.find((s) => s.rank === 3) || {};

  // LOADING STATE
  if (loading) {
    return <p className="text-center mt-10">Loading leaderboard...</p>;
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">

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
              <p>Higher score = Higher rank</p>

              <p><b>2. Tiebreakers</b></p>
              <ul className="list-disc ml-5">
                <li>Execution time</li>
                <li>Time spent</li>
                <li>Memory usage</li>
                <li>Questions solved</li>
              </ul>

              <p><b>3. Rank Score</b></p>
              <p>Top Rank = 1 | Mid Rank = 2 | Low Rank = 3</p>

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
            onChange={(e) => setDate(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 mt-1"
          />
        </div>

        <div>
          <label className="text-sm font-medium">Batch</label>
          <div className="w-full border rounded-lg px-3 py-2 mt-1 bg-gray-100 text-gray-500 cursor-not-allowed">
            All Batches
          </div>
        </div>

        <div>
          <label className="text-sm font-medium">Exam Type</label>
          <select
            value={examType}
            onChange={(e) => setExamType(e.target.value)}
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
          className="flex flex-col items-center"
        >
          <div className="bg-blue-500 text-white rounded-xl w-32 h-36 flex items-center justify-center flex-col shadow-lg">
            <span className="text-3xl font-bold">2</span>
            <p className="text-sm font-semibold mt-1">{(second.username || "-").toUpperCase()}</p>
          </div>
        </motion.div>

        {/* Rank 1 */}
        <motion.div
          initial={{ y: 60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex flex-col items-center"
        >
          <div className="bg-yellow-400 text-black rounded-xl w-36 h-48 flex items-center justify-center flex-col shadow-xl">
            <span className="text-4xl font-bold">1</span>
            <p className="text-sm font-semibold mt-1">{(first.username || "-").toUpperCase()}</p>
          </div>
        </motion.div>

        {/* Rank 3 */}
        <motion.div
          initial={{ y: 60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex flex-col items-center"
        >
          <div className="bg-blue-500 text-white rounded-xl w-32 h-36 flex items-center justify-center flex-col shadow-lg">
            <span className="text-3xl font-bold">3</span>
            <p className="text-sm font-semibold mt-1">{(third.username || "-").toUpperCase()}</p>
          </div>
        </motion.div>

      </div>

      {/* Table */}
      <div className="mt-10 max-w-4xl mx-auto overflow-x-auto">

        <table className="w-full border-collapse rounded-lg shadow-md text-sm">

          <thead className="bg-gray-800 text-white">
            <tr>
              <th className="py-3 px-4 text-center">Rank</th>
              <th className="py-3 px-4 text-center">Name</th>
              <th className="py-3 px-4 text-center">Time</th>
              <th className="py-3 px-4 text-center">Score</th>
            </tr>
          </thead>

          <tbody>
            {leaderboard.length > 0 ? (
              leaderboard.map((student) => (
                <tr key={student.rank} className="border-t hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4 text-center font-semibold text-gray-700">{student.rank}</td>
                  <td className="py-3 px-4 text-center font-medium uppercase tracking-wide">{student.username}</td>
                  <td className="py-3 px-4 text-center text-gray-600">{student.time_taken}</td>
                  <td className="py-3 px-4 text-center font-bold text-indigo-700">{student.score}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="py-6 text-center text-gray-500">
                  No data available
                </td>
              </tr>
            )}
          </tbody>

        </table>

      </div>

    </div>
  );
}

export default ExamLeaderboard;