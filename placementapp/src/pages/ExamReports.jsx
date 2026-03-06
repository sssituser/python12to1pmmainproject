import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function ExamReports() {
  const navigate = useNavigate();
  const [examResults, setExamResults] = useState(null);

  useEffect(() => {
    // Get results from localStorage
    const results = localStorage.getItem('examResults');
    if (results) {
      setExamResults(JSON.parse(results));
    } else {
      // No results found, redirect to exams
      navigate('/exams');
    }
  }, [navigate]);

  if (!examResults) {
    return (
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <p>Loading results...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Exam Results</h1>
          
          {/* Score Card */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Score Card</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-sm text-gray-600">Total Questions</p>
                <p className="text-2xl font-bold text-gray-900">{examResults.totalQuestions}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Marks per Question</p>
                <p className="text-2xl font-bold text-gray-900">2</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Total Marks</p>
                <p className="text-2xl font-bold text-gray-900">{examResults.totalMarks}</p>
              </div>
            </div>
          </div>

          {/* Results Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200 rounded-lg">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                    S.No.
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                    Student Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                    Total Questions Attempted
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                    Correct Answers
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                    Wrong Answers
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                    Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                    Result
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border-b">
                    1
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border-b">
                    {examResults.studentName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border-b">
                    {examResults.attempted}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-semibold border-b">
                    {examResults.correct}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-semibold border-b">
                    {examResults.wrong}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border-b">
                    <span className={`font-bold ${
                      examResults.score >= examResults.totalMarks * 0.6 ? 'text-green-600' : 
                      examResults.score >= examResults.totalMarks * 0.4 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {examResults.score}/{examResults.totalMarks}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm border-b">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      examResults.score >= 30 
                        ? 'bg-green-100 text-green-800 border border-green-200' 
                        : 'bg-red-100 text-red-800 border border-red-200'
                    }`}>
                      {examResults.score >= 30 ? 'PASS' : 'FAIL'}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Performance Summary */}
          <div className="mt-8 p-6 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Accuracy Rate</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {examResults.attempted > 0 ? Math.round((examResults.correct / examResults.attempted) * 100) : 0}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${examResults.attempted > 0 ? (examResults.correct / examResults.attempted) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Completion Rate</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {Math.round((examResults.attempted / examResults.totalQuestions) * 100)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full" 
                    style={{ width: `${(examResults.attempted / examResults.totalQuestions) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex justify-center space-x-4">
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-semibold"
            >
              Back to Dashboard
            </button>
            <button
              onClick={() => navigate('/exams')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
            >
              Take Another Exam
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

export default ExamReports;