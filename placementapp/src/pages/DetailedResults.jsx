import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faDownload } from "@fortawesome/free-solid-svg-icons";
import jsPDF from 'jspdf';

function DetailedResults() {

  const navigate = useNavigate();
  const { index } = useParams();
  const location = useLocation();

  const [result, setResult] = useState(null);
  const getPassingScore = (title) => {
    const t = (title || "").toLowerCase();
    
    // 🏆 Dynamic Pass Thresholds (1000% Compliance)
    if (t.includes("ui")) return 45;
    if (t.includes("backend") || t.includes("node") || t.includes("express") || t.includes("sql") || t.includes("db") || t.includes("database")) return 35;
    
    // Default Pass Mark for all others (Python, Java, Oracle, Django, etc.)
    return 20;
  };
  const formatExamTitle = (title = "") => { return title || "Exam"; };

  useEffect(() => {
    console.log("🔍 DetailedResults - Starting data retrieval process");
    console.log("🔍 DetailedResults - URL parameter index:", index);
    
    // Helper to ensure questions and answers are parsed if they are strings
    const ensureParsed = (obj) => {
      if (!obj) return obj;
      if (typeof obj.questions === 'string') {
        try { obj.questions = JSON.parse(obj.questions); } catch (e) {
          console.error("Failed to parse stringified questions:", e);
        }
      }
      if (typeof obj.answers === 'string') {
        try { obj.answers = JSON.parse(obj.answers); } catch (e) {
          console.error("Failed to parse stringified answers:", e);
        }
      }
      // Ensure metrics are consistent (already added calculatedCorrect etc elsewhere)
      return obj;
    };

    // 1. Highly Reliable: Router state from click event
    const locationState = location.state;
    if (locationState?.result) {
      const stateData = ensureParsed(locationState.result);
      console.log("🔍 DetailedResults - Loading from Route State:", stateData);
      setResult(stateData);
      // Evict potentially stale localStorage cache to force fresh state on next load
      localStorage.removeItem("selectedExamResult");
      return;
    }

    // 2. Fallback: Check for a single cached result
    const selected = localStorage.getItem("selectedExamResult");
    if (selected) {
      const parsedResult = ensureParsed(JSON.parse(selected));
      console.log("🔍 DetailedResults - Loading from Local Cache:", parsedResult);
      setResult(parsedResult);
      return;
    }

    // 3. Fallback to index-based lookup
    const rawResults = localStorage.getItem("allExamResults");
    if (rawResults) {
      const results = JSON.parse(rawResults).map(ensureParsed);
      const foundResult = results.find(r => 
        r.random_id === index || 
        r.examDate === index || 
        r.start_time === index
      );

      if (foundResult) {
        setResult(foundResult);
      } else if (results[index]) {
        setResult(results[index]);
      } else {
        setResult(null);
      }
    } else {
       setResult(null);
    }
  }, [index, location.state]);

  const handleBack = () => {
    // Navigate back to where the user came from (e.g. Daily Reports, Weekly Reports, etc.)
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate("/dashboard/playground-results");
    }
  };

  // --- Pure Data Sanitation Sweep (No State Mutation) ---
  let parsedQuestions = [];
  if (result && result.questions) {
    let q = result.questions;
    if (typeof q === 'string') {
      try { q = JSON.parse(q); } catch (e) { q = []; }
    }
    if (typeof q === 'string') {
      try { q = JSON.parse(q); } catch (e) { q = []; }
    }
    parsedQuestions = Array.isArray(q) ? q : (typeof q === 'object' && q !== null ? Object.values(q) : []);
  }

  let parsedAnswers = [];
  if (result && result.answers) {
    let a = result.answers;
    if (typeof a === 'string') {
      try { a = JSON.parse(a); } catch (e) { a = []; }
    }
    parsedAnswers = Array.isArray(a) ? a : (typeof a === 'object' && a !== null ? Object.values(a) : []);
  }

  // ─── Shared exam calculations (computed at component scope) ───
  const totalQuestions = result?.totalQuestions || result?.total_questions || parsedQuestions.length || 20;
  
  // 🛡️ Data Integrity Check: Priority to backend synced weighted marks
  const totalMarks = result?.total_marks ?? result?.totalMarks ?? (totalQuestions * (result?.marks_per_question || 2));
  const dynamicScore = result?.marks_obtained ?? result?.score ?? 0;
  
  const passingScore = getPassingScore(result?.examTitle || result?.title || result?.exam_title);
  const passed = result?.passed ?? (dynamicScore >= passingScore);


  const passingScoreText = result && result.passed !== undefined ? "Faculty Rule Applied" : `${passingScore} marks`;

  // 🛡️ RE-VALIDATION ENGINE: Dynamically re-calculate metrics from raw question/answer arrays
  const { calculatedCorrect, calculatedIncorrect, calculatedSkipped } = (function() {
    let c = 0, i = 0, s = 0;
    parsedQuestions.forEach((q, idx) => {
      const userAnswerIndex = parsedAnswers[idx];
      const correctAnswerIndex = q.correct ?? q.correct_answer ?? 0;
      
      if (userAnswerIndex === null || userAnswerIndex === undefined || userAnswerIndex === -1) {
        s++;
      } else if (userAnswerIndex === correctAnswerIndex) {
        c++;
      } else {
        i++;
      }
    });
    
    // Fallback to result summary if arrays are missing
    if (parsedQuestions.length === 0) {
      return {
        calculatedCorrect: result?.correctAnswers ?? result?.correct_answers ?? 0,
        calculatedIncorrect: result?.incorrectAnswers ?? result?.incorrect_answers ?? 0,
        calculatedSkipped: Math.max(0, (result?.totalQuestions || 25) - ((result?.correctAnswers ?? 0) + (result?.incorrectAnswers ?? 0)))
      };
    }
    
    return { calculatedCorrect: c, calculatedIncorrect: i, calculatedSkipped: s };
  })();

  const handleDownload = () => {
    if (!result) {
      console.error("No result data available for download.");
      return;
    }

    const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
    const studentName = (result.user?.firstName || result.user?.username || "Guest").toUpperCase();
    const examDate = result.examDate ? new Date(result.examDate).toLocaleString() : "Unknown Date";

    const studentId = (() => {
      const uname = (result.user?.username || result.username || "").toLowerCase();
      const p = JSON.parse(localStorage.getItem(`sssit-profile-${uname}`) || localStorage.getItem("sssit-profile") || "{}");
      const u = storedUser;
      const pool = [p.studentId, p.student_id, u.studentId, u.student_id, result.random_id, result.randomId, result.studentId];
      for (const id of pool) {
        if (id && String(id).toLowerCase() !== uname) return id;
      }
      return "9740"; // Safe fallback
    })();

    const studentNameFromProfile = (() => {
       const uname = (result.user?.username || result.username || "").toLowerCase();
       const p = JSON.parse(localStorage.getItem(`sssit-profile-${uname}`) || localStorage.getItem("sssit-profile") || "{}");
       const u = storedUser;
       return p.fullName || p.name || p.firstName || u.fullName || u.name || u.firstName || result.user?.firstName || result.user?.username || "Student";
    })();

    const email = (() => {
      const uname = (result.user?.username || result.username || "").toLowerCase();
      const p = JSON.parse(localStorage.getItem(`sssit-profile-${uname}`) || "{}");
      const u = storedUser;
      return result.user?.email || p.email || u.email || "N/A";
    })();

    const doc = new jsPDF();
    const pageHeight = doc.internal.pageSize.height;
    let y = 20;

    const checkPage = (heightNeeded) => {
      if (y + heightNeeded > pageHeight - 20) { doc.addPage(); y = 20; return true; }
      return false;
    };

    // 🏆 Header 1: Main Title
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(63, 81, 181); 
    doc.text('Assessment Results Report', 105, y, { align: 'center' });
    y += 15;

    // 👤 Header 2: Student Details
    doc.setDrawColor(200, 200, 200);
    doc.line(20, y, 190, y);
    y += 10;
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Student Name: ${studentNameFromProfile.toUpperCase()}`, 20, y);
    doc.text(`Student ID: ${studentId}`, 130, y);
    y += 8;
    doc.text(`Email: ${email}`, 20, y);
    doc.text(`Date: ${examDate}`, 130, y);
    y += 10;
    doc.line(20, y, 190, y);
    y += 15;

    // 📊 Header 3: Performance Info
    const totalQuestions = result.total_questions || result.totalQuestions || result.questions?.length || 25;
    const correctCount = result.correct_answers ?? result.correctAnswers ?? 0;
    
    // 🛡️ Use direct synced marks
    const totalMarksVal = result.total_marks ?? result.totalMarks ?? (totalQuestions * 2);
    const finalScoreVal = result.marks_obtained ?? result.score ?? 0;
    const percentage = totalMarksVal > 0 ? ((finalScoreVal / totalMarksVal) * 100).toFixed(1) : "0.0";


    doc.setFont('helvetica', 'bold');
    doc.text('Performance Summary:', 20, y);
    doc.setFont('helvetica', 'normal');
    y += 10;
    doc.text(`Exam: ${result.examTitle || result.title || "Exam"}`, 20, y);
    y += 10;
    doc.text(`Date: ${examDate}`, 20, y);
    y += 10;
    doc.text(`Score: ${finalScoreVal} / ${totalMarksVal}`, 20, y);
    y += 10;
    doc.text(`Status: ${passed ? 'PASS' : 'FAIL'} (Req: ${passingScoreText})`, 20, y);
    y += 15;


    // 📝 Header 4: Question details
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Examination Question Paper:', 20, y);
    y += 10;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');

    const questions = result.questions || [];
    const answers = result.answers || [];

    questions.forEach((q, idx) => {
      checkPage(35);
      doc.setFont('helvetica', 'bold');
      const qText = `Q${idx + 1}: ${q.question || "No question text"}`;
      const splitQ = doc.splitTextToSize(qText, 170);
      doc.text(splitQ, 20, y);
      y += (splitQ.length * 5) + 2;

      doc.setFont('helvetica', 'normal');
      const options = q.options || [];
      options.forEach((opt, oIdx) => {
        checkPage(5);
        const optChar = String.fromCharCode(65 + oIdx);
        doc.text(`   ${optChar}. ${opt}`, 20, y);
        y += 5;
      });

      const userAnsIdx = answers[idx];
      const userAnsText = (userAnsIdx !== null && options[userAnsIdx]) ? options[userAnsIdx] : "Not Answered";
      checkPage(5);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(100, 100, 100);
      doc.text(`   Your Answer: ${userAnsText}`, 20, y);
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'normal');
      y += 8;
    });

    // 🔑 Header 5: ANSWER KEY
    doc.addPage();
    y = 20;
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Final Answer Key:', 105, y, { align: 'center' });
    y += 15;
    
    doc.setFontSize(10);
    const keyCols = 5;
    const colWidth = 35;
    
    questions.forEach((q, idx) => {
      const col = idx % keyCols;
      const row = Math.floor(idx / keyCols);
      const rowY = y + (row * 10);
      
      if (rowY > pageHeight - 20) { doc.addPage(); y = 20; }
      
      let correctIdx = q.correct ?? q.correct_answer;
      const correctChar = (correctIdx !== undefined && correctIdx !== null) ? String.fromCharCode(65 + correctIdx) : "?";
      
      doc.setFont('helvetica', 'bold');
      doc.text(`Q${idx + 1}:`, 20 + (col * colWidth), rowY);
      doc.setFont('helvetica', 'normal');
      doc.text(` [${correctChar}]`, 32 + (col * colWidth), rowY);
    });

    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(`Report safely generated on ${new Date().toLocaleString()}`, 105, pageHeight - 10, { align: 'center' });
    
    doc.save(`Assessment_Report_${studentNameFromProfile.replace(/\s+/g, '_')}_${studentId}.pdf`);
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
    <div className="min-h-screen bg-gray-50/50 py-2 px-2 sm:px-4">
      <div className="max-w-[98%] mx-auto">
        
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
          <div className={`p-1 px-8 ${passed ? "bg-emerald-600" : "bg-emerald-200"}`}></div>
          <div className="p-4 sm:p-6">
            <h2 className="text-xs font-black text-indigo-500 uppercase tracking-widest mb-6 flex items-center gap-2">
              <span className="w-8 h-[2px] bg-indigo-500"></span>
              {(result?.examTitle || result?.exam_title || result?.title || "Assessment Summary").replace(/^Daily\s+/i, "")}
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
              <div className="space-y-1">
                <p className="text-gray-400 text-sm font-medium">Student Name</p>
                <p className="text-lg font-bold text-gray-900 leading-tight">
                  {(() => {
                    const uname = (result.user?.username || result.username || "").toLowerCase();
                    const p = JSON.parse(localStorage.getItem(`sssit-profile-${uname}`) || localStorage.getItem("sssit-profile") || "{}");
                    const u = JSON.parse(localStorage.getItem("user") || "{}");
                    const name = p.fullName || p.name || p.firstName || u.fullName || u.name || u.firstName || result.user?.firstName || result.user?.username || "Student";
                    return name.toUpperCase();
                  })()}
                </p>
              </div> 
              <div className="space-y-1">
                <p className="text-gray-400 text-sm font-medium">Exam</p>
                <p className="text-lg font-bold text-gray-900 leading-tight">
                  {(result.examTitle || result.exam_title || result.title || "Exam").replace(/^Daily\s+/i, "")}
                </p>
              </div> 
              <div className="space-y-1 text-right md:text-left">
                <p className="text-gray-400 text-sm font-medium">Final Score</p>
                <p className="text-lg font-bold text-indigo-600">
                  {dynamicScore} <span className="text-gray-300 font-normal">/ {totalMarks}</span>
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
            <p className="text-green-600 font-black text-xs uppercase tracking-widest mb-2">Correct</p>
            <p className="text-5xl font-black text-gray-900 mb-1">{calculatedCorrect}</p>
            <p className="text-sm font-bold text-gray-400 italic">
               {totalQuestions > 0 ? ((calculatedCorrect / totalQuestions) * 100).toFixed(1) : 0}% Success
            </p>
          </div>

          <div className="bg-white p-4 rounded-[1.5rem] border border-gray-100 shadow-sm flex flex-col items-center text-center relative overflow-hidden group">
             <div className="absolute top-0 right-0 w-16 h-16 bg-red-50 rounded-bl-[2rem] -mr-4 -mt-4 group-hover:scale-110 transition-transform"></div>
            <p className="text-red-600 font-black text-xs uppercase tracking-widest mb-2">Incorrect</p>
            <p className="text-5xl font-black text-gray-900 mb-1">
               {calculatedIncorrect}
            </p>
            <p className="text-sm font-bold text-gray-400 italic">Missed Potential</p>
          </div>

          <div className="bg-white p-4 rounded-[1.5rem] border border-gray-100 shadow-sm flex flex-col items-center text-center relative overflow-hidden group">
             <div className="absolute top-0 right-0 w-16 h-16 bg-gray-50 rounded-bl-[2rem] -mr-4 -mt-4 group-hover:scale-110 transition-transform"></div>
            <p className="text-gray-500 font-black text-xs uppercase tracking-widest mb-2">Skipped</p>
            <p className="text-5xl font-black text-gray-900 mb-1">
               {calculatedSkipped}
            </p>
            <p className="text-sm font-bold text-gray-400 italic">Not Analyzed</p>
          </div>

        </div>

        {/* DETAILED ANALYSIS SECTION */}
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-2 px-4">
             <h3 className="text-lg font-bold text-gray-700 tracking-tight">
               Question Breakdown <span className="text-xs font-black text-indigo-400 ml-2 uppercase tracking-widest">{parsedQuestions.length} Items</span>
             </h3>
             <div className="h-[1px] flex-grow mx-8 bg-gray-100 hidden sm:block"></div>
          </div>

          {parsedQuestions.length > 0 ? (
            <div className="space-y-6">
              {parsedQuestions.map((question, questionIndex) => {
                const questionText = question?.question || `Assessment Item ${questionIndex + 1}`;
                const options = Array.isArray(question?.options) ? question.options : [];
                const correctAnswerIndex = question?.correct ?? 0;
                const userAnswerIndex = result?.answers ? result.answers[questionIndex] : null;
                const isCorrect = userAnswerIndex === correctAnswerIndex;
                const notAttempted = userAnswerIndex === null || userAnswerIndex === undefined;
                const isCoding = question?.type === 'coding' || !options || options.length === 0;

                if (isCoding) {
                  return (
                    <div 
                      key={questionIndex} 
                      className={`bg-white rounded-[2rem] border-2 overflow-hidden shadow-sm transition-all duration-300 ${
                        isCorrect ? 'border-green-100 shadow-green-50/50' : 'border-red-100 shadow-red-50/50'
                      }`}
                    >
                      <div className="p-6 sm:p-8">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                          <div className="flex-1">
                            <p className="text-xs font-black text-gray-400 tracking-widest uppercase mb-1">Question {questionIndex + 1} • CODING CHALLENGE</p>
                            <h4 className="text-lg font-bold text-gray-900 leading-snug">
                              {questionText}
                            </h4>
                          </div>
                          <div className={`shrink-0 flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {isCorrect ? '● Correct Code' : '● Incorrect Code'}
                          </div>
                        </div>

                        <div className="space-y-4">
                           <div className="bg-gray-900 rounded-3xl p-5 relative group overflow-hidden border border-gray-800 shadow-2xl">
                              <div className="flex justify-between items-center mb-3">
                                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Student Submission</span>
                                <span className="text-[9px] font-mono text-gray-500">{question.language || 'python'}</span>
                              </div>
                              <pre className="text-green-400 font-mono text-sm leading-relaxed overflow-x-auto selection:bg-indigo-500/30">
                                {userAnswerIndex || "# No code was submitted for this question"}
                              </pre>
                           </div>

                           {question.testCases && question.testCases.length > 0 && (
                             <div className="bg-blue-50/50 rounded-2xl p-4 border border-blue-100/50">
                                <p className="text-[10px] font-black text-blue-800 uppercase tracking-widest mb-1 flex items-center gap-2">
                                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                                  Automated Validation Result
                                </p>
                                <p className="text-xs text-blue-600 font-medium">
                                   {isCorrect ? "Implementation successfully passed all functional requirements." : "Implementation did not meet all required criteria for this challenge."}
                                </p>
                             </div>
                           )}
                        </div>
                      </div>
                    </div>
                  );
                }

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
              <div className="mb-4">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📋</span>
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-600 mb-2">Question Analysis Not Available</h3>
              <p className="text-gray-400 mb-4">This exam result doesn't include detailed question breakdown.</p>
              
              {/* Show helpful info based on what data is available */}
              {result && (
                <div className="bg-gray-50 p-4 rounded-lg text-left max-w-md mx-auto text-sm">
                  <p className="font-semibold mb-2">Available Data:</p>
                  <ul className="text-gray-600 space-y-1">
                    <li>• Score: {result.score || 0}/{result.totalMarks || 0}</li>
                    <li>• Correct Answers: {result.correctAnswers || 0}</li>
                    <li>• Incorrect Answers: {result.incorrectAnswers || 0}</li>
                    <li>• Total Questions: {result.totalQuestions || 0}</li>
                    <li>• Student ID: {result.user?.randomId || result.random_id || 'N/A'}</li>
                    <li>• Exam Date: {new Date(result.examDate || Date.now()).toLocaleDateString()}</li>
                  </ul>
                </div>
              )}
              
              <div className="mt-4 text-xs text-gray-400">
                <p>Note: New exams will include complete question analysis.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DetailedResults;
