from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
import importlib
import logging

logger = logging.getLogger(__name__)

@api_view(['GET'])
@permission_classes([AllowAny])
def playground_questions_dispatcher(request, subject):
    """
    Dynamic dispatcher to route playground question requests to their specific subject views.
    Matches requests for /api/playground-questions/<subject>/
    """
    subject = subject.lower().strip()
    
    # Clean subject name: replace spaces/hyphens with underscores
    key = subject.replace(' ', '_').replace('-', '_')
    
    # Comprehensive subject mapping based on available view files and function names
    subject_map = {
        # Agentic AI & AI
        'agentic_ai_claude': 'agentic_ai_claude',
        'agentic_ai_gpt': 'agentic_ai_gpt',
        'generative_ai': 'generativeai',
        'ai_concepts': 'aiconcepts',
        'machine_learning': 'ml',
        'ml': 'ml',
        'deep_learning': 'deep_learning',
        
        # Languages & Frameworks
        'python': 'python',
        'java': 'java',
        'javascript': 'javascript',
        'js': 'javascript',
        'react': 'react',
        'django': 'django',
        'restframework': 'django', # Mapping REST Framework to Django views as fallback
        'rest_framework': 'django',
        'cpp': 'oopscpp',
        'oops_cpp': 'oopscpp',
        'c_sharp': 'c_sharp',
        'c#': 'c_sharp',
        'dotnet': 'dotnet',
        'dotnet_mvc': 'dotnet_mvc',
        'asp_net': 'asp_net_mvc',
        'asp_net_mvc': 'asp_net_mvc',
        'node': 'nodejs',
        'nodejs': 'nodejs',
        'express': 'expressjs',
        'expressjs': 'expressjs',
        'flutter': 'flutterreactnative',
        'react_native': 'flutterreactnative',
        'android': 'android',
        'ios': 'iosswift',
        'swift': 'iosswift',
        
        # Web & UI
        'web_ui': 'ui',
        'ui': 'ui',
        'backend': 'backend',
        'html': 'html',
        'css': 'css',
        'bootstrap': 'bootstrap',
        'web_apis': 'webapis',
        
        # Cloud & DevOps
        'azure': 'azure',
        'microsoft_azure': 'azure',
        'gcp': 'gcp',
        'google_cloud': 'gcp',
        'aws': 'ec2s3',
        'ec2': 'ec2s3',
        's3': 'ec2s3',
        'ec2_s3': 'ec2s3',
        'iam': 'iam',
        'docker': 'docker',
        'kubernetes': 'k8sbasics',
        'kubernetes_basics': 'k8sbasics',
        'k8s': 'k8sbasics',
        'deployment': 'deployment',
        'ci_cd': 'cicd',
        'git': 'gitgithub',
        'github': 'gitgithub',
        'git_github': 'gitgithub',
        'cloud_basics': 'cloudbasics',
        
        # Data & Databases
        'oracle': 'oracle',
        'mongodb': 'mongodb',
        'mongo_db': 'mongodb',
        'database_basics': 'dbbasics',
        'db_basics': 'dbbasics',
        'pandas': 'pandas',
        'numpy': 'numpy',
        'da_science': 'py_datascience',
        'python_data_science': 'py_datascience',
        'jdbc': 'jdbc',
        'hibernate': 'hibernate',
        'dax': 'dax',
        'power_query': 'power_query',
        'etl_pipelines': 'etlpipes',
        'big_data': 'bigdatatools',
        'big_data_tools': 'bigdatatools',
        'datamodeling': 'datamodeling',
        
        # Cyber Security & Blockchain
        'penetration_testing': 'penetrationtesting',
        'ethical_hacking': 'ethicalhacking',
        'network_security': 'networksecurity',
        'smart_contracts': 'smartcontracts',
        'web3': 'web3',
        'ethereum': 'ethereum',
        
        # Office & Business
        'ms_word': 'msword',
        'ms_office': 'msoffice',
        'excel': 'excel',
        'powerpoint': 'powerpoint',
        
        # Testing & QA
        'qa': 'qaprocesses',
        'qa_processes': 'qaprocesses',
        'selenium': 'selenium',
        'api_testing': 'apitesting',
        
        # General
        'programming_basics': 'probasics',
        'pro_basics': 'probasics',
        'computer_fundamentals': 'computer_fundamentals',
        'dashboards': 'dashboards',
        'data_handling': 'data_handling',
        'data_modeling': 'data_modeling',
        'data_visualization': 'data_visualization',
        'virtual_reality': 'virtualreality',
        'augmented_reality': 'augmentedreality',
        'c_data_structures': 'c_data_structures',
        'springboot': 'springboot',
        'spring_boot': 'springboot',
    }
    
    # 1. Normalize and resolve the internal key
    if key in subject_map:
        key = subject_map[key]
    
    # 2. Hardened logic for specialized topics
    if key == 'microsoft_azure': key = 'azure'
    if key == 'git_github': key = 'gitgithub'

    # Construct the expected function name: playground_questions_<subject>_api
    func_name = f"playground_questions_{key}_api"
    
    
    # 🛡️ 1000% UNIVERSAL DYNAMIC RESOLVER
    # If no static view exists, we search the database for a matching Exam pool.
    from myapp.models import Exam, MCQQuestion
    db_exams = Exam.objects.filter(title__icontains=subject)
    if db_exams.exists():
        exam = db_exams.first()
        mcqs = MCQQuestion.objects.filter(exam=exam)
        if mcqs.exists():
            data = []
            for q in mcqs:
                data.append({
                    "id": q.id,
                    "question": q.question_text,
                    "options": [q.option_a, q.option_b, q.option_c, q.option_d],
                    "correct": ['A','B','C','D'].index(q.correct_option)
                })
            return Response({"success": True, "data": data})

    
    import types
    try:
        from myapp import views
        view_attrs = dir(views)
        
        # Priority 1: Check if func_name exists directly in views (from * imports)
        for attr in view_attrs:
            # Fuzzy match: ignore case and underscores
            if attr.lower().replace('_', '') == func_name.lower().replace('_', ''):
                func = getattr(views, attr)
                return func(request._request)

        # Priority 2: Deep scan all modules in views for the function
        for attr in view_attrs:
            mod_or_item = getattr(views, attr)
            if isinstance(mod_or_item, types.ModuleType):
                # Look inside this submodule
                for sub_attr in dir(mod_or_item):
                    # Fuzzy match: ignore case and underscores
                    if sub_attr.lower().replace('_', '') == func_name.lower().replace('_', ''):
                        func = getattr(mod_or_item, sub_attr)
                        return func(request._request)
                    
                    # Also try to match the subject key directly without 'playground_questions_' prefix if search fails
                    # But the standard is playground_questions_<subject>_api
                    if sub_attr.lower().replace('_', '') == f"playgroundquestions{key.replace('_', '')}api":
                         func = getattr(mod_or_item, sub_attr)
                         return func(request._request)
        
        # 3. Special handling for python which might be named playground_questions_api
        if key == 'python':
            from myapp.views import python_views
            if hasattr(python_views, 'playground_questions_api'):
                return python_views.playground_questions_api(request._request)
            if hasattr(python_views, 'playground_questions_python_api'):
                return python_views.playground_questions_python_api(request._request)

        # 4. Fallback: try to import the module if it exists but wasn't in __init__
        try:
            module_name = f"myapp.views.{key}_views"
            mod = importlib.import_module(module_name)
            if hasattr(mod, func_name):
                func = getattr(mod, func_name)
                return func(request._request)
        except ImportError:
            pass

        return Response({
            "success": True,
            "data": [],
            "message": f"Proceeding with dynamic conceptual generation for {subject}."
        }, status=status.HTTP_200_OK)

    except Exception as e:
        logger.error(f"Dispatcher error for subject {subject}: {str(e)}")
        return Response({
            "success": False,
            "error": str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
