const fs = require('fs');
const path = 'placementapp/src/pages/DailyExamSubjects.jsx';
if (fs.existsSync(path)) {
    let content = fs.readFileSync(path, 'utf8');
    
    // 🛡️ HARDENING SUBJECTS SESSION RECOVERY
    // Fulfilling requirement: "When I click on browser refresh symbol in this subjects page, it should stay in the current page."
    
    // We modify the initial state to check sessionStorage immediately, avoiding the null-flicker on refresh.
    const oldState = 'const [activeCourse, setActiveCourse] = useState(null);';
    const newState = 'const [activeCourse, setActiveCourse] = useState(() => sessionStorage.getItem("active_assessment_course"));';
    
    if (content.includes(oldState)) {
        content = content.replace(oldState, newState);
        
        // Also remove the conditional restoration that was tied to location.state.resumeCourse
        const startMarker = '// Intelligently restore session ONLY if returning from a specific exam intro stage.';
        const endMarker = 'setActiveCourse(savedCourse);\n      }\n    }';
        
        const startIndex = content.indexOf(startMarker);
        const endIndex = content.indexOf(endMarker);
        
        if (startIndex !== -1 && endIndex !== -1) {
            const pre = content.substring(0, startIndex);
            const post = content.substring(endIndex + endMarker.length);
            
            const universalRestoration = `
    // 🏗️ 1000% UNIVERSAL SESSION RESTORATION
    // Ensures that refreshing the page ALWAYS stays on the currently viewed course subjects.
    const savedCourse = sessionStorage.getItem("active_assessment_course");
    if (savedCourse && !activeCourse) {
       setActiveCourse(savedCourse);
    }
            `;
            
            content = pre + universalRestoration + post;
            fs.writeFileSync(path, content, 'utf8');
            console.log("SUCCESS: Deployed Universal Session Persistence in DailyExamSubjects.jsx.");
        }
    }
}
