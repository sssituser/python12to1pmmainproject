import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import jsPDF from 'jspdf';

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
    doc.text(`Score: ${result.correctAnswers * 2}/40`, 20, 120);
    doc.text(`Status: ${passed ? 'Pass' : 'Fail'}`, 20, 130);
    
    // Add performance summary
    doc.setFont('helvetica', 'bold');
    doc.text('Performance Summary:', 20, 150);
    doc.setFont('helvetica', 'normal');
    doc.text(`Correct Answers: ${result.correctAnswers}/20`, 20, 160);
    doc.text(`Incorrect Answers: ${result.incorrectAnswers || (20 - result.correctAnswers)}/20`, 20, 170);
    doc.text(`Percentage: ${((result.correctAnswers / 20) * 100).toFixed(1)}%`, 20, 180);
    
    // Add question analysis (first 10 questions to fit on one page)
    if (result.questions && Array.isArray(result.questions)) {
      doc.setFont('helvetica', 'bold');
      doc.text('Question Analysis (First 10):', 20, 200);
      doc.setFont('helvetica', 'normal');
      
      let yPos = 210;
      const questionsToShow = Math.min(10, result.questions.length);
      
      for (let i = 0; i < questionsToShow; i++) {
        const q = result.questions[i];
        const userAnswer = result.answers[i];
        const isCorrect = userAnswer === q.correct;
        
        if (yPos > 270) {
          doc.addPage();
          yPos = 20;
        }
        
        doc.setFontSize(10);
        doc.text(`Q${i + 1}: ${isCorrect ? '✓' : '✗'} ${userAnswer !== null ? String.fromCharCode(65 + userAnswer) : 'Not Attempted'}`, 20, yPos);
        yPos += 7;
      }
    }
    
    // Add generation date
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 105, 280, { align: 'center' });
    
    // Save the PDF
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