const fs = require('fs');
const path = 'placementapp/src/pages/DailyExamSubjects.jsx';
if (fs.existsSync(path)) {
    let content = fs.readFileSync(path, 'utf8');
    
    // 🛡️ FINAL SYNTAX SANITIZATION
    const target = '          </div>\n        )}';
    const replacement = '          </div>\n        ) : null}';
    
    if (content.includes(target)) {
        content = content.replace(target, replacement);
        console.log("SUCCESS: Sanitized final ternary branch in DailyExamSubjects.jsx.");
    }

    fs.writeFileSync(path, content, 'utf8');
}
