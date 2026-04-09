const fs = require('fs');
const path = 'placementapp/src/faculty/Course.jsx';
if (fs.existsSync(path)) {
    let content = fs.readFileSync(path, 'utf8');
    
    // 🛡️ RE-ENFORCING FACULTY SYNC ENCRYPTION (AGGRESSIVE)
    // We must ensure the token is sanitized in 'syncCourseToBackend'
    // to prevent 401 errors that stop the data from reaching the DB.
    
    const targetPattern = /'Authorization': `Bearer \${token}`/g;
    const replacement = "'Authorization': `Bearer ${token.replace(/^\"|\"$/g, \"\").trim()}`";
    
    content = content.replace(targetPattern, replacement);
    
    fs.writeFileSync(path, content, 'utf8');
    console.log("SUCCESS: Aggressively sanitized all Faculty Auth Tokens in Course.jsx.");
}
