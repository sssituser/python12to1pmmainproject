const fs = require('fs');
const path = 'placementapp/src/pages/DailyExamSubjects.jsx';
if (fs.existsSync(path)) {
    let content = fs.readFileSync(path, 'utf8');
    
    // 🚀 NITRO SPEED OPTIMIZATION in DailyExamSubjects.jsx
    // 1. Parallelize initial data fetching
    const oldFetchProfile = `    const fetchProfile = async () => {
      try {
        const storedToken = localStorage.getItem("access");
        const token = storedToken ? storedToken.replace(/^"|"$/g, "").trim() : null;
        if (!token) {
          
          setIsValidating(false);
          // navigate('/'); // Optional: Force login if desired
          return;
        }

        const response = await axios.get("http://127.0.0.1:8000/api/profile/", {
          headers: { "Authorization": \`Bearer \${token}\` }
        });

        const data = response.data || {};
        const courses = data.enrolled_courses || (data.course_title ? [data.course_title] : []);
        setEnrolledCourses(courses);

        const courseRes = await axios.get("http://127.0.0.1:8000/api/courses/");
        setAllCourseData(courseRes.data || []);
        
        const savedCourse = sessionStorage.getItem("active_assessment_course");
        if (courses.length === 1 && !savedCourse) {
           setActiveCourse(courses[0]);
           sessionStorage.setItem("active_assessment_course", courses[0]);
        }
      } catch (err) {`;

    const nitroFetchProfile = `    const fetchProfile = async () => {
      try {
        const storedToken = localStorage.getItem("access");
        const token = storedToken ? storedToken.replace(/^"|"$/g, "").trim() : null;
        if (!token) {
          setIsValidating(false);
          return;
        }

        // 🚀 NITRO PARALLEL FETCH - Load everything at once
        const [profileRes, courseRes] = await Promise.all([
          axios.get("http://127.0.0.1:8000/api/profile/", { headers: { "Authorization": \`Bearer \${token}\` } }),
          axios.get("http://127.0.0.1:8000/api/courses/")
        ]);

        const data = profileRes.data || {};
        const courses = data.enrolled_courses || (data.course_title ? [data.course_title] : []);
        setEnrolledCourses(courses);
        setAllCourseData(courseRes.data || []);
        
        const savedCourse = sessionStorage.getItem("active_assessment_course");
        if (courses.length === 1 && !savedCourse) {
           setActiveCourse(courses[0]);
           sessionStorage.setItem("active_assessment_course", courses[0]);
        }
      } catch (err) {`;

    content = content.replace(oldFetchProfile, nitroFetchProfile);

    // 2. Add Persistence Cache for Instant Render
    // We'll hydrate the state from localStorage if available
    content = content.replace('const [allCourseData, setAllCourseData] = useState([]);', 
        'const [allCourseData, setAllCourseData] = useState(() => JSON.parse(localStorage.getItem("cache_all_courses") || "[]"));');
    
    // 3. Update cache on every fetch
    content = content.replace('setAllCourseData(courseRes.data || []);', 
        'const cData = courseRes.data || []; setAllCourseData(cData); localStorage.setItem("cache_all_courses", JSON.stringify(cData));');

    fs.writeFileSync(path, content, 'utf8');
    console.log("SUCCESS: Deployed Nitro Speed Parallel Fetch & Instant Cache to DailyExamSubjects.jsx.");
}
