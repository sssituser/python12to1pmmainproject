import {
  faBolt,
  faCalendarCheck,
  faCheckCircle,
  faClock,
  faHistory,
  faMedal,
  faSearch,
  faTimesCircle,
  faTrophy,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios from "axios";
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const PlaygroundResults = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const navigate = useNavigate();

  const userStr = localStorage.getItem("user");
  const user = userStr && userStr !== "undefined" ? JSON.parse(userStr) : {};
  const targetUsername = user.username || "Unknown";

  const fetchResults = async () => {
    setLoading(true);
    try {
      const currentUsername = targetUsername.toLowerCase();
      const token = localStorage.getItem("access")?.replace(/^"|"$/g, "");
      const config = { headers: token ? { Authorization: `Bearer ${token}` } : {} };

      // 1. Fetch Backend Data
      const [dailyRes, weeklyRes, monthlyRes] = await Promise.allSettled([
        axios.get(`http://${window.location.hostname}:8000/api/user-combined-results/?username=${currentUsername}`, config),
        axios.get(`http://${window.location.hostname}:8000/api/all-exam-results/?exam_type=weekly&username=${currentUsername}`, config),
        axios.get(`http://${window.location.hostname}:8000/api/all-exam-results/?exam_type=monthly&username=${currentUsername}`, config)
      ]);

      const extractData = (res) => {
        if (res.status === 'rejected') return [];
        const d = res.value.data;
        let list = d?.data || d || [];
        if (!Array.isArray(list) && list.results) list = list.results;
        return Array.isArray(list) ? list : [];
      };

      const backendDaily = extractData(dailyRes);
      const backendWeekly = extractData(weeklyRes);
      const backendMonthly = extractData(monthlyRes);

      // 2. Filter Local Results
      const allLocalData = JSON.parse(localStorage.getItem("allExamResults") || "[]");
      const currentLocal = allLocalData.filter(r => {
        const u = (r.user?.username || r.username || "").toLowerCase();
        return u === currentUsername || u === "";
      });

      // 3. Transform and Merge
      const transform = (item, typeDefault) => ({
        ...item,
        examTitle: item.examTitle || item.exam_title || item.title || "Assessment",
        examType: (item.examType || item.exam_type || typeDefault).toLowerCase(),
        score: item.score ?? item.marks_obtained ?? 0,
        totalQuestions: item.totalQuestions ?? item.total_questions ?? 0,
        correctAnswers: item.correctAnswers ?? item.correct_answers ?? 0,
        totalMarks: item.totalMarks ?? item.total_marks ?? (item.totalQuestions ? item.totalQuestions * 10 : 100),
        passed: item.passed ?? (item.status === 'Pass' || item.status === 'completed' || (item.score / (item.totalMarks || 100) >= 0.35)),
        examDate: item.examDate || item.created_at || item.start_time || item.date || new Date().toISOString()
      });

      const merged = [
        ...currentLocal.map(i => transform(i, "daily")),
        ...backendDaily.map(i => transform(i, "daily")),
        ...backendWeekly.map(i => transform(i, "weekly")),
        ...backendMonthly.map(i => transform(i, "monthly"))
      ];

      const seen = new Set();
      const unique = merged.filter(item => {
        const title = (item.examTitle || "").toLowerCase();
        
        const date = new Date(item.examDate).toISOString().substring(0, 16); // Minute precision
        const key = `${date}_${title}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });

      setResults(unique.sort((a, b) => new Date(b.examDate) - new Date(a.examDate)));
    } catch (error) {
      console.error("Aggregation Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();

    const handleUpdate = () => {
      console.log("🔄 Results auto-update triggered");
      fetchResults();
    };

    window.addEventListener('examDataUpdated', handleUpdate);
    return () => window.removeEventListener('examDataUpdated', handleUpdate);
  }, [targetUsername]);

  const stats = useMemo(() => {
    const total = results.length;
    const passedCount = results.filter(r => r.passed).length;
    const totalScore = results.reduce((acc, r) => acc + (r.score || 0), 0);
    const avgScore = total > 0 ? (totalScore / total).toFixed(1) : 0;
    
    return { total, passedCount, avgScore };
  }, [results]);

  const filteredResults = useMemo(() => {
    return results.filter(r => {
      const matchesSearch = (r.examTitle || "").toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === "all" || r.examType === filterType;
      return matchesSearch && matchesType;
    });
  }, [results, searchTerm, filterType]);

  const formatDate = (dateStr) => {
    try {
      if (!dateStr) return "N/A";
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { 
        month: 'short', day: 'numeric', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
      });
    } catch (e) { return dateStr || "N/A"; }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8">
      {/* Header Section */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">
              Performance <span className="text-blue-600">Analytics</span>
            </h1>
            <p className="text-slate-500 font-medium text-sm">
              Detailed history of your programming assessments and exams.
            </p>
          </div>
          <button 
            onClick={() => navigate("/dashboard/playground")}
            className="inline-flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all active:scale-95 shadow-lg shadow-slate-200"
          >
            <FontAwesomeIcon icon={faBolt} />
            Back to Playground
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-5">
          <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
            <FontAwesomeIcon icon={faHistory} className="text-xl" />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Exams</p>
            <h3 className="text-2xl font-black text-slate-900">{stats.total}</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-5">
          <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
            <FontAwesomeIcon icon={faTrophy} className="text-xl" />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Exams Passed</p>
            <h3 className="text-2xl font-black text-slate-900">{stats.passedCount}</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-5">
          <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600">
            <FontAwesomeIcon icon={faMedal} className="text-xl" />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Avg Score</p>
            <h3 className="text-2xl font-black text-slate-900">{stats.avgScore}</h3>
          </div>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="max-w-7xl mx-auto bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
        {/* Filters and Search */}
        <div className="p-6 md:p-8 border-b border-slate-50 flex flex-col md:flex-row gap-4 justify-between items-center bg-white">
          <div className="relative w-full md:w-96">
            <FontAwesomeIcon icon={faSearch} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
            <input 
              type="text" 
              placeholder="Search exam history..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-blue-500/20 transition-all text-slate-900"
            />
          </div>
          
          <div className="flex bg-slate-50 p-1.5 rounded-2xl w-full md:w-auto">
            {['all', 'daily', 'weekly', 'monthly'].map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`flex-1 md:flex-none px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  filterType === type 
                  ? 'bg-white text-blue-600 shadow-md ring-1 ring-slate-100' 
                  : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Results Table */}
        <div className="overflow-x-auto">
          {loading ? (
             <div className="p-20 text-center">
                <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Aggregating Results...</p>
             </div>
          ) : filteredResults.length > 0 ? (
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Exam Details</th>
                  <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Performance</th>
                  <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Attempted On</th>
                  <th className="px-8 py-5 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="px-8 py-5 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredResults.map((result, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs ${
                          result.examType === 'monthly' ? 'bg-purple-50 text-purple-600' :
                          result.examType === 'weekly' ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'
                        }`}>
                          {result.examType?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors uppercase text-sm tracking-tight">{result.examTitle}</p>
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            {result.examType} Assessment
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                           <span className="text-base font-black text-slate-900">{result.score}</span>
                           {result.totalMarks && <span className="text-xs text-slate-400 font-bold">/ {result.totalMarks}</span>}
                        </div>
                        <div className="w-32 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                           <div 
                            className={`h-full rounded-full ${result.passed ? 'bg-emerald-500' : 'bg-rose-500'}`} 
                            style={{ width: `${(result.score / (result.totalMarks || 100)) * 100}%` }}
                           ></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2 text-slate-600 font-medium text-xs">
                        <FontAwesomeIcon icon={faCalendarCheck} className="text-slate-300" />
                        {formatDate(result.examDate)}
                      </div>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                        result.passed 
                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                        : 'bg-rose-50 text-rose-600 border border-rose-100'
                      }`}>
                        <FontAwesomeIcon icon={result.passed ? faCheckCircle : faTimesCircle} />
                        {result.passed ? 'Passed' : 'Failed'}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <button 
                        onClick={() => navigate(`/dashboard/playground/detailed-results/${idx}`, { state: { result } })}
                        className="p-2.5 bg-slate-50 hover:bg-white hover:text-blue-600 rounded-xl transition-all border border-transparent hover:border-slate-100 text-slate-400 group"
                      >
                         <FontAwesomeIcon icon={faBolt} className="group-hover:scale-110 transition-transform" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-20 text-center">
              <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center text-slate-200 mx-auto mb-6">
                <FontAwesomeIcon icon={faHistory} className="text-4xl" />
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-2 uppercase tracking-tight">No History Found</h3>
              <p className="text-slate-400 font-medium max-w-sm mx-auto text-sm leading-relaxed">
                You haven't completed any assessments yet. Start your first exam in the playground to see results here.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlaygroundResults;
