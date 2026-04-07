import random

from rest_framework.decorators import api_view, permission_classes

from rest_framework.permissions import AllowAny

from rest_framework.response import Response



@api_view(['GET'])

@permission_classes([AllowAny])

def playground_questions_expressjs_api(request):

    questions_pool = [

        {"id": 1, "question": "What is Express.js?", "options": ["A JavaScript library", "A fast, minimalist web framework for Node.js", "A database for Node.js", "A front-end framework"], "correct": 1},

        {"id": 2, "question": "Which of these is used to define routes in Express?", "options": ["app.listen()", "app.get()", "app.set()", "app.use()"], "correct": 1},

        {"id": 3, "question": "What is 'app.use()' used for in Express?", "options": ["Initializing the app", "Middleware injection", "Starting the server", "Exporting routes"], "correct": 1},

        {"id": 4, "question": "Which object represents the incoming information from the client in Express?", "options": ["res", "req", "next", "app"], "correct": 1},

        {"id": 5, "question": "Which method is used to send a JSON response to the client?", "options": ["res.send()", "res.json()", "res.write()", "res.end()"], "correct": 1},

        {"id": 6, "question": "What is a 'middleware' in Express?", "options": ["A function that executes between the request and response objects", "A front-end library", "An alternative to JSON", "A database engine"], "correct": 0},

        {"id": 7, "question": "Which command is used to install Express into a project?", "options": ["npm init express", "npm install express", "install express -g", "node install express"], "correct": 1},

        {"id": 8, "question": "How can you access URL parameters like '/users/:id' in Express?", "options": ["req.query", "req.params", "req.body", "req.url"], "correct": 1},

        {"id": 9, "question": "Which of the following is NOT an HTTP method used in Express routing?", "options": ["get", "post", "put", "fetch"], "correct": 3},

        {"id": 10, "question": "What does 'next()' do in a middleware function?", "options": ["Stops the execution", "Iterates to the next middleware in the stack", "Redirects to home", "Sends the response"], "correct": 1},

        {"id": 11, "question": "Which method on the response object is used to set the HTTP status code?", "options": ["res.set()", "res.status()", "res.code()", "res.statusCode()"], "correct": 1},

        {"id": 12, "question": "Which middleware is built-in to Express to serve static files?", "options": ["express.static()", "express.files()", "express.serve()", "express.folder()"], "correct": 0},

        {"id": 13, "question": "How do you start an Express server on port 3000?", "options": ["app.listen(3000)", "app.start(3000)", "server.run(3000)", "express.listen(3000)"], "correct": 0},

        {"id": 14, "question": "Which object is used to capture data sent in an HTTP POST request?", "options": ["req.params", "req.query", "req.body", "req.data"], "correct": 2},

        {"id": 15, "question": "Which library is commonly used as middleware to parse 'req.body' for JSON?", "options": ["express.json()", "body-parser", "Both A and B", "Neither"], "correct": 2},

        {"id": 16, "question": "What is the role of an Express Router?", "options": ["To connect to a database", "To modularize routes for different parts of an application", "To serve as a search engine", "To provide UI routing"], "correct": 1},

        {"id": 17, "question": "Which method redirects a client to a different URL?", "options": ["res.redirect()", "res.move()", "res.forward()", "res.to()"], "correct": 0},

        {"id": 18, "question": "How do you specify a catch-all route for 404 errors?", "options": ["app.get('*', callback)", "app.use(callback) at the end of the stack", "app.error(callback)", "None of the above"], "correct": 1},

        {"id": 19, "question": "Which Express template engine is commonly used?", "options": ["Pug (formerly Jade)", "EJS", "Handlebars", "All of the above"], "correct": 3},

        {"id": 20, "question": "How can you chain multiple route handlers for a single route?", "options": ["By separating them with commas in app.get()", "By using next() to move to the next handler", "Both A and B", "You cannot chain handlers"], "correct": 2},

        {"id": 21, "question": "Which variable is used to determine the environment in an Express app?", "options": ["NODE_ENV", "MODE", "STAGING", "ENV"], "correct": 0},

        {"id": 22, "question": "What will 'res.sendFile(path)' do?", "options": ["Downloads the file to the client", "Sends a file to the client for rendering", "Sends the file metadata", "Deletes the file"], "correct": 1},

        {"id": 23, "question": "Which middleware is recommended for logging in Express?", "options": ["log4js", "morgan", "Winston", "Both B and C"], "correct": 3},

        {"id": 24, "question": "How do you handle errors centrally in Express?", "options": ["By defining a middleware with 4 arguments (err, req, res, next)", "Using try-catch blocks everywhere", "Using domain module", "Errors are automatically caught"], "correct": 0},

        {"id": 25, "question": "Which method is used to remove a route in Express?", "options": ["app.remove()", "app.delete() (this is for HTTP DELETE)", "Express does not support dynamic route removal easily", "app.unget()"], "correct": 2},

        {"id": 26, "question": "Which of these is a valid way to define a GET route for '/abc' or '/acd'?", "options": ["app.get('/ab?cd')", "app.get('/a(bc|cd)')", "Both A and B (Regular expressions/string patterns)", "Neither"], "correct": 2},

        {"id": 27, "question": "What is 'req.xhr' property used for?", "options": ["Check if request is an AJAX/XMLHttpRequest", "Check if request is over HTTPS", "Check if it is a GET request", "None of the above"], "correct": 0},

        {"id": 28, "question": "How can you set a cookie in Express?", "options": ["res.cookie('name', 'value')", "req.cookie('name', 'value')", "app.setCookie('name')", "cookies.set('name')"], "correct": 0},

        {"id": 29, "question": "What does Express stand for?", "options": ["Extensible Protocol and Route System", "Nothing - it's just a name", "Extra Programming and Routing Express", "None of the above"], "correct": 1},

        {"id": 30, "question": "Which of these is NOT a core feature of Express?", "options": ["Routing", "Middleware", "Database engine", "Template rendering"], "correct": 2},

        {"id": 31, "question": "What is the purpose of 'res.end()'?", "options": ["Ends the response process specifically without sending data", "Closes the whole app", "Neither", "Both"], "correct": 0},

        {"id": 32, "question": "What's the meaning of 'application/json' content type?", "options": ["Tells specifically that the body of the request is encoded as JSON", "A types of file extension", "Neither", "Both"], "correct": 0},

        {"id": 33, "question": "How do you serve a directory of images in Express?", "options": ["Using express.static('images_folder_name')", "Using express.files()", "Neither", "Both"], "correct": 0},

        {"id": 34, "question": "Which command-line argument sets the port in many scripts?", "options": ["--port", "-p", "Neither", "Both"], "correct": 0},

        {"id": 35, "question": "What is 'express.Router()' used for?", "options": ["Creating isolated route instances specifically for modular code", "Routing internet traffic", "Neither", "Both"], "correct": 0},

        {"id": 36, "question": "How to include a router in the main app?", "options": ["app.use('/path', router_object)", "app.add(router)", "Neither", "Both"], "correct": 0},

        {"id": 37, "question": "What represents the 'View Engine' setting?", "options": ["Specifies specifically which template engine to use (e.g. ejs, pug)", "A vision tool", "Neither", "Both"], "correct": 0},

        {"id": 38, "question": "How do you render a template file?", "options": ["res.render('filename', {data})", "res.show('file')", "Neither", "Both"], "correct": 0},

        {"id": 39, "question": "What is 'Morgan' commonly used for?", "options": ["HTTP log specifically for every request in development/production", "A types of data", "Neither", "Both"], "correct": 0},

        {"id": 40, "question": "What's the meaning of 'CORS' in Express?", "options": ["Cross-Origin Resource Sharing specifically to allow cross-site requests", "A routing error", "Neither", "Both"], "correct": 0},

        {"id": 41, "question": "How to enable CORS in Express?", "options": ["Using the cors() middleware specifically from 'cors' package", "Restarting the app", "Neither", "Both"], "correct": 0},

        {"id": 42, "question": "What's the meaning of 'Helmet' in Express?", "options": ["A middleware specifically for securing HTTP headers", "A safety cap", "Neither", "Both"], "correct": 0},

        {"id": 43, "question": "How to handle a POST request for JSON data?", "options": ["Using app.use(express.json()) to parse the body", "Using express.text()", "Neither", "Both"], "correct": 0},

        {"id": 44, "question": "What represents the 'req.query' object?", "options": ["Contains specifically the URL query parameters (after the ?)", "A list of strings", "Neither", "Both"], "correct": 0},

        {"id": 45, "question": "What represents the 'req.params' object?", "options": ["Contains specifically the named route parameters (e.g. :id)", "A query string", "Neither", "Both"], "correct": 0},

        {"id": 46, "question": "What represents the 'req.headers'?", "options": ["Contains specifically the HTTP request headers sent by client", "A table header", "Neither", "Both"], "correct": 0},

        {"id": 47, "question": "What's the meaning of 'res.locals'?", "options": ["An object specifically for storing data to be used in templates during a request", "Local variables in a function", "Neither", "Both"], "correct": 0},

        {"id": 48, "question": "How can you parse cookies in Express?", "options": ["Using the 'cookie-parser' specifically middleware", "Using express.cookie()", "Neither", "Both"], "correct": 0},

        {"id": 49, "question": "What's 'express-session' used for?", "options": ["Managing specifically server-side sessions for users", "Managing browser tabs", "Neither", "Both"], "correct": 0},

        {"id": 50, "question": "What represents specific 'CSRF' protection?", "options": ["Preventing specifically cross-site request forgery attacks (e.g. csurf)", "A routing error", "Neither", "Both"], "correct": 0},

        {"id": 51, "question": "What's the effect of 'res.download()'?", "options": ["Prompts the client specifically to download a file", "Downloading from a URL", "Neither", "Both"], "correct": 0},

        {"id": 52, "question": "What's 'multer' used for?", "options": ["Handling specifically multipart/form-data for file uploads", "Handling text", "Neither", "Both"], "correct": 0},

        {"id": 33, "question": "How do you handle multiple files in multer?", "options": ["upload.array('fieldname', limit) or upload.fields()", "upload.single()", "Neither", "Both"], "correct": 0},

        {"id": 54, "question": "What is 'express.urlencoded()'?", "options": ["Middleware specifically to parse URL-encoded bodies (like from HTML forms)", "A types of link", "Neither", "Both"], "correct": 0},

        {"id": 55, "question": "What represents 'Router.param()'?", "options": ["Triggers specifically a callback for specific route parameters", "A routing name", "Neither", "Both"], "correct": 1},

        {"id": 56, "question": "How to mount a router at a specific path prefix?", "options": ["app.use('/prefix', routerInstance)", "app.add('/prefix', router)", "Neither", "Both"], "correct": 0},

        {"id": 57, "question": "What's the meaning of 'Mount' in Express?", "options": ["Attaching specifically a router or middleware to a specific path", "Setting up a server", "Neither", "Both"], "correct": 0},

        {"id": 58, "question": "What represents the 'next('route')' call?", "options": ["Skips specifically the remaining middleware in the current route stack", "Moves to next app", "Neither", "Both"], "correct": 0},

        {"id": 59, "question": "What's 'Passport.js' role in Express?", "options": ["Authentication specifically for Node.js apps with various strategies", "Handling travel", "Neither", "Both"], "correct": 0},

        {"id": 60, "question": "What represents 'JWT' (JSON Web Token)?", "options": ["Compact, URL-safe means specifically of representing claims between two parties", "A JavaScript tool", "Neither", "Both"], "correct": 0},

        {"id": 61, "question": "How can you implement Rate Limiting?", "options": ["Using 'express-rate-limit' specifically middleware", "Using a timer", "Neither", "Both"], "correct": 0},

        {"id": 62, "question": "What's 'Compression' middleware for?", "options": ["Compressing specifically HTTP responses to improve performance", "Compressing files on disk", "Neither", "Both"], "correct": 0},

        {"id": 63, "question": "What's 'Validator' package common use?", "options": ["Validating specifically and sanitizing user inputs (strings, emails, etc.)", "Checking code syntax", "Neither", "Both"], "correct": 0},

        {"id": 64, "question": "What's 'Joi' used for?", "options": ["Schema description specifically and data validation in JavaScript", "A types of game", "Neither", "Both"], "correct": 0},

        {"id": 65, "question": "How to handle async errors in Express 4?", "options": ["Manual try-catch or 'express-async-errors' specifically helper", "They are handled automatically", "Neither", "Both"], "correct": 0},

        {"id": 66, "question": "What represents specific 'Cluster' mode?", "options": ["Running multiple instances specifically of an app to utilize multi-core CPUs", "A group of servers", "Neither", "Both"], "correct": 0},

        {"id": 67, "question": "What represents 'PM2'?", "options": ["A production process manager specifically for Node.js apps", "A types of math", "Neither", "Both"], "correct": 0},

        {"id": 68, "question": "What's the meaning of 'Proxy' trust in Express?", "options": ["Configuring specifically how Express handles requests from behind a proxy (like Nginx)", "Trusting a person", "Neither", "Both"], "correct": 0},

        {"id": 69, "question": "What is 'app.locals'?", "options": ["Object specifically for storing app-wide variables available in all templates", "Variables in a function", "Neither", "Both"], "correct": 0},

        {"id": 70, "question": "How to listen on all interfaces?", "options": ["app.listen(3000, '0.0.0.0')", "app.listen(3000, 'localhost')", "Neither", "Both"], "correct": 0},

        {"id": 71, "question": "What's the meaning of 'EJS' (Embedded JavaScript)?", "options": ["A simple templating language specifically that lets you generate HTML with JS", "A types of script", "Neither", "Both"], "correct": 0},

        {"id": 72, "question": "What represents 'Pug'?", "options": ["A high-performance template engine specifically with a whitespace-sensitive syntax", "A types of dog", "Neither", "Both"], "correct": 0},

        {"id": 73, "question": "How to set specific Response Headers?", "options": ["res.set('Header-Name', 'Value') or res.header()", "res.addHeader()", "Neither", "Both"], "correct": 0},

        {"id": 74, "question": "What represents 'res.attachment()'?", "options": ["Sets the specifically Content-Disposition header to attachment", "Adding a file to email", "Neither", "Both"], "correct": 0},

        {"id": 75, "question": "What's 'Serve-Favicon' used for?", "options": ["Middleware specifically for serving the favicon icon for the website", "Serving food", "Neither", "Both"], "correct": 0},

        {"id": 76, "question": "How to handle multiple HTTP methods on one path?", "options": ["app.route('/path').get(cb).post(cb)", "Using many app.get()", "Neither", "Both"], "correct": 0},

        {"id": 77, "question": "What's the meaning of 'Express Generator'?", "options": ["A tool specifically for scaffolding a basic Express application structure", "A power generator", "Neither", "Both"], "correct": 0},

        {"id": 78, "question": "How can you debug Express apps?", "options": ["Using the 'debug' specifically module or console.log", "Using a physical debugger", "Neither", "Both"], "correct": 0},

        {"id": 79, "question": "What represents specific 'Strict Routing'?", "options": ["Distinguishing specifically between '/path' and '/path/'", "A routing law", "Neither", "Both"], "correct": 0},

        {"id": 80, "question": "Why is Express.js so popular?", "options": ["Large ecosystem, minimalism, specifically and ease of use for building APIs", "It is old", "Neither", "Both"], "correct": 0},

        {"id": 81, "question": "What is 'app.mountpath'?", "options": ["Contains one or more path patterns on which a sub-app was mounted", "Path to the mountain", "Neither", "Both"], "correct": 0},

        {"id": 82, "question": "What is 'app.on('mount')' event?", "options": ["Fired on a sub-app when it is mounted on a parent app", "Fired when app starts", "Neither", "Both"], "correct": 0},

        {"id": 83, "question": "What does 'req.accepts()' do?", "options": ["Checks if the specified content types are acceptable", "Accepts a user request", "Neither", "Both"], "correct": 0},

        {"id": 84, "question": "What is 'req.get(field)'?", "options": ["Returns the specified HTTP request header field", "Gets a file", "Neither", "Both"], "correct": 0},

        {"id": 85, "question": "What is 'req.is(type)'?", "options": ["Checks if the 'Content-Type' header matches the given MIME type", "Checks identity", "Neither", "Both"], "correct": 0},

        {"id": 86, "question": "What is 'res.append()' used for?", "options": ["Appends the specified value to the HTTP response header field", "Adding to a list", "Neither", "Both"], "correct": 0},

        {"id": 87, "question": "What does 'res.clearCookie()' do?", "options": ["Clears the cookie specified by name", "Logs out a user", "Neither", "Both"], "correct": 0},

        {"id": 88, "question": "What is 'res.format()'?", "options": ["Performs content-negotiation on the Accept HTTP header on the request object", "Formats a disk", "Neither", "Both"], "correct": 0},

        {"id": 89, "question": "What is 'res.links(links)'?", "options": ["Joins the links provided to populate the Link HTTP header field", "Creates HTML links", "Neither", "Both"], "correct": 0},

        {"id": 90, "question": "What is 'res.location()'?", "options": ["Sets the response Location HTTP header field to the specified path", "Finds user GPS", "Neither", "Both"], "correct": 0},

        {"id": 91, "question": "What does 'res.type()' do?", "options": ["Sets the Content-Type HTTP header to the MIME type", "Prints text", "Neither", "Both"], "correct": 0},

        {"id": 92, "question": "What is 'res.vary()'?", "options": ["Adds the field to the Vary response header of the request", "Changes a variable", "Neither", "Both"], "correct": 0},

        {"id": 93, "question": "Which middleware handles Favicons?", "options": ["serve-favicon", "icon-handler", "Neither", "Both"], "correct": 0},

        {"id": 94, "question": "What is 'cookie-session' middleware for?", "options": ["Storing session data in a cookie (client-side)", "Locking cookies", "Neither", "Both"], "correct": 0},

        {"id": 95, "question": "What is 'method-override' middleware used for?", "options": ["Allowing use of HTTP verbs like PUT or DELETE where the client doesn't support it", "Overriding a function", "Neither", "Both"], "correct": 0},

        {"id": 96, "question": "Which of these is a database adapter for Express?", "options": ["Knex.js", "Bookshelf.js", "Neither", "Both"], "correct": 3},

        {"id": 97, "question": "What is 'express-validator' used for?", "options": ["Server-side data validation", "Validating the server itself", "Neither", "Both"], "correct": 0},

        {"id": 98, "question": "What is 'Passport-Local' strategy?", "options": ["Strategy for authenticating with a username and password", "A travel guide", "Neither", "Both"], "correct": 0},

        {"id": 99, "question": "How to handle binary file downloads in Express?", "options": ["res.sendFile() or res.download()", "res.sendBinary()", "Neither", "Both"], "correct": 0},

        {"id": 100, "question": "What is 'EJS' primarily known for?", "options": ["Using simple JavaScript templates to generate HTML", "A database engine", "Neither", "Both"], "correct": 0}

    ]

    return Response({'success': True, 'data': random.sample(questions_pool, min(len(questions_pool), 50))})

