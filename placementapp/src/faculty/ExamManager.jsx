import React, { useState, useEffect } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faSave, 
  faCheckCircle, 
  faSpinner, 
  faPlus, 
  faTrash, 
  faInfoCircle,
  faHistory
} from "@fortawesome/free-solid-svg-icons";

function ExamManager() {
  const [questions, setQuestions] = useState([]);
  const [maxQuestions, setMaxQuestions] = useState(50);
  const [duration, setDuration] = useState(45); // duration in minutes
  const [passingRule, setPassingRule] = useState("percentage"); // "percentage" or "correct_answers"
  const [passingValue, setPassingValue] = useState(50); // 50% or 15 correct
  const [category, setCategory] = useState("Weekly");
  const [settingsSaved, setSettingsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isQuestionsSaving, setIsQuestionsSaving] = useState(false);

  const [form, setForm] = useState({
    type: "mcq", // "mcq" or "coding"
    question: "",
    options: ["", "", "", ""],
    answer: "",
    language: "python",
    testCases: [{ input: "", output: "" }],
    marks: 2, // default marks
  });

  const BASE_URL = "http://127.0.0.1:8000/api/admin/exam-settings/";

  // Fetch existing settings when category changes
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await axios.get(`${BASE_URL}?category=${category}`);
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

  // handle test case change
  const handleTestCaseChange = (index, field, value) => {
    const newTestCases = [...form.testCases];
    newTestCases[index][field] = value;
    setForm({ ...form, testCases: newTestCases });
  };

  const addTestCase = () => {
    setForm({ ...form, testCases: [...form.testCases, { input: "", output: "" }] });
  };

  const removeTestCase = (index) => {
    const newTestCases = form.testCases.filter((_, i) => i !== index);
    setForm({ ...form, testCases: newTestCases });
  };

  // Save Exam Rules (category, limit, duration, passing rules)
  const handleConfirmSettings = async () => {
    setIsSaving(true);
    try {
      const payload = {
        category,
        maxQuestions: parseInt(maxQuestions, 10) || 1,
        duration: parseInt(duration, 10) || 1,
        passingRule,
        passingValue: parseInt(passingValue, 10) || 0,
      };
      
      const res = await axios.post(BASE_URL, payload);
      
      if (res.data && res.data.success) {
        setSettingsSaved(true);
        setTimeout(() => setSettingsSaved(false), 3000);
      } else {
        alert("Server error: " + (res.data.message || "Could not save settings."));
      }
    } catch (err) {
      console.error("Failed to save exam settings:", err);
      alert("Error: Connection to backend failed. Please check if server is running.");
    } finally {
      setIsSaving(false);
    }
  };

  // Save questions list to backend
  const saveQuestionsToBackend = async (questionsToSave, categoryToSave) => {
    setIsQuestionsSaving(true);
    try {
      const payload = {
        category: categoryToSave,
        questions: questionsToSave
      };
      const res = await axios.post(BASE_URL, payload);
      if (res.data && res.data.success) {
        console.log("✅ Questions synced to " + categoryToSave);
      } else {
        console.error("Failed to sync questions:", res.data.message);
      }
    } catch (err) {
      console.error("Failed to save questions:", err);
    } finally {
      setIsQuestionsSaving(false);
    }
  };

  // add question
  const addQuestion = () => {
    if (!form.question) {
      alert("Fill the question field!");
      return;
    }

    if (form.type === "mcq" && !form.answer) {
      alert("Select the correct answer for MCQ!");
      return;
    }

    const newQuestionArray = [...questions, { ...form, id: Date.now() }];
    setQuestions(newQuestionArray);
    saveQuestionsToBackend(newQuestionArray, category);

    // reset form
    setForm({
      type: "mcq",
      question: "",
      options: ["", "", "", ""],
      answer: "",
      marks: 2,
      language: "python",
      testCases: [{ input: "", output: "" }],
    });
  };

  // delete question
  const deleteQuestion = (id) => {
    // if (!window.confirm("Are you sure you want to delete this question?")) return;
    const updatedQuestions = questions.filter((q) => q.id !== id);
    setQuestions(updatedQuestions);
    saveQuestionsToBackend(updatedQuestions, category);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto pb-20">

      <h1 className="text-3xl font-bold mb-6 text-gray-800 flex items-center gap-3">
         <FontAwesomeIcon icon={faHistory} className="text-blue-600" />
         Exam Manager
      </h1>

      {/* EXAM SETTINGS */}
      <div className="bg-white p-6 shadow-lg rounded-2xl mb-8 border border-gray-100 ring-1 ring-gray-200">
        <h2 className="text-lg font-bold mb-4 text-gray-700 flex items-center gap-2">
           <FontAwesomeIcon icon={faInfoCircle} className="text-blue-500" />
           Assessment Rules & Configuration
        </h2>
        
        <div className="bg-blue-50/50 p-5 rounded-xl border border-blue-100 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          
          <div>
            <label className="block text-xs font-black uppercase text-blue-900 mb-2 tracking-wider">
              Exam Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full p-2.5 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-400 bg-white shadow-sm"
            >
              <option value="Weekly">Weekly Exam</option>
              <option value="Monthly">Monthly Exam</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-black uppercase text-blue-900 mb-2 tracking-wider">
              Max Questions To Display
            </label>
            <input
              type="number"
              min="1"
              value={maxQuestions}
              onChange={(e) => setMaxQuestions(e.target.value)}
              className="w-full p-2.5 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-400 bg-white shadow-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-black uppercase text-blue-900 mb-2 tracking-wider">
               Duration (Mins)
            </label>
            <input
              type="number"
              min="1"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-full p-2.5 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-400 bg-white shadow-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-black uppercase text-blue-900 mb-2 tracking-wider">
              Passing Strategy
            </label>
            <select
              value={passingRule}
              onChange={(e) => setPassingRule(e.target.value)}
              className="w-full p-2.5 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-400 bg-white shadow-sm"
            >
              <option value="percentage">Percentage (%)</option>
              <option value="correct_answers">Correct Answers</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-black uppercase text-blue-900 mb-2 tracking-wider">
              Requirement
            </label>
            <input
              type="number"
              value={passingValue}
              onChange={(e) => setPassingValue(e.target.value)}
              className="w-full p-2.5 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-400 bg-white shadow-sm"
              placeholder={passingRule === "percentage" ? "e.g. 50" : "e.g. 15"}
            />
          </div>

        </div>

        <div className="flex items-center justify-between gap-4 border-t pt-4">
            <p className="text-sm font-semibold text-blue-700">
               {passingRule === "percentage" 
                 ? `Requirement: Students must score ${passingValue}% to pass.` 
                 : `Requirement: Students must get ${passingValue} correct answers to pass.`}
            </p>

            <button
              onClick={() => handleConfirmSettings()}
              disabled={isSaving}
              className={`px-8 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 shadow-md ${
                settingsSaved 
                ? "bg-green-600 hover:bg-green-700 text-white" 
                : "bg-blue-600 hover:bg-blue-700 text-white active:scale-95"
              } ${isSaving ? "opacity-75 cursor-wait" : ""}`}
            >
              {isSaving ? (
                <> <FontAwesomeIcon icon={faSpinner} spin /> Saving... </>
              ) : settingsSaved ? (
                <> <FontAwesomeIcon icon={faCheckCircle} /> Saved </>
              ) : (
                <> <FontAwesomeIcon icon={faSave} /> Confirm </>
              )}
            </button>
        </div>

      </div>

      {/* QUESTION FORM */}
      <div className="bg-white p-6 shadow-lg rounded-2xl mb-8 border border-gray-100 ring-1 ring-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-700 flex items-center gap-2">
             <FontAwesomeIcon icon={faPlus} className="text-green-500" />
             Add MCQ Assessment Questions
          </h2>
        </div>
        
        <div className="flex gap-4 mb-4">
          <div className="flex-1">
            <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest pl-1 mb-1 block">Question Prompt</label>
            <textarea
              placeholder="Type your question or coding problem statement here..."
              value={form.question}
              onChange={handleChange}
              rows="3"
              className="w-full p-3 border rounded-xl focus:outline-none focus:border-blue-500 bg-gray-50/50 resize-none"
            />
          </div>
          <div style={{ width: "120px" }}>
             <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest pl-1 mb-1 block">Marks</label>
             <input
               type="number"
               value={form.marks}
               onChange={(e) => setForm({...form, marks: parseInt(e.target.value) || 0})}
               className="w-full p-3 border rounded-lg bg-gray-50/50"
             />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {form.options.map((opt, i) => (
            <div key={i}>
              <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest pl-1 mb-1 block">Option {i + 1}</label>
              <input
                type="text"
                placeholder={`Choice ${i + 1}`}
                value={opt}
                onChange={(e) => handleOptionChange(i, e.target.value)}
                className="w-full p-2.5 border border-gray-100 rounded-lg focus:ring-1 focus:ring-blue-300 bg-gray-50/50"
              />
            </div>
          ))}
        </div>

        {/* Correct Answer Selection */}
        <div className="mb-6 p-4 bg-blue-50/30 rounded-xl border border-dashed border-blue-200">
          <p className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
            <FontAwesomeIcon icon={faCheckCircle} className="text-green-500" />
            Correct Answer Key
          </p>
          <div className="flex flex-wrap gap-2">
            {form.options.map((opt, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleAnswer(opt)}
                className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest border transition-all ${
                  form.answer === opt && opt !== ""
                    ? "bg-green-600 text-white border-green-700 shadow-lg ring-2 ring-green-100"
                    : "bg-white text-gray-400 border-gray-100 hover:border-gray-300 shadow-sm"
                }`}
              >
                {opt || `Opt ${i + 1}`}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={addQuestion}
          disabled={isQuestionsSaving}
          className="bg-gray-800 text-white px-8 py-3 rounded-xl font-bold hover:bg-black transition-all active:scale-95 shadow-lg flex items-center gap-2"
        >
          {isQuestionsSaving ? <FontAwesomeIcon icon={faSpinner} spin /> : <FontAwesomeIcon icon={faPlus} />}
          Add Question to Bank
        </button>
      </div>

      {/* QUESTION LIST */}
      <div className="mt-12 mb-6 flex items-center justify-between border-b border-gray-100 pb-4">
        <h2 className="text-2xl font-black text-gray-800 tracking-tight flex items-center gap-3">
          Current {category} Questions
          {isQuestionsSaving && <FontAwesomeIcon icon={faSpinner} spin className="text-blue-500 text-sm" />}
        </h2>
        <span className="bg-blue-600 text-white px-5 py-2 rounded-full text-xs font-black shadow-lg shadow-blue-100 flex items-center gap-2 uppercase tracking-tighter">
          Total Content: {questions.length} / {maxQuestions}
        </span>
      </div>

      <div className="space-y-6">
        {questions.length === 0 && (
          <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
             <FontAwesomeIcon icon={faInfoCircle} className="text-4xl text-gray-300 mb-2" />
             <p className="text-gray-400 font-medium">No assessment questions found in the {category} category.</p>
          </div>
        )}

        {questions.map((q, index) => (
          <div key={q.id} className="bg-white p-6 shadow-md rounded-2xl border border-gray-50 hover:shadow-xl transition-shadow relative group">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <span className="bg-gray-100 text-gray-600 h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-black">
                    {index + 1}
                  </span>
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-widest ${q.type === 'coding' ? 'bg-purple-100 text-purple-700' : 'bg-blue-50 text-blue-700'}`}>
                    {q.type === 'coding' ? `Coding (${q.language})` : 'MCQ'} • {q.marks || 2} Marks
                  </span>
                </div>
                <h3 className="font-bold text-gray-800 text-lg mb-4 tracking-tight leading-snug whitespace-pre-wrap">
                  {q.question}
                </h3>

                {q.type === 'coding' ? (
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Test Cases:</p>
                    <div className="grid grid-cols-2 gap-4">
                      {q.testCases?.map((tc, idx) => (
                        <div key={idx} className="text-xs font-mono bg-white p-2 rounded border border-gray-200">
                          <div className="text-blue-500 mb-1">In: {tc.input || "Empty"}</div>
                          <div className="text-green-600">Out: {tc.output}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-2">
                    {q.options.map((opt, i) => (
                      <div
                        key={i}
                        className={`p-3 rounded-xl border text-sm flex items-center gap-2 ${
                          opt === q.answer 
                          ? "bg-green-50 border-green-200 text-green-700 font-bold shadow-sm" 
                          : "bg-white border-gray-100 text-gray-500"
                        }`}
                      >
                        {opt === q.answer && <FontAwesomeIcon icon={faCheckCircle} className="text-[10px]" />}
                        {opt}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button
                onClick={() => deleteQuestion(q.id)}
                className="text-red-300 hover:text-red-500 transition-colors p-2"
                title="Purge this item"
              >
                <FontAwesomeIcon icon={faTrash} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ExamManager;