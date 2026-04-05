import random
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

@api_view(['GET'])
@permission_classes([AllowAny])
def playground_questions_backend_api(request):
    """
    General Backend Development and Server-side Patterns Assessment Questions.
    """
    questions_pool = [
        {"id": 1, "question": "What is Backend Development?", "options": ["Server-side, database, and business logic of an app", "Client-side, UI, and design", "Designing icons", "None"], "correct": 0},
        {"id": 2, "question": "Which of these is a popular backend language/framework?", "options": ["Node.js", "Django", "Spring Boot", "All of the above"], "correct": 3},
        {"id": 3, "question": "What is a 'REST' API?", "options": ["A website for travel", "An architectural style for networked applications using HTTP methods (GET, POST, etc)", "Neither", "Both"], "correct": 1},
        {"id": 4, "question": "Which HTTP method is used to 'create' a new resource?", "options": ["GET", "POST", "PUT", "DELETE"], "correct": 1},
        {"id": 5, "question": "Which HTTP method is used to 'retrieve' data?", "options": ["GET", "POST", "PUT", "PATCH"], "correct": 0},
        {"id": 6, "question": "Which HTTP method is used to 'update' a resource entirely?", "options": ["GET", "POST", "PUT", "DELETE"], "correct": 2},
        {"id": 7, "question": "What is a 'Database'?", "options": ["A types of list", "A structured collection of data stored and accessed electronically", "A physical folder", "None"], "correct": 1},
        {"id": 8, "question": "What is 'SQL'?", "options": ["Standard Query Level", "Structured Query Language for managing relational databases", "A types of script", "None"], "correct": 1},
        {"id": 9, "question": "What is 'NoSQL' primarily known for?", "options": ["Having no SQL", "Non-relational, flexible data models like documents and graphs", "Neither", "Both"], "correct": 1},
        {"id": 10, "question": "What is 'ORM' (Object-Relational Mapping)?", "options": ["A types of paint", "A technique that lets you query and manipulate data from a database using objects", "Neither", "Both"], "correct": 1},
        {"id": 11, "question": "Which of these is a common NoSQL database?", "options": ["MongoDB", "Redis", "Cassandra", "All of the above"], "correct": 3},
        {"id": 12, "question": "What is 'Relational Database'? (RDBMS)", "options": ["Digital friends list", "Database that stores data in tables linked by relationships (e.g. MySQL, Oracle)", "Both", "None"], "correct": 1},
        {"id": 13, "question": "What is 'Primary Key' in a table?", "options": ["A special key to a house", "A unique identifier for each record in a table", "Neither", "Both"], "correct": 1},
        {"id": 14, "question": "What is 'Foreign Key'?", "options": ["A key from outside", "A field in one table that uniquely identifies a row of another table", "Neither", "Both"], "correct": 1},
        {"id": 15, "question": "What is 'Index' used for in a database?", "options": ["Counting words", "To improve the speed of data retrieval operations on a table", "Neither", "Both"], "correct": 1},
        {"id": 16, "question": "What is 'API' (Application Programming Interface)?", "options": ["A design tool", "A set of protocols for building and integrating software applications", "Both", "None"], "correct": 1},
        {"id": 17, "question": "What is 'Authentication' vs 'Authorization'?", "options": ["Verifying identity vs Verifying permissions", "Confirming a person vs Confirming a file", "Neither", "Both"], "correct": 0},
        {"id": 18, "question": "What is 'CORS' (Cross-Origin Resource Sharing)?", "options": ["A types of lock", "A mechanism that allows/blocks requests from different origins (domains)", "Neither", "Both"], "correct": 1},
        {"id": 19, "question": "What is 'JSON' (JavaScript Object Notation)?", "options": ["A JavaScript book", "A lightweight data format commonly used for transmitting data in web apps", "None", "None"], "correct": 1},
        {"id": 20, "question": "What is 'Web Server' (e.g. Nginx, Apache)?", "options": ["A computer for everyone", "Software that serves content to clients (browsers) using HTTP", "Neither", "Both"], "correct": 1},
        {"id": 21, "question": "What is 'Request Header'?", "options": ["A title in a table", "Contextual metadata sent by a client (e.g. Content-Type, Authorization)", "Neither", "Both"], "correct": 1},
        {"id": 22, "question": "What's the meaning of 'Stateless' in backend context?", "options": ["No user data", "The server doesn't retain session information between requests", "Neither", "Both"], "correct": 1},
        {"id": 23, "question": "What is 'Caching' primarily for?", "options": ["Storing files cheaply", "Storing data temporarily to speed up future requests (e.g. Redis)", "Neither", "Both"], "correct": 1},
        {"id": 24, "question": "What is 'Middleware'?", "options": ["A bridge in a program", "Component that processes requests before they reach the handler (e.g. logging, auth)", "None", "None"], "correct": 1},
        {"id": 25, "question": "What is 'Environment Variable' (.env)?", "options": ["Variable for nature", "Variable that stores configuration sensitive data (e.g. DB passwords) outside code", "None", "None"], "correct": 1},
        {"id": 26, "question": "What is 'Load Balancer'?", "options": ["Distributing traffic across multiple servers to ensure scalability and HA", "A physical scale", "Neither", "Both"], "correct": 0},
        {"id": 27, "question": "What is 'Horizontal Scaling'?", "options": ["Increasing server size", "Adding more server instances to handle load", "Both", "Neither"], "correct": 1},
        {"id": 28, "question": "What is 'Vertical Scaling'?", "options": ["Adding more servers", "Increasing the resources (CPU, RAM) of a single server instance", "Both", "Neither"], "correct": 1},
        {"id": 29, "question": "What is 'Rate Limiting'?", "options": ["Limiting internet speed", "Restricting the number of requests a user can make in a given time", "Neither", "Both"], "correct": 1},
        {"id": 30, "question": "What is 'Payload' in an API request?", "options": ["The cost of the API", "The data being sent in the body of the request (e.g. JSON object)", "A routing name", "None"], "correct": 1},
        {"id": 31, "question": "Which of these is a backend 'Service' pattern?", "options": ["Microservices", "Monolithic", "Serverless", "All of the above"], "correct": 3},
        {"id": 32, "question": "What is 'Microservices' architecture?", "options": ["A monolithic app broke into small, independent services communicating over network", "A small app", "Neither", "Both"], "correct": 0},
        {"id": 33, "question": "What is 'Serverless' computing (e.g. AWS Lambda)?", "options": ["Computing with no servers", "Executing code in response to events without managing server infrastructure", "Neither", "Both"], "correct": 1},
        {"id": 34, "question": "What is 'Webhook'?", "options": ["An automated message sent from an app when something happens to another URL", "A design tool for hooks", "Neither", "Both"], "correct": 0},
        {"id": 35, "question": "What is 'Concurrency' in backend systems?", "options": ["Running two programs together", "The ability to handle multiple requests at once (e.g. multi-threading)", "Neither", "Both"], "correct": 1},
        {"id": 36, "question": "What is 'Database Migration'?", "options": ["Moving a database to another country", "Managing version control for your database schema evolution", "Deleting a database", "None"], "correct": 1},
        {"id": 37, "question": "What is 'Pagination' in APIs used for?", "options": ["Naming pages", "Breaking down large datasets into smaller chunks to return to the client", "Both", "None"], "correct": 1},
        {"id": 38, "question": "Which tool is commonly used to test APIs?", "options": ["Postman", "CURL", "Insomnia", "All of the above"], "correct": 3},
        {"id": 39, "question": "What is 'JWT' (JSON Web Token)?", "options": ["User ID", "A secure way of transmitting information between parties as a JSON object (auth)", "Neither", "Both"], "correct": 1},
        {"id": 40, "question": "Which protocol is usually used for persistent bi-directional communication?", "options": ["HTTP", "WebSockets", "FTP", "SMTP"], "correct": 1},
        {"id": 41, "question": "What is 'Eventual Consistency'?", "options": ["Data is always consistent", "Requirement that data will eventually be updated across all nodes in a distributed system", "Neither", "Both"], "correct": 1},
        {"id": 42, "question": "What is 'CAP Theorem' (Consistency, Availability, Partition tolerance)?", "options": ["A law in math", "A theorem stating a distributed system can only provide two of the three simultaneously", "Neither", "Both"], "correct": 1},
        {"id": 43, "question": "What's 'DevOps' primarily about?", "options": ["Coding and Designing", "Integrating Development and IT Operations teams to automate software delivery", "Neither", "Both"], "correct": 1},
        {"id": 44, "question": "What is 'CI/CD'?", "options": ["Continuous Interaction/Continuous Design", "Continuous Integration and Continuous Deployment/Delivery (pipeline automation)", "Both", "None"], "correct": 1},
        {"id": 45, "question": "What's the meaning of 'Scalability'?", "options": ["Increasing the size of objects", "System's ability to handle increasing workload by adding resources", "Neither", "Both"], "correct": 1},
        {"id": 46, "question": "What's the goal of 'Encryption at Rest'?", "options": ["Encrypting data being sent over internet", "Protecting data while it is stored on disk/database", "Neither", "Both"], "correct": 1},
        {"id": 47, "question": "What is 'API Documentation' tool (e.g. Swagger)?", "options": ["Interactive guide for developers using your API", "A security feature", "Neither", "Both"], "correct": 0},
        {"id": 48, "question": "Which encoding is standard for web for most texts?", "options": ["ASCII", "UTF-8", "Latin1", "Binary"], "correct": 1},
        {"id": 49, "question": "What is 'Logging' in server context?", "options": ["Cutting trees", "Recording application events and errors for monitoring and debugging", "Neither", "Both"], "correct": 1},
        {"id": 50, "question": "Why is 'Security' important for backend developers?", "options": ["Protecting sensitive user data and preventing system breaches/attacks", "Preventing design failures", "It's not important", "None"], "correct": 0},
    ]
    return Response({'success': True, 'data': random.sample(questions_pool, min(len(questions_pool), 30))})
