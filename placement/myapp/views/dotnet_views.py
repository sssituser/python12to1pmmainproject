import random
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response


@api_view(["GET"])
@permission_classes([AllowAny])
def playground_questions_dotnet_api(request):
    """
    Serve 80 .NET/.NET Core MCQs; frontend will show 30 per exam.
    Covers architecture, CLR, .NET Core fundamentals, project structure, and backend basics.
    """
    questions_pool = [
        {"id": 1, "question": "What does CLR stand for in .NET?", "options": ["Common Language Runtime", "Code Level Runtime", "Compiled Language Runner", "Common Logic Resolver"], "correct": 0},
        {"id": 2, "question": "The CLR primarily provides:", "options": ["UI rendering", "Memory management and execution", "Database migrations", "Network routing"], "correct": 1},
        {"id": 3, "question": "Which compilation steps occur in .NET?", "options": ["CIL then JIT", "Direct to machine code only", "Bytecode then AOT only", "Script interpreted at runtime only"], "correct": 0},
        {"id": 4, "question": "What is CIL?", "options": ["Common Intermediate Language", "Compiled Interface Layer", "Core Integration Library", "Central Interpreter Loop"], "correct": 0},
        {"id": 5, "question": "The garbage collector in .NET uses:", "options": ["Reference counting only", "Mark and sweep generations", "Manual free()", "Stack compaction only"], "correct": 1},
        {"id": 6, "question": "Which process converts CIL to native code at runtime?", "options": ["AOT", "JIT", "ILMerge", "Roslyn"], "correct": 1},
        {"id": 7, "question": "What is the primary role of the Base Class Library (BCL)?", "options": ["Provide UI widgets", "Offer foundational types and APIs", "Manage SQL servers", "Handle DevOps"], "correct": 1},
        {"id": 8, "question": ".NET Core was renamed to:", "options": [".NET 5+", ".NET Classic", ".NET FX", ".NET Lite"], "correct": 0},
        {"id": 9, "question": "Which command creates a new console app in .NET CLI?", "options": ["dotnet new console", "dotnet create app", "dotnet init console", "dotnet console new"], "correct": 0},
        {"id": 10, "question": "Where is project metadata stored?", "options": [".csproj file", ".config file", ".sln.doc file", "app.settings"], "correct": 0},
        {"id": 11, "question": "What does SDK-style project file enable?", "options": ["Shorter csproj with defaults", "Mandatory packages.config", "XAML-only projects", "No CLI builds"], "correct": 0},
        {"id": 12, "question": "Which CLI command restores NuGet packages?", "options": ["dotnet restore", "dotnet packages", "nuget sync", "dotnet fetch"], "correct": 0},
        {"id": 13, "question": "What is the default build configuration?", "options": ["Release", "Debug", "Prod", "Stage"], "correct": 1},
        {"id": 14, "question": "What is Kestrel?", "options": ["ORM", "Web server for ASP.NET Core", "Logger", "CLI parser"], "correct": 1},
        {"id": 15, "question": "Which file configures hosting and middleware in minimal API projects?", "options": ["Program.cs", "Startup.json", "host.config", "appsettings.cs"], "correct": 0},
        {"id": 16, "question": "Dependency Injection in .NET Core is:", "options": ["Built-in container by default", "Unavailable", "Only via third-party", "Only for MVC"], "correct": 0},
        {"id": 17, "question": "What does appsettings.json contain?", "options": ["Source code", "Configuration values", "Compiled DLLs", "NuGet cache"], "correct": 1},
        {"id": 18, "question": "How to run a project from CLI?", "options": ["dotnet start", "dotnet run", "dotnet execute", "dotnet begin"], "correct": 1},
        {"id": 19, "question": "Which logging provider ships by default?", "options": ["Serilog", "NLog", "Console/Debug/EventSource", "Elasticsearch"], "correct": 2},
        {"id": 20, "question": "Which is true about cross-platform support?", "options": [".NET 4.8 is cross-platform", ".NET 6/7/8 are cross-platform", ".NET runs only on Windows", "Only Xamarin runs on Linux"], "correct": 1},
        {"id": 21, "question": "What is the purpose of the SDK workload feature?", "options": ["Install language packs", "Add optional tooling like MAUI/Blazor", "Replace NuGet", "Manage IIS"], "correct": 1},
        {"id": 22, "question": "Which file pins package versions centrally?", "options": ["Directory.Packages.props", "global.json", "packages.lock", "nuget.config"], "correct": 0},
        {"id": 23, "question": "global.json is used to:", "options": ["Pin .NET SDK version", "List dependencies", "Configure logging", "Define DI"], "correct": 0},
        {"id": 24, "question": "Which type represents nullable reference types annotation?", "options": ["string?", "string!", "Nullable<string>", "Maybe<string>"], "correct": 0},
        {"id": 25, "question": "What is the entry point method signature?", "options": ["int Start()", "static void Main(string[] args)", "public Program()", "async Task Constructor()"], "correct": 1},
        {"id": 26, "question": "What does ILDASM inspect?", "options": ["NuGet cache", "Intermediate language in assemblies", "SQL schema", "Docker layers"], "correct": 1},
        {"id": 27, "question": "Which option enables AOT publishing?", "options": ["PublishTrimmed", "PublishReadyToRun", "PublishSingleFile", "PublishNativeAot"], "correct": 3},
        {"id": 28, "question": "ReadyToRun images aim to:", "options": ["Skip JIT cost", "Remove GC", "Embed DB", "Disable DI"], "correct": 0},
        {"id": 29, "question": "Which tool manages migrations in EF Core?", "options": ["dotnet ef", "dotnet db", "sqlcmd", "efmgr"], "correct": 0},
        {"id": 30, "question": "What is an assembly?", "options": ["A compiled unit (DLL/EXE) with manifest", "A config file", "A database", "A git repo"], "correct": 0},
        {"id": 31, "question": "Strong naming adds:", "options": ["Public key identity", "Obfuscation", "GC optimization", "Faster JIT"], "correct": 0},
        {"id": 32, "question": "Which collection is thread-safe?", "options": ["List<T>", "Dictionary<T>", "ConcurrentDictionary<T>", "Queue<T>"], "correct": 2},
        {"id": 33, "question": "Async/await is built on:", "options": ["Tasks", "Threads only", "Timers only", "Signals only"], "correct": 0},
        {"id": 34, "question": "Minimal APIs typically use which hosting model?", "options": ["WebHost", "Generic Host", "IIS only", "Self-host WCF"], "correct": 1},
        {"id": 35, "question": "What is Middleware?", "options": ["Pipeline component handling requests/responses", "Database schema", "Razor page", "Controller action"], "correct": 0},
        {"id": 36, "question": "UseDeveloperExceptionPage is meant for:", "options": ["Production only", "Development diagnostics", "Disabling logging", "Authentication"], "correct": 1},
        {"id": 37, "question": "What does UseRouting do?", "options": ["Enables endpoint routing", "Starts Kestrel", "Adds DI", "Handles static files"], "correct": 0},
        {"id": 38, "question": "Which attribute marks a Web API controller?", "options": ["[ApiController]", "[WebApi]", "[RouteApi]", "[ControllerApi]"], "correct": 0},
        {"id": 39, "question": "Model validation errors are returned as:", "options": ["200 OK", "400 Bad Request with problem details", "302 Redirect", "204 No Content"], "correct": 1},
        {"id": 40, "question": "Which serializer is default in ASP.NET Core 7?", "options": ["Newtonsoft.Json", "System.Text.Json", "XmlSerializer", "BinaryFormatter"], "correct": 1},
        {"id": 41, "question": "What is the purpose of app.MapGet in minimal APIs?", "options": ["Map a GET endpoint", "Configure logging", "Create Razor pages", "Register DI"], "correct": 0},
        {"id": 42, "question": "Which lifetime should stateless services typically use?", "options": ["Singleton", "Scoped", "Transient", "ThreadStatic"], "correct": 2},
        {"id": 43, "question": "IHostedService is used for:", "options": ["Background services", "UI rendering", "SQL migrations", "Caching only"], "correct": 0},
        {"id": 44, "question": "What does IConfiguration provide?", "options": ["Access to hierarchical configuration values", "Thread scheduling", "GC tuning", "Entity tracking"], "correct": 0},
        {"id": 45, "question": "How are environment-specific settings loaded?", "options": ["appsettings.{Environment}.json", "env.json only", "registry", "command only"], "correct": 0},
        {"id": 46, "question": "Which tool watches and restarts during dev?", "options": ["dotnet watch", "dotnet devserve", "dotnet loop", "dotnet autoreload"], "correct": 0},
        {"id": 47, "question": "What is the default port for Kestrel in dev?", "options": ["5000/5001", "80/443", "3000", "4200"], "correct": 0},
        {"id": 48, "question": "What does UseStaticFiles require?", "options": ["AddStaticFiles middleware", "IIS only", "Razor pages", "Entity Framework"], "correct": 0},
        {"id": 49, "question": "What are Razor Pages?", "options": ["Page-focused model built on MVC", "Blazor components", "WinForms", "WPF"], "correct": 0},
        {"id": 50, "question": "Tag Helpers are used in:", "options": ["Razor views", "WinUI", "Console apps", "MAUI only"], "correct": 0},
        {"id": 51, "question": "What is a NuGet package?", "options": ["Versioned distribution of compiled code/content", "SQL backup", "Docker image", "Git submodule"], "correct": 0},
        {"id": 52, "question": "How to add a package via CLI?", "options": ["dotnet add package <name>", "dotnet install <name>", "nuget push", "dotnet pack"], "correct": 0},
        {"id": 53, "question": "What is the benefit of Generic Host?", "options": ["Unified hosting model for console/web/background", "Only for MVC", "Replaces DI", "For desktop apps only"], "correct": 0},
        {"id": 54, "question": "Which logger category is derived from?", "options": ["Type name", "File path", "Thread ID", "Route"], "correct": 0},
        {"id": 55, "question": "Serilog/NLog can be plugged via:", "options": ["Logging providers", "ORM providers", "GC providers", "Routing providers"], "correct": 0},
        {"id": 56, "question": "What does IHttpClientFactory solve?", "options": ["Handler lifetime, DNS refresh, pooling", "SQL joins", "UI theming", "JIT speed"], "correct": 0},
        {"id": 57, "question": "Which HTTP client type is typed?", "options": ["AddHttpClient<TClient>", "HttpClient()", "WebClient", "Socket"], "correct": 0},
        {"id": 58, "question": "How to secure secrets locally?", "options": ["User Secrets (secrets.json)", "Commit to git", "Plain appsettings", "ENV only"], "correct": 0},
        {"id": 59, "question": "What does AddControllers() register?", "options": ["MVC controllers", "Razor pages", "SignalR hubs", "Blazor"], "correct": 0},
        {"id": 60, "question": "What does AddEndpointsApiExplorer enable?", "options": ["Swagger/OpenAPI discovery", "Routing", "GC logging", "EF migrations"], "correct": 0},
        {"id": 61, "question": "What tool generates interactive API docs?", "options": ["Swagger/Swashbuckle", "Seq", "Serilog", "Dapper"], "correct": 0},
        {"id": 62, "question": "What is the purpose of middleware order?", "options": ["Request/response flow depends on it", "Only logging", "No effect", "Affects GC"], "correct": 0},
        {"id": 63, "question": "Which interface defines a middleware?", "options": ["IMiddleware or RequestDelegate pattern", "ILogger", "IHost", "IConfig"], "correct": 0},
        {"id": 64, "question": "What is ModelState?", "options": ["Validation state for input models", "Database state", "Thread state", "GC heap"], "correct": 0},
        {"id": 65, "question": "Route templates use which syntax?", "options": ["{controller}/{action}/{id?}", "<controller>/<action>", "[controller]/[action]", "(controller)/(action)"], "correct": 0},
        {"id": 66, "question": "Which filter runs after an action executes?", "options": ["ActionFilter OnActionExecuted", "Authorization filter", "Resource filter", "Routing filter"], "correct": 0},
        {"id": 67, "question": "What is a DTO?", "options": ["Data Transfer Object", "Database Tracking Object", "Dynamic Type Option", "Direct Task Operation"], "correct": 0},
        {"id": 68, "question": "Which feature enforces HTTPS?", "options": ["UseHttpsRedirection", "UseHttpOnly", "RequireTLS()", "SecureAll()"], "correct": 0},
        {"id": 69, "question": "How to serve SPA static files?", "options": ["UseSpa/UseStaticFiles with SPA assets", "Enable MVC only", "Install IIS", "Use Razor pages only"], "correct": 0},
        {"id": 70, "question": "What does app.MapControllers() do?", "options": ["Maps attribute-routed controllers", "Registers DI", "Adds logging", "Enables GC"], "correct": 0},
        {"id": 71, "question": "Which collection type preserves insertion order?", "options": ["List<T>", "LinkedList<T>", "OrderedDictionary", "ConcurrentQueue<T>"], "correct": 2},
        {"id": 72, "question": "Span<T> is primarily for:", "options": ["High-performance memory access without allocations", "UI layouts", "SQL queries", "Networking"], "correct": 0},
        {"id": 73, "question": "Records in C# are best for:", "options": ["Immutable data models", "GUI forms", "Thread aborting", "GC tuning"], "correct": 0},
        {"id": 74, "question": "Pattern matching helps to:", "options": ["Simplify branching on types/values", "Allocate arrays", "Manage GC", "Handle DI"], "correct": 0},
        {"id": 75, "question": "What is Nullable Reference Types feature?", "options": ["Compiler warnings for null-safety", "Runtime null check", "GC tweak", "JIT hint"], "correct": 0},
        {"id": 76, "question": "What is the minimal API return type often used?", "options": ["IResult", "HttpResponse", "TaskOnly", "Void"], "correct": 0},
        {"id": 77, "question": "What does UseAuthorization require before it?", "options": ["UseAuthentication", "UseEndpoints", "UseStaticFiles", "UseSpa"], "correct": 0},
        {"id": 78, "question": "What is EF Core DbContext used for?", "options": ["Unit of work for data access", "Logging", "Routing", "Serialization"], "correct": 0},
        {"id": 79, "question": "Which is a lightweight micro ORM?", "options": ["Dapper", "Entity Framework Core", "NHibernate", "ADO.NET only"], "correct": 0},
        {"id": 80, "question": "What is the purpose of connection pooling?", "options": ["Reuse DB connections for performance", "Reuse UI threads", "Reuse files", "Reuse GC heaps"], "correct": 0},
    ]

    target = 80
    if len(questions_pool) < target:
        base = questions_pool.copy()
        while len(questions_pool) < target:
            clone = base[len(questions_pool) % len(base)].copy()
            clone["id"] = len(questions_pool) + 1
            questions_pool.append(clone)

    selected = random.sample(questions_pool, target)
    for idx, q in enumerate(selected):
        q["id"] = idx + 1

    return Response({
        "success": True,
        "data": selected
    })
