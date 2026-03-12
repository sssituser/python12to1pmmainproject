import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function ExamReports() {
  const navigate = useNavigate();
  const [results, setResults] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem('allExamResults') || '[]');
    setResults(data);
    setLoading(false);
  }, []);

  const handleView = (result) => {
    setSelected(result);
  };

  const handleBack = () => {
    setSelected(null);
  };

  const handleDelete = (examDate) => {
    if (confirm('Delete this result?')) {
      const updated = results.filter(r => r.examDate !== examDate);
      setResults(updated);
      localStorage.setItem('allExamResults', JSON.stringify(updated));
      if (selected?.examDate === examDate) {
        setSelected(null);
      }
    }
  };

  const handleDownload = (result) => {
    const content = `
${result.examTitle || 'Exam Report'}
Student: ${result.user?.username || 'Unknown'}
ID: ${result.user?.randomId || 'N/A'}
Score: ${result.correctAnswers * 2}/40 marks
Status: ${result.correctAnswers >= 9 ? 'PASS' : 'FAIL'}
Date: ${new Date(result.examDate).toLocaleString()}
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

  if (selected) {
    const passed = selected.correctAnswers >= 9;
    return (
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow p-8">
            <div className="flex justify-between items-center mb-6">
              <button onClick={handleBack} className="text-blue-600 hover:underline">
                ← Back to Reports
              </button>
              <div className="flex gap-2">
                <button onClick={() => handleDownload(selected)} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                  Download
                </button>
                <button onClick={() => handleDelete(selected.examDate)} className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
                  Delete
                </button>
              </div>
            </div>

            <h1 className="text-3xl font-bold mb-2">{selected.examTitle || 'Exam Results'}</h1>
            
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <p className="text-gray-600">Student</p>
                <p className="font-semibold">{selected.user?.username || 'Unknown'}</p>
              </div>
              <div>
                <p className="text-gray-600">ID</p>
                <p className="font-semibold">{selected.user?.randomId || 'N/A'}</p>
              </div>
              <div>
                <p className="text-gray-600">Date</p>
                <p className="font-semibold">{new Date(selected.examDate).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-gray-600">Time</p>
                <p className="font-semibold">{new Date(selected.examDate).toLocaleTimeString()}</p>
              </div>
            </div>

            <div className={`p-6 rounded-lg text-center mb-6 ${
              passed ? 'bg-green-50 border-2 border-green-200' : 'bg-red-50 border-2 border-red-200'
            }`}>
              <div className={`text-6xl mb-4 ${passed ? 'text-green-500' : 'text-red-500'}`}>
                {passed ? '✓' : '✗'}
              </div>
              <h2 className={`text-2xl font-bold mb-2 ${passed ? 'text-green-700' : 'text-red-700'}`}>
                {passed ? 'PASSED' : 'FAILED'}
              </h2>
              <div className={`text-4xl font-bold ${passed ? 'text-green-600' : 'text-red-600'}`}>
                {selected.correctAnswers * 2}/40
              </div>
              <div className="text-lg text-gray-600">
                {selected.correctAnswers}/{selected.totalQuestions} correct
              </div>
            </div>

            {selected.answers && selected.questions && (
              <div className="mb-6">
                <h3 className="text-xl font-bold mb-4">Question Analysis</h3>
                <div className="space-y-4">
                  {selected.questions.map((q, i) => {
                    const userAnswer = selected.answers[i];
                    const isCorrect = userAnswer === q.correct;
                    const notAttempted = userAnswer === null;

                    return (
                      <div key={i} className={`border rounded-lg p-4 ${
                        notAttempted ? 'border-gray-200 bg-gray-50' :
                        isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                      }`}>
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold">Q{i + 1}: {q.question}</h4>
                          <span className={`px-2 py-1 rounded text-xs font-bold ${
                            notAttempted ? 'bg-gray-200 text-gray-700' :
                            isCorrect ? 'bg-green-200 text-green-700' : 'bg-red-200 text-red-700'
                          }`}>
                            {notAttempted ? 'Not Attempted' : isCorrect ? 'Correct' : 'Incorrect'}
                          </span>
                        </div>
                        <div className="space-y-1 text-sm">
                          {q.options.map((opt, idx) => (
                            <div key={idx} className={`p-2 rounded ${
                              idx === q.correct ? 'bg-green-100 border-green-400' :
                              idx === userAnswer && !isCorrect ? 'bg-red-100 border-red-400' : 'bg-gray-50'
                            }`}>
                              {String.fromCharCode(65 + idx)}. {opt}
                              {idx === q.correct && ' ✓'}
                              {idx === userAnswer && !isCorrect && ' ✗'}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="flex justify-center gap-4">
              <button onClick={() => navigate('/dashboard/playground')} className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
                Retake Exam
              </button>
              <button onClick={() => navigate('/dashboard')} className="bg-gray-600 text-white px-6 py-2 rounded hover:bg-gray-700">
                Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow p-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold">Exam Reports</h1>
              <p className="text-gray-600">All Results</p>
            </div>
            <button onClick={() => navigate('/dashboard/playground')} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              Take New Exam
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">S.No.</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Start Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Score</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {results.map((result, index) => {
                  const passed = result.correctAnswers >= 9;
                  return (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium">{index + 1}</td>
                      <td className="px-6 py-4 text-sm">{result.user?.username || 'Unknown'}</td>
                      <td className="px-6 py-4 text-sm font-mono bg-gray-100 px-2 py-1 rounded">{result.user?.randomId || 'N/A'}</td>
                      <td className="px-6 py-4 text-sm">{new Date(result.examDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                      <td className="px-6 py-4 text-sm font-semibold">{result.correctAnswers * 2}/40</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                          passed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {passed ? 'PASS' : 'FAIL'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-1">
                          <button onClick={() => handleView(result)} className="bg-blue-600 text-white px-2 py-1 rounded text-xs hover:bg-blue-700">
                            View
                          </button>
                          <button onClick={() => handleDownload(result)} className="bg-gray-600 text-white px-2 py-1 rounded text-xs hover:bg-gray-700">
                            Download
                          </button>
                          <button onClick={() => handleDelete(result.examDate)} className="bg-red-600 text-white px-2 py-1 rounded text-xs hover:bg-red-700">
                            Delete
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

export default ExamReports;
