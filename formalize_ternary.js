const fs = require('fs');
const path = 'placementapp/src/pages/DailyExamSubjects.jsx';
if (fs.existsSync(path)) {
    let content = fs.readFileSync(path, 'utf8');
    
    // 🛡️ REPAIRING TERNARY COMPLETION
    const badEndStart = ') : (activeCourse && !isDataFetching) && (';
    const badEndClosing = ')}';
    
    const sIdx = content.lastIndexOf(badEndStart);
    if (sIdx !== -1) {
        const cIdx = content.indexOf(badEndClosing, sIdx);
        if (cIdx !== -1) {
            const replacement = ') : (activeCourse && !isDataFetching) ? (';
            content = content.substring(0, sIdx) + replacement + content.substring(sIdx + badEndStart.length);
            
            // Now we need to add the final ' : null' before the closing brace
            const finalClosingDiv = '</div>';
            const lastDivIdx = content.indexOf(finalClosingDiv, sIdx + replacement.length);
            // We need to find the specific </div> that correlates to the message block
            // and replace its following ')}' with ') : null}'
            
            content = content.replace('      </div>\n        )}', '      </div>\n        ) : null}');
            console.log("SUCCESS: Formalized ternary logic in DailyExamSubjects.jsx.");
        }
    }

    fs.writeFileSync(path, content, 'utf8');
}
