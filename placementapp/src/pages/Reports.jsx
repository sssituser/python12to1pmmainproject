import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { faDownload, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const Reports = () => {
  const navigate = useNavigate();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem('allExamResults') || '[]');
    setResults(data);
    setLoading(false);
  }, []);

  const handleDelete = (date) => {
    if (confirm('Delete this result?')) {
      const updated = results.filter(r => r.examDate !== date);
      setResults(updated);
      localStorage.setItem('allExamResults', JSON.stringify(updated));
    }
  };

  const handleDownload = (result) => {
    const content = `
${result.examTitle || 'Exam Report'}
Student: ${result.user?.username || 'Unknown'}
Score: ${result.correctAnswers}/${result.totalQuestions} (${((result.correctAnswers / result.totalQuestions) * 100).toFixed(1)}%)
Status: ${result.status === 'fail' ? 'FAILED' : 'PASSED'}
Date: ${new Date(result.examDate).toLocaleDateString()}
    `.trim();

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `report-${new Date(result.examDate).toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) return <div className="flex items-center justify-center h-screen"><p>Loading...</p></div>;
  if (results.length === 0) return (
    <div className="flex items-center justify-center h-screen bg-gray-50">
      <div className="text-center p-8 bg-white rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-4">No Results</h2>
        <p className="text-gray-600 mb-4">Complete an exam to see results</p>
        <button onClick={() => navigate('/dashboard/playground')} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Take Exam
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">Exam Reports</h1>
            <button onClick={() => navigate('/dashboard/playground')} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              Take New Exam
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {results.map((result, i) => {
            const percentage = (result.correctAnswers / result.totalQuestions) * 100;
            const passed = percentage >= 60;
            
            return (
              <div key={i} className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold">{result.examTitle || 'Python Exam'}</h3>
                    <p className="text-sm text-gray-600">{result.user?.username || 'Unknown'}</p>
                    <p className="text-sm text-gray-600">{new Date(result.examDate).toLocaleDateString()}</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                    result.status === 'fail' ? 'bg-red-100 text-red-700' :
                    passed ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {result.status === 'fail' ? 'Failed' : passed ? 'Passed' : 'Completed'}
                  </span>
                </div>
                
                <div className={`text-2xl font-bold mb-2 ${
                  result.status === 'fail' ? 'text-red-600' : passed ? 'text-green-600' : 'text-yellow-600'
                }`}>
                  {result.correctAnswers}/{result.totalQuestions}
                </div>
                
                <div className="text-lg font-semibold mb-3 text-gray-700">
                  {percentage.toFixed(1)}%
                </div>
                
                <div className="flex gap-2">
                  <button onClick={() => handleDownload(result)} className="flex-1 bg-gray-600 text-white px-2 py-1 rounded text-sm hover:bg-gray-700">
                    <FontAwesomeIcon icon={faDownload} className="mr-1" /> Download
                  </button>
                  <button onClick={() => handleDelete(result.examDate)} className="flex-1 bg-red-600 text-white px-2 py-1 rounded text-sm hover:bg-red-700">
                    <FontAwesomeIcon icon={faTrash} className="mr-1" /> Delete
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
