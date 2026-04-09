const fs = require('fs');
const path = 'placementapp/src/faculty/ExamManager.jsx';
if (fs.existsSync(path)) {
    const content = fs.readFileSync(path, 'utf8');
    const openDivs = (content.match(/<div(\s|>)/g) || []).length;
    const closeDivs = (content.match(/<\/div>/g) || []).length;
    console.log(`Open: ${openDivs}, Close: ${closeDivs}`);
    
    // Check balance
    let balance = 0;
    const lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const lineOpen = (line.match(/<div(\s|>)/g) || []).length;
        const lineClose = (line.match(/<\/div>/g) || []).length;
        balance += (lineOpen - lineClose);
        if (balance < 0) {
            console.log(`Error at line ${i + 1}: Balance dropped below 0! Current: ${balance}`);
        }
    }
    console.log(`Final Balance: ${balance}`);
}
