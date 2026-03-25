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
    // 1. Try to get the specific selected result first
    const selected = localStorage.getItem("selectedExamResult");
    if (selected) {
      setResult(JSON.parse(selected));
      return;
    }

    // 2. Fallback to index-based lookup (legacy/compatibility)
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

  // ─── Shared exam calculations (computed at component scope) ───
  const totalQuestions = result?.totalQuestions || 20;
  const totalMarks = result?.totalMarks || 40;
  
  // Use the 'passed' status saved in the result (calculated by faculty rules at submission)
  const passed = result && result.passed !== undefined 
    ? result.passed 
    : (result ? (result.score || 0) >= (totalMarks * 0.5) : false);

  const passingScoreText = result && result.passed !== undefined ? "Faculty Rule Applied" : `${totalMarks * 0.5}`;

  const handleDownload = () => {
    if (!result) {
      alert("No result data available for download.");
      return;
    }

    const studentName = (result.user?.firstName || result.user?.username || "Unknown").toUpperCase();
    const examDate = result.examDate ? new Date(result.examDate).toLocaleString() : "Unknown Date";

    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('Exam Results Report', 105, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.text('Student Information:', 20, 40);
    doc.setFont('helvetica', 'normal');
    doc.text(`Name: ${studentName}`, 20, 50);
    doc.text(`Email: ${result.user?.email || 'N/A'}`, 20, 60);
    doc.text(`ID: ${result.user?.randomId || 'N/A'}`, 20, 70);
    
    doc.setFont('helvetica', 'bold');
    doc.text('Exam Information:', 20, 90);
    doc.setFont('helvetica', 'normal');
    doc.text(`Exam: ${result.examTitle || 'Python Programming Assessment'}`, 20, 100);
    doc.text(`Date: ${examDate}`, 20, 110);
    doc.text(`Score: ${result.score || (result.correctAnswers || 0) * 2}/${totalMarks}`, 20, 120);
    doc.text(`Status: ${passed ? 'Pass' : 'Fail'}`, 20, 130);
    doc.text(`Criteria: ${passingScoreText}`, 20, 140);
    
    doc.setFont('helvetica', 'bold');
    doc.text('Performance Summary:', 20, 150);
    doc.setFont('helvetica', 'normal');
    doc.text(`Correct Answers: ${result.correctAnswers || 0}/${totalQuestions}`, 20, 160);
    doc.text(`Incorrect Answers: ${result.incorrectAnswers || (totalQuestions - (result.correctAnswers || 0))}/${totalQuestions}`, 20, 170);
    doc.text(`Not Attempted: ${result.answers?.filter(a => a === null || a === undefined).length || 0}/${totalQuestions}`, 20, 180);
    doc.text(`Percentage: ${(((result.correctAnswers || 0) / totalQuestions) * 100).toFixed(1)}%`, 20, 190);
    
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, 105, 240, { align: 'center' });
    
    doc.save(`exam-results-${studentName.replace(/\s+/g, '_')}.pdf`);
  };

  if (!result) {
    return (
      <div className="p-8 text-center bg-gray-50 min-h-screen flex flex-col items-center justify-center">
        <h2 className="text-2xl font-black text-gray-800 mb-4">
          Assessment Results Not Found
        </h2>
        <button
          onClick={handleBack}
          className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all"
        >
          Return to History
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 py-4 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        
        {/* TOP MINI HEADER */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-indigo-600 transition-all bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100 group"
          >
            <span className="group-hover:-translate-x-1 transition-transform">←</span>
            Back to All Results
          </button>

          <button
            onClick={handleDownload}
            className="flex items-center gap-2 text-sm font-bold text-white bg-gray-800 hover:bg-black transition-all px-5 py-2.5 rounded-xl shadow-lg shadow-gray-200"
          >
            <FontAwesomeIcon icon={faDownload} className="text-xs" />
            Download PDF Report
          </button>
        </div>

        {/* HERO SECTION / STUDENT INFO */}
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden mb-4">
          <div className="bg-gradient-to-r from-indigo-600 to-blue-600 p-1 px-8"></div>
          <div className="p-4 sm:p-6">
            <h2 className="text-xs font-black text-indigo-500 uppercase tracking-widest mb-6 flex items-center gap-2">
              <span className="w-8 h-[2px] bg-indigo-500"></span>
              Student Assessment Summary
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="space-y-1">
                <p className="text-gray-400 text-sm font-medium">Student Name</p>
                <p className="text-xl font-black text-gray-900 truncate">
                  {(result.user?.firstName || result.user?.username || "Guest Student").toUpperCase()}
                </p>
              </div> 
              {/* <div className="space-y-1">
                <p className="text-gray-400 text-sm font-medium">Report ID</p>
                <p className="text-xl font-black text-gray-900 font-mono">
                   #{result.user?.randomId || 'N/A'}
                </p>
              </div> */}
                <div className="space-y-1">
                <p className="text-gray-400 text-sm font-medium">Final Score</p>
                <p className="text-xl font-black text-indigo-600">
                  {result.score || (result.correctAnswers || 0) * 2} <span className="text-gray-300 font-normal">/ {totalMarks}</span>
                </p>
              </div>
              <div className="space-y-1 text-right md:text-left">
                <p className="text-gray-400 text-sm font-medium">Status</p>
                <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider shadow-sm ${
                  passed ? "bg-green-100 text-green-700 ring-1 ring-green-200" : "bg-red-100 text-red-700 ring-1 ring-red-200"
                }`}>
                  {passed ? "Pass ✓" : "Fail ✗"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* PERFORMANCE KPI CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          
          <div className="bg-white p-4 rounded-[1.5rem] border border-gray-100 shadow-sm flex flex-col items-center text-center relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-16 h-16 bg-green-50 rounded-bl-[2rem] -mr-4 -mt-4 group-hover:scale-110 transition-transform"></div>
            <p className="text-green-600 font-black text-xs uppercase tracking-widest mb-2">Accurate</p>
            <p className="text-5xl font-black text-gray-900 mb-1">{result.correctAnswers || 0}</p>
            <p className="text-sm font-bold text-gray-400 italic">
               {(((result.correctAnswers || 0) / totalQuestions) * 100).toFixed(1)}% Success
            </p>
          </div>

          <div className="bg-white p-4 rounded-[1.5rem] border border-gray-100 shadow-sm flex flex-col items-center text-center relative overflow-hidden group">
             <div className="absolute top-0 right-0 w-16 h-16 bg-red-50 rounded-bl-[2rem] -mr-4 -mt-4 group-hover:scale-110 transition-transform"></div>
            <p className="text-red-600 font-black text-xs uppercase tracking-widest mb-2">Incorrect</p>
            <p className="text-5xl font-black text-gray-900 mb-1">
               {result.incorrectAnswers || (totalQuestions - (result.correctAnswers || 0))}
            </p>
            <p className="text-sm font-bold text-gray-400 italic">Missed Potential</p>
          </div>

          <div className="bg-white p-4 rounded-[1.5rem] border border-gray-100 shadow-sm flex flex-col items-center text-center relative overflow-hidden group">
             <div className="absolute top-0 right-0 w-16 h-16 bg-gray-50 rounded-bl-[2rem] -mr-4 -mt-4 group-hover:scale-110 transition-transform"></div>
            <p className="text-gray-500 font-black text-xs uppercase tracking-widest mb-2">Skipped</p>
            <p className="text-5xl font-black text-gray-900 mb-1">
               {result.answers?.filter(a => a === null || a === undefined).length || 0}
            </p>
            <p className="text-sm font-bold text-gray-400 italic">Not Analyzed</p>
          </div>

        </div>

        {/* DETAILED ANALYSIS SECTION */}
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-2 px-4">
             <h3 className="text-2xl font-black text-gray-900 tracking-tight">
               Question Breakdown <span className="text-indigo-500 ml-2">{result.questions?.length || 0} ITEMS</span>
             </h3>
             <div className="h-[2px] flex-grow mx-8 bg-gray-100 hidden sm:block"></div>
          </div>

          {result && result.questions && result.questions.length > 0 ? (
            <div className="space-y-6">
              {result.questions.map((question, questionIndex) => {
                const questionText = question?.question || `Assessment Item ${questionIndex + 1}`;
                const options = Array.isArray(question?.options) ? question.options : [];
                const correctAnswerIndex = question?.correct ?? 0;
                const userAnswerIndex = Array.isArray(result?.answers) ? result.answers[questionIndex] : null;
                const isCorrect = userAnswerIndex === correctAnswerIndex;
                const notAttempted = userAnswerIndex === null || userAnswerIndex === undefined;
                
                return (
                  <div 
                    key={questionIndex} 
                    className={`bg-white rounded-[2rem] border-2 overflow-hidden shadow-sm transition-all duration-300 ${
                       notAttempted ? 'border-gray-100' : isCorrect ? 'border-green-100 shadow-green-50/50' : 'border-red-100 shadow-red-50/50'
                    }`}
                  >
                    <div className="p-6 sm:p-8">
                       <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
                          <div className="flex-1">
                             <p className="text-xs font-black text-gray-400 tracking-widest uppercase mb-1">Question {questionIndex + 1}</p>
                             <h4 className="text-lg font-bold text-gray-900 leading-snug">
                               {questionText}
                             </h4>
                          </div>

                          <div className={`shrink-0 flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                             notAttempted ? 'bg-gray-100 text-gray-500' : isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                             {notAttempted ? '○ Skipped' : isCorrect ? '● Correct' : '● Incorrect'}
                          </div>
                       </div>

                       <div className="grid grid-cols-1 gap-3">
                          {options.map((option, optionIndex) => {
                            const isUserSelected = userAnswerIndex === optionIndex;
                            const isCorrectOption = correctAnswerIndex === optionIndex;
                            
                            let optionStyles = "bg-gray-50 border-transparent text-gray-600";
                            if (isUserSelected && isCorrectOption) optionStyles = "bg-green-50 border-green-500 text-green-900 ring-2 ring-green-100";
                            else if (isUserSelected && !isCorrectOption) optionStyles = "bg-red-50 border-red-500 text-red-900 ring-2 ring-red-100";
                            else if (isCorrectOption) optionStyles = "bg-green-50 border-green-300 text-green-800";

                            return (
                              <div 
                                key={optionIndex} 
                                className={`p-4 rounded-2xl border-2 transition-all flex items-center justify-between gap-4 ${optionStyles}`}
                              >
                                <span className="text-sm font-bold flex items-start gap-3">
                                   <span className="opacity-40">{String.fromCharCode(65 + optionIndex)}.</span>
                                   {option}
                                </span>
                                
                                {isCorrectOption && (
                                   <span className="text-[10px] font-black bg-green-500 text-white px-2 py-0.5 rounded-md uppercase">Correct</span>
                                )}
                                {isUserSelected && !isCorrectOption && (
                                   <span className="text-[10px] font-black bg-red-500 text-white px-2 py-0.5 rounded-md uppercase">Your Answer</span>
                                )}
                              </div>
                            );
                          })}
                       </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-[3rem] border border-dashed border-gray-200">
              <p className="text-gray-400 font-bold">Comprehensive analysis data not found for this report.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DetailedResults;
