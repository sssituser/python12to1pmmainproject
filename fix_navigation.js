const fs = require('fs');
const path = 'placementapp/src/pages/DailyExam.jsx';
if (fs.existsSync(path)) {
    let content = fs.readFileSync(path, 'utf8');
    
    // 🛡️ REPAIRING POST-EXAM NAVIGATION
    // Fulfilling requirement: "After finishing the exam, it should directly navigate to the students results page automatically"
    
    const oldNav = 'navigate("/dashboard/daily-exams", { replace: true });';
    const newNav = 'navigate("/dashboard/playground-results", { replace: true });';
    
    if (content.includes(oldNav)) {
        content = content.replace(oldNav, newNav);
        fs.writeFileSync(path, content, 'utf8');
        console.log("SUCCESS: Re-routed post-exam navigation to results page in DailyExam.jsx.");
    } else {
        console.log("ERROR: Navigation string not found. Checking for alternative patterns...");
        // Fallback for potential whitespace variations
        const regex = /navigate\(\s*["']\/dashboard\/daily-exams["']\s*,\s*\{\s*replace:\s*true\s*\}\s*\)/;
        if (regex.test(content)) {
            content = content.replace(regex, newNav);
            fs.writeFileSync(path, content, 'utf8');
            console.log("SUCCESS: Re-routed post-exam navigation via regex.");
        }
    }
}
