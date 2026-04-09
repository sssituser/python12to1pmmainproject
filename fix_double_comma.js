const fs = require('fs');
const path = 'placementapp/src/faculty/Course.jsx';
if (fs.existsSync(path)) {
    let content = fs.readFileSync(path, 'utf8');
    
    // 🛡️ REPAIRING DOUBLE COMMA SYNTAX ERROR
    // I accidentally matched and replaced with an extra comma during auth sanitization.
    
    const badSyntax = '",",';
    const buggyLine = '`,,';
    
    content = content.replace('`,,', '`,');
    
    fs.writeFileSync(path, content, 'utf8');
    console.log("SUCCESS: Repaired double-comma syntax error in Course.jsx headers.");
}
