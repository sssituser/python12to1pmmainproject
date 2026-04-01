import random
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

@api_view(['GET'])
@permission_classes([AllowAny])
def playground_questions_css_api(request):
    questions_pool = [
        {"id": 1, "question": "What does CSS stand for?", "options": ["Cascading Style Sheets", "Colorful Style Sheets", "Computer Style Sheets", "Creative Style Sheets"], "correct": 0},
        {"id": 2, "question": "What is the correct HTML for referring to an external style sheet?", "options": ["<link rel=\"stylesheet\" type=\"text/css\" href=\"mystyle.css\">", "<stylesheet>mystyle.css</stylesheet>", "<style src=\"mystyle.css\">", "<img src=\"mystyle.css\">"], "correct": 0},
        {"id": 3, "question": "Where in an HTML document is the correct place to refer to an external style sheet?", "options": ["At the end of the document", "In the <body> section", "In the <head> section", "Before the <html> tag"], "correct": 2},
        {"id": 4, "question": "Which HTML tag is used to define an internal style sheet?", "options": ["<script>", "<style>", "<css>", "<link>"], "correct": 1},
        {"id": 5, "question": "Which HTML attribute is used to define inline styles?", "options": ["class", "style", "styles", "font"], "correct": 1},
        {"id": 6, "question": "Which is the correct CSS syntax?", "options": ["body:color=black;", "{body;color:black;}", "body {color: black;}", "{body:color=black;}"], "correct": 2},
        {"id": 7, "question": "How do you insert a comment in a CSS file?", "options": ["// this is a comment", "// this is a comment //", "' this is a comment", "/* this is a comment */"], "correct": 3},
        {"id": 8, "question": "Which property is used to change the background color?", "options": ["bgcolor", "color", "background-color", "bgColor"], "correct": 2},
        {"id": 9, "question": "How do you add a background color for all <h1> elements?", "options": ["all.h1 {background-color:#FFFFFF;}", "h1.all {background-color:#FFFFFF;}", "h1 {background-color:#FFFFFF;}", "h1 {bgcolor:#FFFFFF;}"], "correct": 2},
        {"id": 10, "question": "Which CSS property is used to change the text color of an element?", "options": ["text-color", "fgcolor", "color", "textColor"], "correct": 2},
        {"id": 11, "question": "Which CSS property controls the text size?", "options": ["font-size", "text-style", "text-size", "font-style"], "correct": 0},
        {"id": 12, "question": "What is the correct CSS syntax for making all the <p> elements bold?", "options": ["p {text-size:bold;}", "p {font-weight:bold;}", "p {font-style:bold;}", "p {text-weight:bold;}"], "correct": 1},
        {"id": 13, "question": "How do you display hyperlinks without an underline?", "options": ["a {text-decoration:none;}", "a {text-decoration:no-underline;}", "a {underline:none;}", "a {decoration:no-underline;}"], "correct": 0},
        {"id": 14, "question": "How do you make each word in a text start with a capital letter?", "options": ["text-transform:capitalize", "text-style:capitalize", "transform:capitalize", "text-capitalize:true"], "correct": 0},
        {"id": 15, "question": "Which property is used to change the font of an element?", "options": ["font-weight", "font-family", "font-style", "font"], "correct": 1},
        {"id": 16, "question": "How do you make the text bold?", "options": ["font:bold;", "style:bold;", "font-weight:bold;", "font-weight:bolder;"], "correct": 2},
        {"id": 17, "question": "Which property is used to change the left margin of an element?", "options": ["padding-left", "margin-left", "indent", "left-margin"], "correct": 1},
        {"id": 18, "question": "When using the padding property, are you allowed to use negative values?", "options": ["Yes", "No", "Sometimes", "Only in CSS3"], "correct": 1},
        {"id": 19, "question": "How do you select an element with id 'demo'?", "options": ["#demo", ".demo", "demo", "*demo"], "correct": 0},
        {"id": 20, "question": "How do you select elements with class name 'test'?", "options": ["test", "#test", ".test", "*test"], "correct": 2},
        {"id": 21, "question": "How do you select all p elements inside a div element?", "options": ["div.p", "div + p", "div p", "div > p"], "correct": 2},
        {"id": 22, "question": "How do you group selectors?", "options": ["Separate each selector with a plus sign", "Separate each selector with a space", "Separate each selector with a comma", "Separate each selector with a period"], "correct": 2},
        {"id": 23, "question": "What is the default value of the position property?", "options": ["relative", "fixed", "absolute", "static"], "correct": 3},
        {"id": 24, "question": "Which property is used to set the spacing between lines of text?", "options": ["letter-spacing", "line-height", "word-spacing", "text-spacing"], "correct": 1},
        {"id": 25, "question": "What CSS property controls the transparency of an element?", "options": ["clarity", "visibility", "opacity", "transparent"], "correct": 2},
        {"id": 26, "question": "How do you make a list that lists its items with squares?", "options": ["list-type: square;", "list-style-type: square;", "list: square;", "type: square;"], "correct": 1},
        {"id": 27, "question": "Which property allows you to hide an element, but still retain its space?", "options": ["display:none;", "visibility:hidden;", "opacity:0;", "hidden:true;"], "correct": 1},
        {"id": 28, "question": "Which property indicates that text should wrap depending on element constraints?", "options": ["word-wrap", "text-wrap", "white-space", "wrap-text"], "correct": 0},
        {"id": 29, "question": "What does a CSS declaration always end with?", "options": ["Colon", "Semi-colon", "Period", "Comma"], "correct": 1},
        {"id": 30, "question": "What does VH stand for in CSS?", "options": ["Visual Height", "View Height", "Viewport Height", "Vertical Header"], "correct": 2},
        {"id": 31, "question": "Can margins have negative values?", "options": ["No", "Yes", "Only top margin", "Only bottom margin"], "correct": 1},
        {"id": 32, "question": "The CSS box model consists of:", "options": ["Margins, Borders, Padding, and Content", "Margins, Width, Height, and Content", "Padding, Borders, Outlines, Content", "Backgrounds, Borders, Text, Images"], "correct": 0},
        {"id": 33, "question": "Which property specifies the right margin of an element?", "options": ["margin-right", "padding-right", "right-margin", "right"], "correct": 0},
        {"id": 34, "question": "How do you center block elements horizontally?", "options": ["text-align: center;", "margin: auto;", "padding: center;", "float: center;"], "correct": 1},
        {"id": 35, "question": "A CSS selector defines...", "options": ["Where the style is applied", "What the style is", "How the style behaves", "When the style is applied"], "correct": 0},
        {"id": 36, "question": "Which property changes the color of the border?", "options": ["border-style", "border-color", "border-width", "color"], "correct": 1},
        {"id": 37, "question": "Which CSS property specifies the radius used to round the corners of an element's border?", "options": ["border-radius", "curve-border", "round-corner", "border-curve"], "correct": 0},
        {"id": 38, "question": "Which property is used to align text?", "options": ["align", "text-align", "text-justify", "justify"], "correct": 1},
        {"id": 39, "question": "What is the equivalent of 'font-weight: 700'?", "options": ["bold", "normal", "bolder", "lighter"], "correct": 0},
        {"id": 40, "question": "Which CSS value is used to render an element just like its inline default but with block properties?", "options": ["block", "inline-block", "inline", "flex"], "correct": 1},
        {"id": 41, "question": "Z-index works only on:", "options": ["Statically positioned elements", "Flex elements", "Positioned elements", "Grid elements"], "correct": 2},
        {"id": 42, "question": "Which value of display property removes the element entirely from the document flow?", "options": ["hidden", "none", "invisible", "collapse"], "correct": 1},
        {"id": 43, "question": "Which property specifies the stacking order of elements?", "options": ["z-index", "stack", "order", "index"], "correct": 0},
        {"id": 44, "question": "Flexbox is mainly intended for:", "options": ["2D layouts", "1D layouts", "3D layouts", "Tables"], "correct": 1},
        {"id": 45, "question": "Which CSS property specifies how elements should float?", "options": ["position", "align", "float", "drift"], "correct": 2},
        {"id": 46, "question": "To clear a float, which CSS property is used?", "options": ["stop-float", "clear", "cancel", "reset"], "correct": 1},
        {"id": 47, "question": "Which pseudo-class is used to define a special state of an element when hovered?", "options": [":hover", ":active", "::hover", "::active"], "correct": 0},
        {"id": 48, "question": "Which CSS property specifies the type of cursor to be displayed?", "options": ["pointer", "cursor", "mouse", "click"], "correct": 1},
        {"id": 49, "question": "What does RGB stand for in color?", "options": ["Red, Green, Blue", "Red, Gray, Blue", "Real Good Blue", "Red, Green, Black"], "correct": 0},
        {"id": 50, "question": "In a CSS grid layout, what specifies the size of columns?", "options": ["grid-columns", "grid-template-columns", "columns", "template-columns"], "correct": 1},
    ]

    selected_questions = random.sample(questions_pool, 20)
    
    return Response({
        'success': True,
        'data': selected_questions
    })
