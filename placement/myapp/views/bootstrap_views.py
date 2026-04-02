import random
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

@api_view(['GET'])
@permission_classes([AllowAny])
def playground_questions_bootstrap_api(request):
    questions_pool = [
        {"id": 1, "question": "What is Bootstrap?", "options": ["A CSS framework", "A programming language", "A database system", "An operating system"], "correct": 0},
        {"id": 2, "question": "Who developed Bootstrap?", "options": ["Mark Zuckerberg", "Bill Gates", "Mark Otto and Jacob Thornton", "Linus Torvalds"], "correct": 2},
        {"id": 3, "question": "Which of the following classes is used to create a container with a fixed width in Bootstrap?", "options": [".container", ".container-fluid", ".container-fixed", ".fluid-container"], "correct": 0},
        {"id": 4, "question": "Which of the following classes is used to create a container spanning the entire width of the viewport?", "options": [".container", ".container-fluid", ".container-full", ".container-width"], "correct": 1},
        {"id": 5, "question": "How many columns does the Bootstrap grid system contain by default?", "options": ["10", "12", "14", "16"], "correct": 1},
        {"id": 6, "question": "Which class is used to create a flexible layout that adjusts automatically to different screen sizes?", "options": ["flex-container", "d-flex", "layout-flex", "flexible"], "correct": 1},
        {"id": 7, "question": "Which Bootstrap class is used to make an image responsive?", "options": [".img-responsive", ".img-fluid", ".responsive-img", ".pic-responsive"], "correct": 1},
        {"id": 8, "question": "Which class is used to create a button in Bootstrap?", "options": [".button", ".btn", ".bg-button", ".bt"], "correct": 1},
        {"id": 9, "question": "Which Bootstrap class indicates a successful or positive action?", "options": [".btn-success", ".btn-primary", ".btn-info", ".btn-positive"], "correct": 0},
        {"id": 10, "question": "Which Bootstrap class indicates a dangerous or potentially negative action?", "options": [".btn-warning", ".btn-danger", ".btn-error", ".btn-bad"], "correct": 1},
        {"id": 11, "question": "Which class provides a warning context in Bootstrap?", "options": [".text-hazard", ".alert-caution", ".bg-warning", ".warning-alert"], "correct": 2},
        {"id": 12, "question": "What class adds an alert box?", "options": [".alert-box", ".warning", ".alert", ".message"], "correct": 2},
        {"id": 13, "question": "Which class is used to create a navigation bar?", "options": [".navbar", ".nav-menu", ".navigation", ".menu-bar"], "correct": 0},
        {"id": 14, "question": "Which class is used to position the navbar at the top of the viewport continuously?", "options": [".navbar-static-top", ".navbar-fixed-top", ".navbar-top", ".sticky-top"], "correct": 3},
        {"id": 15, "question": "How to create a dark navigation bar in Bootstrap?", "options": [".navbar-dark .bg-dark", ".navbar-inverse", ".dark-nav", ".bg-black"], "correct": 0},
        {"id": 16, "question": "What does the `.row` class do?", "options": ["Creates a visible horizontal line", "Displays items in a single line", "Creates a horizontal group of columns", "Pushes elements away"], "correct": 2},
        {"id": 17, "question": "Which class is used to hide an element on all screen sizes?", "options": [".hidden", ".d-none", ".invisible", ".hide"], "correct": 1},
        {"id": 18, "question": "To display an element only on medium screens and up, you would use:", "options": [".d-md-block", ".show-md", ".visible-md", ".md-display"], "correct": 0},
        {"id": 19, "question": "Which class creates a bordered table?", "options": [".table-border", ".table-bordered", ".bordered-table", ".border"], "correct": 1},
        {"id": 20, "question": "Which class adds zebra-stripes to a table?", "options": [".table-striped", ".table-zebra", ".striped-table", ".table-alt"], "correct": 0},
        {"id": 21, "question": "What is the form control class for input fields in Bootstrap?", "options": [".form-group", ".form-input", ".form-control", ".input-control"], "correct": 2},
        {"id": 22, "question": "Which class is used to put inputs side-by-side in one line?", "options": [".form-inline", ".inline-form", ".form-horizontal", ".form-row"], "correct": 0},
        {"id": 23, "question": "What is the purpose of the `.jumbotron` class?", "options": ["To create an animated banner", "To highlight key content or information", "To add large margins", "To hide content"], "correct": 1},
        {"id": 24, "question": "Which of these classes shapes an image into a circle?", "options": [".img-circle", ".rounded-circle", ".circle", ".img-round"], "correct": 1},
        {"id": 25, "question": "How do you align text to the center in Bootstrap?", "options": [".center-text", ".text-center", ".align-center", ".text-middle"], "correct": 1},
        {"id": 26, "question": "Which class centers an image horizontally?", "options": [".mx-auto d-block", ".center-block", ".img-center", ".align-center"], "correct": 0},
        {"id": 27, "question": "Which class provides extra visual weight and identifies the primary action?", "options": [".btn-primary", ".btn-main", ".btn-first", ".btn-action"], "correct": 0},
        {"id": 28, "question": "What component is used to cycle through elements, like a slideshow?", "options": [".slideshow", ".carousel", ".slider", ".cycler"], "correct": 1},
        {"id": 29, "question": "Which class is used to create a modal dialog?", "options": [".dialog", ".modal", ".popup", ".window"], "correct": 1},
        {"id": 30, "question": "How to make a button appear as a block level element (spanning full width)?", "options": [".btn-block", ".block-btn", ".full-width", ".d-block"], "correct": 3},
        {"id": 31, "question": "Which utility class adds margin to the top of an element?", "options": [".mt-*", ".margin-top-*", ".m-t-*", ".top-margin-*"], "correct": 0},
        {"id": 32, "question": "Which utility class adds padding to the left and right of an element?", "options": [".px-*", ".py-*", ".pl-*", ".pr-*"], "correct": 0},
        {"id": 33, "question": "What class can be used to add a shadow to an element?", "options": [".box-shadow", ".shadow", ".drop-shadow", ".element-shadow"], "correct": 1},
        {"id": 34, "question": "Which class gives a table hoverable rows?", "options": [".table-hover", ".hover-table", ".table-active", ".active-row"], "correct": 0},
        {"id": 35, "question": "Which class is used to collapse a navigation bar?", "options": [".navbar-collapse", ".collapse", ".nav-collapse", ".menu-collapse"], "correct": 0},
        {"id": 36, "question": "Which class creates a dropdown menu?", "options": [".dropdown", ".select", ".menu", ".nav-drop"], "correct": 0},
        {"id": 37, "question": "Which of the following grid classes applies to small devices like tablets?", "options": [".col-sm-*", ".col-md-*", ".col-lg-*", ".col-*"], "correct": 0},
        {"id": 38, "question": "Which grid class applies to extra large devices?", "options": [".col-xl-*", ".col-lg-*", ".col-md-*", ".col-xxl-*"], "correct": 0},
        {"id": 39, "question": "Which of the following classes is meant to be used for pagination?", "options": [".pages", ".pagination", ".nav-pages", ".page-list"], "correct": 1},
        {"id": 40, "question": "Which class indicates the active page in pagination?", "options": [".current", ".selected", ".active", ".focus"], "correct": 2},
        {"id": 41, "question": "Which component indicates the current page's location within a navigational hierarchy?", "options": [".breadcrumb", ".nav-history", ".path", ".location"], "correct": 0},
        {"id": 42, "question": "Which class creates a badge to highlight new or unread items?", "options": [".tag", ".badge", ".label", ".mark"], "correct": 1},
        {"id": 43, "question": "Which class creates a standard card container?", "options": [".card", ".panel", ".box", ".container-card"], "correct": 0},
        {"id": 44, "question": "Which class specifies the main content region of a card component?", "options": [".card-content", ".card-body", ".card-main", ".card-text"], "correct": 1},
        {"id": 45, "question": "To add a line-through a text, which Bootstrap class is used?", "options": [".text-crossed", ".text-through", ".text-decoration-line-through", ".deleted"], "correct": 2},
        {"id": 46, "question": "Which class converts any text into a lowercase format?", "options": [".text-lowercase", ".lower", ".text-small", ".format-lower"], "correct": 0},
        {"id": 47, "question": "What defines a tooltip in Bootstrap?", "options": ["data-bs-toggle=\"hover\"", "data-bs-toggle=\"tooltip\"", "data-tooltip=\"true\"", "title-tooltip=\"text\""], "correct": 1},
        {"id": 48, "question": "Which class helps you embed a responsive video?", "options": [".embed-responsive", ".video-fluid", ".ratio", ".responsive-video"], "correct": 2},
        {"id": 49, "question": "What defines an offcanvas sidebar in modern Bootstrap?", "options": [".sidebar", ".drawer", ".offcanvas", ".side-menu"], "correct": 2},
        {"id": 50, "question": "To center flex items along the main axis, use:", "options": [".align-items-center", ".justify-content-center", ".flex-center", ".align-center"], "correct": 1},
    ]

    selected_questions = random.sample(questions_pool, 20)
    
    return Response({
        'success': True,
        'data': selected_questions
    })
