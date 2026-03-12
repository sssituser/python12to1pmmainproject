import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function ExamReports() {
  console.log('ExamReports component loaded');
  const navigate = useNavigate();
  const [allExamResults, setAllExamResults] = useState([]);
  const [selectedResult, setSelectedResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'detail'

  useEffect(() => {
    // Load all exam results from localStorage
    const results = JSON.parse(localStorage.getItem('allExamResults') || '[]');
    setAllExamResults(results);
    
    // If there's a current exam result (from just completed exam), show it first
    const currentResult = localStorage.getItem('examResult');
    if (currentResult && !results.some(r => r.examDate === JSON.parse(currentResult).examDate)) {
      const parsed = JSON.parse(currentResult);
      const updatedResults = [parsed, ...results];
      setAllExamResults(updatedResults);
      localStorage.setItem('allExamResults', JSON.stringify(updatedResults));
    }
    
    setLoading(false);
  }, [navigate]);

  const handleViewResult = (result) => {
    console.log('View result clicked:', result);
    setSelectedResult(result);
    setViewMode('detail');
  };

  const handleBackToList = () => {
    setSelectedResult(null);
    setViewMode('list');
  };

  const handleDeleteResult = (examDate) => {
    if (window.confirm('Are you sure you want to delete this exam result? This action cannot be undone.')) {
      try {
        // Remove from allExamResults array
        const updatedResults = allExamResults.filter(r => r.examDate !== examDate);
        setAllExamResults(updatedResults);
        
        // Update localStorage permanently
        localStorage.setItem('allExamResults', JSON.stringify(updatedResults));
        
        // Also remove from examResult if it matches the deleted exam
        const currentResult = localStorage.getItem('examResult');
        if (currentResult) {
          const parsed = JSON.parse(currentResult);
          if (parsed.examDate === examDate) {
            localStorage.removeItem('examResult');
          }
        }
        
        // Clear any other related storage keys
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.includes('exam') && key.includes(examDate)) {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key));
        
        // Navigate back to list if viewing the deleted result
        if (selectedResult?.examDate === examDate) {
          handleBackToList();
        }
        
        // Show success feedback
        alert('Exam result deleted successfully!');
      } catch (error) {
        console.error('Error deleting exam result:', error);
        alert('Error deleting exam result. Please try again.');
      }
    }
  };

  const handleRetakeExam = () => {
    localStorage.removeItem('examResult');
    navigate('/dashboard/playground');
  };

  const handleDownloadReport = (result) => {
    if (!result) {
      alert('No exam data available to download.');
      return;
    }
    
    try {
      const examDate = new Date(result.examDate || Date.now());
      const formattedDate = examDate.toLocaleDateString();
      const formattedTime = examDate.toLocaleTimeString();
      
      const reportContent = `
${result.examTitle || 'Python Programming Exam Report'}
=====================================

Student Information:
--------------------
Name: ${result.user?.firstName && result.user?.lastName ? `${result.user.firstName} ${result.user.lastName}` : result.user?.username || 'Unknown'}
Username: ${result.user?.username || 'Unknown'}
Email: ${result.user?.email || 'N/A'}
Exam Date: ${formattedDate}
Exam Start Time: ${formattedTime}

Exam Status: ${result.status === 'fail' ? 'FAILED' : 'COMPLETED'}
${result.reason ? `Reason: ${result.reason}` : ''}

Score Summary:
-------------
Score: ${result.correctAnswers}/${result.totalQuestions}
Percentage: ${result.totalQuestions > 0 ? ((result.correctAnswers / result.totalQuestions) * 100).toFixed(1) : 0}%
Accuracy: ${result.totalQuestions > 0 ? Math.round((result.correctAnswers / result.totalQuestions) * 100) : 0}%

${result.answers ? `
Detailed Results:
==================
${result.questions.map((q, index) => {
  const userAnswer = result.answers[index];
  const isCorrect = userAnswer === q.correct;
  const notAttempted = userAnswer === null;
  return `
Question ${index + 1}: ${q.question}
${q.options.map((option, optIndex) => `  ${String.fromCharCode(65 + optIndex)}. ${option}${optIndex === q.correct ? ' (Correct)' : ''}${optIndex === userAnswer && !isCorrect ? ' (Your Answer - Incorrect)' : optIndex === userAnswer && isCorrect ? ' (Your Answer - Correct)' : ''}`).join('\n')}
Status: ${notAttempted ? 'Not Attempted' : isCorrect ? '✓ Correct' : '✗ Incorrect'}
`;
}).join('\n')}
` : ''}

Report Generated: ${new Date().toLocaleString()}
=====================================
    `.trim();

      // Create download with enhanced reliability
      const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8' });
      const url = window.URL.createObjectURL(blob);
      
      // Create download link with proper attributes
      const a = document.createElement('a');
      a.href = url;
      a.download = `exam-report-${result.user?.username || 'student'}-${examDate.toISOString().split('T')[0]}.txt`;
      a.style.display = 'none';
      
      // Multiple fallback methods for download
      document.body.appendChild(a);
      a.click();
      
      // Fallback for browsers that don't support click()
      setTimeout(() => {
        if (a.parentNode) {
          a.parentNode.removeChild(a);
        }
        window.URL.revokeObjectURL(url);
      }, 100);
      
      // Show success feedback
      alert('Report downloaded successfully!');
      
    } catch (error) {
      console.error('Error downloading report:', error);
      alert('Error downloading report. Please try again.');
    }
  };

  if (allExamResults.length === 0) {
    return (
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">No Exam Results Found</h2>
            <p className="text-gray-600 mb-6">Please complete an exam to view results.</p>
            <button
              onClick={() => navigate('/dashboard/playground')}
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition"
            >
              Go to Exam
            </button>
          </div>
        </div>
      </div>
    );
  }

  // If we have a selected result, show detail view
  if (viewMode === 'detail' && selectedResult) {
    console.log('Showing detail view for:', selectedResult);
    const percentage = selectedResult.totalQuestions > 0 ? (selectedResult.correctAnswers / selectedResult.totalQuestions) * 100 : 0;
    const passed = selectedResult.correctAnswers >= 9; // Need at least 9 correct answers (18 marks out of 40)

    return (
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <div className="flex justify-between items-center mb-6">
              <button
                onClick={handleBackToList}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition"
              >
                <i className="bi bi-arrow-left"></i>
                Back to All Reports
              </button>
              <div className="flex gap-2">
                <button
                  onClick={() => handleDownloadReport(selectedResult)}
                  className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
                >
                  <i className="bi bi-download"></i>
                  Download Report
                </button>
                <button
                  onClick={() => handleDeleteResult(selectedResult.examDate)}
                  className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
                >
                  <i className="bi bi-trash"></i>
                  Delete
                </button>
              </div>
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-2">{selectedResult.examTitle || 'Exam Results'}</h1>
            <p className="text-gray-600">Student Assessment Report</p>

            {/* Student Information Card */}
            {selectedResult.user && (
              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <i className="bi bi-person text-indigo-600"></i>
                  Student Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-600">Name</p>
                      <p className="font-semibold text-gray-800 truncate" title={`${selectedResult.user.firstName || selectedResult.user.first_name || ''} ${selectedResult.user.lastName || selectedResult.user.last_name || ''}`}>
                        {selectedResult.user.firstName && selectedResult.user.lastName 
                          ? `${selectedResult.user.firstName} ${selectedResult.user.lastName}`
                          : selectedResult.user.first_name && selectedResult.user.last_name
                          ? `${selectedResult.user.first_name} ${selectedResult.user.last_name}`
                          : selectedResult.user.username || 'Unknown'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Username</p>
                      <p className="font-semibold text-gray-800 truncate">{selectedResult.user.username || 'Unknown'}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-semibold text-gray-800 truncate" title={selectedResult.user.email || 'N/A'}>
                        {selectedResult.user.email || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Exam Date</p>
                      <p className="font-semibold text-gray-800">
                        {selectedResult.examDate ? new Date(selectedResult.examDate).toLocaleDateString() : new Date().toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Status Card */}
            <div className={`rounded-lg p-6 mb-6 ${
              selectedResult.status === 'fail' ? 'bg-red-50 border-2 border-red-200' :
              passed ? 'bg-green-50 border-2 border-green-200' : 'bg-yellow-50 border-2 border-yellow-200'
            }`}>
              <div className="text-center">
                <div className={`text-6xl mb-4 ${
                  selectedResult.status === 'fail' ? 'text-red-500' :
                  passed ? 'text-green-500' : 'text-yellow-500'
                }`}>
                  {selectedResult.status === 'fail' ? (
                    <i className="bi bi-x-circle"></i>
                  ) : (
                    <i className="bi bi-check-circle"></i>
                  )}
                </div>
                
                <h2 className={`text-2xl font-bold mb-2 ${
                  selectedResult.status === 'fail' ? 'text-red-700' :
                  passed ? 'text-green-700' : 'text-yellow-700'
                }`}>
                  {selectedResult.status === 'fail' ? 'Exam Failed' : 
                   passed ? 'Exam Passed' : 'Exam Completed'}
                </h2>
                
                {selectedResult.reason && (
                  <p className="text-red-600 mb-4">{selectedResult.reason}</p>
                )}
                
                <div className={`text-4xl font-bold mb-2 ${
                  selectedResult.status === 'fail' ? 'text-red-600' :
                  passed ? 'text-green-600' : 'text-yellow-600'
                }`}>
                  {selectedResult.correctAnswers}/{selectedResult.totalQuestions}
                </div>
                
                <div className={`text-lg font-semibold ${
                  selectedResult.status === 'fail' ? 'text-red-500' :
                  passed ? 'text-green-500' : 'text-yellow-500'
                }`}>
                  {percentage.toFixed(1)}%
                </div>
              </div>
            </div>

            {/* Detailed Results */}
            {(() => {
              console.log('Checking detailed results:', {
                hasAnswers: !!selectedResult.answers,
                hasQuestions: !!selectedResult.questions,
                answersLength: selectedResult.answers?.length,
                questionsLength: selectedResult.questions?.length
              });
              return selectedResult.answers && selectedResult.questions;
            })() ? (
              <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <i className="bi bi-list-check"></i>
                  Complete Exam Analysis ({selectedResult.questions.length} Questions)
                </h3>
                
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
                    <div>
                      <p className="text-sm text-gray-600">Correct Answers</p>
                      <p className="text-2xl font-bold text-green-600">{selectedResult.correctAnswers}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Incorrect Answers</p>
                      <p className="text-2xl font-bold text-red-600">{selectedResult.totalQuestions - selectedResult.correctAnswers}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Not Attempted</p>
                      <p className="text-2xl font-bold text-gray-600">
                        {selectedResult.answers.filter(a => a === null).length}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Accuracy</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {selectedResult.totalQuestions > 0 ? Math.round((selectedResult.correctAnswers / selectedResult.totalQuestions) * 100) : 0}%
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-sm text-amber-800">
                    <strong>Legend:</strong> 
                    <span className="ml-2 px-2 py-1 bg-green-100 text-green-700 rounded">✓ Correct Answer</span>
                    <span className="ml-2 px-2 py-1 bg-red-100 text-red-700 rounded">✗ Your Wrong Answer</span>
                    <span className="ml-2 px-2 py-1 bg-gray-100 text-gray-700 rounded">○ Not Attempted</span>
                  </p>
                </div>
                
                <div className="space-y-6">
                  {selectedResult.questions.map((question, index) => {
                    const userAnswer = selectedResult.answers[index];
                    const isCorrect = userAnswer === question.correct;
                    const notAttempted = userAnswer === null;

                    return (
                      <div key={index} className={`border-2 rounded-lg p-6 ${
                        notAttempted ? 'border-gray-300 bg-gray-50' :
                        isCorrect ? 'border-green-300 bg-green-50' : 'border-red-300 bg-red-50'
                      }`}>
                        <div className="flex items-start justify-between mb-4">
                          <h4 className="font-bold text-gray-900 text-lg">
                            Question {index + 1}: {question.question}
                          </h4>
                          <span className={`px-3 py-2 rounded-full text-sm font-bold ${
                            notAttempted ? 'bg-gray-200 text-gray-700' :
                            isCorrect ? 'bg-green-200 text-green-700' : 'bg-red-200 text-red-700'
                          }`}>
                            {notAttempted ? '○ Not Attempted' : isCorrect ? '✓ CORRECT' : '✗ INCORRECT'}
                          </span>
                        </div>
                        
                        <div className="space-y-3">
                          <p className="font-semibold text-gray-700">Multiple Choice Options:</p>
                          <div className="space-y-2">
                            {question.options.map((option, optIndex) => {
                              const isCorrectAnswer = optIndex === question.correct;
                              const isUserAnswer = optIndex === userAnswer;
                              const isWrongUserAnswer = isUserAnswer && !isCorrect && !notAttempted;
                              
                              return (
                                <div key={optIndex} className={`p-3 rounded-lg border-2 ${
                                  isCorrectAnswer ? 'bg-green-100 border-green-400' :
                                  isWrongUserAnswer ? 'bg-red-100 border-red-400' : 
                                  'bg-gray-50 border-gray-200'
                                }`}>
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                      <span className="font-bold text-lg mr-3">
                                        {String.fromCharCode(65 + optIndex)}.
                                      </span>
                                      <span className="text-gray-800">{option}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      {isCorrectAnswer && (
                                        <span className="px-2 py-1 bg-green-600 text-white rounded text-xs font-bold">
                                          ✓ CORRECT ANSWER
                                        </span>
                                      )}
                                      {isWrongUserAnswer && (
                                        <span className="px-2 py-1 bg-red-600 text-white rounded text-xs font-bold">
                                          ✗ YOUR ANSWER
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {!isCorrect && !notAttempted && (
                          <div className="mt-4 p-3 bg-red-100 border border-red-300 rounded-lg">
                            <p className="text-sm text-red-800">
                              <strong>Explanation:</strong> You selected option {String.fromCharCode(65 + userAnswer)}, but the correct answer is option {String.fromCharCode(65 + question.correct)}.
                            </p>
                          </div>
                        )}

                        {notAttempted && (
                          <div className="mt-4 p-3 bg-gray-100 border border-gray-300 rounded-lg">
                            <p className="text-sm text-gray-800">
                              <strong>Note:</strong> This question was not attempted. The correct answer is option {String.fromCharCode(65 + question.correct)}.
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <div className="text-center py-8">
                  <i className="bi bi-exclamation-triangle text-4xl text-yellow-500 mb-4"></i>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Detailed Questions Not Available</h3>
                  <p className="text-gray-600">The detailed question analysis for this exam result is not available.</p>
                  <p className="text-sm text-gray-500 mt-2">This might be due to incomplete exam data storage.</p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-center gap-4">
              <button
                onClick={handleRetakeExam}
                className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition"
              >
                Retake Exam
              </button>
              <button
                onClick={() => navigate('/dashboard')}
                className="bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-700 transition"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // PERMANENT TABLE VIEW - Always show results in table format (never cards)
  console.log('Rendering permanent table view for', allExamResults.length, 'results');
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Exam Reports</h1>
              <p className="text-gray-600">All Student Assessment Results</p>
            </div>
            <button
              onClick={() => navigate('/dashboard/playground')}
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition"
            >
              Take New Exam
            </button>
          </div>

          {/* PERMANENT RESULTS TABLE - Always displays in table format */}
          <div className="mt-6">
            <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    S.No.
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Start Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {allExamResults.map((result, index) => {
                  const percentage = result.totalQuestions > 0 ? (result.correctAnswers / result.totalQuestions) * 100 : 0;
                  const passed = result.correctAnswers >= 9; // Need at least 9 correct answers (18 marks out of 40)
                  
                  return (
                    <tr key={`${result.examDate}-${index}`} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {index + 1}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {result.user?.username || 'Unknown'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-mono font-semibold text-gray-900 bg-gray-100 px-2 py-1 rounded">
                          {result.user?.randomId || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600 flex items-center">
                          <i className="bi bi-clock mr-1"></i>
                          {result.examDate ? new Date(result.examDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900">
                          {result.correctAnswers * 2}/40
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm font-bold uppercase ${
                          result.status === 'fail' ? 'text-red-600 bg-red-100' :
                          passed ? 'text-green-600 bg-green-100' : 'text-yellow-600 bg-yellow-100'
                        } px-3 py-1 rounded-full`}>
                          {result.status === 'fail' ? 'FAIL' : 'PASS'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleViewResult(result)}
                            className="bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700 transition text-xs font-medium"
                            title="View Details"
                          >
                            <i className="bi bi-eye"></i>
                          </button>
                          <button
                            onClick={() => handleDownloadReport(result)}
                            className="bg-gray-600 text-white px-3 py-1 rounded hover:bg-gray-700 transition text-xs"
                            title="Download Report"
                          >
                            <i className="bi bi-download"></i>
                          </button>
                          <button
                            onClick={() => handleDeleteResult(result.examDate)}
                            className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition text-xs"
                            title="Delete Result"
                          >
                            <i className="bi bi-trash"></i>
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

export default ExamReports;
