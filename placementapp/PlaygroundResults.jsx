import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faDownload, faTrash } from "@fortawesome/free-solid-svg-icons";

function PlaygroundResults() {
  const navigate = useNavigate();
  const [currentResult, setCurrentResult] = useState(null);
  const [allResults, setAllResults] = useState([]);
  const [showDetailedView, setShowDetailedView] = useState(false);

  useEffect(() => {
    // Get current exam result
    const examResult = localStorage.getItem("examResult");
    if (examResult) {
      setCurrentResult(JSON.parse(examResult));
    }

    // Get all exam results
    const results = JSON.parse(localStorage.getItem("allExamResults") || "[]");
    setAllResults(results);
  }, []);

  const handleBack = () => {
    navigate("/dashboard/playground");
  };

  const handleDownload = (result) => {
    try {
      // Validate result data
      if (!result) {
        alert('No result data available for download.');
        return;
      }

      const passed = (result.correctAnswers * 2) >= 20;
      const examDate = result.examDate ? new Date(result.examDate).toLocaleString() : 'Unknown Date';
      const studentName = result.user?.firstName || result.user?.username || 'Unknown';
      
      const content = `
Student: ${studentName}
Email: ${result.user?.email || 'N/A'}
ID: ${result.user?.randomId || 'N/A'}
Exam: ${result.examTitle || 'Python Programming Assessment'}
Date: ${examDate}
Score: ${result.correctAnswers * 2}/40 marks
Status: ${passed ? 'Pass' : 'Fail'}

${result.questions ? result.questions.map((q, i) => `
Question ${i + 1}: ${q.question}
Your Answer: ${result.answers[i] !== null ? String.fromCharCode(65 + result.answers[i]) + '. ' + q.options[result.answers[i]] : 'Not Attempted'}
Correct Answer: ${String.fromCharCode(65 + q.correct) + '. ' + q.options[q.correct]}
${result.answers[i] === q.correct ? '✓ CORRECT' : '✗ INCORRECT'}
`).join('\n') : 'Answer details not available'}
      `.trim();

      // Create and download file
      const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `exam-result-${studentName}-${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      console.log('Download successful for:', studentName);
    } catch (error) {
      console.error('Download failed:', error);
      alert('Download failed. Please try again.');
    }
  };

  const handleDelete = (examDate) => {
    try {
      // Validate examDate
      if (!examDate) {
        alert('Invalid exam date. Cannot delete result.');
        return;
      }

      // Confirm deletion
      const confirmDelete = window.confirm("Are you sure you want to delete this exam result? This action cannot be undone.");
      if (!confirmDelete) {
        return; // User cancelled deletion
      }

      // Filter out the result to be deleted
      const updatedResults = allResults.filter(
        (result) => result.examDate !== examDate
      );

      // Update state and localStorage
      setAllResults(updatedResults);
      localStorage.setItem("allExamResults", JSON.stringify(updatedResults));
      
      // Clear current result if it was deleted
      if (currentResult && currentResult.examDate === examDate) {
        setCurrentResult(null);
        localStorage.removeItem("examResult");
        console.log('Current result cleared from view');
      }

      console.log('Result deleted successfully for exam date:', examDate);
      alert('Exam result deleted successfully.');
      
    } catch (error) {
      console.error('Delete failed:', error);
      alert('Failed to delete result. Please try again.');
    }
  };

  const handleViewDetails = (result) => {
    // Set the current result and show detailed view
    setCurrentResult(result);
    setShowDetailedView(true);
  };

  if (!currentResult) {
    return (
      <div style={{ padding: "20px" }}>
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="text-gray-400 text-6xl mb-4">📝</div>
            <h2 className="text-2xl font-semibold text-gray-700 mb-2">No Exam Results Found</h2>
            <p className="text-gray-500 mb-6">
              You haven't completed any exams yet. Start by taking a Python exam to see your results here.
            </p>
            <button
              onClick={() => navigate("/dashboard/playground")}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
            >
              Take Your First Exam
            </button>
          </div>
        </div>
      </div>
    );
  }

  const passed = (currentResult.correctAnswers * 2) >= 20;

  return (
    <div style={{ padding: "20px" }}>
      <div className="max-w-6xl mx-auto">
        <div className="max-w-6xl mx-auto" style={{ width: "calc(100% + 256px)" }}>
          {/* Header */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex justify-between items-center">
              <button
                onClick={handleBack}
                className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition flex items-center gap-2"
              >
                <FontAwesomeIcon icon={faArrowLeft} />
                ← Back to Playground
              </button>
              <div className="flex gap-2">
                <button onClick={() => handleDownload(currentResult)} className="bg-gray-600 text-white px-3 py-2 rounded hover:bg-gray-700 transition" title="Download Report">
                  <FontAwesomeIcon icon={faDownload} />
                </button>
                <button onClick={() => handleDelete(currentResult.examDate)} className="bg-red-600 text-white px-3 py-2 rounded hover:bg-red-700 transition" title="Delete Result">
                  <FontAwesomeIcon icon={faTrash} />
                </button>
              </div>
            </div>
          </div>

          {/* Detailed Results - Only show when View button is clicked */}
          {showDetailedView && (
            <>
              {/* Result Summary Cards */}
              <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-lg shadow p-6 text-center">
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">Student Name</h3>
                  <p className="text-2xl font-bold text-blue-600">{currentResult.user?.firstName || currentResult.user?.username || 'Unknown'}</p>
                </div>
                
                <div className="bg-white rounded-lg shadow p-6 text-center">
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">Student ID</h3>
                  <p className="text-2xl font-bold text-blue-600">{currentResult.user?.randomId || 'N/A'}</p>
                </div>
                
                <div className="bg-white rounded-lg shadow p-6 text-center">
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Score</h3>
                  <p className="text-2xl font-bold text-blue-600">{currentResult.correctAnswers * 2}/40</p>
                </div>
                
                <div className="bg-white rounded-lg shadow p-6 text-center">
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">Status</h3>
                  <p className={`text-2xl font-bold ${passed ? 'text-green-600' : 'text-red-600'}`}>
                    {passed ? 'Pass' : 'Fail'}
                  </p>
                </div>
              </div>

              {/* Detailed Results Table */}
              <div className="bg-white rounded-lg shadow p-6 mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold">Detailed Results</h3>
                  <button
                    onClick={() => setShowDetailedView(false)}
                    className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition"
                  >
                    ✕ Close Details
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border border-gray-300 px-4 py-2 text-left text-sm font-semibold text-gray-700">Question</th>
                        <th className="border border-gray-300 px-4 py-2 text-left text-sm font-semibold text-gray-700">Your Answer</th>
                        <th className="border border-gray-300 px-4 py-2 text-left text-sm font-semibold text-gray-700">Correct Answer</th>
                        <th className="border border-gray-300 px-4 py-2 text-left text-sm font-semibold text-gray-700">Result</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(currentResult.questions || []).map((q, i) => {
                        const userAnswer = currentResult.answers?.[i];
                        const isCorrect = userAnswer === q.correct;
                        const notAttempted = userAnswer === null || userAnswer === undefined;
                        
                        return (
                          <tr key={i} className="border-b">
                            <td className="border border-gray-300 px-4 py-3 text-sm">
                              Q{i + 1}: {q.question}
                            </td>
                            <td className="border border-gray-300 px-4 py-3 text-sm">
                              {notAttempted ? 'Not Attempted' : String.fromCharCode(65 + userAnswer) + '. ' + q.options[userAnswer]}
                            </td>
                            <td className="border border-gray-300 px-4 py-3 text-sm">
                              {String.fromCharCode(65 + q.correct) + '. ' + q.options[q.correct]}
                            </td>
                            <td className={`border border-gray-300 px-4 py-3 text-sm font-semibold text-center ${
                              notAttempted ? 'text-gray-600' : isCorrect ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {notAttempted ? '-' : isCorrect ? '✓ Correct' : '✗ Wrong'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </>

          {/* All Results History */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-semibold mb-4">All Results</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">S.No.</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Exam Topic</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Time</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {allResults.map((result, index) => {
                    const resultPassed = (result.correctAnswers * 2) >= 20;
                    return (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{index + 1}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {result.user?.firstName || result.user?.username || 'Unknown'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {result.user?.randomId || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {result.examTitle || 'Python Programming Assessment'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(result.examDate).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(result.examDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {result.correctAnswers * 2}/40
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            resultPassed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {resultPassed ? 'Pass' : 'Fail'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex justify-center">
                            <button 
                              onClick={() => handleViewDetails(result)}
                              className="p-2 rounded-r-sm hover:bg-gray-100 transition border-r"
                              title="View Details"
                            >
                              <span style={{ color: '#2563eb' }}>👁</span>
                            </button>
                            <button 
                              onClick={() => handleDownload(result)}
                              className="p-2 hover:bg-gray-100 transition border-r"
                              title="Download"
                            >
                              <span style={{ color: '#4b5563' }}>📥</span>
                            </button>
                            <button 
                              onClick={() => handleDelete(result.examDate)}
                              className="p-2 rounded-l-sm hover:bg-gray-100 transition"
                              title="Delete"
                            >
                              <span style={{ color: '#dc2626' }}>🗑️</span>
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
    </div>
  );
}

export default PlaygroundResults;