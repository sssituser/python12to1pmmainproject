from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from .models import LeaveRequest, PythonQuestion, Choice, ExamAttempt, CodeSnippet, CodeTemplate, ExecutionSession, User
from .serializers import LeaveRequestSerializer, PythonQuestionSerializer, ExamAttemptSerializer, CodeSnippetSerializer, CodeTemplateSerializer, ExecutionSessionSerializer
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
    exam_attempts = ExamAttempt.objects.all().order_by('-exam_date')
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
    POST: Save new exam report
    """
    try:
        data = request.data
        
        # Get or create user
        user = None
        if data.get('user_id'):
            user = User.objects.filter(id=data['user_id']).first()
        elif data.get('username'):
            user, created = User.objects.get_or_create(
                username=data['username'],
                defaults={'email': f"{data['username']}@example.com", 'password': 'default'}
            )
        
        # Create exam attempt
        attempt = ExamAttempt.objects.create(
            user=user,
            exam_title=data.get('exam_title', 'Python Exam'),
            score=data.get('score', 0),
            total_questions=data.get('total_questions', 20),
            correct_answers=data.get('correct_answers', 0),
            incorrect_answers=data.get('incorrect_answers', 0),
            marks_obtained=data.get('marks_obtained', 0),
            total_marks=data.get('total_marks', 40),
            time_taken=data.get('time_taken', 0),
            status=data.get('status', 'completed'),
            random_id=data.get('random_id'),
            answers_json=json.dumps(data.get('answers', [])),
            questions_json=json.dumps(data.get('questions', []))
        )
        
        return Response({
            'success': True,
            'message': 'Exam report saved successfully',
            'data': ExamAttemptSerializer(attempt).data
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
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
