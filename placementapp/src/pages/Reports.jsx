import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckCircle, faTimesCircle, faClock, faChartBar, faArrowLeft, faDownload } from "@fortawesome/free-solid-svg-icons";

const Reports = () => {
  const navigate = useNavigate();
  const [examResult, setExamResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load exam result from localStorage
    const result = localStorage.getItem('examResult');
    if (result) {
      setExamResult(JSON.parse(result));
    } else {
      // If no result found, redirect to dashboard
      navigate('/dashboard/playground');
    }
    setLoading(false);
  }, [navigate]);

  const handleRetakeExam = () => {
    localStorage.removeItem('examResult');
    navigate('/dashboard/playground');
  };

  const handleDownloadReport = () => {
    if (!examResult) return;
    
    const reportContent = `
Python Programming Exam Report
=====================================

Exam Status: ${examResult.status === 'fail' ? 'FAILED' : 'COMPLETED'}
${examResult.reason ? `Reason: ${examResult.reason}` : ''}

Score: ${examResult.correctAnswers}/${examResult.totalQuestions}
Percentage: ${examResult.totalQuestions > 0 ? ((examResult.correctAnswers / examResult.totalQuestions) * 100).toFixed(1) : 0}%

Time Taken: ${Math.floor(examResult.timeTaken / 60)}:${(examResult.timeTaken % 60).toString().padStart(2, '0')} minutes

${examResult.answers ? `
Detailed Results:
==================
${examResult.questions.map((q, index) => {
  const userAnswer = examResult.answers[index];
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
    a.download = `python-exam-report-${new Date().toISOString().split('T')[0]}.txt`;
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

  if (!examResult) {
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

  const percentage = examResult.totalQuestions > 0 ? (examResult.correctAnswers / examResult.totalQuestions) * 100 : 0;
  const passed = percentage >= 60; // Assuming 60% is passing grade

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <button
              onClick={() => navigate('/dashboard/playground')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition"
            >
              <FontAwesomeIcon icon={faArrowLeft} />
              Back to Playground
            </button>
            <button
              onClick={handleDownloadReport}
              className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
            >
              <FontAwesomeIcon icon={faDownload} />
              Download Report
            </button>
          </div>

          <h1 className="text-3xl font-bold text-gray-800 mb-2">Exam Results</h1>
          <p className="text-gray-600">Python Programming Assessment</p>
        </div>

        {/* Status Card */}
        <div className={`rounded-lg shadow-sm p-6 mb-6 ${
          examResult.status === 'fail' ? 'bg-red-50 border-2 border-red-200' :
          passed ? 'bg-green-50 border-2 border-green-200' : 'bg-yellow-50 border-2 border-yellow-200'
        }`}>
          <div className="text-center">
            <div className={`text-6xl mb-4 ${
              examResult.status === 'fail' ? 'text-red-500' :
              passed ? 'text-green-500' : 'text-yellow-500'
            }`}>
              {examResult.status === 'fail' ? (
                <FontAwesomeIcon icon={faTimesCircle} />
              ) : (
                <FontAwesomeIcon icon={faCheckCircle} />
              )}
            </div>
            
            <h2 className={`text-2xl font-bold mb-2 ${
              examResult.status === 'fail' ? 'text-red-700' :
              passed ? 'text-green-700' : 'text-yellow-700'
            }`}>
              {examResult.status === 'fail' ? 'Exam Failed' : 
               passed ? 'Exam Passed' : 'Exam Completed'}
            </h2>
            
            {examResult.reason && (
              <p className="text-red-600 mb-4">{examResult.reason}</p>
            )}
            
            <div className={`text-4xl font-bold mb-2 ${
              examResult.status === 'fail' ? 'text-red-600' :
              passed ? 'text-green-600' : 'text-yellow-600'
            }`}>
              {examResult.correctAnswers}/{examResult.totalQuestions}
            </div>
            
            <div className={`text-lg font-semibold ${
              examResult.status === 'fail' ? 'text-red-500' :
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
                <p className="text-2xl font-bold text-green-600">{examResult.correctAnswers}</p>
              </div>
              <FontAwesomeIcon icon={faCheckCircle} className="text-green-500 text-2xl" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Incorrect Answers</p>
                <p className="text-2xl font-bold text-red-600">{examResult.incorrectAnswers || (examResult.totalQuestions - examResult.correctAnswers)}</p>
              </div>
              <FontAwesomeIcon icon={faTimesCircle} className="text-red-500 text-2xl" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Time Taken</p>
                <p className="text-2xl font-bold text-blue-600">
                  {Math.floor(examResult.timeTaken / 60)}:{(examResult.timeTaken % 60).toString().padStart(2, '0')}
                </p>
              </div>
              <FontAwesomeIcon icon={faClock} className="text-blue-500 text-2xl" />
            </div>
          </div>
        </div>

        {/* Detailed Results */}
        {examResult.answers && examResult.questions && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <FontAwesomeIcon icon={faChartBar} />
              Detailed Results
            </h3>
            
            <div className="space-y-4">
              {examResult.questions.map((question, index) => {
                const userAnswer = examResult.answers[index];
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
};

export default Reports;
