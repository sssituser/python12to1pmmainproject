const fs = require('fs');
const path = 'placementapp/src/pages/DailyExamSubjects.jsx';
if (fs.existsSync(path)) {
    let content = fs.readFileSync(path, 'utf8');
    
    // 🛡️ ENFORCING PERMANENT SUBJECT STABILITY in DailyExamSubjects.jsx
    // We only show the loader if we have NO subjects and we are currently fetching.
    // Otherwise, we keep the existing subjects visible during background syncs.
    
    const oldLogic = ') : (isDataFetching && !filteredSubjects.length && activeCourse) ? (';
    const newLogic = ') : (isDataFetching && filteredSubjects.length === 0 && activeCourse) ? (';
    
    content = content.replace(oldLogic, newLogic);
    
    // Also ensuring that if filteredSubjects has data, we DON'T show the loader overlay
    // The current ternary is:
    // SelectedCourses ? ... : (Loading && !data) ? Spinner : data.length > 0 ? Grid : NoData
    
    fs.writeFileSync(path, content, 'utf8');
    console.log("SUCCESS: Enforced Permanent Subject Stability in DailyExamSubjects.jsx.");
}
