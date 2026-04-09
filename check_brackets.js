const fs = require('fs');
const path = 'placementapp/src/faculty/ExamManager.jsx';
if (fs.existsSync(path)) {
    const content = fs.readFileSync(path, 'utf8');
    const openBraces = (content.match(/{/g) || []).length;
    const closeBraces = (content.match(/}/g) || []).length;
    const openParents = (content.match(/\(/g) || []).length;
    const closeParents = (content.match(/\)/g) || []).length;
    console.log(`Braces: {:${openBraces}, }:${closeBraces} | Parents: (:${openParents}, ):${closeParents}`);
    
    // Line by line balance
    let bBalance = 0;
    let pBalance = 0;
    const lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        bBalance += (line.match(/{/g) || []).length - (line.match(/}/g) || []).length;
        pBalance += (line.match(/\(/g) || []).length - (line.match(/\)/g) || []).length;
        if (bBalance < 0 || pBalance < 0) {
            console.log(`Error at line ${i + 1}: B:${bBalance}, P:${pBalance}`);
        }
    }
    console.log(`Final: B:${bBalance}, P:${pBalance}`);
}
