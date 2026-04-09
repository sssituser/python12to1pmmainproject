const fs = require('fs');
const path = 'placementapp/src/pages/DailyExamSubjects.jsx';
if (fs.existsSync(path)) {
    let content = fs.readFileSync(path, 'utf8');
    
    // 🛡️ REPAIRING AMPERSAND-TERNARY CONFLICT
    // I accidentally mixed && syntax with ternary fallback : null
    
    content = content.replace('activeCourse && enrolledCourses.length > 1 && (', 'activeCourse && enrolledCourses.length > 1 ? (');
    
    fs.writeFileSync(path, content, 'utf8');
    console.log("SUCCESS: Repaired ternary syntax in DailyExamSubjects.jsx header.");
}
