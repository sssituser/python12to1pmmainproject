const fs = require('fs');
const path = 'placementapp/src/faculty/ExamManager.jsx';
if (fs.existsSync(path)) {
    const content = fs.readFileSync(path, 'utf8');
    const lines = content.split('\n');
    let stack = [];
    for (let i = 0; i < lines.length; i++) {
        let line = lines[i];
        let tags = line.match(/<div(\s|>)|<\/div>/g) || [];
        for (let tag of tags) {
            if (tag.startsWith('<div')) {
                stack.push(i + 1);
            } else {
                if (stack.length === 0) {
                    console.log(`Extra close at line ${i + 1}`);
                } else {
                    stack.pop();
                }
            }
        }
    }
    if (stack.length > 0) {
        console.log(`Unclosed divs starting at lines: ${stack.join(', ')}`);
    } else {
        console.log("All divs balanced!");
    }
}
