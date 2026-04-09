import {
  FaPython, FaJs, FaJava, FaDatabase, FaMicrosoft, FaReact, FaLock, FaCode,
  FaBrain, FaRobot, FaCloud, FaShieldAlt, FaChartLine, FaMobile, FaGamepad,
  FaServer, FaCogs, FaLaptopCode, FaGitAlt, FaDocker, FaAws, FaGoogle,
  FaApple, FaAndroid, FaBook, FaChartBar, FaUsers, FaBootstrap, FaHtml5, FaCss3
} from "./LightweightIcons.jsx";




  // Icon mapping for automatic logo generation
  export const getIconForCourse = (courseName) => {
    const lowerName = courseName.toLowerCase();
    
    if (lowerName.includes('python')) return FaPython;
    if (lowerName.includes('javascript') || lowerName.includes('js')) return FaJs;
    if (lowerName.includes('java')) return FaJava;
    if (lowerName.includes('sql') || lowerName.includes('database')) return FaDatabase;
    if (lowerName.includes('.net') || lowerName.includes('dotnet')) return FaMicrosoft;
    if (lowerName.includes('react')) return FaReact;
    if (lowerName.includes('ai') || lowerName.includes('artificial')) return FaBrain;
    if (lowerName.includes('agentic') || lowerName.includes('agent')) return FaRobot;
    if (lowerName.includes('cloud')) return FaCloud;
    if (lowerName.includes('security') || lowerName.includes('cyber')) return FaShieldAlt;
    if (lowerName.includes('data') || lowerName.includes('analytics')) return FaChartLine;
    if (lowerName.includes('mobile') || lowerName.includes('app')) return FaMobile;
    if (lowerName.includes('game') || lowerName.includes('gaming')) return FaGamepad;
    if (lowerName.includes('server') || lowerName.includes('backend')) return FaServer;
    if (lowerName.includes('devops') || lowerName.includes('tools')) return FaCogs;
    if (lowerName.includes('web') || lowerName.includes('frontend')) return FaLaptopCode;
    if (lowerName.includes('git') || lowerName.includes('version')) return FaGitAlt;
    if (lowerName.includes('docker') || lowerName.includes('container')) return FaDocker;
    if (lowerName.includes('aws') || lowerName.includes('amazon')) return FaAws;
    if (lowerName.includes('google') || lowerName.includes('gcp')) return FaGoogle;
    if (lowerName.includes('apple') || lowerName.includes('ios')) return FaApple;
    if (lowerName.includes('android')) return FaAndroid;
    if (lowerName.includes('bootstrap')) return FaBootstrap;
    if (lowerName.includes('html')) return FaHtml5;
    if (lowerName.includes('css')) return FaCss3;
    
    return FaCode; // Default icon
  };

  // Generate dynamic topics for new courses
  export const generateTopicsForCourse = (courseName) => {
    const lowerName = courseName.toLowerCase();
    console.log('Generating topics for:', courseName, 'Lowercase:', lowerName);
    
    // Mathematics Courses
    if (lowerName.includes('math') || lowerName.includes('mathematics') || lowerName.includes('calculus') || lowerName.includes('algebra') || lowerName.includes('geometry') || lowerName.includes('trigonometry') || lowerName.includes('statistics')) {
      console.log('Matched Mathematics topics');
      
      if (lowerName.includes('calculus')) {
        return [
          "Limits and Continuity",
          "Derivatives and Differentiation",
          "Applications of Derivatives",
          "Integration Techniques",
          "Definite and Indefinite Integrals",
          "Applications of Integration",
          "Differential Equations",
          "Multivariable Calculus"
        ];
      }
      
      if (lowerName.includes('algebra')) {
        return [
          "Linear Equations and Inequalities",
          "Quadratic Equations",
          "Polynomials and Factoring",
          "Systems of Equations",
          "Matrices and Determinants",
          "Complex Numbers",
          "Sequences and Series",
          "Exponential and Logarithmic Functions"
        ];
      }
      
      if (lowerName.includes('geometry')) {
        return [
          "Basic Geometric Concepts",
          "Triangles and Properties",
          "Circles and Arcs",
          "Polygons and Angles",
          "Coordinate Geometry",
          "Transformations",
          "Area and Volume",
          "Geometric Proofs"
        ];
      }
      
      if (lowerName.includes('statistics')) {
        return [
          "Descriptive Statistics",
          "Probability Theory",
          "Random Variables",
          "Probability Distributions",
          "Sampling Methods",
          "Hypothesis Testing",
          "Regression Analysis",
          "Statistical Inference"
        ];
      }
      
      if (lowerName.includes('trigonometry')) {
        return [
          "Trigonometric Functions",
          "Trigonometric Identities",
          "Solving Trigonometric Equations",
          "Applications of Trigonometry",
          "Trigonometric Graphs",
          "Inverse Trigonometric Functions",
          "Law of Sines and Cosines",
          "Complex Numbers and Trigonometry"
        ];
      }
      
      // General Mathematics
      return [
        "Number Systems and Operations",
        "Fractions and Decimals",
        "Percentages and Ratios",
        "Basic Algebra",
        "Geometry Fundamentals",
        "Data Handling",
        "Problem Solving Techniques",
        "Mathematical Reasoning"
      ];
    }
    
    // Physics Courses
    if (lowerName.includes('physics') || lowerName.includes('mechanics') || lowerName.includes('thermodynamics') || lowerName.includes('optics') || lowerName.includes('electromagnetism') || lowerName.includes('quantum') || lowerName.includes('nuclear')) {
      console.log('Matched Physics topics');
      
      if (lowerName.includes('mechanics')) {
        return [
          "Kinematics and Motion",
          "Newton's Laws of Motion",
          "Work, Energy and Power",
          "Momentum and Collisions",
          "Rotational Motion",
          "Gravitation",
          "Fluid Mechanics",
          "Oscillations and Waves"
        ];
      }
      
      if (lowerName.includes('thermodynamics')) {
        return [
          "Temperature and Heat",
          "Laws of Thermodynamics",
          "Ideal Gas Laws",
          "Heat Transfer",
          "Entropy and Free Energy",
          "Thermodynamic Processes",
          "Statistical Mechanics",
          "Applications of Thermodynamics"
        ];
      }
      
      if (lowerName.includes('optics')) {
        return [
          "Nature of Light",
          "Reflection and Refraction",
          "Lenses and Mirrors",
          "Optical Instruments",
          "Interference and Diffraction",
          "Polarization",
          "Lasers and Applications",
          "Fiber Optics"
        ];
      }
      
      if (lowerName.includes('electromagnetism') || lowerName.includes('electricity') || lowerName.includes('magnetism')) {
        return [
          "Electric Charges and Fields",
          "Electric Potential and Capacitance",
          "Current and Resistance",
          "Magnetic Fields",
          "Electromagnetic Induction",
          "AC and DC Circuits",
          "Electromagnetic Waves",
          "Applications of Electromagnetism"
        ];
      }
      
      if (lowerName.includes('quantum')) {
        return [
          "Introduction to Quantum Mechanics",
          "Wave-Particle Duality",
          "Schrödinger Equation",
          "Quantum States and Operators",
          "Atomic Structure",
          "Quantum Entanglement",
          "Applications of Quantum Physics",
          "Quantum Computing Basics"
        ];
      }
      
      // General Physics
      return [
        "Introduction to Physics",
        "Measurements and Units",
        "Vectors and Scalars",
        "Motion in One Dimension",
        "Forces and Newton's Laws",
        "Energy and Work",
        "Waves and Sound",
        "Modern Physics Introduction"
      ];
    }
    
    // Chemistry Courses
    if (lowerName.includes('chemistry') || lowerName.includes('organic') || lowerName.includes('inorganic') || lowerName.includes('physical') || lowerName.includes('biochemistry') || lowerName.includes('analytical')) {
      console.log('Matched Chemistry topics');
      
      if (lowerName.includes('organic')) {
        return [
          "Introduction to Organic Chemistry",
          "Hydrocarbons and Functional Groups",
          "Alkanes and Alkenes",
          "Aromatic Compounds",
          "Alcohols, Phenols and Ethers",
          "Aldehydes and Ketones",
          "Carboxylic Acids and Derivatives",
          "Organic Reaction Mechanisms"
        ];
      }
      
      if (lowerName.includes('inorganic')) {
        return [
          "Periodic Table and Periodicity",
          "Chemical Bonding",
          "Coordination Compounds",
          "Transition Elements",
          "Acids and Bases",
          "Redox Reactions",
          "Metallurgy and Extraction",
          "Environmental Chemistry"
        ];
      }
      
      if (lowerName.includes('physical')) {
        return [
          "States of Matter",
          "Chemical Thermodynamics",
          "Chemical Kinetics",
          "Chemical Equilibrium",
          "Electrochemistry",
          "Surface Chemistry",
          "Solutions and Colligative Properties",
          "Molecular Structure"
        ];
      }
      
      if (lowerName.includes('biochemistry')) {
        return [
          "Biomolecules Introduction",
          "Carbohydrates and Metabolism",
          "Proteins and Amino Acids",
          "Lipids and Membranes",
          "Enzymes and Catalysis",
          "Nucleic Acids and DNA",
          "Bioenergetics",
          "Metabolic Pathways"
        ];
      }
      
      if (lowerName.includes('analytical')) {
        return [
          "Introduction to Analytical Chemistry",
          "Classical Methods of Analysis",
          "Spectroscopic Methods",
          "Chromatographic Techniques",
          "Electroanalytical Methods",
          "Statistical Analysis in Chemistry",
          "Quality Control and Assurance",
          "Environmental Analysis"
        ];
      }
      
      // General Chemistry
      return [
        "Atomic Structure",
        "Chemical Bonding and Molecular Structure",
        "Classification of Elements",
        "Chemical Reactions and Equations",
        "Acids, Bases and Salts",
        "States of Matter",
        "Solutions",
        "Environmental Chemistry"
      ];
    }
    
    // Biology Courses
    if (lowerName.includes('biology') || lowerName.includes('botany') || lowerName.includes('zoology') || lowerName.includes('genetics') || lowerName.includes('ecology') || lowerName.includes('microbiology')) {
      console.log('Matched Biology topics');
      
      if (lowerName.includes('botany')) {
        return [
          "Plant Cell Structure",
          "Plant Physiology",
          "Plant Morphology",
          "Plant Reproduction",
          "Photosynthesis",
          "Plant Hormones",
          "Plant Ecology",
          "Economic Botany"
        ];
      }
      
      if (lowerName.includes('zoology')) {
        return [
          "Animal Cell Structure",
          "Animal Tissues",
          "Animal Physiology",
          "Animal Reproduction",
          "Animal Behavior",
          "Evolution and Adaptation",
          "Classification of Animals",
          "Conservation Biology"
        ];
      }
      
      if (lowerName.includes('genetics')) {
        return [
          "Introduction to Genetics",
          "Mendelian Genetics",
          "Chromosomal Theory",
          "Molecular Genetics",
          "Gene Expression",
          "Genetic Engineering",
          "Population Genetics",
          "Genetic Disorders"
        ];
      }
      
      if (lowerName.includes('ecology')) {
        return [
          "Introduction to Ecology",
          "Ecosystem Structure",
          "Energy Flow in Ecosystems",
          "Biogeochemical Cycles",
          "Population Ecology",
          "Community Ecology",
          "Conservation Ecology",
          "Climate Change and Ecology"
        ];
      }
      
      if (lowerName.includes('microbiology')) {
        return [
          "Introduction to Microbiology",
          "Microbial Cell Structure",
          "Bacterial Classification",
          "Virology",
          "Microbial Growth",
          "Microbial Genetics",
          "Industrial Microbiology",
          "Medical Microbiology"
        ];
      }
      
      // General Biology
      return [
        "Cell Biology",
        "Biological Molecules",
        "Genetics and Evolution",
        "Plant and Animal Kingdom",
        "Human Physiology",
        "Ecology and Environment",
        "Biodiversity",
        "Biotechnology"
      ];
    }
    
    // Computer Science / IT Courses
    if (lowerName.includes('computer') || lowerName.includes('programming') || lowerName.includes('coding') || lowerName.includes('software') || lowerName.includes('algorithm') || lowerName.includes('data structure')) {
      console.log('Matched Computer Science topics');
      
      if (lowerName.includes('algorithm')) {
        return [
          "Introduction to Algorithms",
          "Analysis of Algorithms",
          "Sorting Algorithms",
          "Searching Algorithms",
          "Graph Algorithms",
          "Dynamic Programming",
          "Greedy Algorithms",
          "Advanced Algorithm Design"
        ];
      }
      
      if (lowerName.includes('data structure')) {
        return [
          "Introduction to Data Structures",
          "Arrays and Linked Lists",
          "Stacks and Queues",
          "Trees and Graphs",
          "Hash Tables",
          "Heap and Priority Queue",
          "Advanced Data Structures",
          "Applications of Data Structures"
        ];
      }
      
      return [
        "Introduction to Computer Science",
        "Programming Fundamentals",
        "Object Oriented Programming",
        "Database Management",
        "Computer Networks",
        "Operating Systems",
        "Software Engineering",
        "Web Development"
      ];
    }
    
    // Power BI / Business Intelligence
    if (lowerName.includes('power bi') || lowerName.includes('powerbi') || lowerName.includes('business intelligence') || lowerName.includes('bi')) {
      console.log('Matched Power BI/BI topics');
      return [
        "Introduction to Power BI",
        "Data Modeling in Power BI",
        "DAX Functions",
        "Power Query and Data Transformation",
        "Creating Visualizations",
        "Power BI Service",
        "Dashboard Design",
        "Advanced Analytics"
      ];
    }
    
    // AI/Agentic AI
    if (lowerName.includes('ai') || lowerName.includes('artificial') || lowerName.includes('agentic') || lowerName.includes('machine learning') || lowerName.includes('ml')) {
      console.log('Matched AI/Agentic topics');
      return [
        "Introduction to AI",
        "Machine Learning Basics",
        "Neural Networks",
        "Deep Learning",
        "Natural Language Processing",
        "Computer Vision",
        "AI Ethics",
        "Reinforcement Learning"
      ];
    }
    
    // Python Testing / Automation Testing (more specific check first)
    if (lowerName.includes('python testing') || lowerName.includes('automation testing') || lowerName.includes('test automation')) {
      console.log('Matched Python Testing/Automation topics');
      return [
        "Introduction to Python Testing",
        "Unit Testing with PyTest",
        "Test Driven Development",
        "Automation Testing Frameworks",
        "Selenium with Python",
        "API Testing with Python",
        "Test Data Management",
        "Continuous Integration Testing"
      ];
    }
    
    // General Testing (fallback for any testing-related courses)
    if (lowerName.includes('testing') || lowerName.includes('qa') || lowerName.includes('quality')) {
      console.log('Matched General Testing topics');
      return [
        "Introduction to Software Testing",
        "Manual Testing Basics",
        "Test Planning and Design",
        "Test Execution and Reporting",
        "Quality Assurance",
        "Test Management Tools",
        "Bug Tracking and Reporting",
        "Testing Best Practices"
      ];
    }
    
    // Python Full Stack Courses
    if (lowerName.includes('python full stack') || lowerName.includes('python fullstack') || (lowerName.includes('python') && (lowerName.includes('full stack') || lowerName.includes('fullstack')))) {
      console.log('Matched Python Full Stack topics');
      return [
        "Python Fundamentals and Syntax",
        "Object-Oriented Programming in Python",
        "Data Structures and Algorithms in Python",
        "Web Development with Flask",
        "Web Development with Django",
        "RESTful API Development with Python",
        "Database Integration with SQLAlchemy",
        "Frontend Development with HTML/CSS/JavaScript",
        "React.js for Python Developers",
        "Authentication and Security",
        "Testing and Debugging in Python",
        "Deployment and DevOps Basics",
        "Version Control with Git",
        "Cloud Deployment (AWS/Azure)",
        "Project Management and Collaboration",
        "Building Full Stack Applications"
      ];
    }
    
    // Java Full Stack Courses
    if (lowerName.includes('java full stack') || lowerName.includes('java fullstack') || (lowerName.includes('java') && (lowerName.includes('full stack') || lowerName.includes('fullstack')))) {
      console.log('Matched Java Full Stack topics');
      return [
        "Java Fundamentals and Core Concepts",
        "Object-Oriented Programming in Java",
        "Advanced Java Features and Collections",
        "Spring Framework Fundamentals",
        "Spring Boot for Rapid Development",
        "RESTful API Development with Spring",
        "Database Integration with JPA/Hibernate",
        "Frontend Development with HTML/CSS/JavaScript",
        "React.js or Angular for Java Developers",
        "Microservices Architecture",
        "Spring Security and Authentication",
        "Testing with JUnit and Mockito",
        "Maven and Gradle Build Tools",
        "Cloud Deployment with Docker",
        "CI/CD Pipelines for Java Applications",
        "Enterprise Application Development"
      ];
    }
    
    // Django Courses
    if (lowerName.includes('django') || lowerName.includes('django python') || lowerName.includes('python django')) {
      console.log('Matched Django topics');
      return [
        "Django Introduction and Setup",
        "Django Models and Database Design",
        "Django Views and URL Routing",
        "Django Templates and Frontend Integration",
        "Django Forms and User Input",
        "User Authentication and Authorization",
        "Django Admin Interface",
        "Class-Based Views and Generic Views",
        "Django REST Framework",
        "API Development and Serialization",
        "Django Security Best Practices",
        "Testing Django Applications",
        "Django Performance Optimization",
        "Deploying Django Applications",
        "Django with React/Vue.js Integration",
        "Advanced Django Patterns and Techniques"
      ];
    }
    
    // UI Full Stack Courses
    if (lowerName.includes('ui full stack') || lowerName.includes('ui fullstack') || lowerName.includes('frontend full stack') || lowerName.includes('frontend fullstack')) {
      console.log('Matched UI Full Stack topics');
      return [
        "HTML5 Fundamentals and Semantic Markup",
        "CSS3 and Modern Styling Techniques",
        "Responsive Design and Mobile-First Development",
        "JavaScript ES6+ and Modern Features",
        "DOM Manipulation and Event Handling",
        "React.js Fundamentals and Components",
        "State Management with Redux/Context API",
        "Vue.js or Angular Frameworks",
        "TypeScript for Type-Safe JavaScript",
        "CSS Frameworks (Bootstrap, Tailwind CSS)",
        "UI/UX Design Principles",
        "Frontend Build Tools and Bundlers",
        "API Integration and Data Fetching",
        "Frontend Testing and Debugging",
        "Progressive Web Apps (PWA)",
        "Frontend Performance Optimization"
      ];
    }
    
    // MERN Stack Courses
    if (lowerName.includes('mern') || lowerName.includes('mern stack') || (lowerName.includes('mongodb') && lowerName.includes('express') && lowerName.includes('react') && lowerName.includes('node'))) {
      console.log('Matched MERN Stack topics');
      return [
        "MongoDB Database Design and Operations",
        "Express.js Server-Side Development",
        "Node.js Fundamentals and Runtime",
        "React.js Frontend Development",
        "RESTful API Design and Implementation",
        "MongoDB Schema Design and Modeling",
        "Authentication with JWT and Sessions",
        "State Management in React Applications",
        "File Upload and Cloud Storage",
        "Real-time Applications with Socket.io",
        "MERN Stack Deployment Strategies",
        "Testing MERN Applications",
        "Performance Optimization Techniques",
        "Security Best Practices for MERN",
        "Scalable Architecture Patterns",
        "Building Full-Stack MERN Projects"
      ];
    }
    
    // MEAN Stack Courses
    if (lowerName.includes('mean') || lowerName.includes('mean stack') || (lowerName.includes('mongodb') && lowerName.includes('express') && lowerName.includes('angular') && lowerName.includes('node'))) {
      console.log('Matched MEAN Stack topics');
      return [
        "MongoDB Database Fundamentals",
        "Express.js Backend Development",
        "Angular Frontend Framework",
        "Node.js Server-Side JavaScript",
        "TypeScript for MEAN Development",
        "Angular Components and Services",
        "Express Middleware and Routing",
        "MongoDB Aggregation and Queries",
        "Angular Forms and Validation",
        "Authentication and Authorization",
        "Real-time Data with WebSockets",
        "MEAN Stack Testing Strategies",
        "Angular CLI and Build Tools",
        "Cloud Deployment for MEAN Applications",
        "Microservices with MEAN Stack",
        "Enterprise MEAN Application Development"
      ];
    }
    
    // .NET Full Stack Courses
    if (lowerName.includes('.net') || lowerName.includes('dotnet') || lowerName.includes('c# full stack') || lowerName.includes('asp.net')) {
      console.log('Matched .NET Full Stack topics');
      return [
        "C# Programming Fundamentals",
        ".NET Framework and Core Architecture",
        "Object-Oriented Programming in C#",
        "ASP.NET Core Web Development",
        "Entity Framework Core and Database Integration",
        "MVC Pattern and Razor Pages",
        "Web API Development with .NET",
        "Blazor for Web UI Development",
        "Authentication and Authorization in .NET",
        "Dependency Injection and IoC Containers",
        "SignalR for Real-time Communication",
        "Azure Cloud Integration",
        "Docker Containerization for .NET",
        "Unit Testing with xUnit and NUnit",
        "Microservices with .NET",
        "Enterprise Application Patterns"
      ];
    }
    
    // PHP Full Stack Courses
    if (lowerName.includes('php full stack') || lowerName.includes('php fullstack') || (lowerName.includes('php') && (lowerName.includes('full stack') || lowerName.includes('fullstack')))) {
      console.log('Matched PHP Full Stack topics');
      return [
        "PHP Fundamentals and Syntax",
        "Object-Oriented Programming in PHP",
        "Database Design with MySQL/MariaDB",
        "PHP Frameworks (Laravel, Symfony)",
        "Laravel Framework Deep Dive",
        "RESTful API Development with PHP",
        "Frontend Integration with Blade Templates",
        "Authentication and Security in PHP",
        "Composer and Package Management",
        "PHP Testing with PHPUnit",
        "Frontend Technologies Integration",
        "Session Management and Cookies",
        "File Upload and Storage Systems",
        "Performance Optimization Techniques",
        "Deployment and DevOps for PHP",
        "Building Scalable PHP Applications"
      ];
    }
    
    // Ruby on Rails Courses
    if (lowerName.includes('ruby on rails') || lowerName.includes('rails') || lowerName.includes('ror')) {
      console.log('Matched Ruby on Rails topics');
      return [
        "Ruby Programming Fundamentals",
        "Rails Framework Introduction",
        "MVC Architecture in Rails",
        "Active Record and Database Operations",
        "Rails Controllers and Routing",
        "Views and ERB Templates",
        "Rails Asset Pipeline",
        "Authentication with Devise",
        "Rails API Development",
        "Testing Rails Applications",
        "Background Jobs with Sidekiq",
        "Rails Performance Optimization",
        "Rails Security Best Practices",
        "Deploying Rails Applications",
        "Frontend Integration with JavaScript",
        "Advanced Rails Patterns"
      ];
    }
    
    // Vue.js Full Stack Courses
    if (lowerName.includes('vue full stack') || lowerName.includes('vuejs') || lowerName.includes('vue.js')) {
      console.log('Matched Vue.js Full Stack topics');
      return [
        "Vue.js Fundamentals and Core Concepts",
        "Vue Components and Props",
        "Vue Router for Navigation",
        "State Management with Vuex",
        "Vue Composition API",
        "Vue.js with TypeScript",
        "Backend Integration with Node.js/Express",
        "Database Design and Integration",
        "RESTful API Development",
        "Authentication in Vue Applications",
        "Vue.js Testing Strategies",
        "Vue.js Build Tools and Vite",
        "Progressive Web Apps with Vue",
        "Vue.js Performance Optimization",
        "Deploying Vue.js Applications",
        "Building Enterprise Vue.js Applications"
      ];
    }
    
    // Angular Full Stack Courses
    if (lowerName.includes('angular full stack') || lowerName.includes('angularjs') || lowerName.includes('angular')) {
      console.log('Matched Angular Full Stack topics');
      return [
        "Angular Fundamentals and Architecture",
        "TypeScript for Angular Development",
        "Angular Components and Templates",
        "Angular Services and Dependency Injection",
        "Angular Routing and Navigation",
        "Forms and Validation in Angular",
        "HTTP Client and API Integration",
        "RxJS and Reactive Programming",
        "State Management with NgRx",
        "Angular Testing with Jasmine/Karma",
        "Angular Security and Authentication",
        "Angular Material and UI Design",
        "Angular Performance Optimization",
        "Angular CLI and Build Tools",
        "Deploying Angular Applications",
        "Enterprise Angular Development"
      ];
    }
    
    // Flutter Full Stack Courses
    if (lowerName.includes('flutter full stack') || lowerName.includes('flutter') || lowerName.includes('dart')) {
      console.log('Matched Flutter Full Stack topics');
      return [
        "Dart Programming Fundamentals",
        "Flutter Framework Introduction",
        "Flutter Widgets and UI Components",
        "State Management in Flutter",
        "Navigation and Routing in Flutter",
        "Flutter with Firebase Integration",
        "RESTful API Integration in Flutter",
        "Local Database with SQLite/Hive",
        "Flutter Testing Strategies",
        "Flutter Animation and Gestures",
        "Flutter Performance Optimization",
        "Flutter Deployment and Publishing",
        "Backend Integration with Node.js",
        "Flutter for Web and Desktop",
        "Advanced Flutter Patterns",
        "Building Production Flutter Apps"
      ];
    }
    
    // React Native Full Stack Courses
    if (lowerName.includes('react native full stack') || lowerName.includes('react native') || lowerName.includes('rn')) {
      console.log('Matched React Native Full Stack topics');
      return [
        "React Native Fundamentals",
        "JavaScript ES6+ for React Native",
        "React Native Components and Styling",
        "Navigation and Routing in React Native",
        "State Management in React Native",
        "API Integration and Data Fetching",
        "Local Storage and Databases",
        "React Native Testing",
        "Push Notifications",
        "Camera and Media Integration",
        "Maps and Location Services",
        "Authentication in Mobile Apps",
        "Performance Optimization",
        "Deploying to App Stores",
        "Backend Integration with Node.js",
        "Building Production Mobile Apps"
      ];
    }
    
    // Python (general - checked after specific variants)
    if (lowerName.includes('python') && !lowerName.includes('testing') && !lowerName.includes('automation') && !lowerName.includes('full stack') && !lowerName.includes('fullstack') && !lowerName.includes('django')) {
      console.log('Matched Python topics');
      return [
        "Python Basics",
        "Variables and Data Types",
        "Loops",
        "Functions",
        "Lists and Tuples",
        "Dictionaries",
        "File Handling",
        "Exception Handling"
      ];
    }
    
    // JavaScript
    if (lowerName.includes('javascript') || lowerName.includes('js') || lowerName.includes('node') || lowerName.includes('nodejs')) {
      console.log('Matched JavaScript topics');
      return [
        "JS Basics",
        "ES6",
        "DOM Manipulation",
        "React Basics",
        "Arrays and Objects",
        "Async Programming",
        "Event Handling",
        "Error Handling"
      ];
    }
    
    // Java
    if (lowerName.includes('java') || lowerName.includes('spring') || lowerName.includes('jsp')) {
      console.log('Matched Java topics');
      return [
        "Introduction to Java",
        "Java Operators",
        "Data Types",
        "Control Flow",
        "Methods",
        "Classes and Objects",
        "Inheritance",
        "Polymorphism"
      ];
    }
    
    // SQL/Database
    if (lowerName.includes('sql') || lowerName.includes('database') || lowerName.includes('mysql') || lowerName.includes('postgresql')) {
      console.log('Matched SQL/Database topics');
      return [
        "SQL Basics",
        "SELECT Queries",
        "Joins",
        "Aggregate Functions",
        "Subqueries",
        "Indexes",
        "Transactions",
        "Database Normalization"
      ];
    }
    
    // React
    if (lowerName.includes('react') || lowerName.includes('redux') || lowerName.includes('next')) {
      console.log('Matched React topics');
      return [
        "React Intro",
        "Components",
        "State Management",
        "Hooks",
        "Props and PropTypes",
        "Conditional Rendering",
        "Forms in React",
        "React Router"
      ];
    }
    
    // DevOps
    if (lowerName.includes('devops') || lowerName.includes('tools') || lowerName.includes('docker') || lowerName.includes('kubernetes')) {
      console.log('Matched DevOps topics');
      return [
        "Introduction to DevOps",
        "Version Control with Git",
        "CI/CD Pipelines",
        "Container Orchestration",
        "Infrastructure as Code",
        "Monitoring and Logging",
        "Cloud Platforms",
        "DevOps Best Practices"
      ];
    }
    
    // Cyber Security
    if (lowerName.includes('security') || lowerName.includes('cyber') || lowerName.includes('ethical hacking') || lowerName.includes('penetration')) {
      console.log('Matched Cyber Security topics');
      return [
        "Introduction to Cyber Security",
        "Network Security Fundamentals",
        "Cryptography and Encryption",
        "Web Application Security",
        "Ethical Hacking Basics",
        "Security Auditing",
        "Incident Response",
        "Security Compliance"
      ];
    }
    
    // Data Science
    if (lowerName.includes('data science') || lowerName.includes('datascience') || lowerName.includes('analytics') || lowerName.includes('visualization')) {
      console.log('Matched Data Science topics');
      return [
        "Data Science Introduction",
        "Statistics for Data Science",
        "Data Collection and Cleaning",
        "Exploratory Data Analysis",
        "Machine Learning Fundamentals",
        "Data Visualization",
        "Big Data Technologies",
        "Data Science Projects"
      ];
    }
    
    // Cloud Computing
    if (lowerName.includes('cloud') || lowerName.includes('aws') || lowerName.includes('azure') || lowerName.includes('gcp')) {
      console.log('Matched Cloud Computing topics');
      return [
        "Cloud Computing Basics",
        "AWS Fundamentals",
        "Azure Services",
        "Google Cloud Platform",
        "Cloud Architecture",
        "Cloud Security",
        "DevOps in Cloud",
        "Cloud Cost Management"
      ];
    }
    
    // Mobile Development
    if (lowerName.includes('mobile') || lowerName.includes('android') || lowerName.includes('ios') || lowerName.includes('flutter')) {
      console.log('Matched Mobile Development topics');
      return [
        "Mobile App Development",
        "Android Studio Setup",
        "iOS Development Basics",
        "React Native",
        "Flutter Basics",
        "Mobile UI/UX",
        "App Deployment",
        "Mobile Testing"
      ];
    }
    
    // Web Development
    if (lowerName.includes('web') || lowerName.includes('html') || lowerName.includes('css') || lowerName.includes('frontend') || lowerName.includes('backend')) {
      console.log('Matched Web Development topics');
      return [
        "HTML Fundamentals",
        "CSS Styling",
        "JavaScript for Web",
        "Responsive Design",
        "Web Frameworks",
        "Backend Basics",
        "Web APIs",
        "Web Performance"
      ];
    }
    
    // English/Language Courses
    if (lowerName.includes('english') || lowerName.includes('language') || lowerName.includes('grammar') || lowerName.includes('literature') || lowerName.includes('writing')) {
      console.log('Matched English/Language topics');
      
      if (lowerName.includes('grammar')) {
        return [
          "Parts of Speech",
          "Sentence Structure",
          "Tenses and Time",
          "Punctuation Rules",
          "Subject-Verb Agreement",
          "Active and Passive Voice",
          "Common Grammar Mistakes",
          "Advanced Grammar Concepts"
        ];
      }
      
      if (lowerName.includes('literature')) {
        return [
          "Introduction to Literature",
          "Poetry Analysis",
          "Drama and Theater",
          "Fiction and Non-Fiction",
          "Literary Devices",
          "Critical Analysis",
          "World Literature",
          "Contemporary Literature"
        ];
      }
      
      if (lowerName.includes('writing')) {
        return [
          "Creative Writing Basics",
          "Essay Writing",
          "Business Writing",
          "Technical Writing",
          "Storytelling Techniques",
          "Writing Style and Voice",
          "Editing and Proofreading",
          "Publishing and Distribution"
        ];
      }
      
      return [
        "English Language Basics",
        "Vocabulary Building",
        "Reading Comprehension",
        "Communication Skills",
        "Public Speaking",
        "Business English",
        "Academic Writing",
        "Cultural Context"
      ];
    }
    
    // History Courses
    if (lowerName.includes('history') || lowerName.includes('historical') || lowerName.includes('ancient') || lowerName.includes('modern') || lowerName.includes('world')) {
      console.log('Matched History topics');
      
      if (lowerName.includes('ancient')) {
        return [
          "Ancient Civilizations",
          "Egyptian History",
          "Greek and Roman Empires",
          "Ancient India and China",
          "Medieval Period",
          "Renaissance and Reformation",
          "Archaeological Methods",
          "Ancient Art and Culture"
        ];
      }
      
      if (lowerName.includes('modern')) {
        return [
          "Industrial Revolution",
          "World Wars",
          "Cold War Era",
          "Decolonization",
          "Contemporary World Issues",
          "Modern Political Systems",
          "Economic History",
          "Social Movements"
        ];
      }
      
      return [
        "Introduction to History",
        "Historical Methods",
        "World History Overview",
        "Cultural History",
        "Economic History",
        "Political History",
        "Social History",
        "Historical Research"
      ];
    }
    
    // Geography Courses
    if (lowerName.includes('geography') || lowerName.includes('geographical') || lowerName.includes('physical geography') || lowerName.includes('human geography')) {
      console.log('Matched Geography topics');
      
      if (lowerName.includes('physical')) {
        return [
          "Earth's Physical Features",
          "Landforms and Topography",
          "Climate and Weather",
          "Water Bodies",
          "Natural Disasters",
          "Ecosystems and Biomes",
          "Environmental Geography",
          "Climate Change"
        ];
      }
      
      if (lowerName.includes('human')) {
        return [
          "Population Geography",
          "Urban Geography",
          "Economic Geography",
          "Cultural Geography",
          "Political Geography",
          "Development Studies",
          "Migration Patterns",
          "Globalization"
        ];
      }
      
      return [
        "Introduction to Geography",
        "Maps and Cartography",
        "Physical Geography Basics",
        "Human Geography Basics",
        "Regional Geography",
        "Geographic Information Systems",
        "Environmental Issues",
        "Sustainable Development"
      ];
    }
    
    // Economics Courses
    if (lowerName.includes('economics') || lowerName.includes('economic') || lowerName.includes('micro') || lowerName.includes('macro') || lowerName.includes('business')) {
      console.log('Matched Economics topics');
      
      if (lowerName.includes('micro')) {
        return [
          "Introduction to Microeconomics",
          "Supply and Demand",
          "Market Structures",
          "Consumer Behavior",
          "Production and Costs",
          "Market Equilibrium",
          "Factor Markets",
          "Market Failures"
        ];
      }
      
      if (lowerName.includes('macro')) {
        return [
          "Introduction to Macroeconomics",
          "National Income Accounting",
          "Economic Growth",
          "Inflation and Unemployment",
          "Monetary Policy",
          "Fiscal Policy",
          "International Trade",
          "Exchange Rates"
        ];
      }
      
      return [
        "Introduction to Economics",
        "Economic Principles",
        "Market Economy",
        "Supply and Demand Basics",
        "Economic Systems",
        "Business Economics",
        "Global Economy",
        "Economic Policy"
      ];
    }
    
    console.log('Using course-specific default topics for:', courseName);
    // Generate course-specific default topics based on course name
    const courseSpecificTopics = [
      `${courseName} - Introduction`,
      `${courseName} - Core Concepts`,
      `${courseName} - Practical Applications`,
      `${courseName} - Advanced Topics`,
      `${courseName} - Real-world Projects`,
      `${courseName} - Best Practices`,
      `${courseName} - Troubleshooting`,
      `${courseName} - Future Trends`
    ];
    
    return courseSpecificTopics;
  };

// Generate modules for a course based on course name
export const generateModulesForCourse = (courseName) => {
  const lowerName = courseName.toLowerCase();
  
  // Python-specific comprehensive structure
  if (lowerName.includes('python')) {
    return [
      {
        title: "Python Tutorial",
        topics: [
          { title: "Python HOME", video: null },
          { title: "Python Intro", video: null },
          { title: "Python Get Started", video: null },
          { title: "Python Syntax", video: null },
          { title: "Python Output", video: null },
          { title: "Python Comments", video: null },
          { title: "Python Variables", video: null },
          { title: "Python Data Types", video: null },
          { title: "Python Numbers", video: null },
          { title: "Python Casting", video: null },
          { title: "Python Strings", video: null },
          { title: "Python Booleans", video: null },
          { title: "Python Operators", video: null },
          { title: "Python Lists", video: null },
          { title: "Python Tuples", video: null },
          { title: "Python Sets", video: null },
          { title: "Python Dictionaries", video: null },
          { title: "Python If...Else", video: null },
          { title: "Python Match", video: null },
          { title: "Python While Loops", video: null },
          { title: "Python For Loops", video: null },
          { title: "Python Functions", video: null },
          { title: "Python Range", video: null },
          { title: "Python Arrays", video: null },
          { title: "Python Iterators", video: null },
          { title: "Python Modules", video: null },
          { title: "Python Dates", video: null },
          { title: "Python Math", video: null },
          { title: "Python JSON", video: null },
          { title: "Python RegEx", video: null },
          { title: "Python PIP", video: null },
          { title: "Python Try...Except", video: null },
          { title: "Python String Formatting", video: null },
          { title: "Python None", video: null },
          { title: "Python User Input", video: null },
          { title: "Python VirtualEnv", video: null }
        ]
      },
      {
        title: "Python Classes",
        topics: [
          { title: "Python OOP", video: null },
          { title: "Python Classes/Objects", video: null },
          { title: "Python __init__ Method", video: null },
          { title: "Python self Parameter", video: null },
          { title: "Python Class Properties", video: null },
          { title: "Python Class Methods", video: null },
          { title: "Python Inheritance", video: null },
          { title: "Python Polymorphism", video: null },
          { title: "Python Encapsulation", video: null },
          { title: "Python Inner Classes", video: null }
        ]
      },
      {
        title: "File Handling",
        topics: [
          { title: "Python File Handling", video: null },
          { title: "Python Read Files", video: null },
          { title: "Python Write/Create Files", video: null },
          { title: "Python Delete Files", video: null }
        ]
      },
      {
        title: "Python Modules",
        topics: [
          { title: "NumPy Tutorial", video: null },
          { title: "Pandas Tutorial", video: null },
          { title: "SciPy Tutorial", video: null },
          { title: "Django Tutorial", video: null }
        ]
      },
      {
        title: "Python Matplotlib",
        topics: [
          { title: "Matplotlib Intro", video: null },
          { title: "Matplotlib Get Started", video: null },
          { title: "Matplotlib Pyplot", video: null },
          { title: "Matplotlib Plotting", video: null },
          { title: "Matplotlib Markers", video: null },
          { title: "Matplotlib Line", video: null },
          { title: "Matplotlib Labels", video: null },
          { title: "Matplotlib Grid", video: null },
          { title: "Matplotlib Subplot", video: null },
          { title: "Matplotlib Scatter", video: null },
          { title: "Matplotlib Bars", video: null },
          { title: "Matplotlib Histograms", video: null },
          { title: "Matplotlib Pie Charts", video: null }
        ]
      },
      {
        title: "Machine Learning",
        topics: [
          { title: "Getting Started", video: null },
          { title: "Mean Median Mode", video: null },
          { title: "Standard Deviation", video: null },
          { title: "Percentile", video: null },
          { title: "Data Distribution", video: null },
          { title: "Normal Data Distribution", video: null },
          { title: "Scatter Plot", video: null },
          { title: "Linear Regression", video: null },
          { title: "Polynomial Regression", video: null },
          { title: "Multiple Regression", video: null },
          { title: "Scale", video: null },
          { title: "Train/Test", video: null },
          { title: "Decision Tree", video: null },
          { title: "Confusion Matrix", video: null },
          { title: "Hierarchical Clustering", video: null },
          { title: "Logistic Regression", video: null },
          { title: "Grid Search", video: null },
          { title: "Categorical Data", video: null },
          { title: "K-means", video: null },
          { title: "Bootstrap Aggregation", video: null },
          { title: "Cross Validation", video: null },
          { title: "AUC - ROC Curve", video: null },
          { title: "K-nearest neighbors", video: null }
        ]
      },
      {
        title: "Python DSA",
        topics: [
          { title: "Python DSA", video: null },
          { title: "Lists and Arrays", video: null },
          { title: "Stacks", video: null },
          { title: "Queues", video: null },
          { title: "Linked Lists", video: null },
          { title: "Hash Tables", video: null },
          { title: "Trees", video: null },
          { title: "Binary Trees", video: null },
          { title: "Binary Search Trees", video: null },
          { title: "AVL Trees", video: null },
          { title: "Graphs", video: null },
          { title: "Linear Search", video: null },
          { title: "Binary Search", video: null },
          { title: "Bubble Sort", video: null },
          { title: "Selection Sort", video: null },
          { title: "Insertion Sort", video: null },
          { title: "Quick Sort", video: null },
          { title: "Counting Sort", video: null },
          { title: "Radix Sort", video: null },
          { title: "Merge Sort", video: null }
        ]
      },
      {
        title: "Python MySQL",
        topics: [
          { title: "MySQL Get Started", video: null },
          { title: "MySQL Create Database", video: null },
          { title: "MySQL Create Table", video: null },
          { title: "MySQL Insert", video: null },
          { title: "MySQL Select", video: null },
          { title: "MySQL Where", video: null },
          { title: "MySQL Order By", video: null },
          { title: "MySQL Delete", video: null },
          { title: "MySQL Drop Table", video: null },
          { title: "MySQL Update", video: null },
          { title: "MySQL Limit", video: null },
          { title: "MySQL Join", video: null }
        ]
      },
      {
        title: "Python MongoDB",
        topics: [
          { title: "MongoDB Get Started", video: null },
          { title: "MongoDB Create DB", video: null },
          { title: "MongoDB Collection", video: null },
          { title: "MongoDB Insert", video: null },
          { title: "MongoDB Find", video: null },
          { title: "MongoDB Query", video: null },
          { title: "MongoDB Sort", video: null },
          { title: "MongoDB Delete", video: null },
          { title: "MongoDB Drop Collection", video: null },
          { title: "MongoDB Update", video: null },
          { title: "MongoDB Limit", video: null }
        ]
      },
      {
        title: "Python Reference",
        topics: [
          { title: "Python Overview", video: null },
          { title: "Python Built-in Functions", video: null },
          { title: "Python String Methods", video: null },
          { title: "Python List Methods", video: null },
          { title: "Python Dictionary Methods", video: null },
          { title: "Python Tuple Methods", video: null },
          { title: "Python Set Methods", video: null },
          { title: "Python File Methods", video: null },
          { title: "Python Keywords", video: null },
          { title: "Python Exceptions", video: null },
          { title: "Python Glossary", video: null }
        ]
      },
      {
        title: "Module Reference",
        topics: [
          { title: "Built-in Modules", video: null },
          { title: "Random Module", video: null },
          { title: "Requests Module", video: null },
          { title: "Statistics Module", video: null },
          { title: "Math Module", video: null },
          { title: "cMath Module", video: null }
        ]
      },
      {
        title: "Python How To",
        topics: [
          { title: "Remove List Duplicates", video: null },
          { title: "Reverse a String", video: null },
          { title: "Add Two Numbers", video: null }
        ]
      },
      {
        title: "Python Examples",
        topics: [
          { title: "Python Examples", video: null },
          { title: "Python Compiler", video: null },
          { title: "Python Exercises", video: null },
          { title: "Python Quiz", video: null },
          { title: "Python Challenges", video: null },
          { title: "Python Server", video: null },
          { title: "Python Syllabus", video: null },
          { title: "Python Study Plan", video: null },
          { title: "Python Interview Q&A", video: null },
          { title: "Python Bootcamp", video: null },
          { title: "Python Certificate", video: null },
          { title: "Python Training", video: null }
        ]
      }
    ];
  }
  
  // JavaScript-specific comprehensive structure
  if (lowerName.includes('javascript') || lowerName.includes('js')) {
    return [
      {
        title: "JavaScript Tutorial",
        topics: [
          { title: "JS HOME", video: null },
          { title: "JS Introduction", video: null },
          { title: "JS Get Started", video: null },
          { title: "JS Where To", video: null },
          { title: "JS Output", video: null },
          { title: "JS Statements", video: null },
          { title: "JS Syntax", video: null },
          { title: "JS Comments", video: null },
          { title: "JS Variables", video: null },
          { title: "JS Let", video: null },
          { title: "JS Const", video: null },
          { title: "JS Assignment", video: null },
          { title: "JS Data Types", video: null },
          { title: "JS Functions", video: null },
          { title: "JS Objects", video: null },
          { title: "JS Events", video: null },
          { title: "JS Strings", video: null },
          { title: "JS String Methods", video: null },
          { title: "JS String Search", video: null },
          { title: "JS String Templates", video: null },
          { title: "JS Numbers", video: null },
          { title: "JS Number Methods", video: null },
          { title: "JS Arrays", video: null },
          { title: "JS Array Methods", video: null },
          { title: "JS Array Sort", video: null },
          { title: "JS Array Iteration", video: null },
          { title: "JS Const", video: null },
          { title: "JS Dates", video: null },
          { title: "JS Date Formats", video: null },
          { title: "JS Date Get Methods", video: null },
          { title: "JS Date Set Methods", video: null },
          { title: "JS Math", video: null },
          { title: "JS Random", video: null },
          { title: "JS Booleans", video: null },
          { title: "JS Comparisons", video: null },
          { title: "JS If Else", video: null },
          { title: "JS Switch", video: null },
          { title: "JS For Loop", video: null },
          { title: "JS For In", video: null },
          { title: "JS For Of", video: null },
          { title: "JS While Loop", video: null },
          { title: "JS Break", video: null },
          { title: "JS Iterables", video: null },
          { title: "JS Sets", video: null },
          { title: "JS Maps", video: null },
          { title: "JS Typeof", video: null },
          { title: "JS Type Conversion", video: null },
          { title: "JS Bitwise", video: null },
          { title: "JS RegExp", video: null },
          { title: "JS Errors", video: null },
          { title: "JS Scope", video: null },
          { title: "JS Hoisting", video: null },
          { title: "JS Strict Mode", video: null },
          { title: "JS this", video: null },
          { title: "JS Arrow Function", video: null },
          { title: "JS Classes", video: null },
          { title: "JS Modules", video: null },
          { title: "JS JSON", video: null },
          { title: "JS Debugging", video: null },
          { title: "JS Style Guide", video: null },
          { title: "JS Best Practices", video: null }
        ]
      },
      {
        title: "JS Functions",
        topics: [
          { title: "JS Function Definitions", video: null },
          { title: "JS Function Parameters", video: null },
          { title: "JS Function Invocation", video: null },
          { title: "JS Function Apply", video: null },
          { title: "JS Function Closures", video: null },
          { title: "JS ES6", video: null },
          { title: "JS Async", video: null },
          { title: "JS Callbacks", video: null },
          { title: "JS Promises", video: null },
          { title: "JS Async/Await", video: null }
        ]
      },
      {
        title: "JS HTML DOM",
        topics: [
          { title: "DOM Intro", video: null },
          { title: "DOM Methods", video: null },
          { title: "DOM Document", video: null },
          { title: "DOM Elements", video: null },
          { title: "DOM HTML", video: null },
          { title: "DOM Forms", video: null },
          { title: "DOM CSS", video: null },
          { title: "DOM Animations", video: null },
          { title: "DOM Events", video: null },
          { title: "DOM Event Listener", video: null },
          { title: "DOM Navigation", video: null },
          { title: "DOM Nodes", video: null },
          { title: "DOM Collections", video: null },
          { title: "DOM Node Lists", video: null }
        ]
      },
      {
        title: "JS Browser BOM",
        topics: [
          { title: "Window", video: null },
          { title: "Screen", video: null },
          { title: "Location", video: null },
          { title: "History", video: null },
          { title: "Navigator", video: null },
          { title: "Popup Alert", video: null },
          { title: "Timing", video: null },
          { title: "Cookies", video: null }
        ]
      },
      {
        title: "JS Web APIs",
        topics: [
          { title: "Web API Intro", video: null },
          { title: "Web Forms API", video: null },
          { title: "Web History API", video: null },
          { title: "Web Storage API", video: null },
          { title: "Web Worker API", video: null },
          { title: "Web Fetch API", video: null },
          { title: "Web Geolocation API", video: null }
        ]
      },
      {
        title: "JS AJAX",
        topics: [
          { title: "AJAX Intro", video: null },
          { title: "AJAX XMLHttp", video: null },
          { title: "AJAX Request", video: null },
          { title: "AJAX Response", video: null },
          { title: "AJAX XML File", video: null },
          { title: "AJAX PHP", video: null },
          { title: "AJAX ASP", video: null },
          { title: "AJAX Database", video: null },
          { title: "AJAX Applications", video: null },
          { title: "AJAX Examples", video: null }
        ]
      },
      {
        title: "JS JSON",
        topics: [
          { title: "JSON Intro", video: null },
          { title: "JSON Syntax", video: null },
          { title: "JSON vs XML", video: null },
          { title: "JSON Data Types", video: null },
          { title: "JSON Parse", video: null },
          { title: "JSON Stringify", video: null },
          { title: "JSON Objects", video: null },
          { title: "JSON Arrays", video: null },
          { title: "JSON Server", video: null },
          { title: "JSON PHP", video: null },
          { title: "JSON HTML", video: null },
          { title: "JSON JSONP", video: null }
        ]
      },
      {
        title: "JS vs jQuery",
        topics: [
          { title: "jQuery Intro", video: null },
          { title: "jQuery Get Started", video: null },
          { title: "jQuery Syntax", video: null },
          { title: "jQuery Selectors", video: null },
          { title: "jQuery Events", video: null }
        ]
      },
      {
        title: "JS Graphics",
        topics: [
          { title: "JS Canvas", video: null },
          { title: "JS SVG", video: null }
        ]
      },
      {
        title: "JS Examples",
        topics: [
          { title: "JS Examples", video: null },
          { title: "JS HTML DOM", video: null },
          { title: "JS HTML Input", video: null },
          { title: "JS HTML Objects", video: null },
          { title: "JS HTML Events", video: null },
          { title: "JS Browser BOM", video: null },
          { title: "JS HTML Document", video: null },
          { title: "JS CSS", video: null },
          { title: "JS HTML DOM Collections", video: null },
          { title: "JS HTML DOM Node Lists", video: null },
          { title: "JS Exercises", video: null },
          { title: "JS Quiz", video: null },
          { title: "JS Certificate", video: null }
        ]
      }
    ];
  }
  
  // Java-specific comprehensive structure
  if (lowerName.includes('java')) {
    return [
      {
        title: "Java Tutorial",
        topics: [
          { title: "Java HOME", video: null },
          { title: "Java Intro", video: null },
          { title: "Java Get Started", video: null },
          { title: "Java Syntax", video: null },
          { title: "Java Output", video: null },
          { title: "Java Comments", video: null },
          { title: "Java Variables", video: null },
          { title: "Java Data Types", video: null },
          { title: "Java Type Casting", video: null },
          { title: "Java Operators", video: null },
          { title: "Java Strings", video: null },
          { title: "Java Math", video: null },
          { title: "Java Booleans", video: null },
          { title: "Java If Else", video: null },
          { title: "Java Switch", video: null },
          { title: "Java While Loop", video: null },
          { title: "Java For Loop", video: null },
          { title: "Java Break/Continue", video: null },
          { title: "Java Arrays", video: null },
          { title: "Java Methods", video: null },
          { title: "Java Method Overloading", video: null },
          { title: "Java Scope", video: null },
          { title: "Java Recursion", video: null },
          { title: "Java OOP", video: null },
          { title: "Java Classes/Objects", video: null },
          { title: "Java Class Attributes", video: null },
          { title: "Java Class Methods", video: null },
          { title: "Java Constructors", video: null },
          { title: "Java Modifiers", video: null },
          { title: "Java Encapsulation", video: null },
          { title: "Java Packages / API", video: null },
          { title: "Java Inheritance", video: null },
          { title: "Java Polymorphism", video: null },
          { title: "Java Abstraction", video: null },
          { title: "Java Interface", video: null },
          { title: "Java Enums", video: null },
          { title: "Java User Input", video: null },
          { title: "Java Date", video: null },
          { title: "Java ArrayList", video: null },
          { title: "Java LinkedList", video: null },
          { title: "Java HashMap", video: null },
          { title: "Java HashSet", video: null },
          { title: "Java Iterator", video: null },
          { title: "Java Wrapper Classes", video: null },
          { title: "Java Exceptions", video: null },
          { title: "Java Try Catch", video: null },
          { title: "Java Throw Throws", video: null },
          { title: "Java Finally", video: null },
          { title: "Java Stream Filter", video: null },
          { title: "Java Files", video: null },
          { title: "Java Create/Write Files", video: null },
          { title: "Java Read Files", video: null },
          { title: "Java Delete Files", video: null }
        ]
      },
      {
        title: "Java OOP",
        topics: [
          { title: "Java Classes and Objects", video: null },
          { title: "Java Constructors", video: null },
          { title: "Java Modifiers", video: null },
          { title: "Java Encapsulation", video: null },
          { title: "Java Polymorphism", video: null },
          { title: "Java Inheritance", video: null },
          { title: "Java Abstraction", video: null },
          { title: "Java Interface", video: null },
          { title: "Java Enums", video: null },
          { title: "Java Reflection", video: null }
        ]
      },
      {
        title: "Java Collections",
        topics: [
          { title: "Java Collections Framework", video: null },
          { title: "Java ArrayList", video: null },
          { title: "Java LinkedList", video: null },
          { title: "Java HashSet", video: null },
          { title: "Java TreeSet", video: null },
          { title: "Java HashMap", video: null },
          { title: "Java TreeMap", video: null },
          { title: "Java Queue", video: null },
          { title: "Java Stack", video: null },
          { title: "Java Iterator", video: null }
        ]
      },
      {
        title: "Java Multithreading",
        topics: [
          { title: "Java Multithreading", video: null },
          { title: "Java Thread Life Cycle", video: null },
          { title: "Java Thread Synchronization", video: null },
          { title: "Java Thread Pool", video: null },
          { title: "Java Deadlock", video: null },
          { title: "Java Producer Consumer", video: null }
        ]
      },
      {
        title: "Java I/O",
        topics: [
          { title: "Java I/O Streams", video: null },
          { title: "Java Byte Streams", video: null },
          { title: "Java Character Streams", video: null },
          { title: "Java Buffered Streams", video: null },
          { title: "Java File I/O", video: null },
          { title: "Java Serialization", video: null }
        ]
      },
      {
        title: "Java Networking",
        topics: [
          { title: "Java Networking", video: null },
          { title: "Java Socket Programming", video: null },
          { title: "Java URL Class", video: null },
          { title: "Java HttpURLConnection", video: null },
          { title: "Java DatagramSocket", video: null }
        ]
      },
      {
        title: "Java Database",
        topics: [
          { title: "Java JDBC", video: null },
          { title: "Java JDBC Drivers", video: null },
          { title: "Java JDBC Connection", video: null },
          { title: "Java JDBC Statements", video: null },
          { title: "Java JDBC ResultSet", video: null },
          { title: "Java JDBC Transactions", video: null }
        ]
      },
      {
        title: "Java Advanced",
        topics: [
          { title: "Java Generics", video: null },
          { title: "Java Annotations", video: null },
          { title: "Java Lambda Expressions", video: null },
          { title: "Java Stream API", video: null },
          { title: "Java Optional", video: null },
          { title: "Java Date Time API", video: null },
          { title: "Java Modules", video: null },
          { title: "Java Records", video: null }
        ]
      },
      {
        title: "Java Frameworks",
        topics: [
          { title: "Spring Framework", video: null },
          { title: "Spring Boot", video: null },
          { title: "Spring MVC", video: null },
          { title: "Spring Data JPA", video: null },
          { title: "Hibernate", video: null },
          { title: "Maven", video: null },
          { title: "Gradle", video: null }
        ]
      },
      {
        title: "Java Examples",
        topics: [
          { title: "Java Examples", video: null },
          { title: "Java Exercises", video: null },
          { title: "Java Quiz", video: null },
          { title: "Java Certificate", video: null },
          { title: "Java Interview", video: null },
          { title: "Java Projects", video: null }
        ]
      }
    ];
  }
  
  // SQL-specific comprehensive structure
  if (lowerName.includes('sql') || lowerName.includes('database')) {
    return [
      {
        title: "SQL Tutorial",
        topics: [
          { title: "SQL HOME", video: null },
          { title: "SQL Intro", video: null },
          { title: "SQL Syntax", video: null },
          { title: "SQL Select", video: null },
          { title: "SQL Select Distinct", video: null },
          { title: "SQL Where", video: null },
          { title: "SQL And, Or, Not", video: null },
          { title: "SQL Order By", video: null },
          { title: "SQL Insert Into", video: null },
          { title: "SQL Null Values", video: null },
          { title: "SQL Update", video: null },
          { title: "SQL Delete", video: null },
          { title: "SQL Select Top", video: null },
          { title: "SQL Min and Max", video: null },
          { title: "SQL Count, Avg, Sum", video: null },
          { title: "SQL Like", video: null },
          { title: "SQL Wildcards", video: null },
          { title: "SQL In", video: null },
          { title: "SQL Between", video: null },
          { title: "SQL Aliases", video: null },
          { title: "SQL Joins", video: null },
          { title: "SQL Inner Join", video: null },
          { title: "SQL Left Join", video: null },
          { title: "SQL Right Join", video: null },
          { title: "SQL Full Join", video: null },
          { title: "SQL Self Join", video: null },
          { title: "SQL Union", video: null },
          { title: "SQL Group By", video: null },
          { title: "SQL Having", video: null },
          { title: "SQL Exists", video: null },
          { title: "SQL Any, All", video: null },
          { title: "SQL Select Into", video: null },
          { title: "SQL Insert Into Select", video: null },
          { title: "SQL Case", video: null },
          { title: "SQL Null Functions", video: null },
          { title: "SQL Stored Procedures", video: null },
          { title: "SQL Comments", video: null }
        ]
      },
      {
        title: "SQL Advanced",
        topics: [
          { title: "SQL Operators", video: null },
          { title: "SQL Data Types", video: null },
          { title: "SQL Quick Ref", video: null }
        ]
      },
      {
        title: "SQL Database",
        topics: [
          { title: "SQL Create DB", video: null },
          { title: "SQL Drop DB", video: null },
          { title: "SQL Backup DB", video: null },
          { title: "SQL Create Table", video: null },
          { title: "SQL Drop Table", video: null },
          { title: "SQL Alter Table", video: null },
          { title: "SQL Constraints", video: null },
          { title: "SQL Not Null", video: null },
          { title: "SQL Unique", video: null },
          { title: "SQL Primary Key", video: null },
          { title: "SQL Foreign Key", video: null },
          { title: "SQL Check", video: null },
          { title: "SQL Default", video: null },
          { title: "SQL Create Index", video: null },
          { title: "SQL Drop Index", video: null },
          { title: "SQL Auto Increment", video: null },
          { title: "SQL Dates", video: null },
          { title: "SQL Views", video: null },
          { title: "SQL Injection", video: null },
          { title: "SQL Hosting", video: null }
        ]
      },
      {
        title: "SQL Functions",
        topics: [
          { title: "SQL Functions", video: null },
          { title: "SQL MS Functions", video: null }
        ]
      },
      {
        title: "SQL Examples",
        topics: [
          { title: "SQL Examples", video: null },
          { title: "SQL Quiz", video: null },
          { title: "SQL Exercises", video: null },
          { title: "SQL Certificate", video: null }
        ]
      }
    ];
  }
  
  // React-specific comprehensive structure
  if (lowerName.includes('react')) {
    return [
      {
        title: "React Tutorial",
        topics: [
          { title: "React HOME", video: null },
          { title: "React Intro", video: null },
          { title: "React Get Started", video: null },
          { title: "React ES6", video: null },
          { title: "React Render", video: null },
          { title: "React JSX", video: null },
          { title: "React Components", video: null },
          { title: "React Class", video: null },
          { title: "React Props", video: null },
          { title: "React State", video: null },
          { title: "React Lifecycle", video: null },
          { title: "React Events", video: null },
          { title: "React Forms", video: null },
          { title: "React Router", video: null },
          { title: "React Memo", video: null }
        ]
      },
      {
        title: "React Hooks",
        topics: [
          { title: "React Hooks", video: null },
          { title: "useState", video: null },
          { title: "useEffect", video: null },
          { title: "useContext", video: null },
          { title: "useReducer", video: null },
          { title: "useCallback", video: null },
          { title: "useMemo", video: null },
          { title: "useRef", video: null },
          { title: "Custom Hooks", video: null }
        ]
      },
      {
        title: "React Advanced",
        topics: [
          { title: "React Performance", video: null },
          { title: "React Testing", video: null },
          { title: "React TypeScript", video: null },
          { title: "React Native", video: null },
          { title: "React SSR", video: null },
          { title: "React Patterns", video: null }
        ]
      },
      {
        title: "React Ecosystem",
        topics: [
          { title: "Redux", video: null },
          { title: "Redux Toolkit", video: null },
          { title: "React Query", video: null },
          { title: "Styled Components", video: null },
          { title: "Material-UI", video: null },
          { title: "Ant Design", video: null }
        ]
      },
      {
        title: "React Examples",
        topics: [
          { title: "React Examples", video: null },
          { title: "React Quiz", video: null },
          { title: "React Exercises", video: null },
          { title: "React Certificate", video: null },
          { title: "React Projects", video: null }
        ]
      }
    ];
  }
  
  // .NET-specific comprehensive structure
  if (lowerName.includes('.net') || lowerName.includes('dotnet')) {
    return [
      {
        title: ".NET Tutorial",
        topics: [
          { title: ".NET HOME", video: null },
          { title: ".NET Intro", video: null },
          { title: ".NET Get Started", video: null },
          { title: ".NET Versions", video: null },
          { title: ".NET C#", video: null },
          { title: ".NET VB", video: null },
          { title: ".NET F#", video: null },
          { title: ".NET Framework", video: null },
          { title: ".NET Core", video: null },
          { title: ".NET 5/6/7/8", video: null }
        ]
      },
      {
        title: "C# Tutorial",
        topics: [
          { title: "C# HOME", video: null },
          { title: "C# Intro", video: null },
          { title: "C# Get Started", video: null },
          { title: "C# Syntax", video: null },
          { title: "C# Variables", video: null },
          { title: "C# Data Types", video: null },
          { title: "C# Type Casting", video: null },
          { title: "C# Operators", video: null },
          { title: "C# Strings", video: null },
          { title: "C# Booleans", video: null },
          { title: "C# If Else", video: null },
          { title: "C# Switch", video: null },
          { title: "C# While Loop", video: null },
          { title: "C# For Loop", video: null },
          { title: "C# Arrays", video: null },
          { title: "C# Methods", video: null },
          { title: "C# Classes", video: null },
          { title: "C# OOP", video: null },
          { title: "C# Properties", video: null },
          { title: "C# Constructors", video: null },
          { title: "C# Inheritance", video: null },
          { title: "C# Polymorphism", video: null },
          { title: "C# Abstraction", video: null },
          { title: "C# Interface", video: null },
          { title: "C# Enums", video: null },
          { title: "C# Files", video: null },
          { title: "C# Exceptions", video: null },
          { title: "C# User Input", video: null }
        ]
      },
      {
        title: "ASP.NET Core",
        topics: [
          { title: "ASP.NET Core Intro", video: null },
          { title: "ASP.NET Core Setup", video: null },
          { title: "ASP.NET Core MVC", video: null },
          { title: "ASP.NET Core Razor Pages", video: null },
          { title: "ASP.NET Core Web API", video: null },
          { title: "ASP.NET Core Dependency Injection", video: null },
          { title: "ASP.NET Core Configuration", video: null },
          { title: "ASP.NET Core Middleware", video: null },
          { title: "ASP.NET Core Authentication", video: null },
          { title: "ASP.NET Core Authorization", video: null }
        ]
      },
      {
        title: "Entity Framework",
        topics: [
          { title: "EF Core Intro", video: null },
          { title: "EF Core Models", video: null },
          { title: "EF Core DbContext", video: null },
          { title: "EF Core Queries", video: null },
          { title: "EF Core Migrations", video: null },
          { title: "EF Core Relationships", video: null },
          { title: "EF Core Performance", video: null }
        ]
      },
      {
        title: ".NET Advanced",
        topics: [
          { title: ".NET LINQ", video: null },
          { title: ".NET Async/Await", video: null },
          { title: ".NET Generics", video: null },
          { title: ".NET Delegates", video: null },
          { title: ".NET Events", video: null },
          { title: ".NET Reflection", video: null },
          { title: ".NET Attributes", video: null },
          { title: ".NET Collections", video: null }
        ]
      },
      {
        title: ".NET Examples",
        topics: [
          { title: ".NET Examples", video: null },
          { title: ".NET Exercises", video: null },
          { title: ".NET Quiz", video: null },
          { title: ".NET Certificate", video: null }
        ]
      }
    ];
  }
  
  // Base module structure for other courses
  const baseModules = [
    {
      title: "Getting Started",
      topics: [
        { title: `${courseName} - Introduction`, video: null },
        { title: `${courseName} - Setup and Installation`, video: null },
        { title: `${courseName} - Basic Concepts`, video: null }
      ]
    },
    {
      title: "Core Fundamentals",
      topics: [
        { title: `${courseName} - Variables and Data Types`, video: null },
        { title: `${courseName} - Control Flow`, video: null },
        { title: `${courseName} - Functions and Methods`, video: null },
        { title: `${courseName} - Error Handling`, video: null }
      ]
    },
    {
      title: "Intermediate Concepts",
      topics: [
        { title: `${courseName} - Advanced Data Structures`, video: null },
        { title: `${courseName} - Object-Oriented Programming`, video: null },
        { title: `${courseName} - File Operations`, video: null },
        { title: `${courseName} - Libraries and Frameworks`, video: null }
      ]
    },
    {
      title: "Advanced Topics",
      topics: [
        { title: `${courseName} - Design Patterns`, video: null },
        { title: `${courseName} - Performance Optimization`, video: null },
        { title: `${courseName} - Testing and Debugging`, video: null },
        { title: `${courseName} - Best Practices`, video: null }
      ]
    },
    {
      title: "Practical Applications",
      topics: [
        { title: `${courseName} - Real-world Projects`, video: null },
        { title: `${courseName} - Case Studies`, video: null },
        { title: `${courseName} - Industry Applications`, video: null },
        { title: `${courseName} - Portfolio Development`, video: null }
      ]
    }
  ];

  // Return base modules for all courses
  return baseModules;
};

// Standard industrial curriculum (Synchronized with Daily Exam system)
export const industryCourses = [
  "PYTHON FULL STACK",
  "JAVA FULL STACK",
  ".NET FULL STACK",
  "MERN FULL STACK",
  "UI FULL STACK",
  "FULL STACK DEVELOPMENT",
  "DATA SCIENCE AND AGENTIC AI",
  "ARTIFICIAL INTELLIGENCE AND MACHINE LEARNING",
  "ADVANCED MACHINE LEARNING",
  "DATA SCIENCE WITH AI",
  "AGENTIC AI",
  "DATA ANALYTICS",
  "CLOUD COMPUTING",
  "DEVOPS",
  "CYBER SECURITY",
  "POWER BI",
  "MICROSOFT TECHNOLOGIES",
  "MOBILE FULL STACK",
  "MONGODB",
  "DCA",
  "PGDCA",
  "DOA",
  "FRONTEND",
  "BACKEND",
  "IOS SWIFT",
  "ANDROID DEVELOPMENT",
  "FLUTTER DEVELOPMENT",
  "JAVA DEVELOPER",
  "PYTHON DEVELOPMENT",
  "ORACLE DATABASE",
  "NODE JS DEVELOPMENT",
  "REACT JS DEVELOPMENT",
  "AWS SOLUTIONS ARCHITECT",
  "MICROSOFT AZURE",
  "GOOGLE CLOUD PLATFORM",
  "SAP DEVELOPER",
  "C AND DATA STRUCTURES"
];

// Default courses for first-time setup (Unified across Registration & Faculty)
export const defaultCourses = industryCourses.map((title, index) => ({
  id: index + 1,
  title: title,
  icon: getIconForCourse(title),
  level: "Professional",
  duration: "Self-paced",
  progress: 0,
  locked: false,
  modules: [],
  topics: [] 
}));

