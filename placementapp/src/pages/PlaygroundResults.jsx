import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import jsPDF from 'jspdf';

function PlaygroundResults() {

  const navigate = useNavigate();
  const [currentResult, setCurrentResult] = useState(null);
  const [allResults, setAllResults] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const getPassingScore = (title) => {
    const t = (title || "").toLowerCase();
    if (t.includes("ui")) return 45;
    if (t.includes("python") || t.includes("java") || t.includes("oracle") || t.includes("django")) return 20;
    if (t.includes("weekly") || t.includes("monthly")) return 35;
    return 20;
  };

  const formatExamTitle = (title = "") => {
    return title || "Exam";
  };

  useEffect(() => {
    const ensureParsed = (obj) => {
      if (!obj) return obj;
      if (typeof obj.questions === 'string') {
        try { obj.questions = JSON.parse(obj.questions); } catch (e) {}
      }
      if (typeof obj.answers === 'string') {
        try { obj.answers = JSON.parse(obj.answers); } catch (e) {}
      }
      return obj;
    };

    const fetchResults = async () => {
      setIsLoading(true);
      setError(null);

      let localResults = [];
      try {
        localResults = JSON.parse(localStorage.getItem("allExamResults") || "[]").map(ensureParsed);
      } catch (e) {}
      
      const userStr = localStorage.getItem("user");
      const username = localStorage.getItem("username");
      
      let currentUser = null;
      try {
        currentUser = userStr ? JSON.parse(userStr) : null;
      } catch (e) {}

      const targetUsername = username || currentUser?.username;

      if (!targetUsername) {
        const uniqueResults = removeDuplicateResults(localResults);
        setAllResults(uniqueResults);
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/user-combined-results/?username=${targetUsername}`);
        const json = await response.json();

        if (json.success) {
          let backendResults = (json.data || []).map(ensureParsed);
          
          const uniqueLocalResults = removeDuplicateResults(localResults);
          
          // 🛡️ SHOW ALL ATTEMPTS: Ensure every attempt is shown.
          // Deduplication only filters by exact database ID to avoid double-counting.
          const seen = new Set();
          const finalResults = [];
          
          [...uniqueLocalResults, ...backendResults].forEach(res => {
            // 🛡️ TRULY UNIQUE KEY: Ensure every attempt shows up.
            // Combine DB ID (if synced) or a mix of random_id + date + timestamp for local ones.
            const uniqueKey = res.id 
                ? `db_${res.id}` 
                : `local_${(res.random_id || res.user?.randomId || 'guest')}_${(res.examDate || '0')}_${(res.start_time || '0')}`;
            
            if (!seen.has(uniqueKey)) {
              seen.add(uniqueKey);
              finalResults.push(res);
            }
          });
          
          setAllResults(finalResults);
        } else {
          setError(json.error || "Failed to fetch results");
          setAllResults([]);
        }
      } catch (err) {
        console.error("Error fetching results:", err);
        setError("Network error. Please check if the server is running.");
        setAllResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();

    const examFailure = localStorage.getItem("examFailure");
    if (examFailure) {
      const failedResult = ensureParsed(JSON.parse(examFailure));
      setAllResults(prev => {
        const uniqueResults = removeDuplicateResults([failedResult, ...prev]);
        return uniqueResults;
      });
      localStorage.removeItem("examFailure");
    }

    const handleExamDataUpdate = (event) => {
      console.log("🔄 PlaygroundResults - Auto-updating data for:", event.detail.examType);
      fetchResults();
    };

    window.addEventListener('examDataUpdated', handleExamDataUpdate);

    return () => {
      window.removeEventListener('examDataUpdated', handleExamDataUpdate);
    };
  }, []);

  // Helper function to remove duplicate results based on unique identifiers
  const removeDuplicateResults = (results) => {
    const seen = new Set();
    const unique = [];
    
    for (const result of results) {
      // 🛡️ TRULY UNIQUE PER-ATTEMPT KEY
      const key = result.id 
        ? `db_${result.id}` 
        : `local_${(result.random_id || result.randomId || 'guest')}_${(result.examDate || '0')}_${(result.start_time || '0')}`;
      
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(result);
      }
    }
    
    return unique;
  };

  // TAKE NEW EXAM
  const handleTakeNewExam = () => {
    localStorage.removeItem("examResult");
    navigate("/dashboard/playground");
  };

  // BACK TO DASHBOARD
  const handleDashboard = () => {
    navigate("/dashboard/playground");
  };

  const handleViewDetails = (result, index) => {
    localStorage.setItem("selectedExamResult", JSON.stringify(result));
    const uniqueId = result.id || result.random_id || result.examDate || result.start_time || index;
    navigate(`/dashboard/playground/detailed-results/${uniqueId}`, { 
        state: { 
          examTitle: result.examTitle || result.exam_title || result.title || "Exam",
          resultData: result 
        } 
    });
  };

  // DOWNLOAD RESULT
  const handleDownload = (result) => {

    if (!result) {
      console.error("No result available");
      return;
    }

    const totalQuestions = result.totalQuestions || result.questions?.length || 20;
    const totalMarks = result.totalMarks || result.total_marks || (totalQuestions * 2);
    const passingScore = getPassingScore(result.examTitle);
    const passed = result.passed !== undefined ? result.passed : ((result.score || (result.correctAnswers || 0) * 2) >= passingScore);
    const criteriaText = result.passed !== undefined ? "Faculty Rule Applied" : `${passingScore} marks`;
    const examDate = new Date(result.examDate || Date.now()).toLocaleString();
    const storedProfile = (() => {
      try { return JSON.parse(localStorage.getItem("user") || "{}"); } catch { return {}; }
    })();
    const studentName =
      storedProfile.name ||
      storedProfile.firstName ||
      result.user?.firstName ||
      result.user?.username ||
      storedProfile.username ||
      "Unknown";

    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('Exam Results Report', 105, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Student Information:', 20, 40);
    doc.setFont('helvetica', 'normal');
    doc.text(`Name: ${studentName}`, 20, 50);

    const lcEmail = localStorage.getItem("email");
    const email = result.user?.email || storedProfile.email || (lcEmail && lcEmail.includes("@") ? lcEmail : "N/A");
    
    doc.text(`Email: ${email}`, 20, 60);
    doc.text(`ID: ${result.user?.randomId || result.random_id || 'N/A'}`, 20, 70);
    
    doc.setFont('helvetica', 'bold');
    doc.text('Exam Information:', 20, 90);
    doc.setFont('helvetica', 'normal');
    doc.text(`Exam: ${formatExamTitle(result.examTitle)}`, 20, 100);
    doc.text(`Date: ${examDate}`, 20, 110);
    doc.text(`Score: ${result.score || (result.correctAnswers || 0) * 2}/${totalMarks}`, 20, 120);
    doc.text(`Status: ${passed ? 'Pass' : 'Fail'}`, 20, 130);
    doc.text(`Criteria: ${criteriaText}`, 20, 140);
    
    doc.setFont('helvetica', 'bold');
    doc.text('Performance Summary:', 20, 150);
    doc.setFont('helvetica', 'normal');
    doc.text(`Correct Answers: ${result.correctAnswers || 0}/${totalQuestions}`, 20, 160);
    doc.text(`Incorrect Answers: ${result.incorrectAnswers || (totalQuestions - (result.correctAnswers || 0))}/${totalQuestions}`, 20, 170);
    doc.text(`Percentage: ${(((result.correctAnswers || 0) / totalQuestions) * 100).toFixed(1)}%`, 20, 180);
    
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 105, 200, { align: 'center' });
    
    doc.save(`exam-results-${studentName.replace(/\s+/g, '_')}.pdf`);
  };

  const hasResults = allResults.length > 0;

  if (!hasResults) {
    return (
      <div className="p-8 text-center pt-20">
        <div className="text-6xl mb-4 animate-bounce">📝</div>
        <h2 className="text-2xl font-bold mb-3 text-gray-800">No Exam Results Found</h2>
        <p className="mb-6 text-gray-500 max-w-md mx-auto">
          We couldn't find any synced or local exam results for this account.
          Take your first assessment in the playground to begin your history!
        </p>
        <button
          onClick={handleTakeNewExam}
          className="bg-indigo-600 text-white px-8 py-3 rounded-full font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all hover:-translate-y-1"
        >
          Take Your First Exam
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen w-full px-6 py-10 overflow-x-hidden">
      <div className="max-w-7xl mx-auto">
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Exam History</h1>
            <p className="text-gray-500 mt-1">Review and manage all your assessment attempts</p>
          </div>
          
          <div className="flex items-center gap-4">
            <button
              onClick={handleDashboard}
              className="px-6 py-2.5 bg-white border border-gray-200 text-gray-600 rounded-xl font-bold hover:bg-gray-50 transition-all shadow-sm"
            >
              Dashboard
            </button>
            <button
              onClick={handleTakeNewExam}
              className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
            >
              New Exam
            </button>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-[0.2em]">#</th>
                  <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Student</th>
                  <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Assessment</th>
                  <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-[0.2em] text-center">Date</th>
                  <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-[0.2em] text-center">Score</th>
                  <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-[0.2em] text-center">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-50">
                {allResults.map((result, index) => {
                  const totalQuestions = result.totalQuestions || result.total_questions || result.questions?.length || 0;
                  const totalMarks = result.totalMarks || result.total_marks || (totalQuestions ? totalQuestions * 2 : 40);
                  const scoreValue = result.score || result.marks_obtained || ( (result.correctAnswers || result.correct_answers || 0) * 2 );
                  const percentage = totalMarks > 0 ? (scoreValue / totalMarks) * 100 : 0;
                  
                  return (
                    <tr key={index} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-6 py-5 text-sm font-bold text-gray-400">{index + 1}</td>
                      <td className="px-6 py-5 text-sm font-bold text-gray-800">
                        {result.user?.firstName || result.user?.username || "Guest User"}
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-sm font-black text-gray-800 block uppercase tracking-wide">
                          {result.examTitle || result.exam_title || result.title || "Standard Exam"}
                        </span>
                        <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest mt-1 block">
                          {result.examType || "General"}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-center text-sm font-medium text-gray-500">
                        {new Date(result.examDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </td>
                      <td className="px-6 py-5 text-center">
                        <div className="inline-flex flex-col items-center">
                          <span className={`text-sm font-black ${percentage >= 40 ? 'text-green-600' : 'text-red-500'}`}>
                            {scoreValue}/{totalMarks}
                          </span>
                          <div className="w-16 h-1 bg-gray-100 rounded-full mt-1 overflow-hidden">
                            <div 
                              className={`h-full ${percentage >= 40 ? 'bg-green-500' : 'bg-red-500'}`} 
                              style={{ width: `${Math.min(percentage, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <div className="flex justify-center gap-3">
                          <button
                            onClick={() => handleViewDetails(result, index)}
                            className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                            title="View Detailed Analysis"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDownload(result)}
                            className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                            title="Download PDF"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PlaygroundResults;