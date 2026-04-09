import random
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

@api_view(['GET'])
@permission_classes([AllowAny])
def playground_questions_springboot_api(request):
    """Assessment pool for SpringBoot"""
    questions_pool = [
        {"id": 1, "question": "What is Spring Boot?", "options": ["A framework for rapid Java development", "A build tool", "A database", "A server"], "correct": 0},
        {"id": 2, "question": "Which annotation is used to create a Spring Boot application?", "options": ["@SpringBootApplication", "@EnableAutoConfiguration", "@ComponentScan", "@SpringBootConfiguration"], "correct": 0},
        {"id": 3, "question": "What is the default port for a Spring Boot application?", "options": ["8080", "8000", "9090", "7070"], "correct": 0},
        {"id": 4, "question": "Which file is used to configure Spring Boot properties?", "options": ["application.properties", "config.xml", "settings.json", "setup.cfg"], "correct": 0},
        {"id": 5, "question": "What is the purpose of Spring Boot Actuator?", "options": ["Monitoring and management", "Database access", "UI rendering", "Testing"], "correct": 0},
        {"id": 6, "question": "What does @RestController do?", "options": ["Combines @Controller and @ResponseBody", "Creates a static controller", "Redirects to HTML", "None"], "correct": 0},
        {"id": 7, "question": "Which annotation is used for Dependency Injection in Spring?", "options": ["@Autowired", "@Inject", "@Resource", "All of the above"], "correct": 3},
        {"id": 8, "question": "@Service annotation is used at which layer?", "options": ["Service Layer", "Persistence Layer", "Presentation Layer", "Configuration Layer"], "correct": 0},
        {"id": 9, "question": "What is the use of @Repository?", "options": ["Database related operations", "Service logic", "Web endpoints", "Logging"], "correct": 0},
        {"id": 10, "question": "Which tool is commonly used to generate a Spring Boot project?", "options": ["Spring Initializr", "Vite", "Create React App", "NPM"], "correct": 0},
        {"id": 11, "question": "What is Dependency Injection (DI)?", "options": ["A design pattern to decouple objects", "Injecting dependencies manually", "Neither", "Both"], "correct": 0},
        {"id": 12, "question": "What is Inversion of Control (IoC)?", "options": ["Giving control of objects to the framework", "Taking control back", "Neither", "Both"], "correct": 0},
        {"id": 13, "question": "What is application.yml?", "options": ["Alternative to application.properties using YAML format", "A bash script", "Neither", "Both"], "correct": 0},
        {"id": 14, "question": "What is DevTools in Spring Boot?", "options": ["Module to improve developer experience (auto-restart)", "A cloud tool", "Neither", "Both"], "correct": 0},
        {"id": 15, "question": "What is Spring Boot Starter?", "options": ["Dependencies that simplify configuration", "A quick start guide", "Neither", "Both"], "correct": 0},
        {"id": 16, "question": "What is Spring Data JPA?", "options": ["Framework to reduce boilerplate for DB access", "A SQL database", "Neither", "Both"], "correct": 0},
        {"id": 17, "question": "What does @Entity do?", "options": ["Defines a class as a database table", "Neither", "Both", "Defines a service"], "correct": 0},
        {"id": 18, "question": "What is Spring Security?", "options": ["Powerful authentication and access-control framework", "A lock", "Neither", "Both"], "correct": 0},
        {"id": 19, "question": "What is @PathVariable used for?", "options": ["Extracting values from URL paths", "Sending data in body", "Neither", "Both"], "correct": 0},
        {"id": 20, "question": "What is @RequestParam used for?", "options": ["Extracting query parameters from URL", "Extraction from body", "Neither", "Both"], "correct": 0},
        {"id": 21, "question": "How do you run a Spring Boot app from the CLI?", "options": ["mvn spring-boot:run", "python run", "Neither", "Both"], "correct": 0},
        {"id": 22, "question": "What is the purpose of @Primary?", "options": ["Indicate a primary bean when multiple exist", "Neither", "Both", "First line of code"], "correct": 0},
        {"id": 23, "question": "What is @Qualifier used for?", "options": ["Differentiate beans of the same type", "Neither", "Both", "Sorting"], "correct": 0},
        {"id": 24, "question": "What is @Value used for?", "options": ["Injecting values from properties files", "Comparing values", "Neither", "Both"], "correct": 0},
        {"id": 25, "question": "What is 'Bean' in Spring?", "options": ["An object managed by the Spring IoC container", "A vegetable", "Neither", "Both"], "correct": 0},
    ]
    return Response({'success': True, 'data': random.sample(questions_pool, min(len(questions_pool), 25))})
