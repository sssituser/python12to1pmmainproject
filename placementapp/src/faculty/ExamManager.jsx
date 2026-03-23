import React, { useState } from "react";
import axios from "axios";

function ExamManager() {
  const [questions, setQuestions] = useState([]);
  const [maxQuestions, setMaxQuestions] = useState(50);
  const [category, setCategory] = useState("Weekly");
  const [settingsSaved, setSettingsSaved] = useState(false);
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

  // Save only the category & maxQuestions limit (never touches saved questions)
  const handleConfirmSettings = async () => {
    try {
      const payload = {
        category,
        maxQuestions: parseInt(maxQuestions, 10) || 1,
        // DO NOT send questions here — we don't want to overwrite them
      };
      
      const res = await axios.post("http://127.0.0.1:8000/api/admin/exam-settings/", payload);
      
      if (res.data && res.data.success) {
        setSettingsSaved(true);
        setTimeout(() => setSettingsSaved(false), 3000);
      }
    } catch (err) {
      console.error("Failed to save exam settings:", err);
    }
  };

  // Save questions list to backend (category + questions, no maxQuestions override)
  const saveQuestionsToBackend = async (questionsToSave) => {
    try {
      const payload = {
        category,
        questions: questionsToSave
      };
      await axios.post("http://127.0.0.1:8000/api/admin/exam-settings/", payload);
    } catch (err) {
      console.error("Failed to save questions:", err);
    }
  };

  // add question
  const addQuestion = () => {
    if (!form.question || !form.answer) {
      alert("Fill all question fields and select the correct answer!");
      return;
    }

    const newQuestionArray = [...questions, { ...form, id: Date.now() }];
    setQuestions(newQuestionArray);
    
    // Automatically save questions to backend instantly
    saveQuestionsToBackend(newQuestionArray);

    // reset form
    setForm({
      question: "",
      options: ["", "", "", ""],
      answer: "",
    });
  };

  // delete question
  const deleteQuestion = (id) => {
    const updatedQuestions = questions.filter((q) => q.id !== id);
    setQuestions(updatedQuestions);
    
    // Automatically save questions to backend instantly
    saveQuestionsToBackend(updatedQuestions);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">

      <h1 className="text-3xl font-bold mb-6 text-gray-800">Exam Manager (Faculty)</h1>

      {/* EXAM SETTINGS */}
      <div className="bg-white p-5 shadow rounded-lg mb-6 border border-gray-100">
        <h2 className="text-lg font-semibold mb-3 text-gray-700">Exam Settings</h2>
        
        <div className="bg-blue-50 p-4 rounded border border-blue-100 flex flex-col md:flex-row gap-6 mb-4">
          
          {/* CATEGORY DROPDOWN */}
          <div className="flex-1">
            <label className="block text-sm font-semibold text-blue-800 mb-2">
              Select Exam Category:
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-300"
            >
              <option value="Weekly">Weekly Exam</option>
              <option value="Monthly">Monthly Exam</option>
            </select>
          </div>

          {/* MAX QUESTIONS LIMIT */}
          <div className="flex-1">
            <label className="block text-sm font-semibold text-blue-800 mb-2">
              Max Questions to Display:
            </label>
            <input
              type="number"
              min="1"
              value={maxQuestions}
              onChange={(e) => setMaxQuestions(e.target.value)}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-300"
            />
            <p className="text-xs text-blue-600 mt-2">
              Prevents crashing by enforcing an upper limit.
            </p>
          </div>

        </div>

        {/* CONFIRM SETTINGS BUTTON */}
        <button
          onClick={() => handleConfirmSettings()}
          className={`px-5 py-2 rounded-lg font-medium transition ${
            settingsSaved 
            ? "bg-green-500 hover:bg-green-600 text-white" 
            : "bg-blue-600 hover:bg-blue-700 text-white"
          }`}
        >
          {settingsSaved ? "✅ Verified & Saved!" : "Confirm Settings"}
        </button>

      </div>

      {/* QUESTION FORM */}
      <div className="bg-white p-6 shadow rounded-lg mb-6 border border-gray-100">
        <h2 className="text-lg font-semibold mb-4 text-gray-700">Add New Question</h2>
        
        <input
          type="text"
          placeholder="Enter question text..."
          value={form.question}
          onChange={handleChange}
          className="w-full mb-4 p-3 border rounded focus:outline-none focus:border-blue-500"
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