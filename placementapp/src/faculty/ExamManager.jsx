import { useState } from "react";

function ExamManager() {
  const [questions, setQuestions] = useState([]);
  const [form, setForm] = useState({
    question: "",
    options: ["", "", "", ""],
    answer: "",
  });

  // handle input
  const handleChange = (e) => {
    setForm({ ...form, question: e.target.value });
  };

  // handle option change
  const handleOptionChange = (index, value) => {
    const newOptions = [...form.options];
    newOptions[index] = value;
    setForm({ ...form, options: newOptions });
  };

  // handle answer select
  const handleAnswer = (opt) => {
    setForm({ ...form, answer: opt });
  };

  // add question
  const addQuestion = () => {
    if (!form.question || !form.answer) {
      alert("Fill all fields");
      return;
    }

    setQuestions([...questions, { ...form, id: Date.now() }]);

    // reset form
    setForm({
      question: "",
      options: ["", "", "", ""],
      answer: "",
    });
  };

  // delete question
  const deleteQuestion = (id) => {
    setQuestions(questions.filter((q) => q.id !== id));
  };

  return (
    <div className="p-6">

      <h1 className="text-2xl font-bold mb-4">Exam Manager (Faculty)</h1>

      {/* FORM */}
      <div className="bg-white p-4 shadow rounded mb-6">
        <input
          type="text"
          placeholder="Enter question"
          value={form.question}
          onChange={handleChange}
          className="w-full mb-3 p-2 border rounded"
        />

        {form.options.map((opt, i) => (
          <input
            key={i}
            type="text"
            placeholder={`Option ${i + 1}`}
            value={opt}
            onChange={(e) => handleOptionChange(i, e.target.value)}
            className="w-full mb-2 p-2 border rounded"
          />
        ))}

        {/* Select Answer */}
        <div className="mb-3">
          <p className="font-semibold mb-1">Select Correct Answer:</p>
          {form.options.map((opt, i) => (
            <button
              key={i}
              onClick={() => handleAnswer(opt)}
              className={`mr-2 mb-2 px-3 py-1 border rounded ${
                form.answer === opt
                  ? "bg-green-500 text-white"
                  : "bg-gray-200"
              }`}
            >
              {opt || `Option ${i + 1}`}
            </button>
          ))}
        </div>

        <button
          onClick={addQuestion}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Add Question
        </button>
      </div>

      {/* QUESTION LIST */}
      <div className="space-y-4">
        {questions.length === 0 && (
          <p className="text-gray-500">No questions added yet</p>
        )}

        {questions.map((q, index) => (
          <div key={q.id} className="bg-white p-4 shadow rounded">
            <h3 className="font-semibold">
              {index + 1}. {q.question}
            </h3>

            <ul className="ml-4 mt-2">
              {q.options.map((opt, i) => (
                <li
                  key={i}
                  className={`${
                    opt === q.answer ? "text-green-600 font-bold" : ""
                  }`}
                >
                  {opt}
                </li>
              ))}
            </ul>

            <button
              onClick={() => deleteQuestion(q.id)}
              className="mt-2 text-red-500"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ExamManager;