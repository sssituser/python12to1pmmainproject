import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import jsPDF from 'jspdf';

function PlaygroundResults() {

  const navigate = useNavigate();
  const [currentResult, setCurrentResult] = useState(null);
  const [allResults, setAllResults] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchResults = async () => {
      setIsLoading(true);
      setError(null);
      
      const userStr = localStorage.getItem("user");
      const username = localStorage.getItem("username");
      
      let currentUser = null;
      try {
        currentUser = userStr ? JSON.parse(userStr) : null;
      } catch (e) {}

      const targetUsername = username || currentUser?.username;

      if (!targetUsername) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`http://127.0.0.1:8000/api/user-combined-results/?username=${targetUsername}`);
        const json = await response.json();

        if (json.success) {
          setAllResults(json.data);
          
          // Also set current result if it exists in localStorage (most recent one)
          const examResult = localStorage.getItem("examResult");
          if (examResult) {
            setCurrentResult(JSON.parse(examResult));
          } else if (json.data.length > 0) {
            // Fallback to most recent result from backend if nothing in localStorage
            setCurrentResult(json.data[0]);
          }
        } else {
          setError(json.error || "Failed to fetch results");
        }
      } catch (err) {
        console.error("Error fetching results:", err);
        setError("Network error. Please check if the server is running.");
        
        // Fallback to localStorage on network error
        const results = JSON.parse(localStorage.getItem("allExamResults") || "[]");
        setAllResults(results);
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();

    // Still check for one-time results/failures from localStorage
    const examFailure = localStorage.getItem("examFailure");
    if (examFailure) {
      const failedResult = JSON.parse(examFailure);
      setAllResults(prev => [failedResult, ...prev]);
      localStorage.removeItem("examFailure");
    }
  }, []);

  // TAKE NEW EXAM
  const handleTakeNewExam = () => {
    localStorage.removeItem("examResult");
    navigate("/dashboard/playground");
  };

  // BACK TO DASHBOARD
  const handleDashboard = () => {
    navigate("/dashboard");
  };

  // VIEW DETAILS
  const handleViewDetails = (result,index) => {

    // store selected result
    localStorage.setItem(
      "selectedExamResult",
      JSON.stringify(result)
    );
    navigate(`/dashboard/playground/detailed-results/${index}`);

    
  };

  // DOWNLOAD RESULT
  const handleDownload = (result) => {

    if (!result) {
      alert("No result available");
      return;
    }

    // Determine passing criteria based on exam type
    const isDailyExam = result.examTitle?.toLowerCase().includes('daily');
    const isWeeklyExam = result.examTitle?.toLowerCase().includes('weekly');
    const isMonthlyExam = result.examTitle?.toLowerCase().includes('monthly');
    
    let totalQuestions = result.totalQuestions || 20; // use actual value from result
    let totalMarks = result.totalMarks || 40; // use actual value from result
    // Use the 'passed' status saved in the result (calculated by faculty rules at submission)
    const passed = result.passed !== undefined ? result.passed : (result.score >= (totalMarks * 0.5));
    const criteriaText = result.passed !== undefined ? "Faculty Rule Applied" : `${totalMarks * 0.5} (50%)`;
    const examDate = new Date(result.examDate || Date.now()).toLocaleString();
    const studentName = result.user?.firstName || result.user?.username || "Unknown";

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
    doc.text(`Email: ${result.user?.email || 'N/A'}`, 20, 60);
    doc.text(`ID: ${result.user?.randomId || 'N/A'}`, 20, 70);
    
    // Add exam information
    doc.setFont('helvetica', 'bold');
    doc.text('Exam Information:', 20, 90);
    doc.setFont('helvetica', 'normal');
    doc.text(`Exam: ${result.examTitle || 'Python Programming Assessment'}`, 20, 100);
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

    <div className="bg-white shadow p-6">

      {/* ACTION BUTTONS */}

      <div className="flex justify-end gap-3 mb-4">

        <button
          onClick={handleTakeNewExam}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Take New Exam
        </button>

        <button
          onClick={handleDashboard}
          className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
        >
          Back to Dashboard
        </button>

      </div>

      <h3 className="text-xl font-semibold mb-4">
        All Results
      </h3>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[1200px]">
          <thead className="bg-gray-50 border-b sticky top-0 z-10">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-gray-700 min-w-[60px]">S.No</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700 min-w-[120px]">Student</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700 min-w-[80px]">ID</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700 min-w-[120px]">Exam Name</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700 min-w-[100px]">Date</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700 min-w-[80px]">Score</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700 min-w-[100px]">Actions</th>
            </tr>
          </thead>

          <tbody>
            {allResults.map((result, index) => {

              // Determine passing criteria based on exam type
              const isDailyExam = result.examTitle?.toLowerCase().includes('daily');
              const isWeeklyExam = result.examTitle?.toLowerCase().includes('weekly');
              const isMonthlyExam = result.examTitle?.toLowerCase().includes('monthly');
              
              let totalQuestions = result.totalQuestions || 20; // use actual value from result
              let totalMarks = result.totalMarks || 40; // use actual value from result
              let passingScore = 15; // default (marks needed to pass)
              
              if (isDailyExam) {
                passingScore = 20; // 20 marks to pass for daily exam (out of 40)
              } else if (isWeeklyExam || isMonthlyExam) {
                passingScore = 35; // 35 marks to pass for weekly/monthly exams (out of 100)
              }
              
              const passed = (result.score || (result.correctAnswers || 0) * 2) >= passingScore;

              return (
                <tr key={index} className="border-b">
                  <td className="px-4 py-3 whitespace-nowrap min-w-[60px]">
                    {index + 1}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap min-w-[120px]">
                    {result.user?.firstName ||
                      result.user?.username ||
                      "Unknown"}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap min-w-[80px]">
                    {result.user?.randomId || "N/A"}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap min-w-[120px]">
                    {result.examTitle ||
                      "Python Programming"}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap min-w-[100px]">
                    {new Date(
                      result.examDate
                    ).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap min-w-[80px]">
                    {result.score || (result.correctAnswers || 0) * 2}/{result.totalMarks || (result.correctAnswers || 0) * 2}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap min-w-[100px]">
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          handleViewDetails(result,index)
                        }
                        className="text-blue-600 hover:text-blue-800 px-2 py-1"
                        title="View Details"
                      >
                        👁
                      </button>
                      <button
                        onClick={() =>
                          handleDownload(result)
                        }
                        className="text-green-600 hover:text-green-800 px-2 py-1"
                        title="Download Result"
                      >
                        📥
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
