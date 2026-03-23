import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faDownload } from "@fortawesome/free-solid-svg-icons";
import jsPDF from 'jspdf';

function DetailedResults() {

  const navigate = useNavigate();
  const { index } = useParams();

  const [result, setResult] = useState(null);

  useEffect(() => {

    const results = JSON.parse(
      localStorage.getItem("allExamResults") || "[]"
    );

    if (results[index]) {
      setResult(results[index]);
    } else {
      console.error("DetailedResults - No result found at index:", index);
    }

  }, [index]);

  const handleBack = () => {
    navigate("/dashboard/playground-results");
  };

  const handleDownload = () => {
    if (!result) {
      alert("No result data available for download.");
      return;
    }

    // Determine passing criteria based on exam type
    const isDailyExam = result.examTitle?.toLowerCase().includes('daily');
    const isWeeklyExam = result.examTitle?.toLowerCase().includes('weekly');
    const isMonthlyExam = result.examTitle?.toLowerCase().includes('monthly');
    
    let totalQuestions = result.totalQuestions || 20; // use actual value from result
    let totalMarks = result.totalMarks || 40; // use actual value from result
    let passingScore = 15; // default (marks needed to pass)
    
    if (isDailyExam) {
      passingScore = 20; // 20 marks to pass for daily exam (out of 40)
    } else if (isWeeklyExam || isMonthlyExam) {
      passingScore = 35; // 35 marks to pass for weekly/monthly exams (out of 100)
    }
    
    const passed = (result.score || (result.correctAnswers || 0) * 2) >= passingScore;
    const studentName = result.user?.firstName || result.user?.username || "Unknown";
    const examDate = result.examDate ? new Date(result.examDate).toLocaleString() : "Unknown Date";

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
    doc.text(`Score: ${result.score || (result.correctAnswers || 0) * 2}/${totalMarks}`, 20, 120);
    doc.text(`Status: ${passed ? 'Pass' : 'Fail'}`, 20, 130);
    doc.text(`Passing Marks: ${passingScore}`, 20, 140);
    
    // Add performance summary with detailed statistics
    doc.setFont('helvetica', 'bold');
    doc.text('Performance Summary:', 20, 150);
    doc.setFont('helvetica', 'normal');
    doc.text(`Correct Answers: ${result.correctAnswers || 0}/${totalQuestions}`, 20, 160);
    doc.text(`Incorrect Answers: ${result.incorrectAnswers || (totalQuestions - (result.correctAnswers || 0))}/${totalQuestions}`, 20, 170);
    doc.text(`Not Attempted: ${result.answers?.filter(a => a === null || a === undefined).length || 0}/${totalQuestions}`, 20, 180);
    doc.text(`Percentage: ${(((result.correctAnswers || 0) / totalQuestions) * 100).toFixed(1)}%`, 20, 190);
    doc.text(`Status: ${passed ? 'Pass' : 'Fail'}`, 20, 200);
    doc.text(`Score: ${result.score || (result.correctAnswers || 0) * 2}/${totalMarks}`, 20, 210);
    
    // Add generation date at the end
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, 105, 240, { align: 'center' });
    
    // Add note about detailed analysis
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text('Note: For detailed question-by-question analysis, please view the results online.', 105, 255, { align: 'center' });
    
    // Save the PDF
    doc.save(`exam-results-${studentName.replace(/\s+/g, '_')}.pdf`);
  };

  if (!result) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-semibold">
          No Exam Results Found
        </h2>
        <button
          onClick={handleBack}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
        >
          Back to Results
        </button>
      </div>
    );
  }

  const passed = (result.score || (result.correctAnswers || 0) * 2) >= passingScore;

  return (
    <div className="p-6">
      {/* HEADER */}
      <div className="flex justify-between mb-6">
        <button
          onClick={handleBack}
          className="bg-gray-600 text-white px-4 py-2 rounded flex gap-2 items-center"
        >
          <FontAwesomeIcon icon={faArrowLeft} />
          Back
        </button>

        <button
          onClick={handleDownload}
          className="bg-gray-600 text-white px-4 py-2 rounded flex gap-2 items-center"
        >
          <FontAwesomeIcon icon={faDownload} />
          Download
        </button>
      </div>

      {/* STUDENT INFO */}
      <div className="bg-white shadow p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">
          Student Information
        </h2>
        <div className="grid grid-cols-4 gap-4 text-center">
          <div>
            <h3 className="text-gray-600">Name</h3>
            <p className="font-bold text-blue-600">
              {result.user?.firstName || result.user?.username}
            </p>
          </div>
          <div>
            <h3 className="text-gray-600">ID</h3>
            <p className="font-bold text-blue-600">
              {result.user?.randomId}
            </p>
          </div>
          <div>
            <h3 className="text-gray-600">Score</h3>
            <p className="font-bold text-blue-600">
              {result.score || (result.correctAnswers || 0) * 2}/{totalMarks}
            </p>
          </div>
          <div>
            <h3 className="text-gray-600">Status</h3>
            <p
              className={`font-bold ${
                passed ? "text-green-600" : "text-red-600"
              }`}
            >
              {passed ? "Pass" : "Fail"}
            </p>
          </div>
        </div>
      </div>

      {/* PERFORMANCE SUMMARY */}
      <div className="bg-white shadow p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">
          Performance Summary
        </h2>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="text-green-600 font-semibold">Correct</h3>
            <p className="text-2xl font-bold text-green-700">
              {result.correctAnswers || 0}
            </p>
            <p className="text-sm text-green-600">
              {(((result.correctAnswers || 0) / totalQuestions) * 100).toFixed(1)}%
            </p>
          </div>
          <div className="bg-red-50 p-4 rounded-lg">
            <h3 className="text-red-600 font-semibold">Wrong</h3>
            <p className="text-2xl font-bold text-red-700">
              {result.incorrectAnswers || (totalQuestions - (result.correctAnswers || 0))}
            </p>
            <p className="text-sm text-red-600">
              {(((result.incorrectAnswers || (totalQuestions - (result.correctAnswers || 0))) / totalQuestions) * 100).toFixed(1)}%
            </p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-gray-600 font-semibold">Not Attempted</h3>
            <p className="text-2xl font-bold text-gray-700">
              {result.answers?.filter(a => a === null || a === undefined).length || 0}
            </p>
            <p className="text-sm text-gray-600">
              {((result.answers?.filter(a => a === null || a === undefined).length || 0) / totalQuestions * 100).toFixed(1)}%
            </p>
          </div>
        </div>
      </div>

      {/* COMPLETE QUESTION ANALYSIS */}
      <div className="bg-white shadow p-6">
        <h2 className="text-xl font-bold mb-6">
          Complete Question Analysis (All {result.questions?.length || 0} Questions)
        </h2>
        
        {/* Always show questions if data exists */}
        {result && result.questions && Array.isArray(result.questions) && result.questions.length > 0 ? (
          <div>
            {/* Performance Overview Card */}
            <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-blue-800 mb-2">Exam Performance Overview</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-600">Total Questions:</span>
                      <span className="font-bold text-blue-600">{result.questions?.length || 0}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-600">Score Achieved:</span>
                      <span className="font-bold text-blue-600">{result.correctAnswers || 0}/{totalQuestions}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-600">Percentage:</span>
                      <span className="font-bold text-blue-600">{(((result.correctAnswers || 0) / totalQuestions) * 100).toFixed(1)}%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-600">Status:</span>
                      <span className={`font-bold px-2 py-1 rounded-full text-xs ${passed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {passed ? '✓ PASSED' : '✗ FAILED'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <button
                    onClick={handleDownload}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-md"
                  >
                    <FontAwesomeIcon icon={faDownload} />
                    Download Full Report
                  </button>
                </div>
              </div>
            </div>

            {/* Map through all questions */}
            {result.questions.map((question, questionIndex) => {
              // Safe access to all data with fallbacks
              const questionText = question?.question || `Question ${questionIndex + 1}`;
              const options = Array.isArray(question?.options) ? question.options : [];
              const correctAnswerIndex = question?.correct ?? 0;
              const userAnswerIndex = Array.isArray(result?.answers) ? result.answers[questionIndex] : null;
              const isCorrect = userAnswerIndex === correctAnswerIndex;
              const notAttempted = userAnswerIndex === null || userAnswerIndex === undefined;
              
              return (
                <div key={questionIndex} className="border rounded-lg p-4 mb-4 bg-gray-50">
                  {/* Question header with status */}
                  <div className="mb-3">
                    <h3 className="font-bold text-lg mb-2">
                      Question {questionIndex + 1}: {questionText}
                    </h3>
                    <div className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                      notAttempted 
                        ? 'bg-gray-100 text-gray-600' 
                        : isCorrect 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                    }`}>
                      {notAttempted ? 'Not Attempted' : isCorrect ? 'Correct' : 'Wrong'}
                    </div>
                  </div>

                  {/* Options display */}
                  <div className="space-y-2 mb-4">
                    {options.map((option, optionIndex) => {
                      const isSelected = userAnswerIndex === optionIndex;
                      const isCorrectOption = correctAnswerIndex === optionIndex;
                      
                      // Simple styling based on status
                      let bgColor = 'bg-white border-gray-300';
                      if (isSelected && isCorrectOption) {
                        bgColor = 'bg-green-100 border-green-500';
                      } else if (isSelected && !isCorrectOption) {
                        bgColor = 'bg-red-100 border-red-500';
                      } else if (isCorrectOption) {
                        bgColor = 'bg-green-50 border-green-300';
                      }
                      
                      return (
                        <div key={optionIndex} className={`p-3 rounded border-2 ${bgColor}`}>
                          <div className="flex justify-between items-center">
                            <span className="flex-1">
                              {String.fromCharCode(65 + optionIndex)}. {option}
                            </span>
                            <div className="flex gap-2 ml-4">
                              {isCorrectOption && (
                                <span className="text-green-600 font-semibold text-sm">
                                  ✓ Correct
                                </span>
                              )}
                              {isSelected && !isCorrectOption && (
                                <span className="text-red-600 font-semibold text-sm">
                                  ✗ Your Answer
                                </span>
                              )}
                              {isSelected && isCorrectOption && (
                                <span className="text-green-600 font-semibold text-sm">
                                  ✓ Your Answer
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Answer summary */}
                  <div className="mt-4 pt-3 border-t border-gray-300">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-semibold text-gray-600">Your Answer: </span>
                        <span className={`font-semibold ${
                          notAttempted 
                            ? 'text-gray-500' 
                            : isCorrect 
                              ? 'text-green-600' 
                              : 'text-red-600'
                        }`}>
                          {notAttempted 
                            ? 'Not Attempted' 
                            : `${String.fromCharCode(65 + userAnswerIndex)}. ${options[userAnswerIndex]}`
                          }
                        </span>
                      </div>
                      <div>
                        <span className="font-semibold text-gray-600">Correct Answer: </span>
                        <span className="font-semibold text-green-600">
                          {String.fromCharCode(65 + correctAnswerIndex)}. {options[correctAnswerIndex]}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* No questions available */
          <div className="text-center py-8">
            <p className="text-gray-500">No questions available</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default DetailedResults;
