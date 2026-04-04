// Import all icon components
import { 
  FaPython, 
  FaJs, 
  FaJava, 
  FaDatabase, 
  FaMicrosoft, 
  FaReact, 
  FaBrain, 
  FaRobot, 
  FaCloud, 
  FaShieldAlt, 
  FaChartLine, 
  FaMobile, 
  FaGamepad, 
  FaLink, 
  FaServer, 
  FaCogs, 
  FaLaptopCode, 
  FaGitAlt, 
  FaDocker, 
  FaAws, 
  FaGoogle, 
  FaApple, 
  FaAndroid, 
  FaCode 
} from 'react-icons/fa';

// Default courses for first-time setup
export const defaultCourses = [
  {
    id: 1,
    title: "Python Full Stack Development",
    icon: FaPython,
    level: "Beginner to Advanced",
    duration: "12 weeks",
    progress: 0,
    locked: false,
    topics: [
      "Python Fundamentals",
      "Data Structures & Algorithms",
      "Object-Oriented Programming",
      "Web Frameworks (Django/Flask)",
      "RESTful APIs",
      "Database Integration (SQL/NoSQL)",
      "Frontend Basics (HTML/CSS/JavaScript)",
      "Version Control (Git)",
      "Testing & Debugging",
      "Deployment & DevOps",
      "Authentication & Security",
      "Cloud Services (AWS/Azure)"
    ]
  },
  {
    id: 2,
    title: "JavaScript & React Development",
    icon: FaJs,
    level: "Beginner to Intermediate",
    duration: "10 weeks",
    progress: 0,
    locked: false,
    topics: [
      "JavaScript Fundamentals",
      "ES6+ Features",
      "DOM Manipulation",
      "React.js Fundamentals",
      "State Management (Redux/Context)",
      "Node.js & Express.js",
      "MongoDB & Mongoose",
      "RESTful API Development",
      "Authentication & JWT",
      "Testing (Jest/Mocha)",
      "Webpack & Build Tools",
      "Deployment (Heroku/Netlify)"
    ]
  },
  {
    id: 3,
    title: "Java Enterprise Development",
    icon: FaJava,
    level: "Intermediate to Advanced",
    duration: "14 weeks",
    progress: 0,
    locked: false,
    topics: [
      "Java Core Concepts",
      "Spring Boot Framework",
      "Hibernate & JPA",
      "RESTful APIs with Spring",
      "Microservices Architecture",
      "Angular Frontend",
      "TypeScript Integration",
      "MySQL/PostgreSQL",
      "JUnit Testing",
      "Maven & Gradle",
      "Docker & Kubernetes",
      "AWS Cloud Deployment"
    ]
  },
  {
    id: 4,
    title: "Database Management & SQL",
    icon: FaDatabase,
    level: "Beginner to Intermediate",
    duration: "8 weeks",
    progress: 0,
    locked: false,
    topics: [
      "Database Fundamentals",
      "SQL Basics & Queries",
      "Advanced SQL & Joins",
      "Database Design & Normalization",
      "Indexing & Performance",
      "Transactions & Concurrency",
      "NoSQL Databases (MongoDB)",
      "Database Security",
      "Backup & Recovery",
      "Cloud Database Services",
      "Data Migration",
      "Database Administration"
    ]
  },
  {
    id: 5,
    title: ".NET & C# Development",
    icon: FaMicrosoft,
    level: "Intermediate",
    duration: "12 weeks",
    progress: 0,
    locked: false,
    topics: [
      "C# Fundamentals",
      "Object-Oriented Programming in C#",
      ".NET Framework & Core",
      "ASP.NET MVC",
      "Entity Framework",
      "Web API Development",
      "Blazor Framework",
      "Azure Cloud Services",
      "Authentication & Authorization",
      "Unit Testing with xUnit",
      "CI/CD Pipeline",
      "Microservices with .NET"
    ]
  },
  {
    id: 6,
    title: "React & Frontend Development",
    icon: FaReact,
    level: "Beginner to Intermediate",
    duration: "9 weeks",
    progress: 0,
    locked: false,
    topics: [
      "HTML5 & CSS3 Fundamentals",
      "JavaScript ES6+",
      "React.js Fundamentals",
      "Components & Props",
      "State Management",
      "React Hooks",
      "React Router",
      "Context API",
      "Redux Toolkit",
      "Styling (CSS Modules, Styled Components)",
      "Testing (React Testing Library)",
      "Deployment & Optimization"
    ]
  },
  {
    id: 7,
    title: "Mobile App Development",
    icon: FaMobile,
    level: "Intermediate",
    duration: "11 weeks",
    progress: 0,
    locked: false,
    topics: [
      "React Native Fundamentals",
      "Flutter Development",
      "iOS Swift Basics",
      "Android Kotlin",
      "Mobile UI/UX Design",
      "State Management",
      "API Integration",
      "Push Notifications",
      "App Store Deployment",
      "Testing & Debugging",
      "Performance Optimization",
      "Security & Authentication"
    ]
  },
  {
    id: 8,
    title: "Data Science & Analytics",
    icon: FaDatabase,
    level: "Intermediate",
    duration: "12 weeks",
    progress: 0,
    locked: false,
    topics: [
      "Statistics & Probability",
      "Data Wrangling with Pandas",
      "Data Visualization",
      "SQL & NoSQL Databases",
      "Business Intelligence",
      "Predictive Modeling",
      "Big Data Technologies",
      "Tableau & Power BI",
      "Data Mining Techniques",
      "Real-time Analytics",
      "Machine Learning Integration",
      "Data Storytelling"
    ]
  },
  {
    id: 9,
    title: "Cybersecurity Fundamentals",
    icon: FaShieldAlt,
    level: "Beginner to Intermediate",
    duration: "8 weeks",
    progress: 0,
    locked: false,
    topics: [
      "Network Security Basics",
      "Ethical Hacking",
      "Cryptography",
      "Web Application Security",
      "Penetration Testing",
      "Security Auditing",
      "Compliance & Regulations",
      "Incident Response",
      "Security Tools & Frameworks",
      "Cloud Security",
      "Identity & Access Management",
      "Risk Assessment"
    ]
  },
  {
    id: 10,
    title: "Blockchain Development",
    icon: FaLink,
    level: "Advanced",
    duration: "10 weeks",
    progress: 0,
    locked: false,
    topics: [
      "Blockchain Fundamentals",
      "Smart Contracts",
      "Solidity Programming",
      "Ethereum Development",
      "Web3.js Integration",
      "DeFi Applications",
      "NFT Development",
      "Consensus Mechanisms",
      "Distributed Systems",
      "Crypto Economics",
      "Security Best Practices",
      "Scalability Solutions"
    ]
  }
];

// Icon mapping function
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
  if (lowerName.includes('blockchain') || lowerName.includes('crypto')) return FaLink;
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

// Generate modules with topics for a course based on its title
export const generateModulesForCourse = (courseTitle) => {
  const lowerTitle = courseTitle.toLowerCase();
  
  if (lowerTitle.includes('python')) {
    return [
      {
        title: "Python Fundamentals",
        topics: [
          "Python Installation & Setup",
          "Variables & Data Types",
          "Operators & Expressions",
          "Control Flow (if/else, loops)",
          "Functions & Parameters",
          "Modules & Packages"
        ]
      },
      {
        title: "Data Structures & Algorithms",
        topics: [
          "Lists & Tuples",
          "Dictionaries & Sets",
          "Stacks & Queues",
          "Trees & Graphs",
          "Sorting Algorithms",
          "Searching Algorithms"
        ]
      },
      {
        title: "Object-Oriented Programming",
        topics: [
          "Classes & Objects",
          "Inheritance & Polymorphism",
          "Encapsulation & Abstraction",
          "Special Methods (__init__, __str__)",
          "Property Decorators",
          "Design Patterns"
        ]
      },
      {
        title: "Web Development with Python",
        topics: [
          "Flask Framework Basics",
          "Django Framework",
          "RESTful APIs",
          "Database Integration (SQLAlchemy)",
          "Frontend Integration",
          "Authentication & Security"
        ]
      },
      {
        title: "Advanced Python",
        topics: [
          "Decorators & Generators",
          "File Handling & I/O",
          "Exception Handling",
          "Testing with PyTest",
          "Virtual Environments",
          "Performance Optimization"
        ]
      }
    ];
  }
  
  if (lowerTitle.includes('javascript') || lowerTitle.includes('web')) {
    return [
      {
        title: "JavaScript Fundamentals",
        topics: [
          "JavaScript Basics & Syntax",
          "Variables & Data Types",
          "Functions & Scope",
          "Arrays & Objects",
          "DOM Manipulation",
          "Event Handling"
        ]
      },
      {
        title: "Modern JavaScript (ES6+)",
        topics: [
          "Arrow Functions & Template Literals",
          "Destructuring & Spread Operator",
          "Promises & Async/Await",
          "Classes & Modules",
          "Map, Filter, Reduce",
          "Fetch API & Axios"
        ]
      },
      {
        title: "Frontend Frameworks",
        topics: [
          "React.js Fundamentals",
          "Components & Props",
          "State & Lifecycle",
          "Hooks (useState, useEffect)",
          "React Router",
          "Context API"
        ]
      },
      {
        title: "Backend Development",
        topics: [
          "Node.js Basics",
          "Express.js Framework",
          "RESTful APIs",
          "Middleware & Routing",
          "Database Integration (MongoDB)",
          "Authentication & JWT"
        ]
      },
      {
        title: "Full Stack Development",
        topics: [
          "MEAN/MERN Stack",
          "Frontend-Backend Integration",
          "WebSocket & Real-time Apps",
          "Deployment & DevOps",
          "Testing & Debugging",
          "Performance Optimization"
        ]
      }
    ];
  }
  
  if (lowerTitle.includes('java')) {
    return [
      {
        title: "Java Core Concepts",
        topics: [
          "Java Installation & Environment",
          "Basic Syntax & Data Types",
          "Control Flow & Loops",
          "Methods & Parameters",
          "Arrays & Strings",
          "Exception Handling"
        ]
      },
      {
        title: "Object-Oriented Programming",
        topics: [
          "Classes & Objects",
          "Inheritance & Polymorphism",
          "Interfaces & Abstract Classes",
          "Packages & Access Modifiers",
          "Collections Framework",
          "Generics"
        ]
      },
      {
        title: "Spring Framework",
        topics: [
          "Spring Boot Basics",
          "Dependency Injection",
          "Spring MVC",
          "Spring Data JPA",
          "Spring Security",
          "RESTful APIs"
        ]
      },
      {
        title: "Database & Persistence",
        topics: [
          "SQL Fundamentals",
          "JDBC & Database Connectivity",
          "Hibernate ORM",
          "Database Design",
          "Transactions & Concurrency",
          "NoSQL with MongoDB"
        ]
      },
      {
        title: "Enterprise Development",
        topics: [
          "Microservices Architecture",
          "RESTful API Design",
          "Testing with JUnit",
          "Build Tools (Maven/Gradle)",
          "Docker & Containerization",
          "Cloud Deployment (AWS)"
        ]
      }
    ];
  }
  
  if (lowerTitle.includes('data') || lowerTitle.includes('analytics')) {
    return [
      {
        title: "Data Fundamentals",
        topics: [
          "Statistics & Probability",
          "Data Types & Structures",
          "Data Collection Methods",
          "Data Cleaning & Preprocessing",
          "Exploratory Data Analysis",
          "Data Visualization Basics"
        ]
      },
      {
        title: "Python for Data Science",
        topics: [
          "NumPy & Array Operations",
          "Pandas for Data Manipulation",
          "Matplotlib & Seaborn",
          "Jupyter Notebooks",
          "Data Import/Export",
          "Statistical Analysis"
        ]
      },
      {
        title: "Machine Learning",
        topics: [
          "Supervised Learning Basics",
          "Unsupervised Learning",
          "Regression & Classification",
          "Decision Trees & Random Forests",
          "Clustering Algorithms",
          "Model Evaluation"
        ]
      },
      {
        title: "Advanced Analytics",
        topics: [
          "Deep Learning Fundamentals",
          "Neural Networks",
          "Natural Language Processing",
          "Time Series Analysis",
          "Feature Engineering",
          "Model Deployment"
        ]
      },
      {
        title: "Business Intelligence",
        topics: [
          "SQL & Database Queries",
          "Data Warehousing",
          "Tableau & Power BI",
          "Dashboard Design",
          "Report Generation",
          "Data Storytelling"
        ]
      }
    ];
  }
  
  if (lowerTitle.includes('mobile') || lowerTitle.includes('app')) {
    return [
      {
        title: "Mobile Development Fundamentals",
        topics: [
          "Mobile App Architecture",
          "UI/UX Design Principles",
          "Responsive Design",
          "Touch Interactions",
          "Platform Guidelines",
          "App Performance Basics"
        ]
      },
      {
        title: "React Native",
        topics: [
          "React Native Setup",
          "Components & Styling",
          "Navigation & Routing",
          "State Management",
          "API Integration",
          "Platform-Specific Code"
        ]
      },
      {
        title: "Flutter Development",
        topics: [
          "Flutter & Dart Basics",
          "Widgets & Layouts",
          "State Management",
          "Animations & Gestures",
          "Package Management",
          "Build & Deployment"
        ]
      },
      {
        title: "Native Development",
        topics: [
          "iOS Swift Fundamentals",
          "Android Kotlin Basics",
          "Native UI Components",
          "Platform APIs",
          "App Store Deployment",
          "Testing & Debugging"
        ]
      },
      {
        title: "Advanced Mobile Topics",
        topics: [
          "Push Notifications",
          "Offline Storage",
          "Authentication & Security",
          "Performance Optimization",
          "Analytics & Monitoring",
          "Monetization Strategies"
        ]
      }
    ];
  }
  
  // Default modules for other courses
  return [
    {
      title: "Introduction",
      topics: [
        "Course Overview",
        "Basic Concepts",
        "Environment Setup",
        "First Steps",
        "Common Terminology",
        "Best Practices"
      ]
    },
    {
      title: "Core Concepts",
      topics: [
        "Fundamental Principles",
        "Key Components",
        "Working Examples",
        "Practical Exercises",
        "Problem Solving",
        "Code Implementation"
      ]
    },
    {
      title: "Advanced Topics",
      topics: [
        "Complex Concepts",
        "Advanced Techniques",
        "Real-world Applications",
        "Performance Optimization",
        "Security Considerations",
        "Industry Standards"
      ]
    },
    {
      title: "Projects & Practice",
      topics: [
        "Hands-on Projects",
        "Case Studies",
        "Portfolio Development",
        "Team Collaboration",
        "Code Review",
        "Final Assessment"
      ]
    }
  ];
};

// Generate topics for a course based on its title (legacy function)
export const generateTopicsForCourse = (courseTitle) => {
  const lowerTitle = courseTitle.toLowerCase();
  
  if (lowerTitle.includes('python')) {
    return [
      "Python Fundamentals",
      "Data Structures & Algorithms", 
      "Object-Oriented Programming",
      "Web Frameworks (Django/Flask)",
      "RESTful APIs",
      "Database Integration (SQL/NoSQL)",
      "Frontend Basics (HTML/CSS/JavaScript)",
      "Version Control (Git)",
      "Testing & Debugging",
      "Deployment & DevOps",
      "Authentication & Security",
      "Cloud Services (AWS/Azure)"
    ];
  }
  
  if (lowerTitle.includes('javascript')) {
    return [
      "JavaScript Fundamentals",
      "ES6+ Features",
      "DOM Manipulation", 
      "React.js Fundamentals",
      "State Management (Redux/Context)",
      "Node.js & Express.js",
      "MongoDB & Mongoose",
      "RESTful API Development",
      "Authentication & JWT",
      "Testing (Jest/Mocha)",
      "Webpack & Build Tools",
      "Deployment (Heroku/Netlify)"
    ];
  }
  
  if (lowerTitle.includes('java')) {
    return [
      "Java Core Concepts",
      "Spring Boot Framework",
      "Hibernate & JPA",
      "RESTful APIs with Spring",
      "Microservices Architecture",
      "Angular Frontend",
      "TypeScript Integration",
      "MySQL/PostgreSQL",
      "JUnit Testing",
      "Maven & Gradle",
      "Docker & Kubernetes",
      "AWS Cloud Deployment"
    ];
  }
  
  // Default topics for other courses
  return [
    "Introduction",
    "Core Concepts",
    "Practical Applications",
    "Advanced Topics",
    "Best Practices",
    "Industry Standards",
    "Hands-on Projects",
    "Assessment & Evaluation",
    "Career Guidance",
    "Certification Preparation"
  ];
};
