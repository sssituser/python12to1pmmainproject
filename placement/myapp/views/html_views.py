import random
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

@api_view(['GET'])
@permission_classes([AllowAny])
def playground_questions_html_api(request):
    questions_pool = [
        {"id": 1, "question": "What does HTML stand for?", "options": ["Hyper Text Markup Language", "Home Tool Markup Language", "Hyperlinks and Text Markup Language", "Hyper Tool Markup Language"], "correct": 0},
        {"id": 2, "question": "Who is making the Web standards?", "options": ["Mozilla", "Microsoft", "The World Wide Web Consortium", "Google"], "correct": 2},
        {"id": 3, "question": "Choose the correct HTML element for the largest heading:", "options": ["<heading>", "<h1>", "<h6>", "<head>"], "correct": 1},
        {"id": 4, "question": "What is the correct HTML element for inserting a line break?", "options": ["<break>", "<lb>", "<br>", "<newline>"], "correct": 2},
        {"id": 5, "question": "What is the correct HTML for adding a background color?", "options": ["<body bg=\"yellow\">", "<background>yellow</background>", "<body style=\"background-color:yellow;\">", "<body bgcolor=\"yellow\">"], "correct": 2},
        {"id": 6, "question": "Choose the correct HTML element to define important text", "options": ["<strong>", "<b>", "<important>", "<i>"], "correct": 0},
        {"id": 7, "question": "Choose the correct HTML element to define emphasized text", "options": ["<italic>", "<i>", "<em>", "<strong>"], "correct": 2},
        {"id": 8, "question": "What is the correct HTML for creating a hyperlink?", "options": ["<a>http://www.w3schools.com</a>", "<a url=\"http://www.w3schools.com\">W3Schools.com</a>", "<a name=\"http://www.w3schools.com\">W3Schools.com</a>", "<a href=\"http://www.w3schools.com\">W3Schools</a>"], "correct": 3},
        {"id": 9, "question": "Which character is used to indicate an end tag?", "options": ["*", "^", "<", "/"], "correct": 3},
        {"id": 10, "question": "How can you open a link in a new tab/browser window?", "options": ["<a href=\"url\" target=\"new\">", "<a href=\"url\" target=\"_blank\">", "<a href=\"url\" new>", "<a href=\"url\" target=\"_window\">"], "correct": 1},
        {"id": 11, "question": "Which of these elements are all <table> elements?", "options": ["<table><tr><td>", "<table><head><tfoot>", "<thead><body><tr>", "<table><tr><tt>"], "correct": 0},
        {"id": 12, "question": "Inline elements are normally displayed without starting a new line.", "options": ["True", "False", "None", "Both"], "correct": 0},
        {"id": 13, "question": "How can you make a numbered list?", "options": ["<ul>", "<dl>", "<ol>", "<list>"], "correct": 2},
        {"id": 14, "question": "How can you make a bulleted list?", "options": ["<ol>", "<dl>", "<ul>", "<list>"], "correct": 2},
        {"id": 15, "question": "What is the correct HTML for making a checkbox?", "options": ["<checkbox>", "<input type=\"check\">", "<check>", "<input type=\"checkbox\">"], "correct": 3},
        {"id": 16, "question": "What is the correct HTML for making a text input field?", "options": ["<input type=\"textfield\">", "<textfield>", "<input type=\"text\">", "<textinput>"], "correct": 2},
        {"id": 17, "question": "What is the correct HTML for making a drop-down list?", "options": ["<input type=\"dropdown\">", "<select>", "<list>", "<input type=\"list\">"], "correct": 1},
        {"id": 18, "question": "What is the correct HTML for making a text area?", "options": ["<input type=\"textbox\">", "<textarea>", "<input type=\"textarea\">", "<text>"], "correct": 1},
        {"id": 19, "question": "What is the correct HTML for inserting an image?", "options": ["<img href=\"image.gif\" alt=\"MyImage\">", "<img src=\"image.gif\" alt=\"MyImage\">", "<image src=\"image.gif\" alt=\"MyImage\">", "<img alt=\"MyImage\">image.gif</img>"], "correct": 1},
        {"id": 20, "question": "What is the correct HTML for inserting a background image?", "options": ["<body background=\"bgimage.gif\">", "<background img=\"bgimage.gif\">", "<body style=\"background-image:url(bgimage.gif)\">", "<img src=\"bgimage.gif\" background>"], "correct": 2},
        {"id": 21, "question": "An <iframe> is used to display a web page within a web page.", "options": ["True", "False", "Sometimes", "With plugins"], "correct": 0},
        {"id": 22, "question": "HTML comments start with <!-- and end with -->", "options": ["True", "False", "Sometimes", "None"], "correct": 0},
        {"id": 23, "question": "Block elements are normally displayed without starting a new line.", "options": ["True", "False", "Sometimes", "Never"], "correct": 1},
        {"id": 24, "question": "Which HTML element defines the title of a document?", "options": ["<meta>", "<head>", "<title>", "<header>"], "correct": 2},
        {"id": 25, "question": "Which HTML attribute specifies an alternate text for an image, if the image cannot be displayed?", "options": ["alt", "title", "src", "longdesc"], "correct": 0},
        {"id": 26, "question": "Which doctype is correct for HTML5?", "options": ["<!DOCTYPE HTML PUBLIC \"-//W3C//DTD HTML 5.0//EN\" \"http://www.w3.org/TR/html5/strict.dtd\">", "<!DOCTYPE html>", "<!DOCTYPE HTML5>", "<!DOCTYPE>"], "correct": 1},
        {"id": 27, "question": "Which HTML element is used to specify a footer for a document or section?", "options": ["<bottom>", "<footer>", "<section>", "<nav>"], "correct": 1},
        {"id": 28, "question": "In HTML, you can embed SVG elements directly into an HTML page.", "options": ["True", "False", "Only with plugins", "None"], "correct": 0},
        {"id": 29, "question": "What is the correct HTML element for playing video files?", "options": ["<media>", "<movie>", "<video>", "<play>"], "correct": 2},
        {"id": 30, "question": "What is the correct HTML element for playing audio files?", "options": ["<sound>", "<mp3>", "<audio>", "<voice>"], "correct": 2},
        {"id": 31, "question": "The HTML global attribute, \"contenteditable\" is used to:", "options": ["Update content from the server", "Specify whether the content of an element should be editable or not", "Return the spelling of text", "Format content"], "correct": 1},
        {"id": 32, "question": "In HTML, onblur and onfocus are:", "options": ["Style attributes", "HTML elements", "Event attributes", "None of the above"], "correct": 2},
        {"id": 33, "question": "Graphics defined by SVG is in which format?", "options": ["HTML", "XML", "CSS", "JSON"], "correct": 1},
        {"id": 34, "question": "The HTML <canvas> element is used to:", "options": ["Draw graphics", "Manipulate data in MySQL", "Format text", "Create tables"], "correct": 0},
        {"id": 35, "question": "In HTML, which attribute is used to specify that an input field must be filled out?", "options": ["required", "placeholder", "validate", "formvalidate"], "correct": 0},
        {"id": 36, "question": "Which input type defines a slider control?", "options": ["slider", "range", "controls", "search"], "correct": 1},
        {"id": 37, "question": "Which HTML element is used to display a scalar measurement within a range?", "options": ["<gauge>", "<meter>", "<measure>", "<range>"], "correct": 1},
        {"id": 38, "question": "Which HTML element defines navigation links?", "options": ["<navigate>", "<nav>", "<navigation>", "<ul>"], "correct": 1},
        {"id": 39, "question": "In HTML, what does the <aside> element define?", "options": ["Content aside from the page content", "A navigation list to be shown at the left side of the page", "The ASCII character-set", "A background element"], "correct": 0},
        {"id": 40, "question": "Which HTML element is used to specify a header for a document or section?", "options": ["<top>", "<header>", "<head>", "<section>"], "correct": 1},
        {"id": 41, "question": "The <fieldset> element is used to group related elements in a form.", "options": ["True", "False", "Sometimes", "Never"], "correct": 0},
        {"id": 42, "question": "Which of these is not an HTML5 input type?", "options": ["color", "email", "datetime", "paragraph"], "correct": 3},
        {"id": 43, "question": "Which attribute specifies a hint that describes the expected value of an input field?", "options": ["value", "placeholder", "title", "hint"], "correct": 1},
        {"id": 44, "question": "The <datalist> element specifies a list of pre-defined options for an input element.", "options": ["True", "False", "For forms only", "None"], "correct": 0},
        {"id": 45, "question": "In HTML5, which tag is used to specify a grouping of introductory or navigational aids?", "options": ["<nav>", "<header>", "<footer>", "<group>"], "correct": 1},
        {"id": 46, "question": "What does the <caption> tag define in an HTML table?", "options": ["Table title", "Table body", "Table footer", "Table heading"], "correct": 0},
        {"id": 47, "question": "What is the correct syntax for a mailto link?", "options": ["<a href=\"email:me@example.com\">", "<mail>me@example.com</mail>", "<a href=\"mailto:me@example.com\">", "<a mail=\"me@example.com\">"], "correct": 2},
        {"id": 48, "question": "Which element defines an image map?", "options": ["<map>", "<imagemap>", "<areamap>", "<canvas>"], "correct": 0},
        {"id": 49, "question": "Which attribute provides additional information about an element?", "options": ["class", "id", "title", "style"], "correct": 2},
        {"id": 50, "question": "HTML files must be saved with what extension?", "options": [".ht", ".html", ".web", ".page"], "correct": 1},
    ]

    selected_questions = random.sample(questions_pool, 20)
    
    return Response({
        'success': True,
        'data': selected_questions
    })
