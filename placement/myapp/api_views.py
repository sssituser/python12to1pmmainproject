from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework import status
from django.shortcuts import get_object_or_404
from .models import LeaveRequest, PythonQuestion, Choice, ExamAttempt, CodeSnippet, CodeTemplate, ExecutionSession, User, Job
from .serializers import LeaveRequestSerializer, PythonQuestionSerializer, ExamAttemptSerializer, CodeSnippetSerializer, CodeTemplateSerializer, ExecutionSessionSerializer, UserSerializer
from datetime import datetime
import json

# ==================== LEAVE REQUEST API ====================

@api_view(['GET', 'POST'])
def leave_requests_api(request):
    try:
        if request.method == 'GET':
            leave_requests = LeaveRequest.objects.all().order_by('-created_at')
            serializer = LeaveRequestSerializer(leave_requests, many=True)
            return Response({
                'success': True,
                'data': serializer.data
            })
        
        elif request.method == 'POST':
            serializer = LeaveRequestSerializer(data=request.data)
            if serializer.is_valid():
                serializer.save()
                return Response({
                    'success': True,
                    'message': 'Leave request created successfully',
                    'data': serializer.data
                }, status=status.HTTP_201_CREATED)
            return Response({
                'success': False,
                'errors': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({'success': False, 'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['PUT', 'DELETE'])
def leave_request_detail_api(request, pk):
    try:
        leave_request = get_object_or_404(LeaveRequest, pk=pk)
        
        if request.method == 'PUT':
            serializer = LeaveRequestSerializer(leave_request, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response({
                    'success': True,
                    'message': 'Leave request updated successfully',
                    'data': serializer.data
                })
            return Response({
                'success': False,
                'errors': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
        
        elif request.method == 'DELETE':
            leave_request.delete()
            return Response({
                'success': True,
                'message': 'Leave request deleted successfully'
            })
    except Exception as e:
        
        return Response({'success': False, 'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# ==================== PLAYGROUND API ====================

@api_view(['GET'])
def playground_api(request):
    languages = [
        {'name': 'Python', 'icon': '🐍', 'color': 'blue'},
        {'name': 'JavaScript', 'icon': '🟨', 'color': 'yellow'},
        {'name': 'Java', 'icon': '☕', 'color': 'orange'},
        {'name': 'C++', 'icon': '⚙️', 'color': 'purple'},
        {'name': 'HTML', 'icon': '🌐', 'color': 'green'},
        {'name': 'CSS', 'icon': '🎨', 'color': 'pink'}
    ]
    
    templates = CodeTemplate.objects.all()
    snippets = CodeSnippet.objects.all()
    
    return Response({
        'success': True,
        'data': {
            'languages': languages,
            'templates': CodeTemplateSerializer(templates, many=True).data,
            'snippets': CodeSnippetSerializer(snippets, many=True).data
        }
    })

@api_view(['GET', 'POST'])
def code_templates_api(request):
    try:
        if request.method == 'GET':
            templates = CodeTemplate.objects.all()
            serializer = CodeTemplateSerializer(templates, many=True)
            return Response({
                'success': True,
                'data': serializer.data
            })
        
        elif request.method == 'POST':
            serializer = CodeTemplateSerializer(data=request.data)
            if serializer.is_valid():
                serializer.save()
                return Response({
                    'success': True,
                    'message': 'Code template created successfully',
                    'data': serializer.data
                }, status=status.HTTP_201_CREATED)
            return Response({
                'success': False,
                'errors': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({'success': False, 'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET', 'POST'])
def code_snippets_api(request):
    try:
        if request.method == 'GET':
            snippets = CodeSnippet.objects.all()
            serializer = CodeSnippetSerializer(snippets, many=True)
            return Response({
                'success': True,
                'data': serializer.data
            })
        
        elif request.method == 'POST':
            serializer = CodeSnippetSerializer(data=request.data)
            if serializer.is_valid():
                serializer.save()
                return Response({
                    'success': True,
                    'message': 'Code snippet created successfully',
                    'data': serializer.data
                }, status=status.HTTP_201_CREATED)
            return Response({
                'success': False,
                'errors': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({'success': False, 'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
def execute_code_api(request):
    import subprocess
    import sys
    import os
    import tempfile

    code = request.data.get('code', '')
    language = request.data.get('language', 'python').lower()
    test_cases = request.data.get('test_cases', [])
    
    # Create execution session record
    import uuid
    session = ExecutionSession.objects.create(
        session_id=str(uuid.uuid4()),
        code=code,
        language=language,
        status='running'
    )
    
    output = ""
    error = None
    test_results = []

    try:
        if language == 'python':
            # Use a temporary file to run the code
            with tempfile.NamedTemporaryFile(suffix='.py', delete=False, mode='w') as f:
                f.write(code)
                temp_file = f.name
            
            try:
                # 1. Main execution to get output
                # We provide input='' to ensure it doesn't hang if it's waiting for input()
                process = subprocess.run(
                    [sys.executable, temp_file],
                    input='',
                    capture_output=True,
                    text=True,
                    timeout=5
                )
                output = process.stdout
                if process.stderr:
                    # If this is an EOFError and we're running test cases next, 
                    # don't show the scary traceback from the main pass
                    if "EOFError" in process.stderr and test_cases:
                        error = None
                    else:
                        error = process.stderr
                        # Scrub internal paths from traceback for cleaner student view
                        if temp_file in error:
                            error = error.replace(temp_file, "file.py")
                
                # 2. Run Test Cases
                for tc in test_cases:
                    inner_tc_input = tc.get('input', '')
                    expected_output = tc.get('output', '').strip()
                    
                    try:
                        tc_process = subprocess.run(
                            [sys.executable, temp_file],
                            input=inner_tc_input,
                            capture_output=True,
                            text=True,
                            timeout=2
                        )
                        actual_output = tc_process.stdout.strip()
                        passed = actual_output == expected_output
                        test_results.append({
                            'input': inner_tc_input,
                            'expected': expected_output,
                            'actual': actual_output,
                            'passed': passed
                        })
                    except subprocess.TimeoutExpired:
                        test_results.append({'passed': False, 'error': 'Timeout'})
                
                session.status = 'completed' if not error else 'error'
            finally:
                if os.path.exists(temp_file):
                    os.remove(temp_file)

        elif language in ['java', 'c']:
            # For now, simulate real execution for Java/C to avoid environment issues
            # In a production environment, we would use javac/gcc
            output = f"Simulated output for {language.upper()}\nCode received: {len(code)} chars"
            for tc in test_cases:
                test_results.append({
                    'input': tc.get('input', ''),
                    'expected': tc.get('output', ''),
                    'actual': tc.get('output', ''), # Mock pass
                    'passed': True
                })
            session.status = 'completed'
        else:
            error = f"Language {language} not supported yet."
            session.status = 'error'

    except subprocess.TimeoutExpired:
        error = "Execution timed out (5s limit)"
        session.status = 'error'
    except Exception as e:
        error = str(e)
        session.status = 'error'
    
    session.output = output
    session.error = error
    session.save()
    
    return Response({
        'success': True,
        'data': {
            'output': output,
            'status': session.status,
            'error': error,
            'test_results': test_results,
            'passed_count': len([tr for tr in test_results if tr.get('passed')]),
            'total_count': len(test_results)
        }
    })

# ==================== REPORTS API ====================

@api_view(['GET'])
@permission_classes([AllowAny])
def exam_reports_api(request):
    """
    GET: Get all exam reports for a user or all users (daily reports)
    """
    username = request.GET.get('username')
    exam_type = request.GET.get('exam_type', 'daily')
    
    attempts = ExamAttempt.objects.filter(exam_type=exam_type)
    
    if username:
        attempts = attempts.filter(user__username__iexact=username)
        
    attempts = attempts.order_by('-exam_date')
    
    formatted_data = []
    for attempt in attempts:
        formatted_data.append({
            'id': attempt.id,
            'user': {
                'username': attempt.user.username if attempt.user else 'Unknown',
                'randomId': attempt.random_id or 'N/A'
            },
            'examTitle': attempt.exam_title,
            'score': attempt.marks_obtained,
            'totalMarks': attempt.total_marks,
            'correctAnswers': attempt.correct_answers,
            'totalQuestions': attempt.total_questions,
            'status': attempt.status,
            'examDate': attempt.exam_date.isoformat() if attempt.exam_date else None,
            'timeTaken': attempt.time_taken,
            'percentage': round((attempt.marks_obtained / attempt.total_marks) * 100, 1) if attempt.total_marks > 0 else 0
        })

    return Response({
        'success': True,
        'data': formatted_data
    })

@api_view(['GET'])
@permission_classes([AllowAny])
def exam_report_detail_api(request, pk):
    """
    GET: Get detailed exam report
    """
    attempt = get_object_or_404(ExamAttempt, pk=pk)
    serializer = ExamAttemptSerializer(attempt)
    
    # Parse JSON data if exists
    questions_data = []
    answers_data = []
    
    if attempt.questions_json:
        try:
            questions_data = json.loads(attempt.questions_json)
        except:
            questions_data = []
    
    if attempt.answers_json:
        try:
            answers_data = json.loads(attempt.answers_json)
        except:
            answers_data = []
    
    return Response({
        'success': True,
        'data': {
            'attempt': serializer.data,
            'questions': questions_data,
            'answers': answers_data,
            'percentage': round((attempt.marks_obtained / attempt.total_marks) * 100, 1) if attempt.total_marks > 0 else 0,
            'passed': attempt.status == 'Pass'
        }
    })

@api_view(['POST'])
@permission_classes([AllowAny])
def save_exam_report_api(request):
    """
    POST: Save new exam report.
    Does NOT require JWT auth — token can expire during a 45-min exam.
    User is resolved from the 'username' payload field.
    """
    data = request.data
    from django.utils import timezone

    # Resolve user — prefer authenticated session, otherwise look up by username
    user = None
    if request.user and request.user.is_authenticated:
        user = request.user
    else:
        username = data.get('username')
        if not username and isinstance(data.get('user'), dict):
            username = data['user'].get('username')
        
        if username:
            username = username.strip()
            user = User.objects.filter(username__iexact=username).first()
            if not user:
                user, _ = User.objects.get_or_create(
                    username=username,
                    defaults={'email': f"{username}@example.com"}
                )

    if not user:
        return Response({
            'success': False,
            'error': 'Could not identify user. Please log in and try again.'
        }, status=status.HTTP_400_BAD_REQUEST)

    now = timezone.now()
    start_time = data.get('start_time') or data.get('startTime') or now
    end_time   = data.get('end_time')   or data.get('endTime') or now
    
    # safely extract random_id
    random_id_val = data.get('random_id') or data.get('randomId') or ''
    if not random_id_val and isinstance(data.get('user'), dict):
        random_id_val = data['user'].get('randomId') or data['user'].get('random_id') or ''

    # Determine pass/fail status from frontend calculation
    passed_input = data.get('passed')
    if passed_input is True:
        final_status = 'Pass'
    elif passed_input is False:
        final_status = 'Fail'
    else:
        final_status = data.get('status', 'completed')

    attempt = ExamAttempt.objects.create(
        user              = user,
        exam_title        = data.get('exam_title') or data.get('examTitle', 'Python Exam'),
        exam_type         = data.get('exam_type') or data.get('examType', 'daily'),
        score             = data.get('score', 0),
        total_questions   = data.get('total_questions') or data.get('totalQuestions', 20),
        correct_answers   = data.get('correct_answers') or data.get('correctAnswers', 0),
        incorrect_answers = data.get('incorrect_answers') or data.get('incorrectAnswers', 0),
        marks_obtained    = data.get('marks_obtained') or data.get('marks') or data.get('score', 0),
        total_marks       = data.get('total_marks') or data.get('totalMarks', 40),
        time_taken        = data.get('time_taken') or data.get('timeTaken', 0),
        start_time        = start_time,
        end_time          = end_time,
        status            = final_status,
        random_id         = str(random_id_val),
        answers_json      = json.dumps(data.get('answers', [])),
        questions_json    = json.dumps(data.get('questions', []))
    )

    return Response({
        'success': True,
        'message': 'Exam report saved successfully',
        'saved_username': user.username,
        'data': ExamAttemptSerializer(attempt).data
    }, status=status.HTTP_201_CREATED)

@api_view(['DELETE'])
def delete_exam_report_api(request, pk):
    """
    DELETE: Delete exam report
    """
    attempt = get_object_or_404(ExamAttempt, pk=pk)
    attempt.delete()
    return Response({
        'success': True,
        'message': 'Exam report deleted successfully'
    })

# ==================== EXAM QUESTIONS API ====================

@api_view(['GET'])
def exam_questions_api(request):
    """
    GET: Get exam questions for Python exam
    """
    questions = PythonQuestion.objects.filter(question_type='multiple_choice')[:20]
    serializer = PythonQuestionSerializer(questions, many=True)
    
    return Response({
        'success': True,
        'data': serializer.data
    })

# ==================== USERS API ====================

@api_view(['POST'])
def login_api(request):
    try:
        username = request.data.get('username')
        password = request.data.get('password')
        
        # Simple authentication (in real app, use Django auth)
        user, created = User.objects.get_or_create(
            username=username,
            defaults={'email': f"{username}@example.com", 'password': password}
        )
        
        # Generate random 4-digit ID
        import random
        random_id = f"{random.randint(1000, 9999)}"
        
        return Response({
            'success': True,
            'message': 'Login successful',
            'data': {
                'user': UserSerializer(user).data,
                'randomId': random_id,
                'token': f"token_{user.id}_{random_id}"  # Simple token
            }
        })
    except Exception as e:
        return Response({'success': False, 'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# ==================== LEADERBOARD API ====================

@api_view(['GET'])
@permission_classes([AllowAny])
def leaderboard_api(request):
    """
    GET: Get leaderboard - ranked by score (highest first), then by time_taken (fastest first)
    """
    date_filter = request.GET.get('date')
    exam_type_filter = request.GET.get('exam_type')
    
    attempts = ExamAttempt.objects.all()

    if date_filter:
        attempts = attempts.filter(exam_date__date=date_filter)
        
    if exam_type_filter:
        attempts = attempts.filter(exam_type=exam_type_filter)

    attempts = attempts.order_by('-marks_obtained', 'time_taken')

    leaderboard = []
    rank = 1
    for attempt in attempts:
        minutes = int(attempt.time_taken // 60) if attempt.time_taken else 0
        seconds = int(attempt.time_taken % 60) if attempt.time_taken else 0
        leaderboard.append({
            'rank': rank,
            'username': attempt.user.username if attempt.user else 'Unknown',
            'score': attempt.marks_obtained,
            'total_marks': attempt.total_marks,
            'time_taken': f"{minutes}m {seconds}s",
            'time_taken_seconds': attempt.time_taken or 0,
            'exam_title': attempt.exam_title,
            'exam_type': attempt.exam_type,
            'exam_date': attempt.exam_date.isoformat() if attempt.exam_date else None,
        })
        rank += 1

    return Response({
        'success': True,
        'data': leaderboard
    })


# ==================== WEEKLY EXAM REPORTS API ====================

@api_view(['GET'])
@permission_classes([AllowAny])
def weekly_exam_reports_api(request):
    """
    GET: Get exam reports from the current week
    """
    from datetime import timedelta
    from django.utils import timezone

    username = request.GET.get('username')
    now = timezone.now()
    start_of_week = now.replace(hour=0, minute=0, second=0, microsecond=0) - timedelta(days=now.weekday())

    attempts = ExamAttempt.objects.filter(
        exam_date__gte=start_of_week,
        exam_type='weekly'
    )
    
    if username:
        attempts = attempts.filter(user__username__iexact=username)
        
    attempts = attempts.order_by('-exam_date')

    formatted_data = []
    for attempt in attempts:
        formatted_data.append({
            'id': attempt.id,
            'user': {
                'username': attempt.user.username if attempt.user else 'Unknown',
                'randomId': attempt.random_id or 'N/A'
            },
            'examTitle': attempt.exam_title,
            'score': attempt.marks_obtained,
            'totalMarks': attempt.total_marks,
            'correctAnswers': attempt.correct_answers,
            'totalQuestions': attempt.total_questions,
            'status': attempt.status,
            'examDate': attempt.exam_date.isoformat() if attempt.exam_date else None,
            'timeTaken': attempt.time_taken,
            'percentage': round((attempt.marks_obtained / attempt.total_marks) * 100, 1) if attempt.total_marks > 0 else 0
        })

    return Response({
        'success': True,
        'data': formatted_data
    })


# ==================== MONTHLY EXAM REPORTS API ====================

@api_view(['GET'])
@permission_classes([AllowAny])
def monthly_exam_reports_api(request):
    """
    GET: Get exam reports from the current month
    """
    from django.utils import timezone

    username = request.GET.get('username')
    now = timezone.now()
    start_of_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

    attempts = ExamAttempt.objects.filter(
        exam_date__gte=start_of_month,
        exam_type='monthly'
    )
    
    if username:
        attempts = attempts.filter(user__username__iexact=username)
        
    attempts = attempts.order_by('-exam_date')

    formatted_data = []
    for attempt in attempts:
        formatted_data.append({
            'id': attempt.id,
            'user': {
                'username': attempt.user.username if attempt.user else 'Unknown',
                'randomId': attempt.random_id or 'N/A'
            },
            'examTitle': attempt.exam_title,
            'score': attempt.marks_obtained,
            'totalMarks': attempt.total_marks,
            'correctAnswers': attempt.correct_answers,
            'totalQuestions': attempt.total_questions,
            'status': attempt.status,
            'examDate': attempt.exam_date.isoformat() if attempt.exam_date else None,
            'timeTaken': attempt.time_taken,
            'percentage': round((attempt.marks_obtained / attempt.total_marks) * 100, 1) if attempt.total_marks > 0 else 0
        })

    return Response({
        'success': True,
        'data': formatted_data
    })

@api_view(['GET'])
@permission_classes([AllowAny])
def user_combined_results_api(request):
    """
    GET: Get all exam results for a specific user across all categories
    """
    username = request.GET.get('username')
    if not username:
         return Response({
            'success': False,
            'error': 'Username is required'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    attempts = ExamAttempt.objects.filter(user__username__iexact=username).order_by('-exam_date')
    
    formatted_data = []
    for attempt in attempts:
        formatted_data.append({
            'id': attempt.id,
            'user': {
                'username': attempt.user.username,
                'randomId': attempt.random_id or 'N/A',
                'email': attempt.user.email,
                'firstName': attempt.user.first_name or attempt.user.username
            },
            'examTitle': attempt.exam_title,
            'examType': attempt.exam_type,
            'score': attempt.marks_obtained,
            'totalMarks': attempt.total_marks,
            'correctAnswers': attempt.correct_answers,
            'incorrectAnswers': attempt.incorrect_answers,
            'totalQuestions': attempt.total_questions,
            'status': attempt.status,
            'examDate': attempt.exam_date.isoformat(),
            'timeTaken': attempt.time_taken,
            'answers': json.loads(attempt.answers_json) if attempt.answers_json else [],
            'questions': json.loads(attempt.questions_json) if attempt.questions_json else [],
            'percentage': round((attempt.marks_obtained / attempt.total_marks) * 100, 1) if attempt.total_marks > 0 else 0
        })
        
    return Response({
        'success': True,
        'data': formatted_data
    })

# ==================== PLAYGROUND STATIC QUESTIONS ====================

@api_view(['GET'])
@permission_classes([AllowAny])
def playground_questions_api(request):
    import random
    
    questions_pool = [
        {"id": 1, "question": "What is the output of print(2 ** 3)?", "options": ["6", "8", "9", "12"], "correct": 1},
        {"id": 2, "question": "Which keyword is used to define a function in Python?", "options": ["func", "def", "function", "define"], "correct": 1},
        {"id": 3, "question": "What is the correct file extension for Python files?", "options": [".py", ".python", ".pt", ".pyth"], "correct": 0},
        {"id": 4, "question": "Which of the following is a mutable data type in Python?", "options": ["Tuple", "String", "List", "Integer"], "correct": 2},
        {"id": 5, "question": "What does len() function do in Python?", "options": ["Returns the length of an object", "Deletes an object", "Creates an object", "Copies an object"], "correct": 0},
        {"id": 6, "question": "Which operator is used for exponentiation in Python?", "options": ["^", "**", "*", "^^"], "correct": 1},
        {"id": 7, "question": "What is the output of print(type('Hello'))?", "options": ["<class 'int'>", "<class 'str'>", "<class 'string'>", "<class 'char'>"], "correct": 1},
        {"id": 8, "question": "Which method is used to add an element to the end of a list?", "options": ["add()", "append()", "insert()", "extend()"], "correct": 1},
        {"id": 9, "question": "What is the correct way to create a dictionary in Python?", "options": ["{}", "[]", "()", "||"], "correct": 0},
        {"id": 10, "question": "Which statement is used to exit a loop in Python?", "options": ["exit", "break", "continue", "return"], "correct": 1},
        {"id": 11, "question": "What is the output of print(10 // 3)?", "options": ["3.33", "3", "4", "Error"], "correct": 1},
        {"id": 12, "question": "Which function is used to get input from user in Python 3?", "options": ["input()", "raw_input()", "scanf()", "cin()"], "correct": 0},
        {"id": 13, "question": "What is the default value of a parameter if not specified?", "options": ["0", "None", "null", "undefined"], "correct": 1},
        {"id": 14, "question": "Which module is used for mathematical operations in Python?", "options": ["math", "cmath", "maths", "calc"], "correct": 0},
        {"id": 15, "question": "What is the output of print(bool(0))?", "options": ["True", "False", "0", "Error"], "correct": 1},
        {"id": 16, "question": "Which method removes whitespace from both ends of a string?", "options": ["trim()", "strip()", "remove()", "clean()"], "correct": 1},
        {"id": 17, "question": "What is the output of print(range(5))?", "options": ["[0,1,2,3,4]", "range(0,5)", "0,1,2,3,4", "Error"], "correct": 1},
        {"id": 18, "question": "Which keyword is used to handle exceptions in Python?", "options": ["try", "except", "catch", "handle"], "correct": 1},
        {"id": 19, "question": "What is the output of print('Hello' * 3)?", "options": ["HelloHelloHello", "Hello 3", "Hello3", "Error"], "correct": 0},
        {"id": 20, "question": "Which function is used to open a file in Python?", "options": ["open()", "file()", "read()", "load()"], "correct": 0},
        {"id": 21, "question": "What is the purpose of the __init__ method in Python?", "options": ["Constructor", "Destructor", "Iterator", "Generator"], "correct": 0},
        {"id": 22, "question": "Which of the following is not a valid Python data type?", "options": ["int", "float", "char", "str"], "correct": 2},
        {"id": 23, "question": "What does the 'self' parameter represent in Python methods?", "options": ["Current instance", "Class name", "Method name", "Parent class"], "correct": 0},
        {"id": 24, "question": "Which method is used to find the index of an element in a list?", "options": ["index()", "find()", "search()", "locate()"], "correct": 0},
        {"id": 25, "question": "What is the output of print(2 + 3 * 2)?", "options": ["10", "12", "8", "7"], "correct": 0},
        {"id": 26, "question": "Which keyword is used to define a class in Python?", "options": ["class", "Class", "def", "define"], "correct": 0},
        {"id": 27, "question": "What is the output of print(len('Python'))?", "options": ["5", "6", "7", "Error"], "correct": 1},
        {"id": 28, "question": "Which method is used to sort a list in Python?", "options": ["sort()", "sorted()", "order()", "arrange()"], "correct": 0},
        {"id": 29, "question": "What is the output of print(3 ** 2 ** 1)?", "options": ["9", "27", "81", "3"], "correct": 0},
        {"id": 30, "question": "Which function is used to convert a string to uppercase?", "options": ["upper()", "uppercase()", "toUpper()", "toUpperCase()"], "correct": 0},
        {"id": 31, "question": "What is the output of print(bool([]))?", "options": ["True", "False", "[]", "Error"], "correct": 1},
        {"id": 32, "question": "Which operator is used for floor division in Python?", "options": ["//", "/", "%", "%%"], "correct": 0},
        {"id": 33, "question": "What is the output of print(type(5))?", "options": ["<class 'int'>", "<class 'float'>", "<class 'number'>", "<class 'digit'>"], "correct": 0},
        {"id": 34, "question": "Which method is used to remove the last element from a list?", "options": ["pop()", "remove()", "delete()", "del()"], "correct": 0},
        {"id": 35, "question": "What is the output of print('Hello'[-1])?", "options": ["o", "H", "Error", "Hello"], "correct": 0},
        {"id": 36, "question": "Which keyword is used to import modules in Python?", "options": ["import", "include", "require", "using"], "correct": 0},
        {"id": 37, "question": "What is the output of print(list((1,2,3)))?", "options": ["[1, 2, 3]", "(1, 2, 3)", "Error", "[1, 2, 3, ]"], "correct": 0},
        {"id": 38, "question": "Which method is used to join strings in a list?", "options": ["join()", "concat()", "merge()", "combine()"], "correct": 0},
        {"id": 39, "question": "What is the output of print(10 % 3)?", "options": ["1", "3", "0", "10"], "correct": 0},
        {"id": 40, "question": "Which function is used to get the type of a variable in Python?", "options": ["type()", "typeof()", "gettype()", "vartype()"], "correct": 0},
        {"id": 41, "question": "What is the difference between list and tuple in Python?", "options": ["List is mutable, tuple is immutable", "Tuple is mutable, list is immutable", "Both are mutable", "Both are immutable"], "correct": 0},
        {"id": 42, "question": "Which of the following is a built-in Python function?", "options": ["print()", "printf()", "cout()", "System.out.println()"], "correct": 0},
        {"id": 43, "question": "What is the output of print([1,2,3] + [4,5,6])?", "options": ["[1, 2, 3, 4, 5, 6]", "[1, 2, 3, [4, 5, 6]]", "Error", "[1, 2, 3] + [4, 5, 6]"], "correct": 0},
        {"id": 44, "question": "Which method is used to copy a list in Python?", "options": ["copy()", "clone()", "duplicate()", "replicate()"], "correct": 0},
        {"id": 45, "question": "What is the output of print(dict(zip(['a','b'],[1,2])))?", "options": ["{'a': 1, 'b': 2}", "{'a': 1, 'b': 2, }", "Error", "{'a': 1, 'b': 2}"], "correct": 0},
        {"id": 46, "question": "Which of the following is a valid Python variable name?", "options": ["my_var", "2var", "var-name", "class"], "correct": 0},
        {"id": 47, "question": "What is the output of print(set([1,2,2,3,3]))?", "options": ["{1, 2, 3}", "{1, 2, 2, 3, 3}", "[1, 2, 3]", "Error"], "correct": 0},
        {"id": 48, "question": "Which method is used to add elements to a set?", "options": ["add()", "append()", "insert()", "push()"], "correct": 0},
        {"id": 49, "question": "What is the output of print('Python'[2:5])?", "options": ["tho", "th", "hon", "hon"], "correct": 0},
        {"id": 50, "question": "Which keyword is used to define a generator function?", "options": ["yield", "return", "generate", "gen"], "correct": 0},
    ]

    selected_questions = random.sample(questions_pool, 20)
    
    return Response({
        'success': True,
        'data': selected_questions
    })

# ==================== EXAM MANAGER CUSTOM SETTINGS ====================

import os

_BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SETTINGS_FILE = os.path.join(_BASE_DIR, 'exam_settings.json')

@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
def exam_settings_api(request):
    """
    GET: Retrieve custom exam settings and questions for a category (e.g. ?category=Weekly)
    POST: Save new settings and questions array to file.
    """
    if request.method == 'GET':
        if os.path.exists(SETTINGS_FILE):
            with open(SETTINGS_FILE, 'r', encoding='utf-8') as f:
                data = json.load(f)
        else:
            data = {}
            
        category = request.GET.get('category')
        if category:
            # Return specific category config
            return Response({'success': True, 'data': data.get(category, {'maxQuestions': 50, 'questions': []})})
            
        return Response({'success': True, 'data': data})

    elif request.method == 'POST':
        existing_data = {}
        if os.path.exists(SETTINGS_FILE):
            with open(SETTINGS_FILE, 'r', encoding='utf-8') as f:
                content = f.read().strip()
                if content:
                    existing_data = json.loads(content)
            
        category = request.data.get('category', 'Weekly')
        new_questions = request.data.get('questions', None)
        new_max = request.data.get('maxQuestions', None)
        new_rule = request.data.get('passingRule', None)
        new_val = request.data.get('passingValue', None)
        new_duration = request.data.get('duration', None)

        # Get existing category data to merge into
        existing_category = existing_data.get(category, {'maxQuestions': 50, 'questions': [], 'passingRule': 'percentage', 'passingValue': 50, 'duration': 45})

        # Only overwrite fields if explicitly sent
        if new_max is not None:
            existing_category['maxQuestions'] = int(new_max)
        
        if new_rule is not None:
            existing_category['passingRule'] = str(new_rule)
            
        if new_val is not None:
            existing_category['passingValue'] = int(new_val)
            
        if new_duration is not None:
            existing_category['duration'] = int(new_duration)

        # Only overwrite questions if a non-None list was sent
        if new_questions is not None:
            existing_category['questions'] = new_questions

        existing_data[category] = existing_category
        
        with open(SETTINGS_FILE, 'w', encoding='utf-8') as f:
            json.dump(existing_data, f, indent=4)
            
        return Response({'success': True, 'message': f'{category} Settings saved successfully!'})

from rest_framework.decorators import  permission_classes
from rest_framework.permissions import IsAuthenticated

from .models import User, Job, AppliedJob


@api_view(['GET'])
@permission_classes([AllowAny])
def dashboard_stats_api(request):
    """
    Consolidated statistics for the faculty dashboard.
    """
    try:
        total_students = User.objects.filter(is_staff=False).count()
        placed_students = AppliedJob.objects.values('user').distinct().count()
        active_jobs = Job.objects.count()
        pending_leaves = LeaveRequest.objects.filter(status='Pending').count()
        
        return Response({
            "total_students": total_students,
            "placed_students": placed_students,
            "active_jobs": active_jobs,
            "pending_reviews": pending_leaves
        })
    except Exception as e:
        return Response({'success': False, 'message': str(e)}, status=500)

# ---------------- STUDENT STATS (FACULTY) ----------------
@api_view(['GET'])
def student_stats_api(request):
    try:
        students = User.objects.filter(is_staff=False)
        data = []
        
        for student in students:
            # Get latest exam result to derive status/progress
            latest = ExamAttempt.objects.filter(user=student).order_by('-exam_date').first()
            status_val = "Inactive"
            progress = 0
            
            if latest:
                status_val = latest.status
                progress = round((latest.marks_obtained / latest.total_marks) * 100) if latest.total_marks > 0 else 0
                
            data.append({
                "id": student.id,
                "name": student.username,
                "status": status_val,
                "progress": progress
            })
            
        return Response(data)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
