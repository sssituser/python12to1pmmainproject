import React, { useEffect, useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPython, faJava, faReact, faNodeJs, faSwift, faDocker, faAws, faMicrosoft, faGoogle, faGitAlt, faEthereum, faJs, faBootstrap
} from "@fortawesome/free-brands-svg-icons";
import {
  faDatabase, faCode, faLayerGroup, faGlobe, faVrCardboard, faFileSignature, faArrowRight,
  faVial, faClipboardCheck, faShieldHalved, faNetworkWired, faBrain,
  faMobileScreenButton, faRobot, faCloudArrowUp, faFileCode, faGear,
  faLaptopCode, faFileLines, faChartLine, faChartPie, faServer, faInfinity,
  faDesktop, faFileWord, faFileExcel, faFilePowerpoint, faTable, faDatabase as faDbIcon
} from "@fortawesome/free-solid-svg-icons";

const subjects = [
  { name: "Python", key: "python", icon: faPython, textStyle: "text-blue-500", bgStyle: "bg-blue-50", hoverBorder: "hover:border-blue-300", hoverShadow: "hover:shadow-[0_10px_40px_rgba(59,130,246,0.2)]" },
  { name: "Oracle", key: "oracle", icon: faDatabase, textStyle: "text-red-500", bgStyle: "bg-red-50", hoverBorder: "hover:border-red-300", hoverShadow: "hover:shadow-[0_10px_40px_rgba(239,68,68,0.2)]" },
  { name: "Django", key: "django", icon: faCode, textStyle: "text-emerald-600", bgStyle: "bg-emerald-50", hoverBorder: "hover:border-emerald-300", hoverShadow: "hover:shadow-[0_10px_40px_rgba(16,185,129,0.2)]" },
  { name: "Java", key: "java", icon: faJava, textStyle: "text-red-600", bgStyle: "bg-red-50", hoverBorder: "hover:border-red-400", hoverShadow: "hover:shadow-[0_10px_40px_rgba(220,38,38,0.2)]" },
  { name: "React", key: "react", icon: faReact, textStyle: "text-cyan-600", bgStyle: "bg-cyan-50", hoverBorder: "hover:border-cyan-300", hoverShadow: "hover:shadow-[0_10px_40px_rgba(8,145,178,0.2)]" },
  { name: "Node JS", key: "node_js", icon: faNodeJs, textStyle: "text-green-600", bgStyle: "bg-green-50", hoverBorder: "hover:border-green-300", hoverShadow: "hover:shadow-[0_10px_40px_rgba(22,163,74,0.2)]" },
  { name: "Express JS", key: "express_js", icon: faServer, textStyle: "text-gray-600", bgStyle: "bg-gray-50", hoverBorder: "hover:border-gray-300", hoverShadow: "hover:shadow-[0_10px_40px_rgba(75,85,99,0.2)]" },
  { name: "UI", key: "ui", icon: faLayerGroup, textStyle: "text-purple-500", bgStyle: "bg-purple-50", hoverBorder: "hover:border-purple-300", hoverShadow: "hover:shadow-[0_10px_40px_rgba(168,85,247,0.2)]" },
  { name: "JavaScript", key: "javascript", icon: faJs, textStyle: "text-yellow-500", bgStyle: "bg-yellow-50", hoverBorder: "hover:border-yellow-300", hoverShadow: "hover:shadow-[0_10px_40px_rgba(234,179,8,0.2)]" },
  { name: "HTML", key: "html", icon: faFileCode, textStyle: "text-orange-500", bgStyle: "bg-orange-50", hoverBorder: "hover:border-orange-300", hoverShadow: "hover:shadow-[0_10px_40px_rgba(249,115,22,0.2)]" },
  { name: "CSS", key: "css", icon: faFileCode, textStyle: "text-blue-500", bgStyle: "bg-blue-50", hoverBorder: "hover:border-blue-300", hoverShadow: "hover:shadow-[0_10px_40px_rgba(59,130,246,0.2)]" },
  { name: "Bootstrap", key: "bootstrap", icon: faBootstrap, textStyle: "text-purple-600", bgStyle: "bg-purple-50", hoverBorder: "hover:border-purple-400", hoverShadow: "hover:shadow-[0_10px_40px_rgba(147,51,234,0.2)]" },

  // NEW TRENDING TECH
  { name: "Web3", key: "web3", icon: faGlobe, textStyle: "text-indigo-600", bgStyle: "bg-indigo-50", hoverBorder: "hover:border-indigo-300", hoverShadow: "hover:shadow-[0_10px_40px_rgba(79,70,229,0.2)]" },
  { name: "Virtual Reality", key: "virtual_reality", icon: faVrCardboard, textStyle: "text-fuchsia-600", bgStyle: "bg-fuchsia-50", hoverBorder: "hover:border-fuchsia-300", hoverShadow: "hover:shadow-[0_10px_40px_rgba(192,38,211,0.2)]" },
  { name: "Smart Contracts", key: "smart_contracts", icon: faFileSignature, textStyle: "text-amber-600", bgStyle: "bg-amber-50", hoverBorder: "hover:border-amber-300", hoverShadow: "hover:shadow-[0_10px_40px_rgba(217,119,6,0.2)]" },
  { name: "Selenium", key: "selenium", icon: faVial, textStyle: "text-green-600", bgStyle: "bg-green-50", hoverBorder: "hover:border-green-300", hoverShadow: "hover:shadow-[0_10px_40px_rgba(22,163,74,0.2)]" },
  { name: "QA Processes", key: "qa_processes", icon: faClipboardCheck, textStyle: "text-blue-600", bgStyle: "bg-blue-50", hoverBorder: "hover:border-blue-300", hoverShadow: "hover:shadow-[0_10px_40px_rgba(37,99,235,0.2)]" },
  { name: "Penetration Testing", key: "penetration_testing", icon: faShieldHalved, textStyle: "text-slate-700", bgStyle: "bg-slate-50", hoverBorder: "hover:border-slate-300", hoverShadow: "hover:shadow-[0_10px_40px_rgba(71,85,105,0.2)]" },
  { name: "Backend", key: "backend", icon: faServer, textStyle: "text-purple-600", bgStyle: "bg-purple-50", hoverBorder: "hover:border-purple-300", hoverShadow: "hover:shadow-[0_10px_40px_rgba(147,51,234,0.2)]" },
  { name: ".NET Core", key: "dotnet", icon: faCode, textStyle: "text-indigo-700", bgStyle: "bg-indigo-50", hoverBorder: "hover:border-indigo-300", hoverShadow: "hover:shadow-[0_10px_40px_rgba(79,70,229,0.2)]" },
  { name: ".NET MVC", key: "dotnet_mvc", icon: faCode, textStyle: "text-indigo-600", bgStyle: "bg-indigo-50", hoverBorder: "hover:border-indigo-200", hoverShadow: "hover:shadow-[0_10px_40px_rgba(99,102,241,0.2)]" },
  { name: "Network Security", key: "network_security", icon: faNetworkWired, textStyle: "text-red-700", bgStyle: "bg-red-50", hoverBorder: "hover:border-red-300", hoverShadow: "hover:shadow-[0_10px_40px_rgba(185,28,28,0.2)]" },
  { name: "MongoDB", key: "mongodb", icon: faDbIcon, textStyle: "text-emerald-700", bgStyle: "bg-emerald-50", hoverBorder: "hover:border-emerald-300", hoverShadow: "hover:shadow-[0_10px_40px_rgba(4,120,87,0.2)]" },
  { name: "iOS Swift", key: "ios_swift", icon: faSwift, textStyle: "text-orange-500", bgStyle: "bg-orange-50", hoverBorder: "hover:border-orange-300", hoverShadow: "hover:shadow-[0_10px_40px_rgba(249,115,22,0.2)]" },
  { name: "Generative AI", key: "generative_ai", icon: faRobot, textStyle: "text-violet-600", bgStyle: "bg-violet-50", hoverBorder: "hover:border-violet-300", hoverShadow: "hover:shadow-[0_10px_40px_rgba(124,58,237,0.2)]" },
  { name: "Flutter/React Native", key: "flutter_react_native", icon: faMobileScreenButton, textStyle: "text-sky-500", bgStyle: "bg-sky-50", hoverBorder: "hover:border-sky-300", hoverShadow: "hover:shadow-[0_10px_40px_rgba(14,165,233,0.2)]" },
  { name: "ETL Pipelines", key: "etl_pipelines", icon: faGear, textStyle: "text-teal-600", bgStyle: "bg-teal-50", hoverBorder: "hover:border-teal-300", hoverShadow: "hover:shadow-[0_10px_40px_rgba(13,148,136,0.2)]" },
  { name: "Ethical Hacking", key: "ethical_hacking", icon: faShieldHalved, textStyle: "text-zinc-800", bgStyle: "bg-zinc-100", hoverBorder: "hover:border-zinc-400", hoverShadow: "hover:shadow-[0_10px_40px_rgba(39,39,42,0.2)]" },
  { name: "Ethereum", key: "ethereum", icon: faEthereum, textStyle: "text-blue-700", bgStyle: "bg-blue-50", hoverBorder: "hover:border-blue-400", hoverShadow: "hover:shadow-[0_10px_40px_rgba(29,78,216,0.2)]" },
  { name: "Deep Learning", key: "deep_learning", icon: faBrain, textStyle: "text-pink-600", bgStyle: "bg-pink-50", hoverBorder: "hover:border-pink-300", hoverShadow: "hover:shadow-[0_10px_40px_rgba(219,39,119,0.2)]" },
  { name: "Big Data Tools", key: "big_data_tools", icon: faDatabase, textStyle: "text-yellow-700", bgStyle: "bg-yellow-50", hoverBorder: "hover:border-yellow-400", hoverShadow: "hover:shadow-[0_10px_40px_rgba(161,98,7,0.2)]" },
  { name: "Augmented Reality", key: "augmented_reality", icon: faVrCardboard, textStyle: "text-purple-600", bgStyle: "bg-purple-50", hoverBorder: "hover:border-purple-300", hoverShadow: "hover:shadow-[0_10px_40px_rgba(147,51,234,0.2)]" },
  { name: "API Testing", key: "api_testing", icon: faVial, textStyle: "text-blue-500", bgStyle: "bg-blue-50", hoverBorder: "hover:border-blue-300", hoverShadow: "hover:shadow-[0_10px_40px_rgba(59,130,246,0.2)]" },
  { name: "Android", key: "android", icon: faRobot, textStyle: "text-green-500", bgStyle: "bg-green-50", hoverBorder: "hover:border-green-300", hoverShadow: "hover:shadow-[0_10px_40px_rgba(34,197,94,0.2)]" },

  // DATA SCIENCE & AI
  { name: "Python for Data Science", key: "python_data_science", icon: faPython, textStyle: "text-yellow-600", bgStyle: "bg-yellow-50", hoverBorder: "hover:border-yellow-300", hoverShadow: "hover:shadow-[0_10px_40px_rgba(202,138,4,0.2)]" },
  { name: "Numpy", key: "numpy", icon: faCode, textStyle: "text-blue-700", bgStyle: "bg-blue-50", hoverBorder: "hover:border-blue-300", hoverShadow: "hover:shadow-[0_10px_40px_rgba(29,78,216,0.2)]" },
  { name: "Pandas", key: "pandas", icon: faTable, textStyle: "text-indigo-700", bgStyle: "bg-indigo-50", hoverBorder: "hover:border-indigo-300", hoverShadow: "hover:shadow-[0_10px_40px_rgba(67,56,202,0.2)]" },
  { name: "Data Visualization", key: "data_visualization", icon: faChartLine, textStyle: "text-pink-500", bgStyle: "bg-pink-50", hoverBorder: "hover:border-pink-300", hoverShadow: "hover:shadow-[0_10px_40px_rgba(236,72,153,0.2)]" },
  { name: "Machine Learning", key: "machine_learning", icon: faBrain, textStyle: "text-purple-700", bgStyle: "bg-purple-50", hoverBorder: "hover:border-purple-300", hoverShadow: "hover:shadow-[0_10px_40px_rgba(126,34,206,0.2)]" },
  { name: "AI Concepts", key: "ai_concepts", icon: faRobot, textStyle: "text-cyan-700", bgStyle: "bg-cyan-50", hoverBorder: "hover:border-cyan-300", hoverShadow: "hover:shadow-[0_10px_40px_rgba(14,116,144,0.2)]" },
  { name: "Agentic AI (Claude)", key: "agentic_ai_claude", icon: faRobot, textStyle: "text-indigo-700", bgStyle: "bg-indigo-50", hoverBorder: "hover:border-indigo-300", hoverShadow: "hover:shadow-[0_10px_40px_rgba(79,70,229,0.2)]" },
  { name: "Agentic AI (GPT)", key: "agentic_ai_gpt", icon: faRobot, textStyle: "text-teal-700", bgStyle: "bg-teal-50", hoverBorder: "hover:border-teal-300", hoverShadow: "hover:shadow-[0_10px_40px_rgba(13,148,136,0.2)]" },

  // POWER BI
  { name: "Data Modeling", key: "datamodeling", icon: faDbIcon, textStyle: "text-orange-600", bgStyle: "bg-orange-50", hoverBorder: "hover:border-orange-300", hoverShadow: "hover:shadow-[0_10px_40_rgba(234,88,12,0.2)]" },
  { name: "Dashboards", key: "dashboards", icon: faDesktop, textStyle: "text-blue-600", bgStyle: "bg-blue-50", hoverBorder: "hover:border-blue-300", hoverShadow: "hover:shadow-[0_10px_40px_rgba(37,99,235,0.2)]" },
  { name: "Reports", key: "reports", icon: faChartPie, textStyle: "text-green-600", bgStyle: "bg-green-50", hoverBorder: "hover:border-green-300", hoverShadow: "hover:shadow-[0_10px_40px_rgba(22,163,74,0.2)]" },
  { name: "Power Query", key: "power_query", icon: faTable, textStyle: "text-amber-700", bgStyle: "bg-amber-50", hoverBorder: "hover:border-amber-300", hoverShadow: "hover:shadow-[0_10px_40px_rgba(217,119,6,0.2)]" },
  { name: "DAX", key: "dax", icon: faChartLine, textStyle: "text-indigo-700", bgStyle: "bg-indigo-50", hoverBorder: "hover:border-indigo-300", hoverShadow: "hover:shadow-[0_10px_40px_rgba(79,70,229,0.2)]" },

  // CLOUD
  { name: "Cloud Basics", key: "cloud_basics", icon: faCloudArrowUp, textStyle: "text-sky-600", bgStyle: "bg-sky-50", hoverBorder: "hover:border-sky-300", hoverShadow: "hover:shadow-[0_10px_40px_rgba(2,132,199,0.2)]" },
  { name: "EC2 & S3", key: "ec2_s3", icon: faAws, textStyle: "text-orange-600", bgStyle: "bg-orange-50", hoverBorder: "hover:border-orange-300", hoverShadow: "hover:shadow-[0_10px_40px_rgba(234,88,12,0.2)]" },
  { name: "IAM", key: "iam", icon: faShieldHalved, textStyle: "text-red-600", bgStyle: "bg-red-50", hoverBorder: "hover:border-red-300", hoverShadow: "hover:shadow-[0_10px_40px_rgba(220,38,38,0.2)]" },
  { name: "Deployment", key: "deployment", icon: faGear, textStyle: "text-gray-700", bgStyle: "bg-gray-100", hoverBorder: "hover:border-gray-300", hoverShadow: "hover:shadow-[0_10px_40px_rgba(55,65,81,0.2)]" },
  { name: "Microsoft Azure", key: "microsoft_azure", icon: faMicrosoft, textStyle: "text-blue-500", bgStyle: "bg-blue-50", hoverBorder: "hover:border-blue-300", hoverShadow: "hover:shadow-[0_10px_40px_rgba(59,130,246,0.2)]" },
  { name: "Google Cloud", key: "google_cloud", icon: faGoogle, textStyle: "text-red-500", bgStyle: "bg-red-50", hoverBorder: "hover:border-red-300", hoverShadow: "hover:shadow-[0_10px_40px_rgba(239,68,68,0.2)]" },

  // DEVOPS
  { name: "Git & Github", key: "git_github", icon: faGitAlt, textStyle: "text-orange-700", bgStyle: "bg-orange-50", hoverBorder: "hover:border-orange-300", hoverShadow: "hover:shadow-[0_10px_40px_rgba(194,65,12,0.2)]" },
  { name: "CI/CD", key: "ci_cd", icon: faInfinity, textStyle: "text-blue-800", bgStyle: "bg-blue-50", hoverBorder: "hover:border-blue-400", hoverShadow: "hover:shadow-[0_10px_40px_rgba(30,64,175,0.2)]" },
  { name: "Docker", key: "docker", icon: faDocker, textStyle: "text-blue-600", bgStyle: "bg-blue-50", hoverBorder: "hover:border-blue-300", hoverShadow: "hover:shadow-[0_10px_40px_rgba(37,99,235,0.2)]" },
  { name: "Kubernetes", key: "kubernetes_basics", icon: faGear, textStyle: "text-blue-500", bgStyle: "bg-blue-50", hoverBorder: "hover:border-blue-300", hoverShadow: "hover:shadow-[0_10px_40px_rgba(59,130,246,0.2)]" },

  // OTHER SUBJECTS
  { name: "ASP.NET MVC", key: "asp_net_mvc", icon: faCode, textStyle: "text-purple-600", bgStyle: "bg-purple-50", hoverBorder: "hover:border-purple-300", hoverShadow: "hover:shadow-[0_10px_40px_rgba(147,51,234,0.2)]" },
  { name: "C & Data Structures", key: "c_data_structures", icon: faCode, textStyle: "text-blue-600", bgStyle: "bg-blue-50", hoverBorder: "hover:border-blue-300", hoverShadow: "hover:shadow-[0_10px_40px_rgba(37,99,235,0.2)]" },
  { name: "C#", key: "c_sharp", icon: faCode, textStyle: "text-indigo-600", bgStyle: "bg-indigo-50", hoverBorder: "hover:border-indigo-300", hoverShadow: "hover:shadow-[0_10px_40px_rgba(79,70,229,0.2)]" },
  { name: "Hibernate", key: "hibernate", icon: faLayerGroup, textStyle: "text-red-700", bgStyle: "bg-red-50", hoverBorder: "hover:border-red-300", hoverShadow: "hover:shadow-[0_10px_40px_rgba(185,28,28,0.2)]" },
  { name: "JDBC", key: "jdbc", icon: faDatabase, textStyle: "text-amber-700", bgStyle: "bg-amber-50", hoverBorder: "hover:border-amber-300", hoverShadow: "hover:shadow-[0_10px_40px_rgba(180,83,9,0.2)]" },
  { name: "OOPS with C++", key: "oops_cpp", icon: faCode, textStyle: "text-blue-700", bgStyle: "bg-blue-50", hoverBorder: "hover:border-blue-300", hoverShadow: "hover:shadow-[0_10px_40px_rgba(29,78,216,0.2)]" },
  { name: "Spring", key: "spring", icon: faLayerGroup, textStyle: "text-green-700", bgStyle: "bg-green-50", hoverBorder: "hover:border-green-300", hoverShadow: "hover:shadow-[0_10px_40px_rgba(21,128,61,0.2)]" },
  { name: "Web APIs", key: "web_apis", icon: faGlobe, textStyle: "text-sky-700", bgStyle: "bg-sky-50", hoverBorder: "hover:border-sky-300", hoverShadow: "hover:shadow-[0_10px_40px_rgba(3,105,161,0.2)]" },

  // DCA / PGDCA
  { name: "Computer Fundamentals", key: "computer_fundamentals", icon: faDesktop, textStyle: "text-slate-600", bgStyle: "bg-slate-50", hoverBorder: "hover:border-slate-300", hoverShadow: "hover:shadow-[0_10px_40px_rgba(71,85,105,0.2)]" },
  { name: "Programming Basics", key: "programming_basics", icon: faCode, textStyle: "text-indigo-500", bgStyle: "bg-indigo-50", hoverBorder: "hover:border-indigo-300", hoverShadow: "hover:shadow-[0_10px_40px_rgba(99,102,241,0.2)]" },
  { name: "MS Office", key: "ms_office", icon: faFileLines, textStyle: "text-red-500", bgStyle: "bg-red-50", hoverBorder: "hover:border-red-300", hoverShadow: "hover:shadow-[0_10px_40px_rgba(239,68,68,0.2)]" },
  { name: "Database Basics", key: "database_basics", icon: faDbIcon, textStyle: "text-emerald-600", bgStyle: "bg-emerald-50", hoverBorder: "hover:border-emerald-300", hoverShadow: "hover:shadow-[0_10px_40px_rgba(16,185,129,0.2)]" },

  // DOA
  { name: "MS Word", key: "ms_word", icon: faFileWord, textStyle: "text-blue-700", bgStyle: "bg-blue-50", hoverBorder: "hover:border-blue-400", hoverShadow: "hover:shadow-[0_10px_40px_rgba(29,78,216,0.2)]" },
  { name: "Excel", key: "excel", icon: faFileExcel, textStyle: "text-green-700", bgStyle: "bg-green-50", hoverBorder: "hover:border-green-400", hoverShadow: "hover:shadow-[0_10px_40px_rgba(21,128,61,0.2)]" },
  { name: "PowerPoint", key: "powerpoint", icon: faFilePowerpoint, textStyle: "text-orange-700", bgStyle: "bg-orange-50", hoverBorder: "hover:border-orange-400", hoverShadow: "hover:shadow-[0_10px_40px_rgba(194,65,12,0.2)]" },
  { name: "Data Handling", key: "data_handling", icon: faDatabase, textStyle: "text-cyan-700", bgStyle: "bg-cyan-50", hoverBorder: "hover:border-cyan-400", hoverShadow: "hover:shadow-[0_10px_40px_rgba(14,116,144,0.2)]" },
];

// Course-specific subject mappings (lowercase keys)
const courseMappings = {
  "net full stack": ["dotnet", "dotnet_mvc", "c_sharp", "asp_net_mvc", "microsoft_azure", "ui", "oracle", "api_testing", "web_apis", "git_github"],
  "python full stack": ["python", "oracle", "ui", "react", "django", "backend"],
  "java full stack": ["java", "oracle", "ui", "spring", "hibernate", "jdbc", "backend"],
  "mern full stack": ["ui", "react", "node_js", "express_js", "git_github"],
  "ui full stack": ["ui", "backend", "oracle", "react", "node_js", "express_js", "mongodb"],
  "full stack": ["ui", "backend", "react", "node_js", "express_js", "web_apis", "javascript", "database_basics", "html", "css", "bootstrap", "oracle", "python", "java", "api_testing"],
  "data science and agentic ai": ["python_data_science", "numpy", "pandas", "data_visualization", "machine_learning", "ai_concepts", "generative_ai", "deep_learning", "agentic_ai_claude", "agentic_ai_gpt", "python"],
  "data science with ai": ["python", "python_data_science", "numpy", "pandas", "machine_learning", "deep_learning", "oracle", "mongodb", "power_query", "dax", "dashboards", "microsoft_azure", "ai_concepts", "generative_ai", "data_visualization"],
  "data science ai": ["python", "python_data_science", "numpy", "pandas", "data_visualization", "machine_learning", "ai_concepts", "generative_ai", "deep_learning", "agentic_ai_claude", "agentic_ai_gpt", "oracle", "mongodb"],
  "agentic ai": ["ai_concepts", "generative_ai", "deep_learning", "agentic_ai_claude", "agentic_ai_gpt", "python"],
  "data analytics": ["oracle", "python", "power_query", "dax", "dashboards", "excel", "web_apis"],
  "cloud computing": ["cloud_basics", "ec2_s3", "iam", "google_cloud", "microsoft_azure", "deployment", "docker", "kubernetes_basics", "python", "ci_cd"],
  "frontend": ["ui", "react", "javascript", "html", "css", "bootstrap"],
  "backend": ["backend", "node_js", "express_js", "web_apis", "database_basics", "oracle", "api_testing"],
  "devops": ["git_github", "ci_cd", "docker", "kubernetes_basics", "cloud_basics", "ec2_s3", "iam", "deployment", "microsoft_azure", "python"],
  "cyber security": ["network_security", "penetration_testing", "ethical_hacking", "cloud_basics", "iam", "ec2_s3", "python"],
  "power bi": ["power_query", "dax", "dashboards", "data_visualization", "reports", "python", "excel", "oracle"],
  "microsoft technologies": ["dotnet", "dotnet_mvc", "c_sharp", "ms_office", "microsoft_azure", "power_query", "dax", "dashboards", "oracle"],
  "mobile full stack": ["git_github", "django", "node_js", "express_js", "mongodb", "oracle", "web_apis", "api_testing", "ios_swift", "android", "flutter_react_native"],
  "mongodb": ["python", "java", "node_js", "mongodb"],
  "dca": ["computer_fundamentals", "programming_basics", "ms_office", "database_basics"],
  "pgdca": ["computer_fundamentals", "programming_basics", "ms_office", "database_basics"],
  "doa": ["ms_word", "excel", "powerpoint", "data_handling"]
};

const getAllowedSubjects = (courseName = "") => {
  const normalized = String(courseName || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  // STRICT MAPPING ONLY - High Confidence Policy
  return courseMappings[normalized] || [];
};

function DailyExamSubjects() {
  const navigate = useNavigate();

  const [activeCourse, setActiveCourse] = useState(null);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [isValidating, setIsValidating] = useState(true);

  const location = useLocation();
 
  useEffect(() => {
    // Intelligently restore session ONLY if returning from a specific exam intro stage.
    // This allows the "Back to Topics" button to lead back to DevOps (or similar) 
    // while keeping a fresh landing page for global entry points.
    if (location.state?.resumeCourse) {
      const savedCourse = sessionStorage.getItem("active_assessment_course");
      if (savedCourse) {
         setActiveCourse(savedCourse);
      }
    }

    const fetchProfile = async () => {
      const storedToken = localStorage.getItem("access");
      const token = storedToken ? storedToken.replace(/^"|"$/g, "") : null;
      
      if (!token) {
        setIsValidating(false);
        return;
      }
      try {
        const response = await axios.get("http://127.0.0.1:8000/api/profile/", {
          headers: { Authorization: `Bearer ${token}` }
        });
        const courses = response.data.enrolled_courses || (response.data.course_title ? [response.data.course_title] : []);
        setEnrolledCourses(courses);
        
        // Auto-select if only one course exists (only on fresh landing)
        const savedCourse = sessionStorage.getItem("active_assessment_course");
        if (courses.length === 1 && !savedCourse) {
           setActiveCourse(courses[0]);
           sessionStorage.setItem("active_assessment_course", courses[0]);
        }

        // Enrollment sync with local user state
        try {
          const userObj = JSON.parse(localStorage.getItem("user") || "{}");
          userObj.enrolledCourses = courses;
          localStorage.setItem("user", JSON.stringify(userObj));
        } catch (e) {}

      } catch (err) {
        console.error("Profile fetch error in DailyExam", err);
        if (err.response?.status === 401) {
          localStorage.removeItem("access");
          localStorage.removeItem("refresh");
          localStorage.removeItem("user");
          navigate("/");
        }
      } finally {
        setIsValidating(false);
      }
    };
    fetchProfile();
  }, [navigate]);

  const filteredSubjects = subjects.filter((subject) => {
    if (!activeCourse) return false;
    const allowed = getAllowedSubjects(activeCourse);
    
    // Add specific overrides for Mobile and .NET if needed
    const courseMatch = String(activeCourse).toLowerCase();
    if (courseMatch.match(/mobile|flutter|react\s*native/) && ["flutter_react_native", "android", "ios_swift"].includes(subject.key)) {
        return true;
    }
    if (courseMatch === "net full stack" || courseMatch === ".net full stack") {
        return ["dotnet", "dotnet_mvc", "c_sharp", "asp_net_mvc", "microsoft_azure", "ui", "oracle", "api_testing", "web_apis", "git_github"].includes(subject.key);
    }
    
    return allowed.includes(subject.key);
  });

  useEffect(() => {
    // Clear any previous exam result flag so we don't instantly bounce back to results
    localStorage.removeItem("examResult");

    // Intercept the browser back button ("windows arrow button left side")
    // to ensure it always goes directly back to the playground.
    const handlePopState = (e) => {
      e.preventDefault();
      navigate('/dashboard/playground', { replace: true });
    };

    window.history.pushState(null, null, window.location.href);
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [navigate]);

  const handleSelectSubject = (subjectKey) => {
    navigate(`/dashboard/daily-exam/${subjectKey}`);
  };

  if (isValidating) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-500 font-medium animate-pulse">Verifying Registration...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4 sm:p-8 relative">

      <div className="relative z-10 max-w-6xl w-full">

        {/* TOP LEFT BACK TO SELECTION BUTTON (Swapped) */}
        {activeCourse && enrolledCourses.length > 1 && (
          <div className="absolute top-0 left-0 pt-2 z-20">
            <button
              onClick={() => {
                setActiveCourse(null);
                sessionStorage.removeItem("active_assessment_course");
              }}
              className="flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-blue-600 transition-all bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100 group"
            >
              <span className="group-hover:-translate-x-1 transition-transform">←</span>
              Back to Course Selection
            </button>
          </div>
        )}

        {/* TOP RIGHT BACK BUTTON (Swapped) */}
        <div className="absolute top-0 right-0 pt-2 z-20">
          <button
            onClick={() => navigate("/dashboard/playground")}
            className="flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-blue-600 transition-all bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100 group"
          >
            <span className="group-hover:-translate-x-1 transition-transform">←</span>
            Back to Playground
          </button>
        </div>

        <div className="text-center mb-16 mt-16 sm:mt-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-tr from-blue-500 to-indigo-500 shadow-lg shadow-blue-500/30 mb-6 transform transition-transform hover:scale-110 hover:rotate-3 duration-300">
            <FontAwesomeIcon icon={faCode} className="text-3xl text-white" />
          </div>
          <h2 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-4 tracking-tight uppercase">
            {activeCourse ? `${activeCourse} ASSESSMENT` : "Assessment Center"}
          </h2>
          <div className="h-1.5 w-24 bg-gradient-to-r from-blue-500 to-indigo-500 mx-auto rounded-full mb-6"></div>
          <p className="text-gray-500 font-medium leading-relaxed max-w-2xl mx-auto text-lg">
            {activeCourse 
              ? `Choose a technical domain from the ${activeCourse} curriculum to start your evaluation.`
              : "Please select the registered course you wish to view assessments for."}
          </p>
          

          {!activeCourse && enrolledCourses.length === 0 && !isValidating && (
            <p className="text-sm text-red-500 font-semibold mt-4">
              Detailed course mapping not found. Please contact faculty.
            </p>
          )}
        </div>

        {/* Dynamic Branching: Course Selection OR Subject Grid */}
        {!activeCourse && enrolledCourses.length > 1 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {enrolledCourses.map((courseTitle) => (
              <button
                key={courseTitle}
                onClick={() => {
                  setActiveCourse(courseTitle);
                  sessionStorage.setItem("active_assessment_course", courseTitle);
                }}
                className="group relative p-10 bg-white rounded-[2rem] border-2 border-slate-100 hover:border-blue-500 shadow-xl shadow-slate-200/50 transition-all duration-500 hover:-translate-y-2 text-center overflow-hidden"
              >
                 <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                    <FontAwesomeIcon icon={faCode} className="text-6xl" />
                 </div>
                 <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:rotate-6 transition-transform">
                    <FontAwesomeIcon icon={faArrowRight} className="text-2xl" />
                 </div>
                 <h3 className="text-xl font-bold text-slate-800 uppercase tracking-tight mb-2">
                    {courseTitle}
                 </h3>
                 <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">
                    Enter Curriculum
                 </p>
                 <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/5 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSubjects.map((subject) => (
              <Link
                key={subject.key}
                to={`/dashboard/daily-exam/${subject.key}`}
                className={`group relative flex items-center justify-between w-full p-6 bg-white rounded-3xl border border-gray-100 hover:border-gray-200 transition-all duration-300 transform hover:-translate-y-1.5 overflow-hidden shadow-sm ${subject.hoverShadow} ${subject.hoverBorder}`}
              >
                <div className="flex items-center gap-5">
                  {/* Icon Container */}
                  <div className={`relative w-16 h-16 rounded-2xl flex items-center justify-center transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6 ${subject.bgStyle}`}>
                    <FontAwesomeIcon icon={subject.icon} className={`text-3xl ${subject.textStyle} transition-transform duration-300`} />
                  </div>
  
                  {/* Text Info */}
                  <div className="text-left flex flex-col justify-center">
                    <h3 className="text-lg font-bold text-gray-800 tracking-wide group-hover:text-gray-900 transition-colors uppercase">
                      {subject.name}
                    </h3>
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.2em] mt-1.5 group-hover:text-gray-500 transition-colors">
                      Select Topic
                    </p>
                  </div>
                </div>
  
                {/* Right side decoration */}
                <div className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center text-gray-300 group-hover:bg-blue-500 group-hover:text-white transition-all duration-300">
                  <FontAwesomeIcon icon={faArrowRight} className="text-xs group-hover:translate-x-0.5" />
                </div>
  
                {/* Hover highlight line */}
                <div className={`absolute bottom-0 left-0 h-[3px] bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-500 w-0 group-hover:w-full`}></div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default DailyExamSubjects;
