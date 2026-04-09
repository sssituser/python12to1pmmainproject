const fs = require('fs');
const path = 'placementapp/src/pages/DailyExamSubjects.jsx';
if (fs.existsSync(path)) {
    let content = fs.readFileSync(path, 'utf8');
    
    // 🛡️ REPAIRING JSX TERNARY CHAIN
    const buggyLogicStart = ') : {isDataFetching && !filteredSubjects.length && activeCourse && (';
    const buggyLogicEnd = ')}';
    const bStart = content.indexOf(buggyLogicStart);
    if (bStart !== -1) {
        const nextBEnd = content.indexOf(buggyLogicEnd, bStart);
        if (nextBEnd !== -1) {
            // We want to replace the whole block from the first ':' of the buggy part 
            // to the end of the loading div.
            
            const replacement = `) : (isDataFetching && !filteredSubjects.length && activeCourse) ? (
          <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-6 shadow-sm"></div>
            <h2 className="text-xl font-bold text-slate-800 uppercase tracking-tight">Syncing Live Curriculum...</h2>
            <p className="text-slate-500 font-bold mt-2">Fetching the latest subjects from the faculty dashboard.</p>
          </div>
        ) :`;

            // Identify the end of the loading div block
            const loadingDivEnd = '</div>';
            const finalDivEnd = content.indexOf(loadingDivEnd, nextBEnd) + loadingDivEnd.length;
            
            // To be precise, let's just target the specific faulty line and its closing brace
            const targetBlock = content.substring(bStart, finalDivEnd + 1);
            // Verify if the next part is ' filteredSubjects.length > 0 ? ('
            if (content.indexOf('filteredSubjects.length > 0 ? (', finalDivEnd) !== -1) {
                 content = content.replace(targetBlock, replacement);
                 console.log("SUCCESS: Repaired JSX Ternary Chain in DailyExamSubjects.jsx.");
            }
        }
    }

    fs.writeFileSync(path, content, 'utf8');
}
