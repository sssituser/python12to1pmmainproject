const fs = require('fs');
const path = 'placementapp/src/pages/DailyExam.jsx';
if (fs.existsSync(path)) {
    let content = fs.readFileSync(path, 'utf8');
    
    // 🛡️ REPAIRING DYNAMIC FALLBACK ENGINE
    // Removed the "config requirement" that was causing empty exams when no faculty configuration existed.
    // The system now automatically falls back to default assessment parameters (60m, 25q, 50%) 
    // to ensure subjects "open always" as requested.
    
    const badCleanup = "// If no master config, we show EMPTY list - NO LEGACY FALLBACK";
    
    // Locating the block that checks customJson.status
    const targetBlock = 'if (customJson && customJson.status === "success") {';
    
    // We want the fetchQuestions to proceed even if status is not success, using defaults.
    
    const repairCode = `
        // 🏗️ 2000% DYNAMIC CONFIG RESOLVER
        // Fulfilling user requirement: "Subjects should open always, with or without configuration"
        const qLimit = (customJson && customJson.status === "success") ? (customJson.question_count || 25) : 25;
        const dur = (customJson && customJson.status === "success") ? (customJson.duration || 60) : 60;
        const weightage = (customJson && customJson.status === "success") ? (customJson.marks_per_question || 1) : 1;

        setExamDuration(dur);
        setTimeLeft(dur * 60);
        setPassingRule((customJson && customJson.status === "success") ? (customJson.passing_strategy || "percentage") : "percentage");
        setPassingValue((customJson && customJson.status === "success" && customJson.requirement !== undefined) ? customJson.requirement : 50);
        setMarksPerQuestion(weightage);

        const activeSlug = subjectKey.toLowerCase().replace(/\\s+/g, "_");
        let pool = [];

        try {
           const res = await fetch("http://127.0.0.1:8000/api/playground-questions/" + activeSlug + "/");
           const json = await res.json();
           const data = json.data || json;
           if (Array.isArray(data)) pool = data;
           else if (data && Array.isArray(data.questions)) pool = data.questions;
        } catch(e) {
           console.error("Dynamic Pool Fetch Failed:", e);
        }
    `;

    // Replace the entire if(customJson.status === "success") block with the dynamic version.
    // I will use a more precise replacement to avoid breaking the logic.
    
    const oldBlockStart = 'if (customJson && customJson.status === "success") {';
    const oldBlockEnd = 'setQuestions([]);'; // We replace until here
    
    // Actually, I'll just re-write the fetchQuestions function to be smarter.
    
    console.log("Replacing legacy config-locked logic with Dynamic Fallback Engine...");
    
    const startMarker = 'const fetchQuestions = async () => {';
    const endMarker = '// If no master config, we show EMPTY list - NO LEGACY FALLBACK';
    
    const startIndex = content.indexOf(startMarker);
    const endIndex = content.indexOf(endMarker);
    
    if (startIndex !== -1 && endIndex !== -1) {
        const pre = content.substring(0, startIndex);
        const post = content.substring(content.indexOf('setQuestions([]);') + 'setQuestions([]);'.length);
        
        const newFunc = `
    const fetchQuestions = async () => {
      try {
        setIsLoadingQuestions(true);
        const normalizedCourseName = (studentCourse || "").trim().toUpperCase();
        const token = localStorage.getItem("access")?.replace(/^"|"$/g, "");
        
        let customJson = null;
        try {
          const customRes = await fetch(\`http://127.0.0.1:8000/api/automated-exam-config/?course_name=\${encodeURIComponent(normalizedCourseName)}&_t=\${Date.now()}\`, {
             headers: { 
               "Authorization": token ? \`Bearer \${token}\` : "",
               "Content-Type": "application/json"
             }
          });
          if (customRes.ok) customJson = await customRes.json();
        } catch (e) {}

        const qLimit = (customJson && customJson.status === "success") ? (customJson.question_count || 25) : 25;
        const dur = (customJson && customJson.status === "success") ? (customJson.duration || 60) : 60;
        const weightage = (customJson && customJson.status === "success") ? (customJson.marks_per_question || 1) : 1;

        setExamDuration(dur);
        setTimeLeft(dur * 60);
        setPassingRule((customJson && customJson.status === "success") ? (customJson.passing_strategy || "percentage") : "percentage");
        setPassingValue((customJson && customJson.status === "success") ? (customJson.requirement ?? 50) : 50);
        setMarksPerQuestion(weightage);

        const activeSlug = subjectKey.toLowerCase().replace(/\\s+/g, "_");
        let pool = [];

        try {
           const res = await fetch("http://127.0.0.1:8000/api/playground-questions/" + activeSlug + "/");
           const json = await res.json();
           const data = json.data || json;
           if (Array.isArray(data)) pool = data;
           else if (data && Array.isArray(data.questions)) pool = data.questions;
        } catch(e) {}

        if (pool.length > 0) {
          const shuffleArray = (array) => {
            const shuffled = [...array];
            for (let i = shuffled.length - 1; i > 0; i--) {
              const j = Math.floor(Math.random() * (i + 1));
              [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
            }
            return shuffled;
          };
          
          const selected = shuffleArray(pool).slice(0, Math.min(pool.length, qLimit));
          const mapped = selected.map((q, idx) => ({
             ...q,
             id: idx + 1,
             marks: weightage,
             options: Array.isArray(q.options) ? q.options : [],
             correct: q.correct !== undefined ? q.correct : 0
          }));

          setQuestions(mapped);
          setIsLoadingQuestions(false);
          return;
        }
        `;
        
        content = pre + newFunc + post;
        fs.writeFileSync(path, content, 'utf8');
        console.log("SUCCESS: Deployed Dynamic Spring/Fall fallback in DailyExam.jsx.");
    }
}
