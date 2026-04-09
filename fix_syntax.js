const fs = require('fs');
const path = 'placementapp/src/pages/DailyExam.jsx';
if (fs.existsSync(path)) {
    let lines = fs.readFileSync(path, 'utf8').split('\n');
    
    // 🛡️ REMOVING DANGLING CATCH BLOCK
    // Identified a syntax error where a 'catch' block existed without a 'try'.
    
    // We target lines 338-340 (1-indexed) which translates to 337-339 (0-indexed)
    // Values might have shifted slightly, so we look for the exact string.
    
    const startLine = 338;
    const endLine = 340;
    
    if (lines[startLine-1].includes('catch (e)') && lines[startLine-1].includes('catch')) {
        console.log("Removing dangling catch at line " + startLine);
        lines.splice(startLine-1, 3);
        fs.writeFileSync(path, lines.join('\n'), 'utf8');
        console.log("SUCCESS: Fixed syntax error in DailyExam.jsx.");
    } else {
        console.log("ERROR: Could not find dangling catch at exactly line 338. Searching...");
        let found = false;
        for (let i = 0; i < lines.length; i++) {
           if (lines[i].includes('catch (e)') && lines[i].includes('Failed to clear session storage')) {
               console.log("Found orphan block at index " + i + ". Removing...");
               lines.splice(i-1, 4); // Remove the catch and the lines around it
               fs.writeFileSync(path, lines.join('\n'), 'utf8');
               console.log("SUCCESS: Fixed syntax error via search.");
               found = true;
               break;
           }
        }
        if (!found) console.log("Final Error: Pattern not found.");
    }
}
