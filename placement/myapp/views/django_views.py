import random
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response


@api_view(["GET"])
@permission_classes([AllowAny])
def playground_questions_django_api(request):
    """
    Serve a 50-question Django assessment pool (2-mark MCQs).
    """
    questions_pool = [
        {"id": 1, "question": "What does Django’s MTV stand for?", "options": ["Model-Template-View", "Model-Test-View", "Module-Template-View", "Model-Template-Variable"], "correct": 0},
        {"id": 2, "question": "Which file contains global project settings?", "options": ["urls.py", "settings.py", "wsgi.py", "apps.py"], "correct": 1},
        {"id": 3, "question": "Default database shipped with Django is?", "options": ["PostgreSQL", "MySQL", "SQLite", "Oracle"], "correct": 2},
        {"id": 4, "question": "Which command creates a new Django project?", "options": ["django-admin startproject", "django-admin startapp", "manage.py runserver", "pip install django"], "correct": 0},
        {"id": 5, "question": "Which command creates a new Django app?", "options": ["manage.py startproject", "manage.py startapp", "manage.py runapp", "django-admin app"], "correct": 1},
        {"id": 6, "question": "Where do you map URLs to views?", "options": ["views.py", "models.py", "urls.py", "apps.py"], "correct": 2},
        {"id": 7, "question": "What does makemigrations do?", "options": ["Runs server", "Creates migration files based on models", "Applies migrations", "Creates superuser"], "correct": 1},
        {"id": 8, "question": "What does migrate do?", "options": ["Creates models", "Applies migrations to DB", "Runs tests", "Creates project"], "correct": 1},
        {"id": 9, "question": "Which class-based view lists objects?", "options": ["DetailView", "ListView", "CreateView", "TemplateView"], "correct": 1},
        {"id": 10, "question": "Which CBV displays a single object?", "options": ["DetailView", "ListView", "FormView", "RedirectView"], "correct": 0},
        {"id": 11, "question": "Which template tag loads static files?", "options": ["{% static %}", "{% load static %}", "{% asset %}", "{% files %}"], "correct": 1},
        {"id": 12, "question": "Where do you define model fields?", "options": ["forms.py", "models.py", "views.py", "admin.py"], "correct": 1},
        {"id": 13, "question": "Which field auto-adds timestamp on create?", "options": ["DateTimeField", "DateTimeField(auto_now=True)", "DateTimeField(auto_now_add=True)", "TimeField"], "correct": 2},
        {"id": 14, "question": "How to create a superuser?", "options": ["manage.py createsuper", "manage.py createsuperuser", "manage.py superuser", "manage.py admin"], "correct": 1},
        {"id": 15, "question": "Django template auto-escapes variables to prevent:", "options": ["SQL injection", "XSS", "CSRF", "CSRF and SQL"], "correct": 1},
        {"id": 16, "question": "Which middleware protects against CSRF?", "options": ["SessionMiddleware", "CsrfViewMiddleware", "AuthMiddleware", "CacheMiddleware"], "correct": 1},
        {"id": 17, "question": "Which decorator restricts view to logged-in users?", "options": ["@staff_required", "@login_required", "@authenticated", "@user_required"], "correct": 1},
        {"id": 18, "question": "How do you reference a URL by name in templates?", "options": ["{% url 'name' %}", "{% link 'name' %}", "{% route 'name' %}", "{% href 'name' %}"], "correct": 0},
        {"id": 19, "question": "Which setting defines static file URL prefix?", "options": ["STATIC_ROOT", "STATIC_URL", "MEDIA_URL", "STATIC_PATH"], "correct": 1},
        {"id": 20, "question": "Which file registers models for the admin site?", "options": ["models.py", "views.py", "admin.py", "apps.py"], "correct": 2},
        {"id": 21, "question": "How to perform ORM filter for case-insensitive contains?", "options": ["icontains", "contains", "iexact", "startswith"], "correct": 0},
        {"id": 22, "question": "Which class handles HTML forms easily?", "options": ["forms.Form", "models.Model", "views.View", "forms.Field"], "correct": 0},
        {"id": 23, "question": "ModelForm is used to:", "options": ["Render JSON", "Generate forms from models", "Handle migrations", "Serialize models"], "correct": 1},
        {"id": 24, "question": "What does select_related optimize?", "options": ["ManyToMany", "ForeignKey joins", "File uploads", "CSRF"], "correct": 1},
        {"id": 25, "question": "prefetch_related is best for:", "options": ["ForeignKey", "OneToOne", "ManyToMany and reverse relations", "File fields"], "correct": 2},
        {"id": 26, "question": "Which storage handles user-uploaded files?", "options": ["STATICFILES_STORAGE", "DEFAULT_FILE_STORAGE", "MEDIAFILES_STORAGE", "UPLOAD_STORAGE"], "correct": 1},
        {"id": 27, "question": "collectstatic command:", "options": ["Runs migrations", "Collects static files to STATIC_ROOT", "Creates superuser", "Backs up DB"], "correct": 1},
        {"id": 28, "question": "Django signals allow:", "options": ["Template inheritance", "Decoupled event callbacks", "Form validation", "URL routing"], "correct": 1},
        {"id": 29, "question": "Which signal fires after a model is saved?", "options": ["pre_save", "post_save", "post_init", "request_finished"], "correct": 1},
        {"id": 30, "question": "Which HTTP status code helper does HttpResponseNotFound return?", "options": ["200", "301", "404", "500"], "correct": 2},
        {"id": 31, "question": "Which setting configures allowed hosts?", "options": ["HOSTS", "ALLOWED_HOSTS", "SAFE_HOSTS", "HOST_LIST"], "correct": 1},
        {"id": 32, "question": "Django ORM method to update multiple rows efficiently:", "options": ["obj.save()", "QuerySet.update()", "bulk_create()", "create()"], "correct": 1},
        {"id": 33, "question": "To enforce database-level uniqueness across two fields you use:", "options": ["unique=True", "unique_together / UniqueConstraint", "primary_key=True", "db_index=True"], "correct": 1},
        {"id": 34, "question": "Which middleware compresses content for clients?", "options": ["GZipMiddleware", "SessionMiddleware", "CacheMiddleware", "CompressionMiddleware"], "correct": 0},
        {"id": 35, "question": "Which cache backend ships by default for development?", "options": ["Memcached", "Redis", "LocMemCache", "DatabaseCache"], "correct": 2},
        {"id": 36, "question": "How to mark a query as safe in templates (use carefully)?", "options": ["|raw", "|safe", "|escape", "|html"], "correct": 1},
        {"id": 37, "question": "Default template language in Django is:", "options": ["Jinja2", "Mako", "Django Template Language", "Mustache"], "correct": 2},
        {"id": 38, "question": "Which command runs the test suite?", "options": ["manage.py runtests", "manage.py test", "manage.py testrun", "manage.py pytest"], "correct": 1},
        {"id": 39, "question": "How do you reverse a URL in Python code?", "options": ["redirect()", "reverse()", "url()", "resolve()"], "correct": 1},
        {"id": 40, "question": "Which decorator caches an entire view?", "options": ["@cache_response", "@cache_page", "@cached_view", "@page_cache"], "correct": 1},
        {"id": 41, "question": "What does LOGIN_URL setting do?", "options": ["Sets admin URL", "Redirect target for @login_required", "Defines API base", "Sets static URL"], "correct": 1},
        {"id": 42, "question": "Which field stores JSON data natively?", "options": ["TextField", "JSONField", "BinaryField", "DictField"], "correct": 1},
        {"id": 43, "question": "How to create database migrations for model changes?", "options": ["manage.py makemigrations", "manage.py migrate --new", "manage.py syncdb", "manage.py create_migration"], "correct": 0},
        {"id": 44, "question": "Django Rest Framework provides:", "options": ["ORM replacement", "Serialization, auth, viewsets for APIs", "Template engines", "Static compilation"], "correct": 1},
        {"id": 45, "question": "What is a slug field used for?", "options": ["Storing binary", "URL-friendly text identifier", "Foreign key", "Session token"], "correct": 1},
        {"id": 46, "question": "Which class renders JSON in DRF by default?", "options": ["XMLRenderer", "JSONRenderer", "YAMLRenderer", "TemplateRenderer"], "correct": 1},
        {"id": 47, "question": "How to allow CORS in a Django API quickly?", "options": ["Enable CsrfViewMiddleware", "Use django-cors-headers middleware/settings", "Disable security", "Use template tags"], "correct": 1},
        {"id": 48, "question": "Which session engine stores data in signed cookies?", "options": ["cached_db", "file", "cookie", "cache"], "correct": 2},
        {"id": 49, "question": "How to paginate querysets in DRF generics?", "options": ["Set PAGE_SIZE/DEFAULT_PAGINATION_CLASS", "Loop manually", "Use Paginator only", "Add limit/offset to URL manually"], "correct": 0},
        {"id": 50, "question": "Which management command shows SQL for migrations without applying?", "options": ["showmigrations --plan", "sqlmigrate", "migrate --sql", "showsql"], "correct": 1},
    ]

    selected_questions = random.sample(questions_pool, 25)

    return Response({
        "success": True,
        "data": selected_questions
    })
