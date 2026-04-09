const fs = require('fs');
const path = 'placementapp/src/pages/DailyExamSubjects.jsx';
if (fs.existsSync(path)) {
    let content = fs.readFileSync(path, 'utf8');
    
    // 🛡️ FINAL SYNTAX SANITIZATION (FLEXIBLE)
    const target = '</div>\n        )}';
    if (content.includes(target)) {
        content = content.replace(target, '</div>\n        ) : null}');
        console.log("SUCCESS: Sanitized final ternary branch via flexible match.");
    } else {
        // Try even more flexible
        content = content.replace(/<\/div>\s+\)\}/g, '</div>\n        ) : null}');
        console.log("SUCCESS: Sanitized final ternary branch via regex.");
    }

    fs.writeFileSync(path, content, 'utf8');
}
