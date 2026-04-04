import random
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

@api_view(['GET'])
@permission_classes([AllowAny])
def playground_questions_java_api(request):
    questions_pool = [
        {"id": 1, "question": "Which of the following is not a Java features?", "options": ["Dynamic", "Architecture Neutral", "Use of pointers", "Object-oriented"], "correct": 2},
        {"id": 2, "question": "What is the size of boolean variable?", "options": ["8 bit", "16 bit", "32 bit", "not precisely defined"], "correct": 3},
        {"id": 3, "question": "What is the default value of a local variable?", "options": ["null", "0", "Depends on data type", "No default value"], "correct": 3},
        {"id": 4, "question": "Which of these cannot be used for a variable name in Java?", "options": ["identifier & keyword", "identifier", "keyword", "none of the mentioned"], "correct": 2},
        {"id": 5, "question": "What is the extension of compiled java classes?", "options": [".txt", ".js", ".class", ".java"], "correct": 2},
        {"id": 6, "question": "Which exception is thrown when divide by zero occurs?", "options": ["ArithmeticException", "NullPointerException", "ZeroDivException", "ClassCastException"], "correct": 0},
        {"id": 7, "question": "What is the default value of String?", "options": ["\"\"", "null", "0", "not defined"], "correct": 1},
        {"id": 8, "question": "Which concept allows you to expose only essential data to the outside world?", "options": ["Encapsulation", "Abstraction", "Polymorphism", "Inheritance"], "correct": 1},
        {"id": 9, "question": "Which class is the superclass of all classes in Java?", "options": ["java.lang.System", "java.lang.Class", "java.lang.Object", "java.lang.String"], "correct": 2},
        {"id": 10, "question": "What happens if a class does not define any constructors?", "options": ["Compilation error", "Runtime error", "A default no-argument constructor is provided", "The class cannot be instantiated"], "correct": 2},
        {"id": 11, "question": "How do you define a constant in Java?", "options": ["const int x = 10;", "final int x = 10;", "static int x = 10;", "immutable int x = 10;"], "correct": 1},
        {"id": 12, "question": "Which of the following is true about interfaces?", "options": ["Can have constructors", "Can be instantiated", "Variables are public static final by default", "Can extend a class"], "correct": 2},
        {"id": 13, "question": "Which keyword is used to explicitly call a superclass constructor?", "options": ["this", "super", "extends", "parent"], "correct": 1},
        {"id": 14, "question": "Which keyword is used to prevent a method from being overridden?", "options": ["static", "final", "abstract", "const"], "correct": 1},
        {"id": 15, "question": "What method is used to compare two strings for content equality?", "options": ["==", "equals()", "compareTo()", "matches()"], "correct": 1},
        {"id": 16, "question": "In Java, what does the 'static' keyword mean?", "options": ["The variable cannot change", "Belongs to the class rather than instances", "Can only be accessed locally", "Runs only once"], "correct": 1},
        {"id": 17, "question": "Which stream is used to read data from a file line by line?", "options": ["FileInputStream", "BufferedReader", "ObjectInputStream", "FileReader"], "correct": 1},
        {"id": 18, "question": "Which of these collections is synchronized?", "options": ["ArrayList", "Vector", "LinkedList", "HashSet"], "correct": 1},
        {"id": 19, "question": "What interface does a class need to implement to enable object serialization?", "options": ["Serializable", "Cloneable", "Comparable", "Runnable"], "correct": 0},
        {"id": 20, "question": "How can you run a thread?", "options": ["By calling init()", "By calling start()", "By calling run() directly", "By calling execute()"], "correct": 1},
        {"id": 21, "question": "What is lambda expression in Java?", "options": ["An anonymous class", "A function that can be created without belonging to any class", "A looping construct", "An abstract class"], "correct": 1},
        {"id": 22, "question": "Which memory area stores objects in Java?", "options": ["Stack", "Heap", "String Pool", "Method Area"], "correct": 1},
        {"id": 23, "question": "What does garbage collection guarantee?", "options": ["That memory leaks will not occur", "That out of memory errors will not occur", "Both A and B", "None of the above"], "correct": 3},
        {"id": 24, "question": "Which package contains the mathematical functions in Java?", "options": ["java.util", "java.lang", "java.math", "java.io"], "correct": 1},
        {"id": 25, "question": "What does JDBC stand for?", "options": ["Java Database Connectivity", "Java Data Base Connection", "Java Database Control", "Java Data Bind Connection"], "correct": 0},
        {"id": 26, "question": "Is it possible to overload the main() method in Java?", "options": ["Yes", "No", "Only in static classes", "Only using generic types"], "correct": 0},
        {"id": 27, "question": "Which keyword is used to throw an exception explicitly?", "options": ["throws", "try", "throw", "catch"], "correct": 2},
        {"id": 28, "question": "What is a major difference between throw and throws?", "options": ["No difference", "Throw is used inside method, throws in signature", "Throws is inside method, throw in signature", "Throw works with unchecked only"], "correct": 1},
        {"id": 29, "question": "Which map implementation maintains insertion order?", "options": ["HashMap", "TreeMap", "LinkedHashMap", "ConcurrentHashMap"], "correct": 2},
        {"id": 30, "question": "What is the difference between execute() and executeQuery() in JDBC?", "options": ["No difference", "execute() returns boolean; executeQuery() returns ResultSet", "execute() is for SELECT; executeQuery() for UPDATE", "execute() does not compile"], "correct": 1},
        {"id": 31, "question": "Which is used to handle multiple catch blocks properly?", "options": ["Parent exception class before child", "Child exception class before parent", "Any order", "Only one catch is allowed"], "correct": 1},
        {"id": 32, "question": "What does string 'intern()' method do?", "options": ["Converts string to int", "Places string in the string pool", "Removes whitespaces", "Interns a class"], "correct": 1},
        {"id": 33, "question": "Which design pattern restricts a class from having more than one instance?", "options": ["Factory", "Observer", "Singleton", "Decorator"], "correct": 2},
        {"id": 34, "question": "Which of these access specifiers allows the variables to be accessed from another class in the same package and subclasses in another package?", "options": ["Private", "Protected", "Public", "Default"], "correct": 1},
        {"id": 35, "question": "What happens when a thread is suspended?", "options": ["Releases all locks", "Terminates instantly", "Does not release any locks", "Throws an exception"], "correct": 2},
        {"id": 36, "question": "Can an abstract class have a constructor?", "options": ["Yes", "No", "Only default ones", "Only public ones"], "correct": 0},
        {"id": 37, "question": "Which method must be implemented by all threads using the Runnable interface?", "options": ["start()", "run()", "stop()", "main()"], "correct": 1},
        {"id": 38, "question": "What is the return type of hashCode() method in Java?", "options": ["int", "long", "String", "Object"], "correct": 0},
        {"id": 39, "question": "Which API facilitates processing large quantities of data efficiently in Java 8?", "options": ["Future API", "Stream API", "Collections API", "Concurrency API"], "correct": 1},
        {"id": 40, "question": "What does a volatile variable guarantee?", "options": ["Atomicity", "Thread safety", "Visibility of changes given to other threads", "Instance immutability"], "correct": 2},
        {"id": 41, "question": "Which function allows executing SQL queries in Java?", "options": ["java.sql.Query", "java.sql.Execute", "java.sql.Statement", "java.sql.SQL"], "correct": 2},
        {"id": 42, "question": "Which annotation is used to tell the compiler that a method is being overridden?", "options": ["@Override", "@Overload", "@Extend", "@Hide"], "correct": 0},
        {"id": 43, "question": "Which feature of Java avoids memory leaks natively?", "options": ["ClassLoader", "Garbage Collection", "Encapsulation", "Polymorphism"], "correct": 1},
        {"id": 44, "question": "Which method is used in Collections to sort a list?", "options": ["Collections.order()", "Collections.sort()", "List.sort()", "both B and C"], "correct": 3},
        {"id": 45, "question": "Are enums classes in Java?", "options": ["Yes, they can have fields and methods", "No, they are primitive types", "No, they only hold integers", "Yes, but they cannot have methods"], "correct": 0},
        {"id": 46, "question": "What is the output of the following Java snippet?\nString s1 = \"Hello\";\nString s2 = new String(\"Hello\");\nSystem.out.println(s1 == s2);", "options": ["true", "false", "Compilation error", "Runtime exception"], "correct": 1},
        {"id": 47, "question": "What is the result of the following Java snippet?\nint a = 10, b = 20;\nSystem.out.println(a + b + \" Java\");\nSystem.out.println(\"Java \" + a + b);", "options": ["30 Java\nJava 1020", "30 Java\nJava 30", "1020 Java\nJava 1020", "compile error"], "correct": 0},
        {"id": 48, "question": "What will this Java snippet print?\ntry {\n  int data = 10 / 0;\n} catch (ArithmeticException e) {\n  System.out.print(\"A\");\n} finally {\n  System.out.print(\"B\");\n}", "options": ["A", "B", "AB", "program crashes"], "correct": 2},
        {"id": 49, "question": "What does the following print?\nint x = 5;\nSystem.out.println(x++ + ++x);", "options": ["10", "11", "12", "13"], "correct": 2},
        {"id": 50, "question": "What is the output of this Java loop?\nint sum = 0;\nfor(int i = 0; i < 5; i++) {\n  if(i == 3) continue;\n  sum += i;\n}\nSystem.out.println(sum);", "options": ["10", "7", "6", "3"], "correct": 1},
    ]

    theoretical_questions = questions_pool[:45]
    practical_questions = questions_pool[45:50]
    
    selected_questions = random.sample(theoretical_questions, 15) + practical_questions
    random.shuffle(selected_questions)
    
    return Response({
        'success': True,
        'data': selected_questions
    })