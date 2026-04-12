export const getQuestionBank = (courseName, count = 80, category = "Weekly", subjectList = []) => {
  const lowerCourse = (courseName || "").toString().toLowerCase();
  const subjects = Array.isArray(subjectList) && subjectList.length > 0 ? subjectList : null;
  let questions = [];

  // Helper to shuffle array
  const shuffle = (array) => {
    let currentIndex = array.length, randomIndex;
    while (currentIndex !== 0) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]];
    }
    return array;
  };

  const generateTechQuestions = (course, topics, variants) => {
    const qs = [];
    const activeTopics = subjects || topics;
    const usedTexts = new Set();

    activeTopics.forEach(topic => {
      // Internal variants shuffle to maximize variety even with small topic sets
      const shuffledVariants = shuffle([...variants]);
      shuffledVariants.forEach(variant => {
        const qText = variant.q.replace(/{topic}/g, topic).replace(/{course}/g, course);

        // Prevent exact text duplication
        if (!usedTexts.has(qText)) {
          usedTexts.add(qText);
          qs.push({
            question: qText,
            options: shuffle([...variant.opts.map(o => o.replace(/{topic}/g, topic).replace(/{course}/g, course))]),
            answer: variant.a.replace(/{topic}/g, topic).replace(/{course}/g, course),
            type: "mcq",
            marks: 2,
            subject: topic
          });
        }
      });
    });
    return qs;
  };

  // --- COURSE TRACK REPOSITORY ---

  // 1. PYTHON TRACK (Full Stack, Django, Fast API)
  if (lowerCourse.includes("python")) {
    const topics = [
      "Django Views & URLs", "Python Generators", "Decorator Logic", "Asyncio in Python",
      "Django REST Framework", "Python Type Hinting", "List & Dict Comprehensions",
      "Pandas Series & DataFrames", "NumPy Matrix Math", "Flask Microservices",
      "Multiprocessing", "Socket Programming", "PyTest Units", "PEP 8 Standards",
      "Memory Management (GC)", "Abstract Base Classes", "Metaclasses in Python",
      "Database Migrations", "Authentication Middleware", "FastAPI Pydantic",
      "Regex Patterns", "Virtual Environments", "Python Logging", "Boto3 AWS S3",
      "Celery Task Queues", "Redis Caching", "GraphQL with Graphene", "WebSocket Channels"
    ];
    const variants = [
      { q: "What is the best practice for implementing {topic} in a {course} project?", opts: ["Use built-in libraries", "Follow industry design patterns", "Write custom logic from scratch", "It's better to avoid it"], a: "Follow industry design patterns" },
      { q: "Which tool or library is standard for {topic}?", opts: ["Standard Library", "Pip installable packages", "External OS tools", "No standard exists"], a: "Pip installable packages" },
      { q: "How does {topic} improve the performance of {course} applications?", opts: ["Reduced latency", "Memory optimization", "Concurrency support", "All of the above"], a: "All of the above" },
      { q: "What is a common pitfall when using {topic}?", opts: ["Circular dependencies", "Memory leaks", "Security loopholes", "Poor readability"], a: "Poor readability" },
      { q: "In {course}, {topic} is primarily used for:", opts: ["Scaling", "Debugging", "Modularization", "Data Isolation"], a: "Modularization" },
      { q: "Which of the following describes the core architecture of {topic}?", opts: ["Declarative", "Imperative", "Event-driven", "Synchronous"], a: "Event-driven" },
      { q: "How is {topic} typically configured in a mission-critical {course} app?", opts: ["Environment Variables", "JSON Config", "Hardcoded Constants", "Database rows"], a: "Environment Variables" },
      { q: "What is the maximum scalability limit for {topic} in {course}?", opts: ["Vertical only", "Horizontal only", "Distributed clustering", "Limited by CPU"], a: "Distributed clustering" }
    ];
    questions = generateTechQuestions(courseName, topics, variants);
  }

  // 2. JAVA TRACK (Spring, Hibernate, Microservices)
  else if (lowerCourse.includes("java")) {
    const topics = [
      "Spring Boot Starters", "Hibernate Persistence", "JVM Heap Memory", "Java 8 Streams",
      "Spring Security OAuth", "Kafka Message Bus", "Microservices Discovery", "JUnit Mocking",
      "Multi-threading Executor", "Inheritance vs Composition", "Lombok Annotations",
      "Maven Repository Management", "Dockerizing Java Apps", "Spring Cloud Config",
      "RESTful Endpoint Design", "Dependency Injection", "AOP (Aspect Oriented)",
      "Garbage Collection Cycles", "Collections (TreeSet, HashMap)", "JDBC Connections",
      "Spring Batch Processing", "Reactive WebFlux", "JPA Specifications", "Quarkus Cloud Native"
    ];
    const variants = [
      { q: "In the context of {course}, why is {topic} considered essential?", opts: ["Efficiency", "Type Stability", "Ease of Testing", "Community Support"], a: "Efficiency" },
      { q: "What is the standard configuration for {topic}?", opts: ["XML mapping", "Annotation based", "Environment variables", "Hardcoded in Main"], a: "Annotation based" },
      { q: "Which error is most likely when {topic} fails?", opts: ["NullPointerException", "NoClassDefFoundError", "StackOverflowError", "BeanCreationException"], a: "BeanCreationException" },
      { q: "How do you optimize {topic} for high traffic?", opts: ["Caching", "Vertical Scaling", "Code Refactoring", "Load Balancing"], a: "Caching" },
      { q: "What is the memory footprint of {topic} in a standard JVM?", opts: ["Heap bound", "Stack bound", "Metaspace intensive", "Constant overhead"], a: "Heap bound" },
      { q: "How does {topic} handle concurrent requests in {course}?", opts: ["Blocking IO", "Non-blocking event loop", "Thread pooling", "Master-worker pattern"], a: "Thread pooling" },
      { q: "Which design pattern is fundamental to {topic}?", opts: ["Singleton", "Proxy", "Prototype", "Strategy"], a: "Proxy" }
    ];
    questions = generateTechQuestions(courseName, topics, variants);
  }

  // 3. FRONTEND / UI / MERN TRACK (React, Vue, Angular)
  else if (lowerCourse.includes("web") || lowerCourse.includes("ui") || lowerCourse.includes("react") || lowerCourse.includes("frontend") || lowerCourse.includes("mern") || lowerCourse.includes("vue") || lowerCourse.includes("angular")) {
    const topics = [
      "Lifecycle Hooks", "State Management (Redux)", "Context API", "Virtual DOM diffing",
      "Responsive Layouts (CSS Grid)", "TypeScript Interfaces", "Component Prop-drilling",
      "Server Side Rendering (SSR)", "API Fetching (Axios)", "Client Side Routing",
      "Shadow DOM", "Progressive Web Apps", "Form Validation", "WebSockets Real-time",
      "Unit Testing (Jest)", "Bundling (Webpack/Vite)", "CSS-in-JS (Styled)",
      "Authentication (JWT)", "Cross-Origin (CORS)", "DOM Manipulation",
      "GraphQL Fragments", "Next.js Static Generation", "Accessibility (A11y)", "Web Workers"
    ];
    const variants = [
      { q: "Why would a developer choose {topic} over other solutions?", opts: ["Performance", "Maintainability", "Browser Support", "Ecosystem"], a: "Maintainability" },
      { q: "What is the primary drawback of using {topic} incorrectly?", opts: ["Slow rendering", "Security risks", "Memory leaks", "Poor SEO"], a: "Slow rendering" },
      { q: "In {course}, how do we verify {topic} is working correctly?", opts: ["Browser Console", "Unit Tests", "Code Linting", "User Feedback"], a: "Unit Tests" },
      { q: "Which design pattern is best for {topic}?", opts: ["Singleton", "Observer", "Component-based", "Factory"], a: "Component-based" },
      { q: "How does {topic} affect the bundle size of a {course} application?", opts: ["Increases significantly", "Tree-shaking optimized", "Lazy loaded by default", "Negligible impact"], a: "Tree-shaking optimized" },
      { q: "What is the industry standard for securing {topic}?", opts: ["OAuth 2.0", "Basic Auth", "API Keys", "IP Whitelisting"], a: "OAuth 2.0" }
    ];
    questions = generateTechQuestions(courseName, topics, variants);
  }

  // 4. DATA SCIENCE / POWER BI / AI TRACK
  else if (lowerCourse.includes("data") || lowerCourse.includes("ai") || lowerCourse.includes("machine") || lowerCourse.includes("power") || lowerCourse.includes("tableau") || lowerCourse.includes("intelligence")) {
    const topics = [
      "DAX Expressions", "Data Modeling (Star Schema)", "Feature Scaling", "Random Forest Logic",
      "K-Means Clustering", "Visualization Storytelling", "SQL Joins & Aggregates",
      "NLP Sentiment Analysis", "TensorFlow Layers", "Matplotlib Charts",
      "ETL Pipelines", "Model Overfitting", "Bias-Variance Tradeoff", "Hyperparameter Tuning",
      "Predictive Analytics", "Business Metrics (KPIs)", "Big Data with Spark",
      "Cleaning Messy Data", "Correlation vs Causation", "Time Series Forecasting",
      "AutoML Workflows", "Deep Learning Neural Nets", "Data Lake Architecture", "Feature Engineering"
    ];
    const variants = [
      { q: "When performing {topic} in {course}, what is the first step?", opts: ["Data Cleaning", "Algorithm Selection", "Exporting Results", "Client Meeting"], a: "Data Cleaning" },
      { q: "Which tool is the industry standard for {topic}?", opts: ["Python/R", "Power BI", "Excel", "Depends on Scale"], a: "Depends on Scale" },
      { q: "What is a major challenge during {topic} implementation?", opts: ["Data Quality", "Processing Power", "Algorithmic Complexity", "All of the above"], a: "All of the above" },
      { q: "How do we measure the accuracy of {topic}?", opts: ["Validation Sets", "Training Loss", "Manual Review", "Deployment Feedback"], a: "Validation Sets" },
      { q: "Which mathematical concept is core to {topic} success?", opts: ["Linear Algebra", "Calculus", "Probability", "Graph Theory"], a: "Linear Algebra" },
      { q: "In {course}, {topic} is most effective for:", opts: ["Pattern Recognition", "Data Storage", "Networking", "User Interface"], a: "Pattern Recognition" }
    ];
    questions = generateTechQuestions(courseName, topics, variants);
  }

  // 5. ACADEMIC TRACK (Math, Physics, Chemistry, Biology)
  else if (lowerCourse.includes("math") || lowerCourse.includes("physics") || lowerCourse.includes("chem") || lowerCourse.includes("biology") || lowerCourse.includes("science")) {
    const topics = [
      "Calculus (Limits & Continuity)", "Thermodynamics Laws", "Organic synthesis",
      "Molecular Biology (DNA)", "Genetic Algorithms", "Quantum Mechanics",
      "Statistical Probability", "Electromagnetism", "Cellular Respiration",
      "Differential Equations", "Atomic Structure", "Periodic Trends",
      "Ecological Systems", "Biochemical Pathways", "Kinematics in Physics",
      "Neurobiology Basics", "Astrophysics Phenomena", "Material Science", "Environmental Chemistry"
    ];
    const variants = [
      { q: "In the study of {course}, {topic} is fundamental to understanding:", opts: ["Core mechanics", "Advanced theories", "Experimental results", "All scientific phenomena"], a: "Core mechanics" },
      { q: "Which formula or principle defines {topic}?", opts: ["Standard Equations", "Modern Theories", "Classical Laws", "Mathematical Proofs"], a: "Standard Equations" },
      { q: "How does {topic} affect the real-world application of {course}?", opts: ["Informs engineering", "Guides medical research", "Shapes economic policy", "Varies by industry"], a: "Varies by industry" },
      { q: "What is the most complex aspect of mastering {topic}?", opts: ["Abstract concepts", "Calculation precision", "Experimental validation", "Interdisciplinary links"], a: "Abstract concepts" },
      { q: "Which experimental method is standard for {topic}?", opts: ["Spectroscopy", "Titration", "Controlled Observation", "Peer Review"], a: "Controlled Observation" },
      { q: "What recent breakthrough has changed the perspective of {topic} in {course}?", opts: ["Quantum Computing", "CRISPR Tech", "AI Simulation", "Nanotechnology"], a: "AI Simulation" }
    ];
    questions = generateTechQuestions(courseName, topics, variants);
  }

  // 6. ENTERPRISE / MOBILE / LEGACY TRACK (.NET, PHP, Laravel, Flutter, Android)
  else if (lowerCourse.includes("dot") || lowerCourse.includes(".net") || lowerCourse.includes("php") || lowerCourse.includes("flutter") || lowerCourse.includes("mobile") || lowerCourse.includes("android") || lowerCourse.includes("ios") || lowerCourse.includes("swift") || lowerCourse.includes("kotlin")) {
    const topics = [
      "ASP.NET Core Middleware", "PHP Laravel Eloquent", "Flutter Widget Tree",
      "Android Intent System", "iOS Swift Optionals", "RESTful API in Laravel",
      "Entity Framework Migration", "Blade Templates", "Dart Async programming",
      "Native Bridge for Apps", "Gradle Build Systems", "App Store Guidelines",
      "User Permission handling", "Local Storage (SQLite)", "Responsive App UI"
    ];
    const variants = [
      { q: "Why is {topic} essential for modern {course} development?", opts: ["Performance", "User Experience", "Developer Speed", "Security"], a: "User Experience" },
      { q: "Which tool is primarily used to debug {topic}?", opts: ["IDE Debugger", "Log profiling", "Remote console", "Device simulators"], a: "Device simulators" },
      { q: "What is a defining characteristic of {topic}?", opts: ["Scalability", "Reliability", "Specific syntax rules", "Community driven"], a: "Specific syntax rules" },
      { q: "How does {topic} scale in an enterprise {course} environment?", opts: ["Modularization", "Cloud integration", "Micro-services", "Vertical stacking"], a: "Modularization" }
    ];
    questions = generateTechQuestions(courseName, topics, variants);
  }

  // 7. TESTING / QA TRACK
  else if (lowerCourse.includes("testing") || lowerCourse.includes("qa") || lowerCourse.includes("automation")) {
    const topics = [
      "Selenium Grid", "Cucumber BDD", "Test-Driven Development", "Load Testing with JMeter",
      "Bug Life Cycle", "Regression Suite", "Zero-day vulnerability check", "Penetration Tests",
      "Mobile App Automation", "API contract testing", "CI/CD Pipeline tests",
      "Accessibility Testing", "User Acceptance (UAT)", "Equivalence Partitioning"
    ];
    const variants = [
      { q: "What is the primary goal of {topic} in the STLC?", opts: ["Detecting bugs early", "Validating requirements", "Preventing regressions", "All of the above"], a: "All of the above" },
      { q: "Which reporting tool is standard for {topic}?", opts: ["Allure", "ExtentReports", "Built-in logs", "Screenshot verification"], a: "Allure" },
      { q: "When should {topic} be performed?", opts: ["Daily", "After every build", "Before release", "Continuously"], a: "Continuously" },
      { q: "What is the biggest challenge in {topic} automation?", opts: ["Maintenance", "Initial setup", "Script complexity", "Tool costs"], a: "Maintenance" }
    ];
    questions = generateTechQuestions(courseName, topics, variants);
  }

  // 8. FALLBACK / GENERAL
  else {
    const topics = [
      "Industry Trends", "Fundamental Concepts", "Advanced Modules", "Expert Workflows",
      "Standard Practices", "Technical Ethics", "Team Communications", "Problem Solving",
      "Resource Management", "Scalability Planning", "Security Auditing", "Deployment Strategy"
    ];
    const variants = [
      { q: "How do you define progress in the field of {course} through {topic}?", opts: ["Innovation", "Efficiency", "Customer Satisfaction", "Code Quality"], a: "Innovation" },
      { q: "What is the first step in mastering {topic}?", opts: ["Theoretical study", "Practical labs", "Reading documentation", "Watching tutorials"], a: "Theoretical study" },
      { q: "Who is responsible for maintaining {topic} in a production environment?", opts: ["DevOps Team", "Full Stack Devs", "System Admins", "Entire Tech Team"], a: "Entire Tech Team" },
      { q: "What is the long-term impact of {topic} on {course} evolution?", opts: ["Higher standards", "Easier maintenance", "Lower costs", "Better performance"], a: "Better performance" }
    ];
    questions = generateTechQuestions(courseName, topics, variants);
  }

  // Finalization logic (Common for all)
  const categoryPrefix = category === "Monthly" ? "Assessment" : "Knowledge Check";
  const label = (courseName || "General").toString().toUpperCase();

  // Mix in jumbled unique questions for every click
  let rawQuestions = questions.map(q => ({
    ...q,
    question: `[${categoryPrefix}] ${q.question}`,
    id: `auto_${Math.random().toString(36).substr(2, 9)}_${Date.now()}`
  }));

  // Ensure we have exactly 'count' questions (e.g., 80)
  let finalQuestions = shuffle([...rawQuestions]);

  // If we have more than needed, slice. If less, generate Variations with context shifts to ensure uniqueness
  if (finalQuestions.length < count) {
    const diff = count - finalQuestions.length;
    const additional = [];
    for (let i = 0; i < diff; i++) {
      const base = finalQuestions[i % finalQuestions.length];
      const scenario = i % 2 === 0 ? "Corporate" : "Enterprise";
      additional.push({
        ...base,
        question: `${base.question} (In ${scenario} Context)`,
        id: `auto_ext_${i}_${Math.random().toString(36).substr(2, 5)}_${Date.now()}`
      });
    }
    finalQuestions = [...finalQuestions, ...additional];
  }

  return finalQuestions.slice(0, count);
};
