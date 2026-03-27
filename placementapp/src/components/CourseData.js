import {
  FaPython, FaJs, FaJava, FaDatabase, FaMicrosoft, FaReact, FaLock, FaCode,
  FaBrain, FaRobot, FaCloud, FaShieldAlt, FaChartLine, FaMobile, FaGamepad,
  FaServer, FaCogs, FaLaptopCode, FaGitAlt, FaDocker, FaAws, FaGoogle,
  FaApple, FaAndroid
} from "react-icons/fa";

// Default courses for first-time setup
  export const defaultCourses = [
    {
      id: 1,
      title: "Python (Basic)",
      icon: FaPython,
      level: "Beginner",
      duration: "3 hrs",
      progress: 60,
      locked: false,
      topics: [
        "Python Basics",
        "Variables and Data Types",
        "Loops",
        "Functions",
        "Lists and Tuples",
        "Dictionaries",
        "File Handling",
        "Exception Handling"
      ]
    },
    {
      id: 2,
      title: "JavaScript (Basic)",
      icon: FaJs,
      level: "Beginner",
      duration: "2.5 hrs",
      progress: 40,
      locked: false,
      topics: [
        "JS Basics",
        "ES6",
        "DOM Manipulation",
        "React Basics",
        "Arrays and Objects",
        "Async Programming",
        "Event Handling",
        "Error Handling"
      ]
    },
    {
      id: 3,
      title: "Java (Intermediate)",
      icon: FaJava,
      level: "Intermediate",
      duration: "4 hrs",
      progress: 20,
      locked: false,
      topics: [
        "Introduction to Java",
        "Java Operators",
        "Data Types",
        "Control Flow",
        "Methods",
        "Classes and Objects",
        "Inheritance",
        "Polymorphism"
      ]
    },
    {
      id: 4,
      title: "SQL (Basic)",
      icon: FaDatabase,
      level: "Beginner",
      duration: "2 hrs",
      progress: 80,
      locked: false,
      topics: [
        "SQL Basics",
        "SELECT Queries",
        "Joins",
        "Aggregate Functions",
        "Subqueries",
        "Indexes",
        "Transactions",
        "Database Normalization"
      ]
    },
    {
      id: 5,
      title: ".NET (Intermediate)",
      icon: FaMicrosoft,
      level: "Intermediate",
      duration: "5 hrs",
      progress: 0,
      locked: false,
      topics: [
        ".NET Introduction",
        "C# Basics",
        "ASP.NET Core",
        "MVC Pattern",
        "Entity Framework",
        "Dependency Injection",
        "Authentication",
        "Web API Development"
      ]
    },
    {
      id: 6,
      title: "React (Basic)",
      icon: FaReact,
      level: "Beginner",
      duration: "3 hrs",
      progress: 30,
      locked: false,
      topics: [
        "React Intro",
        "Components",
        "State Management",
        "Hooks",
        "Props and PropTypes",
        "Conditional Rendering",
        "Forms in React",
        "React Router"
      ]
    }
  ];



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
