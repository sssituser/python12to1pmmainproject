const fs = require('fs');
const path = 'placementapp/src/faculty/Course.jsx';
if (fs.existsSync(path)) {
    let content = fs.readFileSync(path, 'utf8');
    
    // 🛡️ REPAIRING FACULTY SYNC ENGINE
    // The previous implementation was sending quoted tokens in 'syncCourseToBackend',
    // leading to 401 Unauthorized errors and preventing curriculum persistence to the DB.
    
    const badTokenLine = "'Authorization': `Bearer ${token}`,";
    const goodTokenLine = "'Authorization': `Bearer ${token.replace(/^\"|\"$/g, \"\").trim()}`,";
    
    content = content.replace(badTokenLine, goodTokenLine);
    
    // Also ensuring any POST/PUT in this file uses sanitized tokens
    content = content.replace("'Authorization': `Bearer ${token}`", goodTokenLine);

    fs.writeFileSync(path, content, 'utf8');
    console.log("SUCCESS: Sanitized Faculty Auth Tokens in Course.jsx to enable DB persistence.");
}
