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
    const examResult = localStorage.getItem("examResult");
    if (examResult) {
      setCurrentResult(JSON.parse(examResult));
    }

    const results = JSON.parse(localStorage.getItem("allExamResults") || "[]");
    setAllResults(results);
  }, []);

  const handleBack = () => navigate("/dashboard/playground");

  const handleDownload = (result) => {
    if (!result) return alert("No result data");

    const passed = result.correctAnswers * 2 >= 20;
    const studentName =
      result.user?.firstName || result.user?.username || "Unknown";

    const content = `
Student: ${studentName}
Score: ${result.correctAnswers * 2}/40
Status: ${passed ? "Pass" : "Fail"}
    `.trim();

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `result-${studentName}.txt`;
    a.click();

    window.URL.revokeObjectURL(url);
  };

  const handleDelete = (examDate) => {
    if (!window.confirm("Delete this result?")) return;

    const updated = allResults.filter((r) => r.examDate !== examDate);
    setAllResults(updated);
    localStorage.setItem("allExamResults", JSON.stringify(updated));

    if (currentResult?.examDate === examDate) {
      setCurrentResult(null);
      localStorage.removeItem("examResult");
    }
  };

  const handleViewDetails = (result) => {
    setCurrentResult(result);
    setShowDetailedView(true);
  };

  if (!currentResult) {
    return <h2>No Results Found</h2>;
  }

  const passed = currentResult.correctAnswers * 2 >= 20;

  return (
    <div style={{ padding: "20px" }}>
      <div className="max-w-6xl mx-auto">

        {/* HEADER */}
        <div className="bg-white p-4 mb-4 shadow rounded flex justify-between">
          <button onClick={handleBack}>
            <FontAwesomeIcon icon={faArrowLeft} /> Back
          </button>

          <div>
            <button onClick={() => handleDownload(currentResult)}>
              <FontAwesomeIcon icon={faDownload} />
            </button>

            <button onClick={() => handleDelete(currentResult.examDate)}>
              <FontAwesomeIcon icon={faTrash} />
            </button>
          </div>
        </div>

        {/* SHOW DETAILS */}
        {showDetailedView && (
          <>
            <div className="grid grid-cols-4 gap-4 mb-4">
              <div>Score: {currentResult.correctAnswers * 2}/40</div>
              <div>Status: {passed ? "Pass" : "Fail"}</div>
            </div>

            <button onClick={() => setShowDetailedView(false)}>
              Close Details
            </button>
          </>
        )}

        {/* ALL RESULTS */}
        <div className="bg-white p-4 shadow rounded">
          <h3>All Results</h3>

          <table className="w-full mt-3">
            <thead>
              <tr>
                <th>S.No</th>
                <th>Name</th>
                <th>Score</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {allResults.map((result, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>
                    {result.user?.firstName ||
                      result.user?.username ||
                      "Unknown"}
                  </td>
                  <td>{result.correctAnswers * 2}/40</td>

                  <td>
                    <button onClick={() => handleViewDetails(result)}>👁</button>
                    <button onClick={() => handleDownload(result)}>📥</button>
                    <button onClick={() => handleDelete(result.examDate)}>🗑</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}

export default PlaygroundResults;