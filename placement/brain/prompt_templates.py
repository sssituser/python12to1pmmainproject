"""
brain/prompt_templates.py
All prompt templates for online (Gemini) mode
and offline keyword/QA databases for fallback mode.
"""

# ─── ONLINE PROMPTS ───────────────────────────────────────────────────────────

RESUME_PARSE_PROMPT = """
You are an expert ATS resume parser. Analyze the following resume text and return a JSON object with:
{{
  "technical_skills": [...],
  "soft_skills": [...],
  "education": [{{ "degree": "", "institution": "", "year": "" }}],
  "projects": [{{ "title": "", "description": "" }}],
  "certifications": [...]
}}
Return ONLY valid JSON, no extra text.

Resume Text:
{resume_text}
"""

ATS_SCORE_PROMPT = """
You are an ATS scoring engine. Analyze this resume and return JSON:
{{
  "ats_score": <integer 0-100>,
  "improvements": [<list of specific improvement suggestions as strings>]
}}
Score based on: completeness (30%), keyword density (30%), format clarity (20%), contact info (10%), quantifiable achievements (10%).
Return ONLY valid JSON.

Resume Text:
{resume_text}
"""

JOB_MATCH_PROMPT = """
You are a job matching AI. Given student skills and a job's required skills, return JSON:
{{
  "match_percentage": <integer 0-100>,
  "matched_skills": [...],
  "missing_skills": [...],
  "learning_suggestions": [{{ "skill": "", "resource": "", "duration": "" }}]
}}
Return ONLY valid JSON.

Student Skills: {student_skills}
Job Required Skills: {job_skills}
Job Title: {job_title}
"""

INTERVIEW_PROMPT = """
You are an expert interview question generator. Generate questions for:
Job Role: {job_role}
Company: {company}
Student Skills: {student_skills}

Return JSON:
{{
  "technical": [<5 technical questions>],
  "hr": [<5 HR questions>],
  "coding": [<3 coding challenge descriptions>],
  "company_specific": [<3 company-specific questions>]
}}
Return ONLY valid JSON.
"""

REPORT_PROMPT = """
You are a placement analytics expert. Based on the data below, generate a comprehensive natural language report.

Data: {data}

Include: overall performance summary, top performing students, weak areas, department analysis, and recommendations.
Write in professional report style, 3-5 paragraphs.
"""

CHAT_SYSTEM_PROMPT = """
You are SSSIT Placement Assistant, an intelligent AI assistant for the SSSIT Placement Portal.
You help:
- Students: find jobs, prepare for interviews, understand exam mistakes, plan preparation
- Faculty: generate reports, identify weak students, analyze department performance
- Recruiters: find candidates, rank applicants, summarize resumes

User Role: {role}
Context Data: {context}

Be concise, helpful and professional. Answer based on the context provided.
"""

SKILL_GAP_PROMPT = """
Analyze skill gap between student and job requirements. Return JSON:
{{
  "missing_skills": [...],
  "roadmap": [{{ "week": <int>, "topic": "", "resources": "" }}],
  "estimated_weeks": <int>
}}
Return ONLY valid JSON.

Student Skills: {student_skills}
Job Requirements: {job_requirements}
"""

# ─── OFFLINE DATA ─────────────────────────────────────────────────────────────

TECHNICAL_SKILLS_KEYWORDS = [
    # Languages
    "python", "java", "javascript", "typescript", "c++", "c#", "php", "ruby", "swift", "kotlin",
    "go", "rust", "scala", "r", "matlab", "perl", "bash", "powershell",
    # Web
    "html", "css", "react", "angular", "vue", "node.js", "express", "django", "flask",
    "fastapi", "spring", "springboot", "asp.net", "laravel", "next.js", "nuxt", "gatsby",
    # Data & AI
    "machine learning", "deep learning", "tensorflow", "pytorch", "keras", "scikit-learn",
    "pandas", "numpy", "matplotlib", "seaborn", "nlp", "computer vision", "data science",
    "big data", "spark", "hadoop", "kafka", "airflow",
    # Cloud & DevOps
    "aws", "azure", "gcp", "docker", "kubernetes", "jenkins", "ci/cd", "terraform",
    "ansible", "nginx", "linux", "git", "github", "gitlab", "bitbucket",
    # Databases
    "mysql", "postgresql", "mongodb", "redis", "sqlite", "oracle", "cassandra",
    "elasticsearch", "dynamodb", "firebase",
    # Mobile
    "android", "ios", "flutter", "react native", "xamarin",
    # Testing
    "selenium", "jest", "pytest", "junit", "postman", "api testing", "unit testing",
    # Others
    "rest api", "graphql", "microservices", "agile", "scrum", "jira", "figma",
    "excel", "power bi", "tableau", "blockchain", "web3",
]

SOFT_SKILLS_KEYWORDS = [
    "communication", "leadership", "teamwork", "problem solving", "critical thinking",
    "time management", "adaptability", "creativity", "collaboration", "analytical",
    "project management", "decision making", "presentation", "interpersonal",
    "multitasking", "attention to detail", "self-motivated", "quick learner",
    "conflict resolution", "negotiation", "mentoring", "coaching",
]

CERTIFICATION_KEYWORDS = [
    "certified", "certification", "certificate", "aws certified", "azure certified",
    "google certified", "pmp", "cisco", "ccna", "ccnp", "rhce", "oracle certified",
    "comptia", "cissp", "ceh", "itil", "six sigma", "pmi", "coursera", "udemy",
    "nptel", "hackerrank", "leetcode", "microsoft certified", "salesforce certified",
]

EDUCATION_KEYWORDS = [
    "b.tech", "b.e.", "bca", "bsc", "mca", "m.tech", "m.e.", "msc", "mba",
    "bachelor", "master", "phd", "diploma", "degree", "10th", "12th", "sslc",
    "hsc", "cbse", "icse", "university", "college", "institute", "iit", "nit",
    "cgpa", "percentage", "aggregate",
]

PROJECT_KEYWORDS = [
    "project", "developed", "built", "implemented", "designed", "created",
    "deployed", "integrated", "architected", "application", "system", "platform",
    "website", "app", "tool", "framework", "module",
]

# ─── OFFLINE INTERVIEW QUESTION BANK ──────────────────────────────────────────

INTERVIEW_QUESTION_BANK = {
    "python": {
        "technical": [
            "What are Python decorators and how do they work?",
            "Explain the difference between list, tuple, set and dict in Python.",
            "What is the GIL (Global Interpreter Lock) and how does it affect multithreading?",
            "How does Python manage memory? Explain garbage collection.",
            "What are generators and how are they different from iterators?",
            "Explain list comprehensions vs generator expressions.",
            "What is the difference between `deepcopy` and `shallowcopy`?",
            "How do you handle exceptions in Python? Explain try/except/finally.",
            "What are Python's `*args` and `**kwargs`?",
            "Explain Python's MRO (Method Resolution Order).",
        ],
        "coding": [
            "Reverse a string without using built-in functions.",
            "Find the second largest element in a list.",
            "Check if a string is a palindrome.",
            "Implement a binary search algorithm.",
            "Write a function to flatten a nested list.",
        ],
    },
    "java": {
        "technical": [
            "What is the difference between JDK, JRE and JVM?",
            "Explain OOP principles: encapsulation, inheritance, polymorphism, abstraction.",
            "What is the difference between an abstract class and interface?",
            "Explain Java's memory model: heap and stack.",
            "What are checked and unchecked exceptions?",
            "What is the Collections framework in Java?",
            "How does HashMap work internally?",
            "What is multithreading? Explain synchronized keyword.",
            "What are Java streams and lambda expressions?",
            "Explain the difference between == and .equals() in Java.",
        ],
        "coding": [
            "Implement a Singleton design pattern.",
            "Write a program to find all prime numbers up to N.",
            "Implement a stack using arrays.",
            "Write a linked list reversal program.",
            "Find duplicates in an integer array.",
        ],
    },
    "django": {
        "technical": [
            "Explain Django's MTV (Model-Template-View) architecture.",
            "What is Django ORM and how does it work?",
            "Explain Django middleware and how to write custom middleware.",
            "What is the difference between `select_related` and `prefetch_related`?",
            "How does Django handle authentication and authorisation?",
            "What is Django REST Framework and how does it differ from Django?",
            "Explain signals in Django.",
            "What are Django migrations and how do you manage them?",
            "How does Django's caching framework work?",
            "What are serializers in DRF?",
        ],
        "coding": [
            "Write a Django model for a blog post with author and tags.",
            "Create a DRF serializer for a nested relationship.",
            "Write a custom Django middleware to log all requests.",
            "Implement a custom user model extending AbstractUser.",
            "Create a Django view that returns paginated JSON data.",
        ],
    },
    "react": {
        "technical": [
            "What is the virtual DOM and how does React use it?",
            "Explain React hooks: useState, useEffect, useContext.",
            "What is the difference between controlled and uncontrolled components?",
            "How does React Context API work?",
            "What is prop drilling and how can you avoid it?",
            "Explain React lifecycle methods.",
            "What is Redux and when should you use it?",
            "What are higher-order components (HOC)?",
            "Explain lazy loading and code splitting in React.",
            "What is the difference between `useMemo` and `useCallback`?",
        ],
        "coding": [
            "Build a counter component with increment and decrement buttons.",
            "Create a todo list with add and delete functionality.",
            "Implement a search filter on a list of items.",
            "Build a custom hook for fetching data from an API.",
            "Create a modal component with open/close state.",
        ],
    },
    "sql": {
        "technical": [
            "What is the difference between INNER JOIN and LEFT JOIN?",
            "Explain normalization forms (1NF, 2NF, 3NF).",
            "What are indexes and when should you use them?",
            "What is the difference between DELETE, TRUNCATE and DROP?",
            "Explain ACID properties of transactions.",
            "What is a stored procedure vs a function?",
            "How do GROUP BY and HAVING work together?",
            "What are window functions in SQL?",
            "Explain the difference between clustered and non-clustered indexes.",
            "What are SQL subqueries and correlated subqueries?",
        ],
        "coding": [
            "Find the second highest salary from an employee table.",
            "Write a query to find duplicate rows in a table.",
            "Find all employees who earn more than their manager.",
            "Write a query to get department-wise employee count.",
            "Find all customers who have not placed any orders.",
        ],
    },
    "general": {
        "hr": [
            "Tell me about yourself.",
            "Why do you want to join our company?",
            "Where do you see yourself in 5 years?",
            "What are your strengths and weaknesses?",
            "Describe a challenging situation and how you handled it.",
            "Why should we hire you?",
            "What motivates you to work hard?",
            "How do you handle pressure and tight deadlines?",
            "Describe a time you worked in a team to achieve a goal.",
            "Do you have any questions for us?",
        ],
        "technical": [
            "Explain the concept of OOP with a real-world example.",
            "What is the difference between compiled and interpreted languages?",
            "Explain REST vs SOAP APIs.",
            "What is version control and why is it important?",
            "What is the difference between SQL and NoSQL databases?",
            "Explain the software development lifecycle (SDLC).",
            "What is Agile methodology?",
            "Explain TCP/IP and HTTP protocol.",
            "What is cloud computing?",
            "Explain CI/CD pipeline.",
        ],
    },
}

# Offline chatbot intent patterns
CHAT_INTENTS = {
    "job_recommend": ["recommend job", "suggest job", "which job", "find job", "job for me", "suitable job"],
    "interview_help": ["interview question", "prepare interview", "interview tips", "mock interview"],
    "exam_explain": ["exam mistake", "wrong answer", "explain answer", "why wrong", "exam result"],
    "aptitude": ["aptitude question", "quantitative", "reasoning question", "math question"],
    "prep_plan": ["preparation plan", "study plan", "how to prepare", "placement preparation", "roadmap"],
    "candidate_find": ["find candidate", "student skilled", "find student", "who knows", "best candidate"],
    "resume_summary": ["summarize resume", "resume summary", "candidate summary"],
    "rank_applicant": ["rank candidate", "best applicant", "rank applicant", "who is best"],
    "weak_students": ["weak student", "needs training", "poor performance", "failing student"],
    "department_report": ["department performance", "which department", "department analysis"],
    "placement_report": ["placement report", "generate report", "placement statistics", "placement summary"],
    "greeting": ["hello", "hi", "hey", "good morning", "good afternoon", "help"],
}
