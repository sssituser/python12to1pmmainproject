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
    if (!title) return "Exam";
    
    const t = title.toLowerCase();
    
    // Priority 1: Multi-word specialized subjects
    if (t.includes("machine") && t.includes("learning")) return "Machine Learning Exam";
    if (t.includes("deep") && t.includes("learning")) return "Deep Learning Exam";
    if (t.includes("data") && t.includes("science")) return "Data Science Exam";
    if (t.includes("data") && t.includes("modeling")) return "Data Modeling Exam";
    if (t.includes("data") && (t.includes("visualization") || t.includes("visualisation"))) return "Data Visualization Exam";
    if (t.includes("ai") && t.includes("concepts")) return "AI Concepts Exam";
    if (t.includes("computer") && t.includes("fundamentals")) return "Computer Fundamentals Exam";
    if (t.includes("google") && t.includes("cloud")) return "Google Cloud Exam";
    if (t.includes("augmented") && t.includes("reality")) return "Augmented Reality Exam";
    if (t.includes("virtual") && t.includes("reality")) return "Virtual Reality Exam";
    if (t.includes("cloud") && t.includes("basics")) return "Cloud Basics Exam";
    if (t.includes("big") && t.includes("data")) return "Big Data Exam";
    if (t.includes("web") && t.includes("api")) return "Web APIs Exam";
    
    // Priority 2: Pattern-specific exams
    if (t.includes("deployment")) return "Deployment Exam";
    if (t.includes("qa") && t.includes("processes")) return "QA Processes Exam";
    if (t.includes("otp")) return "OTP Exam";
    if (t.includes("ci") && t.includes("cd")) return "CI/CD Exam";

    // Priority 3: Core subjects (only if specific multi-word patterns didn't match)
    if (t.includes("python")) return "Python Exam";
    if (t.includes("java")) return "Java Exam";
    if (t.includes("oracle")) return "Oracle Exam";
    if (t.includes("ui")) return "UI Exam";
    if (t.includes("django")) return "Django Exam";
    if (t.includes("spring")) return "Spring Exam";
    if (t.includes("selenium")) return "Selenium Exam";
    if (t.includes("docker")) return "Docker Exam";
    if (t.includes("kubernetes")) return "Kubernetes Exam";
    if (t.includes("web") && t.includes("3")) return "Web3 Exam";
    if (t.includes("pandas")) return "Pandas Exam";
    
    // Default categories
    if (t.includes("weekly")) return "Weekly Exam";
    if (t.includes("monthly")) return "Monthly Exam";
    if (t.includes("test")) return "Test Exam";
    
    // If it already says "Exam", keep it as is
    if (t.includes("exam")) return title;
    
    // Catch-all
    return title.charAt(0).toUpperCase() + title.slice(1) + " Exam";
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
            const key = res.id || res.random_id || (res.start_time + res.examDate + JSON.stringify(res));
            if (!seen.has(key)) {
              seen.add(key);
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
      const key = result.random_id || (result.user && result.user.randomId) || result.examDate || result.start_time || JSON.stringify(result);
      
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
    // Store the complete result data to ensure accuracy
    console.log("PlaygroundResults - Storing result data:", result);
    console.log("PlaygroundResults - Result questions:", result.questions);
    console.log("PlaygroundResults - Questions length:", result.questions?.length);
    console.log("PlaygroundResults - Questions type:", typeof result.questions);
    console.log("PlaygroundResults - Is Array.isArray(questions):", Array.isArray(result.questions));
    
    localStorage.setItem("selectedExamResult", JSON.stringify(result));
    // Use unique ID instead of index for reliable navigation
    const uniqueId = result.random_id || result.examDate || result.start_time || index;
    navigate(`/dashboard/playground/detailed-results/${uniqueId}`, { 
        state: { 
          examTitle: result.examTitle || result.exam_title || result.title || "Exam",
          resultData: result // Pass complete data as fallback
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
    const profileCache = (() => {
      try { return JSON.parse(localStorage.getItem("sssit-profile") || "{}"); } catch { return {}; }
    })();
    const studentName =
      storedProfile.name ||
      storedProfile.firstName ||
      result.user?.firstName ||
      result.user?.username ||
      storedProfile.username ||
      "Unknown";

    // Create new PDF document
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('Exam Results Report', 105, 20, { align: 'center' });
    
    // Add student information
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Student Information:', 20, 40);
    doc.setFont('helvetica', 'normal');
    doc.text(`Name: ${studentName}`, 20, 50);
    const lcEmail = localStorage.getItem("email");
    let email = result.user?.email
      || result.user?.Email
      || profileCache.email
      || storedProfile.email
      || storedProfile.Email
      || profileCache.username
      || (lcEmail && lcEmail.includes("@") ? lcEmail : null)
      || (storedProfile.username && storedProfile.username.includes("@") ? storedProfile.username : null)
      || (profileCache.name && profileCache.name.includes("@") ? profileCache.name : null)
      || "N/A";
    doc.text(`Email: ${email}`, 20, 60);
    doc.text(`ID: ${result.user?.randomId || 'N/A'}`, 20, 70);
    
    // Add exam information
    doc.setFont('helvetica', 'bold');
    doc.text('Exam Information:', 20, 90);
    doc.setFont('helvetica', 'normal');
    doc.text(`Exam: ${formatExamTitle(result.examTitle)}`, 20, 100);
    doc.text(`Date: ${examDate}`, 20, 110);
    doc.text(`Score: ${result.score || (result.correctAnswers || 0) * 2}/${totalMarks}`, 20, 120);
    doc.text(`Status: ${passed ? 'Pass' : 'Fail'}`, 20, 130);
    doc.text(`Criteria: ${criteriaText}`, 20, 140);
    
    // Add performance summary
    doc.setFont('helvetica', 'bold');
    doc.text('Performance Summary:', 20, 150);
    doc.setFont('helvetica', 'normal');
    doc.text(`Correct Answers: ${result.correctAnswers || 0}/${totalQuestions}`, 20, 160);
    doc.text(`Incorrect Answers: ${result.incorrectAnswers || (totalQuestions - (result.correctAnswers || 0))}/${totalQuestions}`, 20, 170);
    doc.text(`Percentage: ${(((result.correctAnswers || 0) / totalQuestions) * 100).toFixed(1)}%`, 20, 180);
    doc.text(`Marks Obtained: ${result.score || (result.correctAnswers || 0) * 2} out of ${totalMarks}`, 20, 190);
    
    // Add generation date
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString('en-US', { hour12: true, hour: 'numeric', minute: 'numeric' })}`, 105, 200, { align: 'center' });
    
    // Save PDF
    doc.save(`exam-results-${studentName.replace(/\s+/g, '_')}.pdf`);
  };

  const hasResults = allResults.length > 0;

  if (!hasResults) {

    return (

      <div className="p-8 text-center">

        <div className="text-6xl mb-4">📝</div>

        <h2 className="text-2xl font-semibold mb-3">
          No Exam Results Found
        </h2>

        <p className="mb-6 text-gray-500">
          Take your first exam to see results here
        </p>

        <button
          onClick={handleTakeNewExam}
          className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700"
        >
          Take Your First Exam
        </button>

      </div>
    );
  }

  return (

    <div
      className="bg-white shadow p-6 w-full"
      style={{
        width: "100%",
        margin: 0,
        overflowX: "hidden"
      }}
    >

      {/* ACTION BUTTONS */}

      <div className="flex items-center justify-start gap-3 mb-4">
        <button
          onClick={handleDashboard}
          className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
        >
          Back
        </button>
      </div>

      <h3 className="text-xl font-semibold mb-4">
        All Results
      </h3>

      <div className="overflow-x-auto">
        <table className="w-full table-auto border-collapse border border-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-center font-bold border-r border-gray-300">S.No</th>
              <th className="px-4 py-3 text-left font-bold border-r border-gray-300">Student</th>
              <th className="px-4 py-3 text-left font-bold border-r border-gray-300">Exam Name</th>
              <th className="px-4 py-3 text-center font-bold border-r border-gray-300">Date</th>
              <th className="px-4 py-3 text-center font-bold border-r border-gray-300">Score</th>
              <th className="px-4 py-3 text-center font-bold border-r border-gray-300">Reports</th>
            </tr>
          </thead>

          <tbody>
            {allResults.map((result, index) => {

              const totalQuestions = result.totalQuestions || result.total_questions || result.questions?.length || 0;
              const totalMarks = result.totalMarks || result.total_marks || (totalQuestions ? totalQuestions * 2 : 40);
              const passingScore = getPassingScore(result.examTitle);
              const scoreValue = result.score || result.marks_obtained || ( (result.correctAnswers || result.correct_answers || 0) * 2 );
              const passed = scoreValue >= passingScore;

              return (
                <tr key={index} className="border-b hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-center">{index + 1}</td>
                  <td className="px-4 py-3 text-start">
                    {result.user?.firstName ||
                      result.user?.username ||
                      "Unknown"}
                  </td>
                  <td className="px-4 py-3 text-start">
                    {result.examTitle || result.exam_title || result.title || "Exam"}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {new Date(
                      result.examDate
                    ).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {scoreValue}/{totalMarks}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex justify-center gap-4">
                      <button
                        onClick={() =>
                          handleViewDetails(result,index)
                        }
                        className="text-blue-600 hover:text-blue-800 font-bold text-xs uppercase transition-colors"
                      >
                        VIEW
                      </button>
                      <button
                        onClick={() =>
                          handleDownload(result)
                        }
                        className="text-green-600 hover:text-green-800 font-bold text-xs uppercase transition-colors"
                      >
                        DOWNLOAD
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
  );
}

export default PlaygroundResults;