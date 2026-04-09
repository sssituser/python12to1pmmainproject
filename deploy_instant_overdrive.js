const fs = require('fs');
const path = 'placementapp/src/pages/DailyExamSubjects.jsx';
if (fs.existsSync(path)) {
    let content = fs.readFileSync(path, 'utf8');
    
    // 🛡️ ENFORCING ABSOLUTE INSTANTANEOUS SYNC in DailyExamSubjects.jsx
    // 1. Overdrive Heartbeat: Increase to 3 seconds for "Immediate" feel
    content = content.replace('setInterval(refreshAllData, 15000)', 'setInterval(refreshAllData, 3000)');
    
    // 2. Suppress Spinner if Cache exists
    // We only show the spinner if we have NO data AND no cache
    content = content.replace('const [isDataFetching, setIsDataFetching] = useState(true);', 
        'const [isDataFetching, setIsDataFetching] = useState(() => !localStorage.getItem("cache_all_courses"));');

    // 3. Parallelize Automated Config into the main Nitro stream
    const nitroFetchWithConfig = `    const fetchProfile = async () => {
      try {
        const storedToken = localStorage.getItem("access");
        const token = storedToken ? storedToken.replace(/^"|"$/g, "").trim() : null;
        if (!token) {
          setIsValidating(false);
          return;
        }

        // 🚀 OVERDRIVE PARALLEL FETCH
        const initialActive = activeCourse || sessionStorage.getItem("active_assessment_course");
        
        const fetchPromises = [
          axios.get("http://127.0.0.1:8000/api/profile/", { headers: { "Authorization": \`Bearer \${token}\` } }),
          axios.get("http://127.0.0.1:8000/api/courses/")
        ];

        // If we know the course, fetch its config in the same burst
        if (initialActive) {
          fetchPromises.push(axios.get(\`http://127.0.0.1:8000/api/automated-exam-config/?course_name=\${encodeURIComponent(initialActive)}&_t=\${Date.now()}\`, {
            headers: { "Authorization": \`Bearer \${token}\` }
          }));
        }

        const resArray = await Promise.all(fetchPromises);
        const profileRes = resArray[0];
        const courseRes = resArray[1];
        const configRes = resArray[2];

        const data = profileRes.data || {};
        const courses = data.enrolled_courses || (data.course_title ? [data.course_title] : []);
        setEnrolledCourses(courses);
        
        const cData = courseRes.data || [];
        setAllCourseData(cData);
        localStorage.setItem("cache_all_courses", JSON.stringify(cData));
        
        if (configRes && configRes.data && configRes.data.status === "success") {
           setAutomatedConfig(configRes.data);
        }

        if (courses.length === 1 && !initialActive) {
           setActiveCourse(courses[0]);
           sessionStorage.setItem("active_assessment_course", courses[0]);
        }
      } catch (err) {`;

    // Careful with replacement to avoid breaking syntax if variables differ
    content = content.replace(/const fetchProfile = async \(\) => \{[\s\S]*?\} catch \(err\) \{/, nitroFetchWithConfig);

    fs.writeFileSync(path, content, 'utf8');
    console.log("SUCCESS: Deployed Absolute Instantaneous Sync Overdrive to DailyExamSubjects.jsx.");
}
