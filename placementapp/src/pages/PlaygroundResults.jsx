import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function PlaygroundResults() {

  const navigate = useNavigate();
  const [currentResult, setCurrentResult] = useState(null);
  const [allResults, setAllResults] = useState([]);

  useEffect(() => {

    const examResult = localStorage.getItem("examResult");
    if (examResult) {
      setCurrentResult(JSON.parse(examResult));
    }

    const results = JSON.parse(localStorage.getItem("allExamResults") || "[]");
    setAllResults(results);

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

    const passed = (result.correctAnswers * 2) >= 20;
    const examDate = new Date(result.examDate).toLocaleString();

    const studentName =
      result.user?.firstName ||
      result.user?.username ||
      "Unknown";

    const content = `
Student: ${studentName}
Email: ${result.user?.email || "N/A"}
ID: ${result.user?.randomId || "N/A"}

Exam: ${result.examTitle || "Python Programming Assessment"}
Date: ${examDate}

Score: ${result.correctAnswers * 2}/40
Status: ${passed ? "Pass" : "Fail"}

${result.questions
        ? result.questions
          .map(
            (q, i) => `
Question ${i + 1}: ${q.question}

Your Answer:
${result.answers[i] !== null
                ? String.fromCharCode(65 + result.answers[i]) +
                ". " +
                q.options[result.answers[i]]
                : "Not Attempted"}

Correct Answer:
${String.fromCharCode(65 + q.correct)}. ${q.options[q.correct]}

${result.answers[i] === q.correct ? "✓ CORRECT" : "✗ INCORRECT"}

`
          )
          .join("\n")
        : "Answer details not available"}
`;

    const blob = new Blob([content], {
      type: "text/plain;charset=utf-8",
    });

    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `exam-result-${studentName}.txt`;

    document.body.appendChild(a);
    a.click();

    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  // DELETE RESULT
  const handleDelete = (examDate) => {

    const confirmDelete = window.confirm(
      "Delete this exam result?"
    );

    if (!confirmDelete) return;

    const updatedResults = allResults.filter(
      (result) => result.examDate !== examDate
    );

    setAllResults(updatedResults);

    localStorage.setItem(
      "allExamResults",
      JSON.stringify(updatedResults)
    );

    if (currentResult?.examDate === examDate) {
      setCurrentResult(null);
      localStorage.removeItem("examResult");
    }

    alert("Result deleted successfully");
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

        <table className="w-full">

          <thead className="bg-gray-50 border-b">

            <tr>

              <th className="px-4 py-3">S.No</th>
              <th className="px-4 py-3">Student</th>
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">Exam</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Score</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>

            </tr>

          </thead>

          <tbody>

            {allResults.map((result, index) => {

              const passed = (result.correctAnswers * 2) >= 20;

              return (

                <tr key={index} className="border-b">

                  <td className="px-4 py-3">
                    {index + 1}
                  </td>

                  <td className="px-4 py-3">
                    {result.user?.firstName ||
                      result.user?.username ||
                      "Unknown"}
                  </td>

                  <td className="px-4 py-3">
                    {result.user?.randomId || "N/A"}
                  </td>

                  <td className="px-4 py-3">
                    {result.examTitle ||
                      "Python Programming"}
                  </td>

                  <td className="px-4 py-3">
                    {new Date(
                      result.examDate
                    ).toLocaleDateString()}
                  </td>

                  <td className="px-4 py-3">
                    {result.correctAnswers * 2}/40
                  </td>

                  <td className="px-4 py-3">

                    <span
                      className={`px-2 py-1 text-xs rounded 
                      ${passed
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                        }`}
                    >

                      {passed ? "Pass" : "Fail"}

                    </span>

                  </td>

                  <td className="px-4 py-3 flex gap-2">

                    <button
                      onClick={() =>
                        handleViewDetails(result,index)
                      }
                    >
                      👁
                    </button>

                    <button
                      onClick={() =>
                        handleDownload(result)
                      }
                    >
                      📥
                    </button>

                    <button
                      onClick={() =>
                        handleDelete(result.examDate)
                      }
                    >
                      🗑️
                    </button>

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