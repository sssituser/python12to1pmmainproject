const fs = require('fs');
const path = 'placementapp/src/pages/DailyExamSubjects.jsx';
if (fs.existsSync(path)) {
    let content = fs.readFileSync(path, 'utf8');
    
    // 🛡️ ENHANCING REFRESH ENGINE in DailyExamSubjects.jsx
    // 1. Add isLoading state
    if (!content.includes('const [isDataFetching, setIsDataFetching]')) {
        content = content.replace('const [allCourseData, setAllCourseData] = useState([]);', 
            'const [allCourseData, setAllCourseData] = useState([]);\n  const [isDataFetching, setIsDataFetching] = useState(true);');
    }

    // 2. Add refresh handler
    const refreshLogic = `  const refreshAllData = async () => {
    try {
      const storedToken = localStorage.getItem("access");
      const token = storedToken ? storedToken.replace(/^"|"$/g, "").trim() : null;
      
      const courseRes = await axios.get("http://127.0.0.1:8000/api/courses/");
      setAllCourseData(courseRes.data || []);
      
      if (activeCourse) {
        const configRes = await axios.get(\`http://127.0.0.1:8000/api/automated-exam-config/?course_name=\${encodeURIComponent(activeCourse)}&_t=\${Date.now()}\`, {
          headers: token ? { "Authorization": \`Bearer \${token}\` } : {}
        });
        if (configRes.data && configRes.data.status === "success") {
           setAutomatedConfig(configRes.data);
        }
      }
    } catch (e) {} finally {
      setIsDataFetching(false);
    }
  };`;

    if (!content.includes('const refreshAllData = async () =>')) {
        content = content.replace('const [automatedConfig, setAutomatedConfig] = useState(null);', 
            'const [automatedConfig, setAutomatedConfig] = useState(null);\n' + refreshLogic);
    }

    // 3. Add periodic refresh
    if (!content.includes('setInterval(refreshAllData, 30000)')) {
        content = content.replace('useEffect(() => {\n    fetchProfile();\n  }, [navigate]);', 
            'useEffect(() => {\n    fetchProfile();\n    const interval = setInterval(refreshAllData, 15000); // 15s Heartbeat Pulse\n    return () => clearInterval(interval);\n  }, [navigate, activeCourse]);');
    }

    // 4. Update Render Logic
    content = content.replace(') : activeCourse && (', ') : (activeCourse && !isDataFetching) && (');
    
    // 5. Add Loading Overlay
    const loadingOverlay = `{isDataFetching && !filteredSubjects.length && activeCourse && (
          <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-6 shadow-sm"></div>
            <h2 className="text-xl font-bold text-slate-800 uppercase tracking-tight">Syncing Live Curriculum...</h2>
            <p className="text-slate-500 font-bold mt-2">Fetching the latest subjects from the faculty dashboard.</p>
          </div>
        )}\n        `;
    
    if (!content.includes('Syncing Live Curriculum...')) {
        content = content.replace(') : filteredSubjects.length > 0 ? (', ') : ' + loadingOverlay + ' filteredSubjects.length > 0 ? (');
    }

    fs.writeFileSync(path, content, 'utf8');
    console.log("SUCCESS: Deployed Heartbeat Pulse Sync Engine to DailyExamSubjects.jsx.");
}
