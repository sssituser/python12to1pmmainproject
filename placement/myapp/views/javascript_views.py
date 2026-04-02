import random
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

@api_view(['GET'])
@permission_classes([AllowAny])
def playground_questions_javascript_api(request):
    questions_pool = [
        {"id": 1, "question": "Inside which HTML element do we put the JavaScript?", "options": ["<js>", "<scripting>", "<script>", "<javascript>"], "correct": 2},
        {"id": 2, "question": "Where is the correct place to insert a JavaScript?", "options": ["Both the <head> section and the <body> section", "The <head> section", "The <body> section", "At the end of the document"], "correct": 0},
        {"id": 3, "question": "What is the correct syntax for referring to an external script called 'xxx.js'?", "options": ["<script href=\"xxx.js\">", "<script src=\"xxx.js\">", "<script name=\"xxx.js\">", "<link href=\"xxx.js\">"], "correct": 1},
        {"id": 4, "question": "The external JavaScript file must contain the <script> tag.", "options": ["True", "False", "Partially True", "Depends on the browser"], "correct": 1},
        {"id": 5, "question": "How do you write 'Hello World' in an alert box?", "options": ["msgBox(\"Hello World\");", "alert(\"Hello World\");", "alertBox(\"Hello World\");", "msg(\"Hello World\");"], "correct": 1},
        {"id": 6, "question": "How do you create a function in JavaScript?", "options": ["function = myFunction()", "function:myFunction()", "function myFunction()", "myFunction = function()"], "correct": 2},
        {"id": 7, "question": "How do you call a function named 'myFunction'?", "options": ["call function myFunction()", "call myFunction()", "myFunction()", "execute myFunction()"], "correct": 2},
        {"id": 8, "question": "How to write an IF statement in JavaScript?", "options": ["if i = 5", "if i = 5 then", "if i == 5 then", "if (i == 5)"], "correct": 3},
        {"id": 9, "question": "How to write an IF statement for executing some code if 'i' is NOT equal to 5?", "options": ["if (i != 5)", "if i <> 5", "if (i <> 5)", "if i =! 5 then"], "correct": 0},
        {"id": 10, "question": "How does a WHILE loop start?", "options": ["while i = 1 to 10", "while (i <= 10; i++)", "while (i <= 10)", "while (i <= 10) do"], "correct": 2},
        {"id": 11, "question": "How does a FOR loop start?", "options": ["for (i <= 5; i++)", "for (i = 0; i <= 5; i++)", "for (i = 0; i <= 5)", "for i = 1 to 5"], "correct": 1},
        {"id": 12, "question": "How can you add a comment in a JavaScript?", "options": ["'This is a comment", "//This is a comment", "<!--This is a comment-->", "/*This is a comment*/"], "correct": 1},
        {"id": 13, "question": "What is the correct way to write a JavaScript array?", "options": ["var colors = [\"red\", \"green\", \"blue\"]", "var colors = \"red\", \"green\", \"blue\"", "var colors = 1 = (\"red\"), 2 = (\"green\"), 3 = (\"blue\")", "var colors = (1:\"red\", 2:\"green\", 3:\"blue\")"], "correct": 0},
        {"id": 14, "question": "How do you round the number 7.25, to the nearest integer?", "options": ["rnd(7.25)", "Math.rnd(7.25)", "Math.round(7.25)", "round(7.25)"], "correct": 2},
        {"id": 15, "question": "How do you find the number with the highest value of x and y?", "options": ["Math.ceil(x, y)", "top(x, y)", "Math.max(x, y)", "ceil(x, y)"], "correct": 2},
        {"id": 16, "question": "Which event occurs when the user clicks on an HTML element?", "options": ["onmouseclick", "onchange", "onmouseover", "onclick"], "correct": 3},
        {"id": 17, "question": "In JavaScript, the x === y statement implies that:", "options": ["Both x and y are equal in value, type and reference address", "Both x and y are equal in value only", "Both are equal in value and data type", "Both are equal in reference only"], "correct": 2},
        {"id": 18, "question": "Which operator is used to assign a value to a variable?", "options": ["*", "=", "-", "x"], "correct": 1},
        {"id": 19, "question": "What will the following code return: Boolean(10 > 9)", "options": ["NaN", "false", "true", "undefined"], "correct": 2},
        {"id": 20, "question": "Is JavaScript case-sensitive?", "options": ["No", "Yes", "Only in functions", "Only for variables"], "correct": 1},
        {"id": 21, "question": "Which of the following is not a reserved word in JavaScript?", "options": ["interface", "throws", "program", "short"], "correct": 2},
        {"id": 22, "question": "What is the output of 'typeof NaN'?", "options": ["number", "string", "undefined", "object"], "correct": 0},
        {"id": 23, "question": "What is the default value of variables that are not initialized?", "options": ["null", "0", "false", "undefined"], "correct": 3},
        {"id": 24, "question": "Which symbol is used for comments of more than one line?", "options": ["//", "<!-- -->", "/* */", "##"], "correct": 2},
        {"id": 25, "question": "Which of the following type of variable is visible only within a function where it is defined?", "options": ["global variable", "local variable", "both", "none"], "correct": 1},
        {"id": 26, "question": "Which built-in method adds one or more elements to the end of an array and returns the new length?", "options": ["last()", "put()", "append()", "push()"], "correct": 3},
        {"id": 27, "question": "Which built-in method removes the last element from an array and returns that element?", "options": ["last()", "get()", "pop()", "none"], "correct": 2},
        {"id": 28, "question": "Which built-in method returns the calling string value converted to lower case?", "options": ["toLowerCase()", "toLower()", "changeCase(case)", "None"], "correct": 0},
        {"id": 29, "question": "What does DOM stand for?", "options": ["Document Object Model", "Data Object Model", "Document Oriented Model", "Data Oriented Model"], "correct": 0},
        {"id": 30, "question": "Which method is used to serialize an object into a JSON string?", "options": ["JSON.stringify()", "JSON.parse()", "JSON.toString()", "JSON.convert()"], "correct": 0},
        {"id": 31, "question": "Which method is used to parse a JSON string into a JavaScript object?", "options": ["JSON.toObject()", "JSON.parse()", "JSON.fromString()", "JSON.convert()"], "correct": 1},
        {"id": 32, "question": "What is a closure in JavaScript?", "options": ["A function that modifies the DOM", "A function with an empty body", "A combination of a function bundled together with references to its surrounding state", "A function to close a popup"], "correct": 2},
        {"id": 33, "question": "Which keyword is used to declare a constant variable?", "options": ["var", "let", "const", "constant"], "correct": 2},
        {"id": 34, "question": "What does the 'this' keyword refer to in JavaScript?", "options": ["The global object", "The previous object", "The current object", "The next object"], "correct": 2},
        {"id": 35, "question": "Which function is used to set a timer to execute a piece of code once?", "options": ["setInterval", "setTimeout", "setTimer", "wait"], "correct": 1},
        {"id": 36, "question": "Which function is used to execute a piece of code repeatedly?", "options": ["setInterval", "setTimeout", "setRepeater", "loop"], "correct": 0},
        {"id": 37, "question": "What is the result of '2' + 2 in JavaScript?", "options": ["4", "22", "undefined", "NaN"], "correct": 1},
        {"id": 38, "question": "What is the result of '2' - 2 in JavaScript?", "options": ["0", "22", "undefined", "NaN"], "correct": 0},
        {"id": 39, "question": "Which operator provides the remainder?", "options": ["%", "/", "//", "mod"], "correct": 0},
        {"id": 40, "question": "What is an Immediately Invoked Function Expression (IIFE)?", "options": ["A function that never runs", "A function that runs as soon as it is defined", "An expression that returns an integer", "A function with immediate access level"], "correct": 1},
        {"id": 41, "question": "Which of these is used to declare an asynchronous function?", "options": ["async", "defer", "await", "promise"], "correct": 0},
        {"id": 42, "question": "Which keyword halts the execution of an async function until a Promise resolves?", "options": ["async", "await", "wait", "yield"], "correct": 1},
        {"id": 43, "question": "What does a Promise object represent?", "options": ["A successful data retrieval", "An event handler", "The eventual completion or failure of an asynchronous operation", "Immediate code execution"], "correct": 2},
        {"id": 44, "question": "How do you export a module in ES6?", "options": ["module.exports", "export", "import", "package"], "correct": 1},
        {"id": 45, "question": "What is 'Hoisting' in JavaScript?", "options": ["Moving variables and functions to the top of their scope during compilation", "Calling functions multiple times", "Increasing the execution speed", "Securing variables from access"], "correct": 0},
        {"id": 46, "question": "What is the output of the following code?\nlet x = 5;\nconsole.log(x++ + ++x);", "options": ["11", "10", "12", "13"], "correct": 2},
        {"id": 47, "question": "What is the result of this code?\nconst arr = [1, 2, 3];\nconst res = arr.map(x => x * 2);\nconsole.log(res[1]);", "options": ["2", "4", "6", "undefined"], "correct": 1},
        {"id": 48, "question": "What will this output?\nconsole.log(typeof null === 'object');", "options": ["true", "false", "undefined", "TypeError"], "correct": 0},
        {"id": 49, "question": "What is the output of the following JS code?\nsetTimeout(() => console.log('A'), 0);\nconsole.log('B');", "options": ["A then B", "B then A", "A only", "B only"], "correct": 1},
        {"id": 50, "question": "What does this snippet return?\nfunction add(a, b) {\n  return a + b;\n}\nconsole.log(add(2, '2'));", "options": ["4", "'22'", "NaN", "Error"], "correct": 1},
    ]

    theoretical_questions = questions_pool[:45]
    practical_questions = questions_pool[45:50]
    
    selected_questions = random.sample(theoretical_questions, 15) + practical_questions
    random.shuffle(selected_questions)
    
    return Response({
        'success': True,
        'data': selected_questions
    })
