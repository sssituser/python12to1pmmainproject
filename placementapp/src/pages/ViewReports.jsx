import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload, faTrash } from "@fortawesome/free-solid-svg-icons";
import { View } from "@react-three/drei";

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
];

const ViewReports = () => {

  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("allExamResults") || "[]");
    setReports(data);
    setLoading(false);
  }, []);

  const handleBack = () => {
    setSelected(null);
  };

  const handleView = (report) => {
    setSelected(report);
  };

  const handleDelete = (examDate) => {
    const updated = reports.filter((r) => r.examDate !== examDate);
    setReports(updated);
    localStorage.setItem("allExamResults", JSON.stringify(updated));
  };

  const handleDownload = (result) => {

    const content = `
Student: ${result.user?.firstName}
Score: ${result.correctAnswers * 2}/40
Date: ${new Date(result.examDate).toLocaleString()}
`;

    const blob = new Blob([content], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "exam-result.txt";

    document.body.appendChild(a);
    a.click();

    document.body.removeChild(a);
  };

  if (loading) {
    return <div className="p-10 text-center">Loading...</div>;
  }

  if (selected) {

    const passed = (selected.correctAnswers * 2) >= 20;

    return (
      <div className="p-6">

        <button
          onClick={handleBack}
          className="mb-6 text-blue-600"
        >
          ← Back
        </button>

        <h2 className="text-2xl font-bold mb-6">
          Question Analysis
        </h2>

        {(selected.questions || masterQuestions).map((q, i) => {

          const userAnswer = selected.answers?.[i];

          return (
            <div key={i} className="border p-4 mb-4 rounded">

              <h3 className="font-semibold">
                Q{i + 1}: {q.question}
              </h3>

              {q.options.map((opt, idx) => {

                const correct = idx === q.correct;
                const selectedAns = idx === userAnswer;

                return (
                  <div
                    key={idx}
                    className={`p-2 mt-2 rounded ${
                      correct
                        ? "bg-green-100"
                        : selectedAns
                        ? "bg-red-100"
                        : "bg-gray-50"
                    }`}
                  >
                    {String.fromCharCode(65 + idx)}. {opt}
                    {correct && " ✓ Correct"}
                    {selectedAns && !correct && " ✗ Your Answer"}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="p-6">

      <h2 className="text-2xl font-bold mb-6">
        Exam Reports
      </h2>

      {reports.length === 0 && (
        <p>No reports available.</p>
      )}

      {reports.map((r, i) => (

        <div
          key={i}
          className="border p-4 mb-3 flex justify-between items-center"
        >

          <div>
            {r.user?.firstName} - {r.correctAnswers * 2}/40
          </div>

          <div className="flex gap-3">

            <button onClick={() => handleView(r)}>
              View
            </button>

            <button onClick={() => handleDownload(r)}>
              <FontAwesomeIcon icon={faDownload} />
            </button>

            <button onClick={() => handleDelete(r.examDate)}>
              <FontAwesomeIcon icon={faTrash} />
            </button>

          </div>

        </div>

      ))}

    </div>
  );
};

export default ViewReports;