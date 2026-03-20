from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from .models import LeaveRequest, PythonQuestion, Choice, ExamAttempt, CodeSnippet, CodeTemplate, ExecutionSession, User
from .serializers import LeaveRequestSerializer, PythonQuestionSerializer, ExamAttemptSerializer, CodeSnippetSerializer, CodeTemplateSerializer, ExecutionSessionSerializer, UserSerializer
from datetime import datetime
import json

# ==================== LEAVE REQUEST API ====================

@api_view(['GET', 'POST'])
def leave_requests_api(request):
    """
    GET: Get all leave requests
    POST: Create new leave request
    """
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

@api_view(['PUT', 'DELETE'])
def leave_request_detail_api(request, pk):
    """
    PUT: Update leave request (approve/reject)
    DELETE: Delete leave request
    """
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

# ==================== PLAYGROUND API ====================

@api_view(['GET'])
def playground_api(request):
    """
    GET: Get playground data (languages, templates, snippets)
    """
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
    """
    GET: Get all code templates
    POST: Create new code template
    """
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

@api_view(['GET', 'POST'])
def code_snippets_api(request):
    """
    GET: Get all code snippets
    POST: Create new code snippet
    """
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

@api_view(['POST'])
def execute_code_api(request):
    """
    POST: Execute code and return result
    """
    try:
        code = request.data.get('code')
        language = request.data.get('language', 'python')
        
        # Create execution session
        session = ExecutionSession.objects.create(
            code=code,
            language=language,
            status='running'
        )
        
        # Simulate code execution (in real implementation, use actual code runner)
        if language.lower() == 'python':
            try:
                # Safe execution simulation
                exec_result = eval(code) if code.strip() else "Code executed successfully"
                output = str(exec_result)
                session.status = 'completed'
                session.error = None
            except Exception as e:
                output = None
                session.error = str(e)
                session.status = 'error'
        else:
            output = f"Code execution simulated for {language}"
            session.status = 'completed'
            session.error = None
        
        session.output = output
        session.save()
        
        return Response({
            'success': True,
            'data': {
                'output': output,
                'status': session.status,
                'error': session.error,
                'execution_time': session.execution_time
            }
        })
        
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# ==================== REPORTS API ====================

@api_view(['GET'])
def exam_reports_api(request):
    """
    GET: Get all exam reports
    """
    exam_attempts = ExamAttempt.objects.filter(exam_type='daily').order_by('-exam_date')
    serializer = ExamAttemptSerializer(exam_attempts, many=True)
    
    # Format data for frontend
    formatted_data = []
    for attempt in exam_attempts:
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
def exam_report_detail_api(request, pk):
    """
    GET: Get detailed exam report
    """
    try:
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
                'passed': attempt.marks_obtained >= (attempt.total_marks * 0.5)  # 50% pass criteria
            }
        })
        
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
def save_exam_report_api(request):
    """
    POST: Save new exam report.
    Does NOT require JWT auth — token can expire during a 45-min exam.
    User is resolved from the 'username' payload field.
    """
    try:
        data = request.data
        from django.utils import timezone

        # Resolve user — prefer authenticated session, otherwise look up by username
        user = None
        if request.user and request.user.is_authenticated:
            user = request.user
        elif data.get('username'):
            username = data['username'].strip()
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
        start_time = data.get('start_time') or now
        end_time   = data.get('end_time')   or now

        attempt = ExamAttempt.objects.create(
            user              = user,
            exam_title        = data.get('exam_title', 'Python Exam'),
            exam_type         = data.get('exam_type', 'daily'),
            score             = data.get('score', 0),
            total_questions   = data.get('total_questions', 20),
            correct_answers   = data.get('correct_answers', 0),
            incorrect_answers = data.get('incorrect_answers', 0),
            marks_obtained    = data.get('marks_obtained', 0),
            total_marks       = data.get('total_marks', 40),
            time_taken        = data.get('time_taken', 0),
            start_time        = start_time,
            end_time          = end_time,
            status            = data.get('status', 'completed'),
            random_id         = str(data.get('random_id', '')),
            answers_json      = json.dumps(data.get('answers', [])),
            questions_json    = json.dumps(data.get('questions', []))
        )

        return Response({
            'success': True,
            'message': 'Exam report saved successfully',
            'saved_username': user.username,
            'data': ExamAttemptSerializer(attempt).data
        }, status=status.HTTP_201_CREATED)

    except Exception as e:
        import traceback
        return Response({
            'success': False,
            'error': str(e),
            'trace': traceback.format_exc()
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['DELETE'])
def delete_exam_report_api(request, pk):
    """
    DELETE: Delete exam report
    """
    try:
        attempt = get_object_or_404(ExamAttempt, pk=pk)
        attempt.delete()
        return Response({
            'success': True,
            'message': 'Exam report deleted successfully'
        })
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

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
    """
    POST: User login
    """
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
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# ==================== LEADERBOARD API ====================

@api_view(['GET'])
def leaderboard_api(request):
    """
    GET: Get leaderboard - ranked by score (highest first), then by time_taken (fastest first)
    """
    try:
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
                'exam_date': attempt.exam_date.isoformat() if attempt.exam_date else None,
            })
            rank += 1

        return Response({
            'success': True,
            'data': leaderboard
        })

    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ==================== WEEKLY EXAM REPORTS API ====================

@api_view(['GET'])
def weekly_exam_reports_api(request):
    """
    GET: Get exam reports from the current week
    """
    try:
        from datetime import timedelta
        from django.utils import timezone

        today = timezone.now().date()
        start_of_week = today - timedelta(days=today.weekday())  # Monday
        end_of_week = start_of_week + timedelta(days=6)

        attempts = ExamAttempt.objects.filter(
            exam_date__date__gte=start_of_week,
            exam_date__date__lte=end_of_week,
            exam_type='weekly'
        ).order_by('-exam_date')

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

    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ==================== MONTHLY EXAM REPORTS API ====================

@api_view(['GET'])
def monthly_exam_reports_api(request):
    """
    GET: Get exam reports from the current month
    """
    try:
        from django.utils import timezone

        today = timezone.now()
        attempts = ExamAttempt.objects.filter(
            exam_date__year=today.year,
            exam_date__month=today.month,
            exam_type='monthly'
        ).order_by('-exam_date')

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

    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
