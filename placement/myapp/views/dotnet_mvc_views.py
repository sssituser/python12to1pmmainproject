import random
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response


@api_view(["GET"])
@permission_classes([AllowAny])
def playground_questions_dotnet_mvc_api(request):
    """
    Serve 80 questions for .NET with MVC. Frontend will display 30 per exam.
    Topics: .NET architecture, CLR, .NET Core basics, ASP.NET MVC patterns,
    controllers/views/models, routing, dependency injection, middleware,
    configuration, deployment basics.
    """
    questions_pool = [
        {"id": 1, "question": "What does MVC stand for?", "options": ["Model View Controller", "Module View Compiler", "Model Visual Component", "Managed View Controller"], "correct": 0},
        {"id": 2, "question": "In ASP.NET Core MVC, controllers inherit from:", "options": ["ControllerBase", "PageModel", "Controller", "ApiController"], "correct": 2},
        {"id": 3, "question": "Which folder typically holds Razor views?", "options": ["Views/", "Pages/", "Templates/", "Layouts/"], "correct": 0},
        {"id": 4, "question": "What file configures endpoints in minimal hosting model?", "options": ["Program.cs", "Startup.cs only", "App.config", "launchSettings.json"], "correct": 0},
        {"id": 5, "question": "Razor syntax uses which delimiters for C#?", "options": ["{{ }}", "@", "<? ?>", "<% %>"], "correct": 1},
        {"id": 6, "question": "What does the _Layout.cshtml file define?", "options": ["Shared page shell", "Database schema", "API routes", "DI registrations"], "correct": 0},
        {"id": 7, "question": "What attribute sets the base route on a controller?", "options": ["[Route]", "[HttpGet]", "[Path]", "[BaseRoute]"], "correct": 0},
        {"id": 8, "question": "How do you return a view from a controller action?", "options": ["return View()", "return Page()", "return Render()", "return Html()"], "correct": 0},
        {"id": 9, "question": "What is ViewModel used for?", "options": ["Shape data for views", "Configure DB", "Handle GC", "Define DI lifetimes"], "correct": 0},
        {"id": 10, "question": "Tag Helpers run on:", "options": ["Server during rendering", "Client only", "Database", "CLI"], "correct": 0},
        {"id": 11, "question": "Which middleware enforces HTTPS?", "options": ["UseHttpsRedirection", "UseAuthorization", "UseCors", "UseStaticFiles"], "correct": 0},
        {"id": 12, "question": "What enables model validation?", "options": ["DataAnnotations", "LINQ", "EF Core", "Swagger"], "correct": 0},
        {"id": 13, "question": "Which attribute validates required input?", "options": ["[Required]", "[Needed]", "[NotNull]", "[Validate]"], "correct": 0},
        {"id": 14, "question": "ModelState.IsValid is checked in:", "options": ["Controller action", "Program.cs", "appsettings.json", "csproj"], "correct": 0},
        {"id": 15, "question": "ViewBag is:", "options": ["Dynamic wrapper for passing data", "Static class", "Cache store", "Logger"], "correct": 0},
        {"id": 16, "question": "TempData persists data for:", "options": ["Next request", "Whole session", "Forever", "Same request only"], "correct": 0},
        {"id": 17, "question": "Which result type issues a redirect?", "options": ["RedirectToAction", "ViewResult", "JsonResult", "FileResult"], "correct": 0},
        {"id": 18, "question": "What does routing map?", "options": ["URLs to actions", "Tables to entities", "Threads to cores", "Assemblies to GAC"], "correct": 0},
        {"id": 19, "question": "Default route template in MVC is:", "options": ["{controller=Home}/{action=Index}/{id?}", "/index", "/home/action", "{action}/{controller}"], "correct": 0},
        {"id": 20, "question": "What does IActionResult represent?", "options": ["Action return contract", "DI lifetime", "Thread pool item", "Config section"], "correct": 0},
        {"id": 21, "question": "Partial views are used to:", "options": ["Reuse UI fragments", "Configure DI", "Compile IL", "Secure cookies"], "correct": 0},
        {"id": 22, "question": "What file holds environment-specific settings?", "options": ["appsettings.{Environment}.json", "env.config", "config.env", "settings.ini"], "correct": 0},
        {"id": 23, "question": "Which service registers MVC in Program.cs?", "options": ["builder.Services.AddControllersWithViews()", "builder.Services.AddPages()", "builder.Services.AddRazorComponents()", "builder.Services.AddMvcLegacy()"], "correct": 0},
        {"id": 24, "question": "Anti-forgery tokens mitigate:", "options": ["CSRF", "XSS", "SQL injection", "Heap overflow"], "correct": 0},
        {"id": 25, "question": "What generates anti-forgery tokens in forms?", "options": ["@Html.AntiForgeryToken()", "ViewBag.Token()", "@AntiCSRF()", "Token.Generate()"], "correct": 0},
        {"id": 26, "question": "Which filter runs before an action?", "options": ["OnActionExecuting", "OnResultExecuted", "OnException", "OnResourceExecuted"], "correct": 0},
        {"id": 27, "question": "What are Action Filters used for?", "options": ["Cross-cutting concerns", "Routing only", "GC tuning", "SQL joins"], "correct": 0},
        {"id": 28, "question": "What is dependency injection?", "options": ["Providing dependencies from a container", "Compiling IL", "Threading model", "JSON parsing"], "correct": 0},
        {"id": 29, "question": "Singleton lifetime means:", "options": ["One instance per app", "One per request", "One per resolve", "One per thread"], "correct": 0},
        {"id": 30, "question": "Scoped lifetime means:", "options": ["One instance per request", "One per app", "One per thread", "One per call"], "correct": 0},
        {"id": 31, "question": "Transient lifetime means:", "options": ["New instance each resolve", "One per app", "One per request", "Shared globally"], "correct": 0},
        {"id": 32, "question": "What does AddDbContext register?", "options": ["EF Core DbContext", "Dapper", "Mongo", "Redis"], "correct": 0},
        {"id": 33, "question": "What template file sets a view’s layout?", "options": ["_ViewStart.cshtml", "_Imports.razor", "layout.json", "viewsettings.cs"], "correct": 0},
        {"id": 34, "question": "What is _ViewImports.cshtml for?", "options": ["Shared namespaces/Tag Helpers", "Layout definition", "Routing", "DI setup"], "correct": 0},
        {"id": 35, "question": "Which result returns JSON?", "options": ["JsonResult/return Json()", "View()", "File()", "Redirect()"], "correct": 0},
        {"id": 36, "question": "How to enable static files?", "options": ["app.UseStaticFiles()", "app.UseFiles()", "app.AddStatics()", "app.UseAssets()"], "correct": 0},
        {"id": 37, "question": "What does app.UseRouting() do?", "options": ["Adds routing middleware", "Adds authentication", "Adds logging", "Adds GC"], "correct": 0},
        {"id": 38, "question": "What must run before UseAuthorization?", "options": ["UseAuthentication", "UseEndpoints", "UseCors", "UseDeveloperExceptionPage"], "correct": 0},
        {"id": 39, "question": "What’s the purpose of middleware order?", "options": ["Request/response pipeline correctness", "Compile speed", "GC pause", "NuGet restore"], "correct": 0},
        {"id": 40, "question": "What is a Razor component?", "options": ["UI building block (Blazor)", "Middleware", "Controller", "Filter"], "correct": 0},
        {"id": 41, "question": "Which template is best for server-rendered MVC?", "options": ["MVC template", "Blazor WebAssembly", "React", "Console"], "correct": 0},
        {"id": 42, "question": "What does AddControllersWithViews include?", "options": ["Controllers + Razor views", "Razor Pages only", "API only", "Blazor components"], "correct": 0},
        {"id": 43, "question": "What is IActionFilter used for?", "options": ["Code before/after actions", "GC", "EF migrations", "Logging only"], "correct": 0},
        {"id": 44, "question": "How do you bind route values to parameters?", "options": ["[FromRoute]", "[FromBody]", "[FromForm]", "[FromServices]"], "correct": 0},
        {"id": 45, "question": "What attribute enables automatic model validation response?", "options": ["[ApiController]", "[ValidateModel]", "[ModelState]", "[Route]"], "correct": 0},
        {"id": 46, "question": "Which middleware handles exceptions globally?", "options": ["UseExceptionHandler", "UseErrorPage", "UseCrashHandler", "UsePanic"], "correct": 0},
        {"id": 47, "question": "What does UseStatusCodePages do?", "options": ["Friendly error responses", "Adds routing", "Adds DI", "Runs migrations"], "correct": 0},
        {"id": 48, "question": "Which package generates Swagger UI?", "options": ["Swashbuckle.AspNetCore", "Newtonsoft.Json", "Serilog", "CsvHelper"], "correct": 0},
        {"id": 49, "question": "What does [Authorize] do?", "options": ["Requires authenticated/authorized user", "Adds HTTPS", "Runs migrations", "Enables GC"], "correct": 0},
        {"id": 50, "question": "How to allow anonymous on an action inside [Authorize] controller?", "options": ["[AllowAnonymous]", "[Public]", "[SkipAuth]", "[Anonymous]"], "correct": 0},
        {"id": 51, "question": "What is IActionResult vs ActionResult<T>?", "options": ["Generic typed response vs non-generic", "Same thing", "Only for APIs", "Only for views"], "correct": 0},
        {"id": 52, "question": "What does [HttpPost] indicate?", "options": ["Action responds to POST", "Enables DI", "Adds JSON", "Handles GET"], "correct": 0},
        {"id": 53, "question": "How to bind JSON body to a model?", "options": ["[FromBody]", "[FromRoute]", "[FromQuery]", "[FromServices]"], "correct": 0},
        {"id": 54, "question": "What is the purpose of the hosting environment variable?", "options": ["Selects environment-specific config", "Sets port", "Controls GC", "Chooses database"], "correct": 0},
        {"id": 55, "question": "Which pattern reduces view logic duplication?", "options": ["Partial views + layouts", "Stored procedures", "GC tuning", "Threads"], "correct": 0},
        {"id": 56, "question": "What command scaffolds a controller with views and EF?", "options": ["dotnet aspnet-codegenerator controller", "dotnet new mvc", "dotnet generate views", "dotnet add controller"], "correct": 0},
        {"id": 57, "question": "What is PublishTrimmed for?", "options": ["Trims unused assemblies for publish", "Minifies JS", "Compacts GC", "Shrinks SQL"], "correct": 0},
        {"id": 58, "question": "What is ReadyToRun publish option?", "options": ["Precompiles IL to native images", "Enables hot reload", "Disables DI", "Turns off JIT"], "correct": 0},
        {"id": 59, "question": "What is the role of IWebHostEnvironment?", "options": ["Provides environment info, content root, web root", "Logs errors", "Runs GC", "Configures SQL"], "correct": 0},
        {"id": 60, "question": "What does app.UseCors do?", "options": ["Configures Cross-Origin Resource Sharing", "Adds caching", "Adds auth", "Adds HTTPS"], "correct": 0},
        {"id": 61, "question": "How to return a file download?", "options": ["return File(bytes, contentType, fileName)", "return View(file)", "return Download()", "return StreamOnly()"], "correct": 0},
        {"id": 62, "question": "What is Model Binding?", "options": ["Mapping HTTP data to action parameters", "Binding DLLs", "Connecting DB", "Thread binding"], "correct": 0},
        {"id": 63, "question": "What is ViewData?", "options": ["Dictionary for passing data to view", "Static config", "Connection string", "Route table"], "correct": 0},
        {"id": 64, "question": "How to enable session state?", "options": ["services.AddSession(); app.UseSession();", "app.UseCache()", "services.AddViews()", "app.UseCookiesOnly()"], "correct": 0},
        {"id": 65, "question": "What does IServiceCollection represent?", "options": ["DI service registrations", "Thread pool", "Route table", "View collection"], "correct": 0},
        {"id": 66, "question": "What command runs EF Core migrations?", "options": ["dotnet ef database update", "dotnet db migrate", "dotnet ef apply", "dotnet update db"], "correct": 0},
        {"id": 67, "question": "What is Middleware?", "options": ["Component in HTTP pipeline", "DB entity", "Thread lock", "Cache"], "correct": 0},
        {"id": 68, "question": "What is IFormFile used for?", "options": ["File uploads", "JSON parsing", "Logging", "GC"], "correct": 0},
        {"id": 69, "question": "Which hosting model combines Program.cs and Startup.cs?", "options": ["Minimal hosting model", "Legacy hosting", "IIS only", "WCF hosting"], "correct": 0},
        {"id": 70, "question": "What does UseDeveloperExceptionPage show?", "options": ["Detailed errors in Development", "Production error page", "No errors", "Static files"], "correct": 0},
        {"id": 71, "question": "What is the difference between Razor Pages and MVC?", "options": ["Page-focused vs controller-focused", "No difference", "MVC is WebForms", "Razor Pages lack routing"], "correct": 0},
        {"id": 72, "question": "How to authorize by policy?", "options": ["[Authorize(Policy=\"policyName\")]", "[Policy]", "[Role]", "[Auth]"], "correct": 0},
        {"id": 73, "question": "What does endpoint routing require?", "options": ["UseRouting then MapControllers/MapDefaultControllerRoute", "UseEndpoints only", "UseMvc", "UseWebApi"], "correct": 0},
        {"id": 74, "question": "What is IHttpContextAccessor for?", "options": ["Access HttpContext via DI", "Access SQL", "GC tuning", "File IO"], "correct": 0},
        {"id": 75, "question": "What does AddMemoryCache provide?", "options": ["In-memory caching services", "Distributed cache", "File cache", "No caching"], "correct": 0},
        {"id": 76, "question": "What is the purpose of ResponseCaching middleware?", "options": ["Adds caching headers and short-term caching", "Compresses responses", "Encrypts responses", "Logs responses"], "correct": 0},
        {"id": 77, "question": "How to inject a service into a view?", "options": ["@inject IService Name", "@service", "@using", "@injector"], "correct": 0},
        {"id": 78, "question": "What is the default JSON serializer in ASP.NET Core 7?", "options": ["System.Text.Json", "Newtonsoft.Json", "DataContractJsonSerializer", "Json.Net Core"], "correct": 0},
        {"id": 79, "question": "What does [ValidateAntiForgeryToken] do?", "options": ["Validates CSRF token on POST", "Encrypts payload", "Hashes password", "Logs errors"], "correct": 0},
        {"id": 80, "question": "What is the role of Program.cs in minimal hosting?", "options": ["Builds host, registers services, configures middleware/endpoints", "Stores views", "Defines DB schema", "Compiles C#"], "correct": 0},
    ]

    target = 80
    selected = random.sample(questions_pool, target)
    for idx, q in enumerate(selected):
        q["id"] = idx + 1

    return Response({"success": True, "data": selected})
