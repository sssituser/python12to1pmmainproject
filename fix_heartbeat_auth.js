const fs = require('fs');
const path = 'placementapp/src/pages/DailyExamSubjects.jsx';
if (fs.existsSync(path)) {
    let content = fs.readFileSync(path, 'utf8');
    
    // 🛡️ REPAIRING HEARTBEAT AUTHENTICATION
    // The previous implementation was fetching the course list WITHOUT a token in the background pulse.
    // If the API hides 'modules' from anonymous users, the subjects would "disappear" during background sync.
    
    const badSync = 'axios.get("http://127.0.0.1:8000/api/courses/")';
    const goodSync = 'axios.get("http://127.0.0.1:8000/api/courses/", { headers: { "Authorization": `Bearer ${token}` } })';
    
    // Implementation in fetchProfile (parallel)
    content = content.replace(badSync, goodSync);
    
    // Implementation in refreshAllData (heartbeat)
    const badHeartbeat = 'await axios.get("http://127.0.0.1:8000/api/courses/");';
    const goodHeartbeat = 'await axios.get("http://127.0.0.1:8000/api/courses/", { headers: { "Authorization": `Bearer ${token}` } });';
    content = content.replace(badHeartbeat, goodHeartbeat);

    fs.writeFileSync(path, content, 'utf8');
    console.log("SUCCESS: Hardened Heartbeat Auth in DailyExamSubjects.jsx to prevent subject disappearance.");
}
