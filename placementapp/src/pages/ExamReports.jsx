import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faDownload, faTrash, faPlus } from "@fortawesome/free-solid-svg-icons";

// Master question list (same as in PythonExam.jsx)
const masterQuestions = [
  {
    id: 1,
    question: "What is the output of print(2 ** 3)?",
    options: ["6", "8", "9", "12"],
    correct: 1,
  },
  {
    id: 2,
    question: "Which keyword is used to define a function in Python?",
    options: ["func", "def", "function", "define"],
    correct: 1,
  },
  {
    id: 3,
    question: "What is the correct file extension for Python files?",
    options: [".py", ".python", ".pt", ".pyth"],
    correct: 0,
  },
  {
    id: 4,
    question: "Which of the following is a mutable data type in Python?",
    options: ["Tuple", "String", "List", "Integer"],
    correct: 2,
  },
  {
    id: 5,
    question: "What does len() function do in Python?",
    options: [
      "Returns the length of an object",
      "Deletes an object",
      "Creates an object",
      "Copies an object",
    ],
    correct: 0,
  },
  {
    id: 6,
    question: "Which operator is used for exponentiation in Python?",
    options: ["^", "**", "*", "^^"],
    correct: 1,
  },
  {
    id: 7,
    question: "What is the output of type('hello')?",
    options: [
      "<class 'int'>",
      "<class 'str'>",
      "<class 'string'>",
      "<class 'char'>",
    ],
    correct: 1,
  },
  {
    id: 8,
    question: "Which method is used to add an element to the end of a list?",
    options: ["add()", "append()", "insert()", "extend()"],
    correct: 1,
  },
  {
    id: 9,
    question: "How do you create a dictionary in Python?",
    options: ["{}", "[]", "()", "||"],
    correct: 0,
  },
  {
    id: 10,
    question: "Which statement is used to exit a loop prematurely?",
    options: ["exit", "break", "continue", "return"],
    correct: 1,
  },
  {
    id: 11,
    question: "What is the output of int(3.7)?",
    options: ["3.33", "3", "4", "Error"],
    correct: 1,
  },
  {
    id: 12,
    question: "Which function is used to get user input in Python 3?",
    options: ["input()", "raw_input()", "scanf()", "cin()"],
    correct: 0,
  },
  {
    id: 13,
    question: "What is the default value of a variable in Python?",
    options: ["0", "None", "null", "undefined"],
    correct: 1,
  },
  {
    id: 14,
    question: "Which module is used for mathematical operations in Python?",
    options: ["math", "cmath", "maths", "calc"],
    correct: 0,
  },
  {
    id: 15,
    question: "What is the output of bool([])?",
    options: ["True", "False", "0", "Error"],
    correct: 1,
  },
  {
    id: 16,
    question:
      "Which method is used to remove whitespace from both ends of a string?",
    options: ["trim()", "strip()", "remove()", "clean()"],
    correct: 1,
  },
  {
    id: 17,
    question: "What is the output of list(range(5))?",
    options: ["[0, 1, 2, 3, 4]", "range(0, 5)", "0, 1, 2, 3, 4", "Error"],
    correct: 0,
  },
  {
    id: 18,
    question: "Which keyword is used to handle exceptions in Python?",
    options: ["try", "except", "catch", "handle"],
    correct: 1,
  },
  {
    id: 19,
    question: "What is the output of 'Hello' * 3?",
    options: ["HelloHelloHello", "Hello 3", "Hello3", "Error"],
    correct: 0,
  },
  {
    id: 20,
    question: "Which function is used to open a file in Python?",
    options: ["open()", "file()", "read()", "load()"],
    correct: 0,
  },
];

const ExamReports = () => {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);

  // Permanently keep reports empty - never load from localStorage
  useEffect(() => {
    // Always keep empty - never load any data
    // Clear any existing data from localStorage
    localStorage.removeItem("allExamResults");
    setReports([]);
    setLoading(false);
  }, []);

  const handleView = (report) => {
    setSelected(report);
  };

  const handleBack = () => {
    setSelected(null);
  };

  const handleDelete = (examDate) => {
    if (window.confirm('Are you sure you want to delete this exam result?')) {
      const updatedReports = reports.filter(r => r.examDate !== examDate);
      setReports(updatedReports);
      localStorage.setItem('allExamResults', JSON.stringify(updatedReports));
      if (selected && selected.examDate === examDate) {
        setSelected(null);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading exam reports...</p>
        </div>
      </div>
    );
  }

  if (selected) {
    const passed = (selected.correctAnswers * 2) >= 20; // Passing if 20 marks or more (50%)
    const incorrectAnswers = selected.answers ? 
      selected.answers.filter((answer, index) => {
        const question = selected.questions ? selected.questions[index] : masterQuestions[index];
        return answer !== null && answer !== question.correct;
      }).length : 
      (selected.totalQuestions - selected.correctAnswers);

    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <button onClick={handleBack} className="text-blue-600 hover:underline">
              ← Back to Reports
            </button>
            <div className="flex gap-2">
              <button onClick={() => handleDownload(selected)} className="bg-gray-600 text-white px-3 py-2 rounded hover:bg-gray-700 transition" title="Download Report">
                <FontAwesomeIcon icon={faDownload} />
              </button>
              <button onClick={() => handleDelete(selected.examDate)} className="bg-red-600 text-white px-3 py-2 rounded hover:bg-red-700 transition" title="Delete Result">
                <FontAwesomeIcon icon={faTrash} />
              </button>
            </div>
          </div>

          <h1 className="text-3xl font-bold mb-2">{selected.examTitle || 'Exam Results'}</h1>
          
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <p className="text-gray-600">Student</p>
              <p className="font-semibold">{selected.user?.firstName || selected.user?.username || 'Unknown'}</p>
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
              {passed ? 'Pass' : 'Fail'}
            </h2>
            <div className={`text-4xl font-bold ${passed ? 'text-green-600' : 'text-red-600'}`}>
              {selected.correctAnswers * 2}/40
            </div>
            {selected.correctAnswers === 0 && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>Keep Learning!</strong> Review all questions below to see the correct answers and improve next time.
                </p>
              </div>
            )}
          </div>

          {selected && (
            <div className="mb-6">
              <h3 className="text-xl font-bold mb-4">Complete Question Analysis (20 Questions)</h3>
              
              {selected.correctAnswers === 0 && (
                <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-blue-800 font-semibold">
                    📚 Learning Opportunity! All 20 questions are shown below with correct answers highlighted.
                  </p>
                  <p className="text-blue-700 text-sm mt-1">
                    Study each question carefully to understand the correct answers for your next attempt.
                  </p>
                </div>
              )}
              
              {/* Summary Stats */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-green-50 p-4 rounded-lg text-center border border-green-200">
                  <div className="text-2xl font-bold text-green-600">{selected.correctAnswers || 0}</div>
                  <div className="text-sm text-green-700">Correct Answers</div>
                </div>
                <div className="bg-red-50 p-4 rounded-lg text-center border border-red-200">
                  <div className="text-2xl font-bold text-red-600">{incorrectAnswers || 0}</div>
                  <div className="text-sm text-red-700">Wrong Answers</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg text-center border border-gray-200">
                  <div className="text-2xl font-bold text-gray-600">{(selected.totalQuestions || 20) - (selected.correctAnswers || 0) - (incorrectAnswers || 0)}</div>
                  <div className="text-sm text-gray-700">Not Attempted</div>
                </div>
              </div>

              {/* Enhanced Legend for Zero Score */}
              <div className="bg-gray-50 p-3 rounded-lg mb-4">
                <div className="flex items-center gap-6 text-sm mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-100 border border-green-400 rounded"></div>
                    <span>Correct Answer ✓</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-red-100 border border-red-400 rounded"></div>
                    <span>Your Wrong Answer ✗</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-gray-50 border border-gray-300 rounded"></div>
                    <span>Other Options</span>
                  </div>
                </div>
                {selected.correctAnswers === 0 && (
                  <div className="text-xs text-blue-600 font-semibold mt-2">
                    💡 Focus on the green highlighted answers - these are the correct ones!
                  </div>
                )}
              </div>

              {/* Show questions - always display all questions for learning */}
              <div className="space-y-4">
                {(selected.questions || masterQuestions).map((q, i) => {
                  const userAnswer = selected.answers?.[i];
                  const isCorrect = userAnswer === q.correct;
                  const notAttempted = userAnswer === null || userAnswer === undefined;

                  return (
                      <div key={i} className={`border rounded-lg p-4 ${
                        notAttempted ? 'border-gray-200 bg-gray-50' :
                        isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                      }`}>
                        <div className="flex justify-between items-start mb-3">
                          <h4 className="font-semibold text-lg">Q{i + 1}: {q.question}</h4>
                          <span className={`px-3 py-1 rounded text-sm font-bold ${
                            notAttempted ? 'bg-gray-200 text-gray-700' :
                            isCorrect ? 'bg-green-200 text-green-700' : 'bg-red-200 text-red-700'
                          }`}>
                            {notAttempted ? 'Not Attempted' : isCorrect ? 'Correct ✓' : 'Incorrect ✗'}
                          </span>
                        </div>
                        <div className="space-y-2 text-sm">
                          {q.options.map((opt, idx) => {
                            const isCorrectAnswer = idx === q.correct;
                            const isUserWrongAnswer = idx === userAnswer && !isCorrect && !notAttempted;
                            
                          return (
                              <div key={idx} className={`p-3 rounded border-2 ${
                                isCorrectAnswer ? 'bg-green-100 border-green-400 font-semibold' :
                                isUserWrongAnswer ? 'bg-red-100 border-red-400' : 'bg-gray-50 border-gray-300'
                              }`}>
                                <div className="flex items-center justify-between">
                                  <span>{String.fromCharCode(65 + idx)}. {opt}</span>
                                  <div className="flex items-center gap-2">
                                    {isCorrectAnswer && <span className="text-green-600 font-bold">✓ Correct</span>}
                                    {isUserWrongAnswer && <span className="text-red-600 font-bold">✗ Your Answer</span>}
                                    {!isCorrectAnswer && !isUserWrongAnswer && <span className="text-gray-400">—</span>}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        {!notAttempted && (
                          <div className="mt-3 pt-3 border-t border-gray-200 text-sm">
                            <span className="text-gray-600">Your answer: </span>
                            <span className={`font-semibold ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                              {String.fromCharCode(65 + userAnswer)}. {q.options[userAnswer]}
                            </span>
                            {!isCorrect && (
                              <span className="text-gray-600 ml-2">
                                (Correct: {String.fromCharCode(65 + q.correct)}. {q.options[q.correct]})
                              </span>
                            )}
                          </div>
                        )}
                        {notAttempted && (
                          <div className="mt-3 pt-3 border-t border-gray-200 text-sm">
                            <span className="text-gray-600">This question was not attempted. </span>
                            <span className="text-green-600 font-semibold">
                              Correct answer: {String.fromCharCode(65 + q.correct)}. {q.options[q.correct]}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Completely empty page - no content */}
      </div>
    </div>
  );
};

export default ExamReports;
