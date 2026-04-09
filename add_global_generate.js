const fs = require('fs');
const path = 'placementapp/src/faculty/ExamManager.jsx';
if (fs.existsSync(path)) {
    let content = fs.readFileSync(path, 'utf8');
    
    // 🛡️ 1. Add Global Mode State
    if (!content.includes('const [isGlobalMode')) {
        content = content.replace('const [examMarksPerQuestion, setExamMarksPerQuestion] = useState(2);', 
                                  'const [examMarksPerQuestion, setExamMarksPerQuestion] = useState(2);\n  const [isGlobalMode, setIsGlobalMode] = useState(false);');
    }

    // 🛡️ 2. Add Global Generation Handler
    const globalHandler = `
  // 🌍 1000% GLOBAL AUTOMATION ENGINE
  const handleGlobalGenerate = async () => {
    if (!window.confirm("Are you sure you want to generate assessments for ALL courses and ALL subjects?")) return;
    
    setIsAutoGenerating(true);
    try {
      const token = localStorage.getItem("access");
      const config = {
        headers: {
          Authorization: token ? \`Bearer \${token}\` : "",
          "Content-Type": "application/json",
        },
      };

      // Loop through all synced courses
      for (const courseObj of fullCourseObjects) {
        const title = courseObj.title || courseObj;
        const subjects = (courseObj.modules || []).map(m => m.title);
        
        if (subjects.length > 0) {
            const payload = {
                course_name: String(title).trim().toUpperCase(),
                exam_name: examName,
                subjects: subjects,
                duration: parseInt(examDuration) || 80,
                passing_strategy: examStrategy,
                requirement: parseInt(examRequirement) || 50,
                question_count: parseInt(examQuestionCount) || 25,
                marks_per_question: parseInt(examMarksPerQuestion) || 2
            };
            await axios.post("http://127.0.0.1:8000/api/automated-exam-config/", payload, config);
        }
      }
      
      setAutoGenSuccess(true);
      toast.success("All courses generated successfully!", { theme: "colored" });
      setTimeout(() => setAutoGenSuccess(false), 3000);
      setIsGlobalMode(false); // Reset to standard mode
    } catch (err) {
      console.error("Global generation failed:", err);
      toast.error("Some courses failed to sync.");
    } finally {
      setIsAutoGenerating(false);
    }
  };
`;

    if (!content.includes('handleGlobalGenerate')) {
        content = content.replace('const saveQuestionsToBackend', globalHandler + '\n  const saveQuestionsToBackend');
    }

    // 🛡️ 3. Modify UI to HIDE Course/Subject columns in Global Mode
    // Course Name Div
    content = content.replace(/\{(\s*)\/\* Course Name \*\/[\s\S]*?(\s*)\}/, match => {
        // Find the outer div wrapping Course Name and wrap it in conditional
        return `{!isGlobalMode && (${match})}`;
    });
    
    // Wait! I'll do a more direct search for the JSX blocks
    const courseBlock = `<div>
            <label className="block text-xs font-black uppercase text-purple-900 mb-2 tracking-wider">
              Course Name
            </label>
            <select
              value={examCourseName}
              onChange={(e) => setExamCourseName(e.target.value)}
              className="w-full p-2.5 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-400 bg-white shadow-sm"
            >
              {courses.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>`;
          
    const subjectsBlock = `<div className="relative">
            <label className="block text-xs font-black uppercase text-purple-900 mb-2 tracking-wider flex justify-between items-center">
              Subjects`;
              
    // Wrap them in {!isGlobalMode && (...)}
    if (content.includes(courseBlock)) {
        content = content.replace(courseBlock, `{!isGlobalMode && (\n          ${courseBlock}\n          )}`);
    }
    
    // For subject block, I need to find the closing div of the relative container
    const subjectRegex = /<div\s+className="relative">[\s\S]*?{examSubjects\.length > 0 && \([\s\S]*?<\/p>\s*\)\s*}\s*<\/div>/;
    content = content.replace(subjectRegex, match => `{!isGlobalMode && (\n          ${match}\n          )}`);

    // 🛡️ 4. Update the Footer Buttons
    const buttonsBlock = `<button
                onClick={handleAutoGenerate}
                disabled={isAutoGenerating}
                className={\`px-6 py-2.5 rounded-xl font-bold transition-all border flex items-center gap-2 shadow-sm \${
                   autoGenSuccess 
                   ? 'bg-green-500 text-white border-green-600' 
                   : 'bg-white hover:bg-purple-600 hover:text-white text-purple-700 border-purple-200'
                }\`}
              >
                {isAutoGenerating ? (
                   <FontAwesomeIcon icon={faSpinner} spin />
                ) : autoGenSuccess ? (
                   <FontAwesomeIcon icon={faCheckCircle} />
                ) : null}
                {autoGenSuccess ? "Generated!" : "Auto Generate"}
              </button>`;
              
    const newButtons = `
              {/* 🌍 GLOBAL GENERATION TOGGLE */}
              <button
                onClick={() => setIsGlobalMode(!isGlobalMode)}
                className={\`px-6 py-2.5 rounded-xl font-bold transition-all border flex items-center gap-2 shadow-sm \${
                  isGlobalMode 
                  ? 'bg-purple-600 text-white border-purple-700' 
                  : 'bg-white text-purple-700 border-purple-200 hover:bg-purple-50'
                }\`}
              >
                <FontAwesomeIcon icon={faHistory} />
                {isGlobalMode ? "Custom Mode" : "All Courses"}
              </button>

              {!isGlobalMode ? (
                <button
                  onClick={handleAutoGenerate}
                  disabled={isAutoGenerating}
                  className={\`px-6 py-2.5 rounded-xl font-bold transition-all border flex items-center gap-2 shadow-sm \${
                    autoGenSuccess 
                    ? 'bg-green-500 text-white border-green-600' 
                    : 'bg-white hover:bg-purple-600 hover:text-white text-purple-700 border-purple-200'
                  }\`}
                >
                  {isAutoGenerating ? <FontAwesomeIcon icon={faSpinner} spin /> : autoGenSuccess ? <FontAwesomeIcon icon={faCheckCircle} /> : null}
                  {autoGenSuccess ? "Generated!" : "Auto Generate"}
                </button>
              ) : (
                <button
                  onClick={handleGlobalGenerate}
                  disabled={isAutoGenerating}
                  className={\`px-6 py-2.5 rounded-xl font-bold transition-all border flex items-center gap-2 shadow-sm \${
                    autoGenSuccess 
                    ? 'bg-green-500 text-white border-green-600' 
                    : 'bg-purple-700 text-white border-purple-800 hover:bg-purple-800'
                  }\`}
                >
                  {isAutoGenerating ? <FontAwesomeIcon icon={faSpinner} spin /> : <FontAwesomeIcon icon={faCheckCircle} />}
                  {isAutoGenerating ? "Generating..." : "Generate for All Courses"}
                </button>
              )}
    `;
    
    if (content.includes(buttonsBlock)) {
        content = content.replace(buttonsBlock, newButtons);
        fs.writeFileSync(path, content, 'utf8');
        console.log("SUCCESS: Deployed All Courses controller in ExamManager.jsx.");
    }
}
