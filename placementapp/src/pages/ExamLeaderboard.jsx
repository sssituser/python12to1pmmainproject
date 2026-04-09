import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import "bootstrap-icons/font/bootstrap-icons.css";

function ExamLeaderboard() {
  //  STATE
  const [leaderboard, setLeaderboard] = useState([]);
  const [date, setDate] = useState("");
  const [batch, setBatch] = useState("");
  const [examType, setExamType] = useState("");
  const [showRules, setShowRules] = useState(true);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [debugInfo, setDebugInfo] = useState(null);

  //  FETCH FUNCTION
  const fetchLeaderboard = async (showLoader = false) => {
    try {
      if (showLoader) setLoading(true);
      else setIsRefreshing(true);

      const params = new URLSearchParams();
      if (date) params.append("date", date);
      if (batch) params.append("batch", batch);
      if (examType) params.append("exam_type", examType);

      const res = await fetch(`/api/leaderboard/?${params.toString()}`);
      // Ensured correct slash-ending for Django compatibility
      const data = await res.json();

      if (data.success) {
        setLeaderboard(data.data || []);
        setDebugInfo(data.debug_info || null);
      } else {
        toast.error("Failed to load leaderboard");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error connecting to server");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  // Trigger fetch when filters change
  useEffect(() => {
    fetchLeaderboard(true);

    const handleExamUpdate = () => {
       console.log("🔄 Leaderboard - Exam updated, refreshing rankings...");
       fetchLeaderboard(false);
    };
    window.addEventListener('examDataUpdated', handleExamUpdate);

    return () => {
       window.removeEventListener('examDataUpdated', handleExamUpdate);
    };
  }, [date, batch, examType]);

  //  SILENT AUTO REFRESH every 45 sec
  useEffect(() => {
    const interval = setInterval(() => fetchLeaderboard(false), 45000);
    return () => clearInterval(interval);
  }, [date, batch, examType]);

  //  CLEAR FILTERS
  const clearFilters = () => {
    setDate("");
    setBatch("");
    setExamType("");
  };

  //  PODIUM DATA
  const podium = [
    leaderboard.find((s) => s.rank === 2), // Silver
    leaderboard.find((s) => s.rank === 1), // Gold
    leaderboard.find((s) => s.rank === 3), // Bronze
  ];

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 md:p-10 font-sans text-gray-900">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 mb-2">
              Hall of Fame
            </h1>
            <p className="text-gray-500 font-medium">
              Daily, Weekly, and Monthly top performers recognized for excellence.
            </p>
          </div>
          <button
            onClick={() => setShowRules(true)}
            className="flex items-center gap-2 bg-white border border-gray-200 px-5 py-2.5 rounded-xl shadow-sm hover:shadow-md transition-all text-sm font-semibold text-gray-700 active:scale-95"
          >
            <i className="bi bi-info-circle text-blue-500"></i>
            Ranking Rules
          </button>
        </div>

        {/* Filters Panel */}
        <div className="bg-white border border-gray-100 rounded-[2rem] p-6 shadow-sm mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-3">
             <div className={`w-2 h-2 rounded-full ${isRefreshing ? 'bg-blue-500 animate-pulse' : 'bg-green-400'}`}></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-end">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">
                Filter by Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-gray-50 border-none rounded-2xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all ring-1 ring-gray-100"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">
                Batch
              </label>
              <div className="w-full bg-gray-100 border-none rounded-2xl px-4 py-3 text-sm font-bold text-gray-400 cursor-not-allowed ring-1 ring-gray-100">
                All Batches
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">
                Exam Type
              </label>
              <select
                value={examType}
                onChange={(e) => setExamType(e.target.value)}
                className="w-full bg-gray-50 border-none rounded-2xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all ring-1 ring-gray-100 appearance-none cursor-pointer"
              >
                <option value="">All Exams</option>
                <option value="daily">Daily Exam</option>
                <option value="weekly">Weekly Exam</option>
                <option value="monthly">Monthly Exam</option>
                <option value="grand">Grand Test</option>
              </select>
            </div>

            <button
              onClick={clearFilters}
              disabled={!date && !batch && !examType}
              className="h-[48px] bg-red-50 text-red-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-red-100 transition-all active:scale-95 disabled:opacity-0"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Updating Rank Board...</p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* Podium Representation */}
            {leaderboard.length > 0 && (
              <div className="flex justify-center items-end gap-2 sm:gap-6 mb-2 px-4">
                {/* 2nd Place */}
                <motion.div
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="flex flex-col items-center flex-1 max-w-[140px]"
                >
                  <div className="text-gray-400 font-black text-2xl mb-2 italic">#2</div>
                  <div className="bg-white border border-gray-100 rounded-3xl p-4 w-full aspect-square flex flex-col items-center justify-center shadow-lg relative group">
                    <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl"></div>
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                       <i className="bi bi-person-fill text-blue-600 text-xl"></i>
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-tight text-center line-clamp-1 w-full">
                      {podium[0]?.username || "Runner Up"}
                    </span>
                    <span className="text-xs font-bold text-blue-600 mt-1">{podium[0]?.score || 0} pts</span>
                  </div>
                  <div className="w-full bg-gray-200 h-16 rounded-b-2xl mt-[-1rem] -z-10 shadow-inner"></div>
                </motion.div>

                {/* 1st Place */}
                <motion.div
                  initial={{ y: 70, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="flex flex-col items-center flex-1 max-w-[170px] z-10"
                >
                  <div className="text-yellow-500 font-black text-4xl mb-2 drop-shadow-sm">
                    <i className="bi bi-trophy-fill"></i>
                  </div>
                  <div className="bg-white border-2 border-yellow-400/30 rounded-[2.5rem] p-6 w-full aspect-square flex flex-col items-center justify-center shadow-2xl shadow-yellow-200/50 relative overflow-hidden group">
                    <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-yellow-300 via-yellow-500 to-yellow-300"></div>
                    <div className="w-16 h-16 bg-yellow-50 rounded-full flex items-center justify-center mb-4">
                       <i className="bi bi-award-fill text-yellow-600 text-3xl"></i>
                    </div>
                    <span className="text-xs font-black uppercase tracking-tight text-center line-clamp-1 w-full">
                      {podium[1]?.username || "Champion"}
                    </span>
                    <span className="text-sm font-black text-yellow-600 mt-1">{podium[1]?.score || 0} pts</span>
                  </div>
                  <div className="w-full bg-gray-300 h-28 rounded-b-2xl mt-[-1rem] -z-10 shadow-lg"></div>
                </motion.div>

                {/* 3rd Place */}
                <motion.div
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="flex flex-col items-center flex-1 max-w-[140px]"
                >
                  <div className="text-amber-700/50 font-black text-2xl mb-2 italic">#3</div>
                  <div className="bg-white border border-gray-100 rounded-3xl p-4 w-full aspect-square flex flex-col items-center justify-center shadow-lg relative group">
                    <div className="w-10 h-10 bg-amber-50 rounded-full flex items-center justify-center mb-3">
                       <i className="bi bi-person-fill text-amber-700 text-lg"></i>
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-tight text-center line-clamp-1 w-full">
                      {podium[2]?.username || "Bronze"}
                    </span>
                    <span className="text-xs font-bold text-amber-700 mt-1">{podium[2]?.score || 0} pts</span>
                  </div>
                  <div className="w-full bg-gray-100 h-10 rounded-b-2xl mt-[-1rem] -z-10 shadow-inner"></div>
                </motion.div>
              </div>
            )}

            {/* Table Section */}
            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-50/50 border-b border-gray-100">
                      <th className="py-6 px-8 text-left text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Rank</th>
                      <th className="py-6 px-4 text-left text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Participant</th>
                      <th className="py-6 px-4 text-center text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Exam Category</th>
                      <th className="py-6 px-4 text-center text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Time Taken</th>
                      <th className="py-6 px-8 text-center text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Total Score</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    <AnimatePresence mode="popLayout">
                      {leaderboard.length > 0 ? (
                        leaderboard.map((student, index) => (
                          <motion.tr
                            key={student.username + student.rank}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="group hover:bg-blue-50/30 transition-colors"
                          >
                            <td className="py-5 px-8">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black shadow-sm ${
                                student.rank === 1 ? 'bg-yellow-400 text-yellow-900' :
                                student.rank === 2 ? 'bg-gray-200 text-gray-600' :
                                student.rank === 3 ? 'bg-amber-100 text-amber-700' :
                                'bg-gray-50 text-gray-400'
                              }`}>
                                {student.rank}
                              </div>
                            </td>
                            <td className="py-5 px-4 font-black uppercase text-xs tracking-tight text-gray-800">
                              {student.username}
                            </td>
                            <td className="py-5 px-4 text-center">
                              <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-[9px] font-black uppercase tracking-widest whitespace-nowrap">
                                {student.exam_type?.replace(/_/g, ' ') || "General"}
                              </span>
                            </td>
                            <td className="py-5 px-4 text-center text-xs font-bold text-gray-500 tabular-nums">
                              {student.time_taken}
                            </td>
                            <td className="py-5 px-8 text-center font-black text-blue-600 tabular-nums">
                               {student.score}
                            </td>
                          </motion.tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="5" className="py-32">
                            <div className="flex flex-col items-center justify-center gap-4 text-center px-10">
                               <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-2">
                                  <i className="bi bi-clipboard-x text-gray-200 text-4xl"></i>
                               </div>
                               <h3 className="font-black uppercase text-gray-800 tracking-tight">No Rankings Found</h3>
                               <p className="text-sm text-gray-400 max-w-xs leading-relaxed">
                                 {debugInfo?.total_count > 0 
                                   ? `We found ${debugInfo.total_count} total records in the system, but 0 match your current filters (Date: ${date || 'Any'}, Type: ${examType || 'Any'}). Try clearing filters!`
                                   : "We couldn't find ANY exam records in the backend database. Please ensure you have taken an exam and that it was saved successfully."
                                 }
                               </p>
                               <button 
                                 onClick={clearFilters}
                                 className="mt-2 px-6 py-2 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-100 hover:scale-105 transition-transform active:scale-95"
                               >
                                  See All Rankings
                               </button>
                            </div>
                          </td>
                        </tr>
                      )}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* Rules Modal */}
        {showRules && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-[1.5rem] shadow-2xl relative border border-gray-100 overflow-hidden"
              style={{ width: "460px", height: "460px" }}
            >
              {/* Close */}
              <button 
                onClick={() => setShowRules(false)}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-50 hover:bg-gray-100 transition-colors z-10"
              >
                <i className="bi bi-x-lg text-gray-400 text-sm"></i>
              </button>

              {/* Inner flex column filling exactly 460px */}
              <div style={{ height: "460px", display: "flex", flexDirection: "column", padding: "24px 28px 20px" }}>

                {/* Header — fixed ~90px */}
                <div className="text-center" style={{ marginBottom: "16px" }}>
                  <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mx-auto" style={{ marginBottom: "10px" }}>
                    <i className="bi bi-stopwatch-fill text-base"></i>
                  </div>
                  <h3 className="text-[13px] font-black text-gray-900 tracking-tight uppercase leading-tight">
                    Leaderboard Ranking Rules
                  </h3>
                </div>

                {/* Rule cards — flex-1, each gets equal height via flex */}
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "10px" }}>

                  {/* 1. Primary Rank */}
                  <div style={{ flex: 1, display: "flex", alignItems: "center", gap: "14px" }}
                    className="bg-green-50/60 rounded-2xl px-4 border border-green-100">
                    <div className="shrink-0 w-7 h-7 rounded-full bg-green-100 text-green-600 flex items-center justify-center font-black text-[11px]">1</div>
                    <div>
                      <h4 className="font-black text-[10px] uppercase tracking-widest text-gray-800 mb-0.5">Primary Rank</h4>
                      <p className="text-[11px] text-gray-500 font-semibold">Higher score = Higher rank</p>
                    </div>
                  </div>

                  {/* 2. Tiebreakers */}
                  <div style={{ flex: 1, display: "flex", alignItems: "center", gap: "14px" }}
                    className="bg-blue-50/60 rounded-2xl px-4 border border-blue-100">
                    <div className="shrink-0 w-7 h-7 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-black text-[11px]">2</div>
                    <div>
                      <h4 className="font-black text-[10px] uppercase tracking-widest text-gray-800 mb-0.5">Tiebreakers</h4>
                      <p className="text-[11px] text-gray-500 font-medium leading-relaxed">
                        Execution time &nbsp;•&nbsp; Time spent &nbsp;•&nbsp; Memory usage &nbsp;•&nbsp; Questions solved
                      </p>
                    </div>
                  </div>

                  {/* 3. Rank Score */}
                  <div style={{ flex: 1, display: "flex", alignItems: "center", gap: "14px" }}
                    className="bg-purple-50/60 rounded-2xl px-4 border border-purple-100">
                    <div className="shrink-0 w-7 h-7 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-black text-[11px]">3</div>
                    <div>
                      <h4 className="font-black text-[10px] uppercase tracking-widest text-gray-800 mb-0.5">Rank Score</h4>
                      <p className="text-[11px] text-gray-500 font-medium">Top Rank = 1 &nbsp;|&nbsp; Mid = 2 &nbsp;|&nbsp; Low = 3</p>
                    </div>
                  </div>

                </div>

                {/* Button — fixed ~44px + 16px top margin */}
                <button
                  onClick={() => setShowRules(false)}
                  className="w-full bg-blue-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-700 transition-all active:scale-95 shadow-lg shadow-blue-100"
                  style={{ marginTop: "16px", height: "44px", flexShrink: 0 }}
                >
                  I Understand
                </button>

              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ExamLeaderboard;
