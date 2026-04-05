import random
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

@api_view(['GET'])
@permission_classes([AllowAny])
def playground_questions_ui_api(request):
    """
    General UI/UX and Frontend Design Assessment Questions.
    """
    questions_pool = [
        {"id": 1, "question": "What does UI stand for?", "options": ["User Interface", "User Integration", "Universal Interface", "User Interaction"], "correct": 0},
        {"id": 2, "question": "Which of these is a core principle of UX design?", "options": ["Complexity", "Usability", "Opacity", "Rigidity"], "correct": 1},
        {"id": 3, "question": "What is 'White Space' in UI design?", "options": ["Empty space between elements", "White background only", "Space for text only", "Error space"], "correct": 0},
        {"id": 4, "question": "What does 'Responsive Design' mean?", "options": ["Fast loading", "Layout adapts to different screen sizes", "Design with many buttons", "Design that responds to clicks"], "correct": 1},
        {"id": 5, "question": "What is a 'Wireframe'?", "options": ["A high-fidelity mockup", "A low-fidelity structural sketch of a page", "A type of code", "A CSS framework"], "correct": 1},
        {"id": 6, "question": "Which color is often used to signify 'Success' or 'Go'?", "options": ["Red", "Green", "Blue", "Yellow"], "correct": 1},
        {"id": 7, "question": "What is 'Typography'?", "options": ["The art of arranging type (fonts)", "A type of map", "A printing process", "Writing code"], "correct": 0},
        {"id": 8, "question": "What does 'Affordance' mean in UI?", "options": ["Cost of design", "The visual clue to an element's function", "Speed of interface", "Size of screen"], "correct": 1},
        {"id": 9, "question": "What is a 'Call to Action' (CTA)?", "options": ["A phone call", "A button or link that encourages a specific user action", "A design meeting", "A CSS class"], "correct": 1},
        {"id": 10, "question": "What is 'Accessibility' in UI design?", "options": ["Fast internet access", "Making designs usable by people with disabilities", "Price of the app", "Login speed"], "correct": 1},
        {"id": 11, "question": "What is a 'Grid System' used for?", "options": ["Drawing lines", "Consistent layout and alignment of elements", "Database storage", "Networking"], "correct": 1},
        {"id": 12, "question": "What is 'F-Pattern' in web design?", "options": ["A letter F", "The common way users scan content visually", "A type of error", "A coding pattern"], "correct": 1},
        {"id": 13, "question": "What is 'Visual Hierarchy'?", "options": ["A list of colors", "Arranging elements to show their importance", "A server structure", "A type of font"], "correct": 1},
        {"id": 14, "question": "What does 'RGB' stand for?", "options": ["Red Green Blue", "Red Gray Brown", "Real Great Blue", "Right Green Base"], "correct": 0},
        {"id": 15, "question": "What is 'Hex Code' in colors?", "options": ["A 6-digit code for errors", "A 6-digit code representing a color (e.g. #FFFFFF)", "A type of encrypted text", "None"], "correct": 1},
        {"id": 16, "question": "What is 'Dark Mode'?", "options": ["An error state", "A color scheme that uses light text on a dark background", "A hidden feature", "A design failure"], "correct": 1},
        {"id": 17, "question": "What is 'Contrast Ratio'?", "options": ["Comparison of image sizes", "The difference in luminance between text and background", "A type of font weight", "Design speed"], "correct": 1},
        {"id": 18, "question": "Which of these is a popular UI design tool?", "options": ["Figma", "Excel", "Notepad", "Calculator"], "correct": 0},
        {"id": 19, "question": "What is 'Micro-interaction'?", "options": ["A large animation", "Subtle functional animations that provide feedback", "A small database", "A short code snippet"], "correct": 1},
        {"id": 20, "question": "What is 'User Journey'?", "options": ["Going to the office", "The path a user takes to complete a task in an app", "A physical trip", "A design sprint"], "correct": 1},
        # Adding more to reach 50...
        {"id": 21, "question": "What is 'Sans-serif'?", "options": ["Fonts with decorative lines at ends", "Fonts without decorative lines at ends", "A type of code", "A color palette"], "correct": 1},
        {"id": 22, "question": "What is 'Kerning'?", "options": ["Spacing between lines", "Spacing between individual characters", "Drawing shapes", "Size of text"], "correct": 1},
        {"id": 23, "question": "What is 'Leading' in typography?", "options": ["Spacing between lines of text", "The first word", "A bold font", "A CSS property"], "correct": 0},
        {"id": 24, "question": "What is 'Flat Design'?", "options": ["Design with no colors", "Minimalist design with no 3D effects/shadows", "A boring design", "A simple sketch"], "correct": 1},
        {"id": 25, "question": "What is 'Skeuomorphism'?", "options": ["Simplified design", "Design that mimics real-world objects and textures", "Modern design", "A type of error"], "correct": 1},
        {"id": 26, "question": "What is 'Card UI'?", "options": ["Using playing cards", "Organizing content into rectangular containers", "A small screen", "A type of menu"], "correct": 1},
        {"id": 27, "question": "What is 'Hamburger Menu'?", "options": ["A food icon", "The three-line icon for toggling a sidebar menu", "A circular menu", "None"], "correct": 1},
        {"id": 28, "question": "What is 'Breadcrumb' navigation?", "options": ["Eating bread", "Showing the user's location in a site hierarchy", "A map of the city", "A list of links"], "correct": 1},
        {"id": 29, "question": "What is 'Modal' (or Popup)?", "options": ["A new web page", "An overlay window that requires interaction before returning to the main page", "A footer", "A sidebar"], "correct": 1},
        {"id": 30, "question": "What is 'Skeleton Screen'?", "options": ["A screen with bones", "A placeholder screen shown while content is loading", "A design template", "An error page"], "correct": 1},
        {"id": 31, "question": "What is 'Color Theory'?", "options": ["A study of painting", "The study of how colors interact and their psychological impacts", "A list of RGB codes", "None"], "correct": 1},
        {"id": 32, "question": "What is 'Primary Color'?", "options": ["The most expensive color", "The dominant color in a design's brand identity", "Black and white", "None"], "correct": 1},
        {"id": 33, "question": "What is 'Shadow' (Elevation) used for?", "options": ["Cool effects only", "Providing depth and indicating layered elements", "Hiding content", "None"], "correct": 1},
        {"id": 34, "question": "What is 'User Feedback' in UI?", "options": ["Users complaining", "Visual or auditory response to user actions (e.g. success message)", "A ratings page", "None"], "correct": 1},
        {"id": 35, "question": "What is 'A/B Testing'?", "options": ["Testing from A to B", "Comparing two versions of a design to see which performs better", "Testing for bugs", "None"], "correct": 1},
        {"id": 36, "question": "What is 'Heuristic Evaluation'?", "options": ["Counting buttons", "Expert review based on usability principles", "A user survey", "None"], "correct": 1},
        {"id": 37, "question": "What is 'Information Architecture' (IA)?", "options": ["Designing buildings", "Organizing and structuring content for navigation and clarity", "A database schema", "None"], "correct": 1},
        {"id": 38, "question": "What is 'SVG' primarily used for?", "options": ["Video", "Scalable vector graphics (icons, illustrations)", "Audio", "Database"], "correct": 1},
        {"id": 39, "question": "What is 'Persona' in UX?", "options": ["A real person", "A fictional character representing a user type", "A design lead", "None"], "correct": 1},
        {"id": 40, "question": "What is 'Empathy' in design?", "options": ["Being sad", "Understanding the user's needs, frustrations, and goals", "A types of font", "None"], "correct": 1},
        {"id": 41, "question": "What is 'Low Fidelity' mockup?", "options": ["Low quality image", "Quick, rough design for rapid iteration", "The final version", "None"], "correct": 1},
        {"id": 42, "question": "What is 'High Fidelity' mockup?", "options": ["Detailed design that looks like the final product", "A sketch", "A wireframe", "None"], "correct": 0},
        {"id": 43, "question": "What is 'Prototype' level?", "options": ["A sketch", "An interactive simulation of the final design", "A code snippet", "None"], "correct": 1},
        {"id": 44, "question": "What is 'Steppers' UI component?", "options": ["A stairs icon", "Control for inputting numbers or moving through steps", "A scrollbar", "None"], "correct": 1},
        {"id": 45, "question": "What is 'Pagination'?", "options": ["Writing a page", "Dividing content into discrete pages (e.g. 1, 2, 3...)", "A list scroll", "None"], "correct": 1},
        {"id": 46, "question": "What is 'Input Validation'?", "options": ["Counting words", "Checking that user input meets required format/constraints", "A search engine", "None"], "correct": 1},
        {"id": 47, "question": "What is 'Tooltip'?", "options": ["A tool for design", "Contextual help message shown when hovering over an element", "A footer link", "None"], "correct": 1},
        {"id": 48, "question": "What is 'Accordion' menu?", "options": ["A musical instrument", "A vertically stacked list of headers that expand to reveal content", "A horizontal menu", "None"], "correct": 1},
        {"id": 49, "question": "What is 'Empty State'?", "options": ["An error page", "Design shown when there is no content/data yet", "A blank screen", "None"], "correct": 1},
        {"id": 50, "question": "Why is 'Visual Consistency' important?", "options": ["It looks pretty", "It builds trust and reduces the learning curve for users", "It saves CSS space", "None"], "correct": 1},
    ]
    return Response({'success': True, 'data': random.sample(questions_pool, min(len(questions_pool), 30))})
