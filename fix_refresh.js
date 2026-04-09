const fs = require('fs');
const path = 'placementapp/src/pages/DailyExamSubjects.jsx';
if (fs.existsSync(path)) {
    let content = fs.readFileSync(path, 'utf8');
    
    // 🛡️ REPAIRING REFRESH PERSISTENCE
    // Fulfilling requirement: "staying in the current page" on refresh.
    
    const target = 'const [activeCourse, setActiveCourse] = useState(null);';
    const replacement = 'const [activeCourse, setActiveCourse] = useState(() => sessionStorage.getItem("active_assessment_course"));';
    
    if (content.includes(target)) {
        content = content.replace(target, replacement);
        
        // Remove the restricted session restoration
        const regex = /if\s*\(location\.state\?\.resumeCourse\)\s*\{[\s\S]*?setActiveCourse\(savedCourse\);\s*\}\s*\}/;
        content = content.replace(regex, '');
        
        fs.writeFileSync(path, content, 'utf8');
        console.log("SUCCESS: Deployed Universal Session Persistence in DailyExamSubjects.jsx.");
    } else {
        console.log("ERROR: Target string not found.");
    }
}
