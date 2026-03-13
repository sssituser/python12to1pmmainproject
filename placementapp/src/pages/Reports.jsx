import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckCircle, faTimesCircle, faClock, faChartBar, faArrowLeft, faDownload, faUser, faCalendar, faGraduationCap, faEye, faTrash } from "@fortawesome/free-solid-svg-icons";

const Reports = () => {
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
    setSelectedResult(result);
    setViewMode('detail');
  };

  const handleBackToList = () => {
    setSelectedResult(null);
    setViewMode('list');
  };

  const handleDeleteResult = (examDate) => {
    if (window.confirm('Are you sure you want to delete this exam result?')) {
      const updatedResults = allExamResults.filter(r => r.examDate !== examDate);
      setAllExamResults(updatedResults);
      localStorage.setItem('allExamResults', JSON.stringify(updatedResults));
      
      if (selectedResult?.examDate === examDate) {
        handleBackToList();
      }
    }
  };

  const handleRetakeExam = () => {
    localStorage.removeItem('examResult');
    navigate('/dashboard/playground');
  };

  const handleDownloadReport = (result) => {
    if (!result) return;
    
    const reportContent = `
${result.examTitle || 'Python Programming Exam Report'}
=====================================

Student Information:
--------------------
Name: ${result.user?.firstName || ''} ${result.user?.lastName || ''}
Username: ${result.user?.username || 'Unknown'}
Email: ${result.user?.email || 'N/A'}
Exam Date: ${new Date(result.examDate || Date.now()).toLocaleDateString()}

Exam Status: ${result.status === 'fail' ? 'FAILED' : 'COMPLETED'}
${result.reason ? `Reason: ${result.reason}` : ''}

Score: ${result.correctAnswers}/${result.totalQuestions}
Percentage: ${result.totalQuestions > 0 ? ((result.correctAnswers / result.totalQuestions) * 100).toFixed(1) : 0}%

Time Taken: ${Math.floor(result.timeTaken / 60)}:${(result.timeTaken % 60).toString().padStart(2, '0')} minutes

${result.answers ? `
Detailed Results:
==================
${result.questions.map((q, index) => {
  const userAnswer = result.answers[index];
  const isCorrect = userAnswer === q.correct;
  return `Q${index + 1}. ${q.question}
Your Answer: ${userAnswer !== null ? q.options[userAnswer] : 'Not Attempted'}
Correct Answer: ${q.options[q.correct]}
Status: ${isCorrect ? '✓ Correct' : '✗ Incorrect'}
`;
}).join('\n')}
` : ''}
    `.trim();

    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `python-exam-report-${new Date(result.examDate).toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading exam results...</p>
        </div>
      </div>
    );
  }

  if (allExamResults.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center">
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
    );
  }

  // If we have a selected result, show the detail view
  if (viewMode === 'detail' && selectedResult) {
    const percentage = selectedResult.totalQuestions > 0 ? (selectedResult.correctAnswers / selectedResult.totalQuestions) * 100 : 0;
    const passed = percentage >= 60;

    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex justify-between items-center mb-6">
              <button
                onClick={handleBackToList}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition"
              >
                <FontAwesomeIcon icon={faArrowLeft} />
                Back to All Reports
              </button>
              <div className="flex gap-2">
                <button
                  onClick={() => handleDownloadReport(selectedResult)}
                  className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
                >
                  <FontAwesomeIcon icon={faDownload} />
                  Download Report
                </button>
                <button
                  onClick={() => handleDeleteResult(selectedResult.examDate)}
                  className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
                >
                  <FontAwesomeIcon icon={faTrash} />
                  Delete
                </button>
              </div>
            </div>

            <h1 className="text-3xl font-bold text-gray-800 mb-2">{selectedResult.examTitle || 'Exam Results'}</h1>
            <p className="text-gray-600">Student Assessment Report</p>
          </div>

          {/* Student Information Card */}
          {selectedResult.user && (
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <FontAwesomeIcon icon={faUser} className="text-indigo-600" />
                Student Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Name</p>
                  <p className="font-semibold text-gray-800">
                    {selectedResult.user.firstName && selectedResult.user.lastName 
                      ? `${selectedResult.user.firstName} ${selectedResult.user.lastName}`
                      : selectedResult.user.username || 'Unknown'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Username</p>
                  <p className="font-semibold text-gray-800">{selectedResult.user.username || 'Unknown'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-semibold text-gray-800">{selectedResult.user.email || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Exam Date</p>
                  <p className="font-semibold text-gray-800">
                    {selectedResult.examDate ? new Date(selectedResult.examDate).toLocaleDateString() : new Date().toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Status Card */}
          <div className={`rounded-lg shadow-sm p-6 mb-6 ${
            selectedResult.status === 'fail' ? 'bg-red-50 border-2 border-red-200' :
            passed ? 'bg-green-50 border-2 border-green-200' : 'bg-yellow-50 border-2 border-yellow-200'
          }`}>
            <div className="text-center">
              <div className={`text-6xl mb-4 ${
                selectedResult.status === 'fail' ? 'text-red-500' :
                passed ? 'text-green-500' : 'text-yellow-500'
              }`}>
                {selectedResult.status === 'fail' ? (
                  <FontAwesomeIcon icon={faTimesCircle} />
                ) : (
                  <FontAwesomeIcon icon={faCheckCircle} />
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

          {/* Statistics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Correct Answers</p>
                  <p className="text-2xl font-bold text-green-600">{selectedResult.correctAnswers}</p>
                </div>
                <FontAwesomeIcon icon={faCheckCircle} className="text-green-500 text-2xl" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Incorrect Answers</p>
                  <p className="text-2xl font-bold text-red-600">{selectedResult.incorrectAnswers || (selectedResult.totalQuestions - selectedResult.correctAnswers)}</p>
                </div>
                <FontAwesomeIcon icon={faTimesCircle} className="text-red-500 text-2xl" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Time Taken</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {Math.floor(selectedResult.timeTaken / 60)}:{(selectedResult.timeTaken % 60).toString().padStart(2, '0')}
                  </p>
                </div>
                <FontAwesomeIcon icon={faClock} className="text-blue-500 text-2xl" />
              </div>
            </div>
          </div>

          {/* Detailed Results */}
          {selectedResult.answers && selectedResult.questions && (
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <FontAwesomeIcon icon={faChartBar} />
                Detailed Results
              </h3>
              
              <div className="space-y-4">
                {selectedResult.questions.map((question, index) => {
                  const userAnswer = selectedResult.answers[index];
                  const isCorrect = userAnswer === question.correct;
                  const notAttempted = userAnswer === null;

                  return (
                    <div key={index} className={`border rounded-lg p-4 ${
                      notAttempted ? 'border-gray-200 bg-gray-50' :
                      isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                    }`}>
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-gray-800">
                          Q{index + 1}. {question.question}
                        </h4>
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          notAttempted ? 'bg-gray-200 text-gray-700' :
                          isCorrect ? 'bg-green-200 text-green-700' : 'bg-red-200 text-red-700'
                        }`}>
                          {notAttempted ? 'Not Attempted' : isCorrect ? 'Correct' : 'Incorrect'}
                        </span>
                      </div>
                      
                      <div className="space-y-1 text-sm">
                        <div className="text-gray-600">
                          <span className="font-medium">Your Answer:</span> {notAttempted ? 'Not Attempted' : question.options[userAnswer]}
                        </div>
                        {!notAttempted && !isCorrect && (
                          <div className="text-green-600">
                            <span className="font-medium">Correct Answer:</span> {question.options[question.correct]}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
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
    );
  }

  // Main list view of all exam results
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Exam Reports</h1>
              <p className="text-gray-600">All Student Assessment Results</p>
            </div>
            <button
              onClick={() => navigate('/dashboard/playground')}
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition"
            >
              Take New Exam
            </button>
          </div>
        </div>

        {/* Results Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allExamResults.map((result, index) => {
            const percentage = result.totalQuestions > 0 ? (result.correctAnswers / result.totalQuestions) * 100 : 0;
            const passed = percentage >= 60;
            
            return (
              <div key={index} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-lg transition">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-1">{result.examTitle || 'Python Exam'}</h3>
                    <p className="text-sm text-gray-600">Student: {result.user?.username || 'Unknown'}</p>
                    <p className="text-sm text-gray-600">Date: {new Date(result.examDate).toLocaleDateString()}</p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                    result.status === 'fail' ? 'bg-red-100 text-red-700' :
                    passed ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {result.status === 'fail' ? 'Failed' : passed ? 'Passed' : 'Completed'}
                  </div>
                </div>
                
                {result.reason && (
                  <p className="text-red-600 mb-4 text-sm">{result.reason}</p>
                )}
                
                <div className={`text-3xl font-bold mb-2 ${
                  result.status === 'fail' ? 'text-red-600' :
                  passed ? 'text-green-600' : 'text-yellow-600'
                }`}>
                  {result.correctAnswers}/{result.totalQuestions}
                </div>
                
                <div className={`text-lg font-semibold mb-4 ${
                  result.status === 'fail' ? 'text-red-500' :
                  passed ? 'text-green-500' : 'text-yellow-500'
                }`}>
                  {percentage.toFixed(1)}%
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => handleViewResult(result)}
                    className="flex-1 bg-indigo-600 text-white px-3 py-2 rounded hover:bg-indigo-700 transition text-sm"
                  >
                    <FontAwesomeIcon icon={faEye} className="mr-1" />
                    View
                  </button>
                  <button
                    onClick={() => handleDownloadReport(result)}
                    className="flex-1 bg-gray-600 text-white px-3 py-2 rounded hover:bg-gray-700 transition text-sm"
                  >
                    <FontAwesomeIcon icon={faDownload} className="mr-1" />
                    Download
                  </button>
                  <button
                    onClick={() => handleDeleteResult(result.examDate)}
                    className="flex-1 bg-red-600 text-white px-3 py-2 rounded hover:bg-red-700 transition text-sm"
                  >
                    <FontAwesomeIcon icon={faTrash} className="mr-1" />
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
export default Reports;