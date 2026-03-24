import React, { useState } from "react";
import axios from "axios";

function ExamManager() {
  const [questions, setQuestions] = useState([]);
  const [maxQuestions, setMaxQuestions] = useState(50);
  const [duration, setDuration] = useState(45); // duration in minutes
  const [passingRule, setPassingRule] = useState("percentage"); // "percentage" or "correct_answers"
  const [passingValue, setPassingValue] = useState(50); // 50% or 15 correct
  const [category, setCategory] = useState("Weekly");
  const [settingsSaved, setSettingsSaved] = useState(false);
  const [form, setForm] = useState({
    question: "",
    options: ["", "", "", ""],
    answer: "",
    marks: 2, // default marks
  });

  // Fetch existing settings when category changes
  React.useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await axios.get(`http://127.0.0.1:8000/api/admin/exam-settings/?category=${category}`);
        if (res.data && res.data.success && res.data.data) {
          const { maxQuestions: savedMax, questions: savedQuestions, passingRule: rule, passingValue: val, duration: savedDuration } = res.data.data;
          setMaxQuestions(savedMax || 50);
          setQuestions(savedQuestions || []);
          setPassingRule(rule || "percentage");
          setPassingValue(val !== undefined ? val : 50);
          setDuration(savedDuration || 45);
        }
      } catch (err) {
        console.error("Failed to fetch settings:", err);
      }
    };
    fetchSettings();
  }, [category]);

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
        duration: parseInt(duration, 10) || 1,
        passingRule,
        passingValue: parseInt(passingValue, 10) || 0,
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

  // Save questions list to backend
  const saveQuestionsToBackend = async (questionsToSave, categoryToSave) => {
    try {
      const payload = {
        category: categoryToSave,
        questions: questionsToSave
      };
      const res = await axios.post("http://127.0.0.1:8000/api/admin/exam-settings/", payload);
      if (res.data && res.data.success) {
        console.log("✅ Questions saved");
      }
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
    saveQuestionsToBackend(newQuestionArray, category);

    // reset form
    setForm({
      question: "",
      options: ["", "", "", ""],
      answer: "",
      marks: 2,
    });
  };

  // delete question
  const deleteQuestion = (id) => {
    const updatedQuestions = questions.filter((q) => q.id !== id);
    setQuestions(updatedQuestions);
    saveQuestionsToBackend(updatedQuestions, category);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto pb-20">

      <h1 className="text-3xl font-bold mb-6 text-gray-800">Exam Manager</h1>

      {/* EXAM SETTINGS */}
      <div className="bg-white p-5 shadow rounded-lg mb-6 border border-gray-100">
        <h2 className="text-lg font-semibold mb-3 text-gray-700">Exam Settings & Passing Rules</h2>
        
        <div className="bg-blue-50 p-4 rounded border border-blue-100 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-4">
          
          <div>
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

          <div>
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
          </div>

          <div>
            <label className="block text-sm font-semibold text-blue-800 mb-2">
               Exam Duration (Minutes):
            </label>
            <input
              type="number"
              min="1"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-300"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-blue-800 mb-2">
              Passing Rule Type:
            </label>
            <select
              value={passingRule}
              onChange={(e) => setPassingRule(e.target.value)}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-300"
            >
              <option value="percentage">Percentage (%)</option>
              <option value="correct_answers">Minimum Correct Answers</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-blue-800 mb-2">
              Required Value to Pass:
            </label>
            <input
              type="number"
              value={passingValue}
              onChange={(e) => setPassingValue(e.target.value)}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-300"
              placeholder={passingRule === "percentage" ? "e.g. 50" : "e.g. 15"}
            />
          </div>

        </div>

        <div className="mb-4">
            <p className="text-sm font-medium text-blue-700 bg-blue-100 p-2 rounded inline-block">
              {passingRule === "percentage" 
                ? "Requirement: Student must score " + passingValue + "% marks within " + duration + " minutes." 
                : "Requirement: Student must get at least " + passingValue + " correct answers within " + duration + " minutes."}
            </p>
        </div>

        <button
          onClick={() => handleConfirmSettings()}
          className={`px-5 py-2 rounded-lg font-medium transition ${
            settingsSaved 
            ? "bg-green-500 hover:bg-green-600 text-white" 
            : "bg-blue-600 hover:bg-blue-700 text-white"
          }`}
        >
          {settingsSaved ? "Saved" : "Confirm"}
        </button>

      </div>

      {/* QUESTION FORM */}
      <div className="bg-white p-6 shadow rounded-lg mb-6 border border-gray-100">
        <h2 className="text-lg font-semibold mb-4 text-gray-700">Add New Question</h2>
        
        <div className="flex gap-4 mb-4">
          <input
            type="text"
            placeholder="Enter question text..."
            value={form.question}
            onChange={handleChange}
            className="flex-1 p-3 border rounded focus:outline-none focus:border-blue-500"
          />
          <div style={{ width: "100px" }}>
             <label className="text-xs font-bold text-gray-500 uppercase">Marks</label>
             <input
               type="number"
               value={form.marks}
               onChange={(e) => setForm({...form, marks: parseInt(e.target.value) || 0})}
               className="w-full p-2 border rounded"
             />
          </div>
        </div>

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
      <div className="mt-10 mb-6 flex items-center justify-between border-b pb-4">
        <h2 className="text-2xl font-black text-gray-800 tracking-tight">
          Current {category} Questions
        </h2>
        <span className="bg-gray-100 text-gray-600 px-4 py-1.5 rounded-full text-sm font-bold shadow-sm ring-1 ring-gray-200">
          Total: {questions.length} / {maxQuestions}
        </span>
      </div>

      <div className="space-y-4">
        {questions.length === 0 && (
          <p className="text-gray-500">No questions added yet</p>
        )}

        {questions.map((q, index) => (
          <div key={q.id} className="bg-white p-4 shadow rounded">
            <h3 className="font-semibold">
              {index + 1}. {q.question} 
              <span className="ml-2 bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded">
                {q.marks || 0} Marks
              </span>
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