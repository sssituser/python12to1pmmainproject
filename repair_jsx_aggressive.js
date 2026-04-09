const fs = require('fs');
const path = 'placementapp/src/pages/DailyExamSubjects.jsx';
if (fs.existsSync(path)) {
    let content = fs.readFileSync(path, 'utf8');
    
    // 🛡️ REPAIRING JSX TERNARY CHAIN (AGGRESSIVE)
    const startPattern = ') : {isDataFetching';
    const endPattern = 'filteredSubjects.length > 0 ? (';
    
    const sIdx = content.indexOf(startPattern);
    const eIdx = content.indexOf(endPattern);
    
    if (sIdx !== -1 && eIdx !== -1 && sIdx < eIdx) {
        const replacement = `) : (isDataFetching && !filteredSubjects.length && activeCourse) ? (
          <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-6 shadow-sm"></div>
            <h2 className="text-xl font-bold text-slate-800 uppercase tracking-tight">Syncing Live Curriculum...</h2>
            <p className="text-slate-500 font-bold mt-2">Fetching the latest subjects from the faculty dashboard.</p>
          </div>
        ) : `;
        
        const oldBlock = content.substring(sIdx, eIdx);
        content = content.replace(oldBlock, replacement);
        console.log("SUCCESS: Repaired JSX Ternary Chain via aggressive matching.");
    }

    fs.writeFileSync(path, content, 'utf8');
}
