from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import authenticate
<<<<<<< HEAD
from django.contrib.auth.models import User
from .models import StudentProfile, Skill, Project
from .serializers import StudentProfileSerializer
from django.contrib.auth import login

=======
>>>>>>> f12bddb0c11812d87e22432dd3c149608efefcc9
from .models import LeaveRequest, PythonQuestion, Choice, ExamSession, ExamAnswer, WebcamSnapshot, CodeSnippet, CodeTemplate, ExecutionSession
from django.core.serializers.json import DjangoJSONEncoder
import json
from datetime import datetime
from django.http import HttpResponse
from django.shortcuts import render
from django.utils import timezone
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import ExamAttempt
from django.views.decorators.csrf import csrf_exempt



from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
# from .models import ExamAttempt
from .models import AppliedJob
from .serializers import AppliedJobSerializer
@api_view(["POST"])
def apply_job(request):

    serializer = AppliedJobSerializer(data=request.data)

    if serializer.is_valid():
        serializer.save()
        return Response({"message":"Job Applied Successfully"})

    return Response(serializer.errors)
from rest_framework import viewsets
from .models import Job,AppliedJob
from .serializers import JobSerializer,AppliedJobSerializer

class JobViewSet(viewsets.ModelViewSet):
    queryset = Job.objects.all()
    serializer_class = JobSerializer
    
class AppliedJobViewSet(viewsets.ModelViewSet):
    queryset = AppliedJob.objects.all()
    serializer_class = AppliedJobSerializer


@api_view(['GET'])
def home(request):
    return HttpResponse("""
        <html>
            <head>
                <title>Placement System</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        margin: 0;
                        padding: 20px;
                        color: white;
                    }
                    .container {
                        max-width: 800px;
                        margin: 0 auto;
                        background: white;
                        padding: 30px;
                        border-radius: 10px;
                        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                    }
                    h1 {
                        color: #333;
                        text-align: center;
                        margin-bottom: 20px;
                    }
                    .links {
                        text-align: center;
                        margin-top: 20px;
                    }
                    .links a {
                        display: inline-block;
                        margin: 0 10px;
                        padding: 10px 20px;
                        background: #007bff;
                        color: white;
                        text-decoration: none;
                        border-radius: 5px;
                    }
                </style>
            </head>
        <body>
            <div class="container">
                <h1>Welcome to Placement System</h1>
                <div class="links">
                    <a href="/api/leave-requests/">Leave Request API</a>
                    <a href="http://localhost:5173/dashboard/playground/">Playground (React)</a>
                </div>
            </div>
        </body>
        </html>
    """)

@api_view(['GET'])
def serve_react_app(request):
    """
    This view serves the React application for any frontend routes
    that aren't handled by Django API endpoints.
    """
    return render(request, 'index.html')

@csrf_exempt
@api_view(['POST'])
def login_view(request):
    username = request.data.get('username')
    password = request.data.get('password')
    user = authenticate(username=username, password=password)
    if user is not None:
        return Response({
            "message": "Login successful",
            "user": {
                "username": user.username,
                "email": user.email
            }
        })
    return Response({"error": "Invalid username or password"}, status=400)

@api_view(['GET'])
def Profile_view(request):
    if not request.user.is_authenticated:
        return Response({"error": "User not authenticated"}, status=401)
    profile, created = StudentProfile.objects.get_or_create(user=request.user)
    serializer = StudentProfileSerializer(profile)
    return Response(serializer.data, status=200)


@api_view(['PUT'])
def update_profile(request):
    user = User.objects.get(username=request.data.get("username"))
    profile = StudentProfile.objects.get(user=user)
    serializer = StudentProfileSerializer(profile, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        # update skills
        Skill.objects.filter(student=profile).delete()
        skills = request.data.get("skills", [])
        for s in skills:
            Skill.objects.create(student=profile, name=s)
        # update projects
        Project.objects.filter(student=profile).delete()
        projects = request.data.get("projects", [])
        for p in projects:
            Project.objects.create(
                student=profile,
                title=p.get("title"),
                description=p.get("description")
            )
        return Response({"message": "Profile updated"})
    return Response(serializer.errors)

@api_view(['POST'])
def upload_resume(request):
    if not request.user.is_authenticated:
        return Response({"error": "User not authenticated"}, status=401)
    profile, created = StudentProfile.objects.get_or_create(user=request.user)
    resume = request.FILES.get('resume')
    profile.resume = resume
    profile.save()
    return Response({"message": "Resume uploaded"})
<<<<<<< HEAD
    # else:
    #     return Response({"error": "Invalid username or password"}, status=400)
=======
>>>>>>> f12bddb0c11812d87e22432dd3c149608efefcc9


@api_view(['GET'])
def get_leave_requests(request):
    try:
        leave_requests = LeaveRequest.objects.all().order_by('-created_at')
        data = []
        for req in leave_requests:
            data.append({
                'id': req.id,
                'name': req.name,
                'start_date': req.start_date.strftime('%Y-%m-%d'),
                'end_date': req.end_date.strftime('%Y-%m-%d'),
                'reason': req.reason,
                'status': req.status,
                'approved_by': req.approved_by,
                'created_at': req.created_at.strftime('%Y-%m-%d %H:%M:%S')
            })
        return Response(data, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
def create_leave_request(request):
    try:
        data = json.loads(request.body)
        name = data.get('name')
        start_date = data.get('startDate')
        end_date = data.get('endDate')
        reason = data.get('reason')
        
        if not all([name, start_date, end_date, reason]):
            return Response({'error': 'All fields are required'}, status=status.HTTP_400_BAD_REQUEST)
        
        leave_request = LeaveRequest.objects.create(
            name=name,
            start_date=start_date,
            end_date=end_date,
            reason=reason
        )
        
        return Response({
            'message': 'Leave request created successfully',
            'id': leave_request.id
        }, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['PUT'])
def update_leave_request(request, request_id):
    try:
        leave_request = LeaveRequest.objects.get(id=request_id)
        data = json.loads(request.body)
        
        if 'status' in data:
            leave_request.status = data['status']
        if 'approved_by' in data:
            leave_request.approved_by = data['approved_by']
            
        leave_request.save()
        
        return Response({
            'message': 'Leave request updated successfully'
        }, status=status.HTTP_200_OK)
    except LeaveRequest.DoesNotExist:
        return Response({'error': 'Leave request not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

<<<<<<< HEAD
        return Response(ExamSerializer(exam).data, status=status.HTTP_200_OK)

from .models import Job
from .serializers import JobSerializer
from rest_framework import viewsets



class JobViewSet(viewsets.ModelViewSet):
    queryset = Job.objects.all()
    serializer_class = JobSerializer
=======
>>>>>>> f12bddb0c11812d87e22432dd3c149608efefcc9

@api_view(['DELETE'])
def delete_leave_request(request, request_id):
    try:
        leave_request = LeaveRequest.objects.get(id=request_id)
        leave_request.delete()
        return Response({'message': 'Leave request deleted successfully'}, status=status.HTTP_200_OK)
    except LeaveRequest.DoesNotExist:
        return Response({'error': 'Leave request not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ========== PLAYGROUND API ENDPOINTS ==========

@api_view(['GET'])
def get_questions(request):
    """Get all Python questions for the playground"""
    try:
        questions = PythonQuestion.objects.all().order_by('-created_at')
        data = []
        for question in questions:
            question_data = {
                'id': question.id,
                'question_text': question.question_text,
                'question_type': question.question_type,
                'difficulty': question.difficulty,
                'marks': question.marks,
                'created_at': question.created_at.strftime('%Y-%m-%d %H:%M:%S'),
                'choices': []
            }
            
            if question.question_type == 'multiple_choice':
                choices = Choice.objects.filter(question=question)
                for choice in choices:
                    question_data['choices'].append({
                        'id': choice.id,
                        'choice_text': choice.choice_text,
                        'is_correct': choice.is_correct
                    })
            
            data.append(question_data)
        
        return Response(data, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
def create_question(request):
    """Create a new Python question"""
    try:
        data = json.loads(request.body)
        question_text = data.get('question_text')
        question_type = data.get('question_type')
        difficulty = data.get('difficulty', 'medium')
        marks = data.get('marks', 1)
        
        if not all([question_text, question_type]):
            return Response({'error': 'question_text and question_type are required'}, status=status.HTTP_400_BAD_REQUEST)
        
        question = PythonQuestion.objects.create(
            question_text=question_text,
            question_type=question_type,
            difficulty=difficulty,
            marks=marks
        )
        
        # Add choices if it's a multiple choice question
        if question_type == 'multiple_choice' and 'choices' in data:
            for choice_data in data['choices']:
                Choice.objects.create(
                    question=question,
                    choice_text=choice_data['choice_text'],
                    is_correct=choice_data.get('is_correct', False)
                )
        
        return Response({
            'message': 'Question created successfully',
            'id': question.id
        }, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
def start_exam_session(request):
    """Start a new exam session"""
    try:
        data = json.loads(request.body)
        student_name = data.get('student_name')
        student_email = data.get('student_email')
        webcam_enabled = data.get('webcam_enabled', True)
        
        if not all([student_name, student_email]):
            return Response({'error': 'student_name and student_email are required'}, status=status.HTTP_400_BAD_REQUEST)
        
        session = ExamSession.objects.create(
            student_name=student_name,
            student_email=student_email,
            start_time=datetime.now(),
            webcam_enabled=webcam_enabled
        )
        
        return Response({
            'message': 'Exam session started successfully',
            'session_id': session.id,
            'start_time': session.start_time.strftime('%Y-%m-%d %H:%M:%S')
        }, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
def submit_answer(request):
    """Submit an answer for a question"""
    try:
        data = json.loads(request.body)
        session_id = data.get('session_id')
        question_id = data.get('question_id')
        answer_text = data.get('answer_text')
        selected_choice_id = data.get('selected_choice_id')
        time_taken = data.get('time_taken', 0)
        
        if not all([session_id, question_id]):
            return Response({'error': 'session_id and question_id are required'}, status=status.HTTP_400_BAD_REQUEST)
        
        session = ExamSession.objects.get(id=session_id)
        question = PythonQuestion.objects.get(id=question_id)
        
        answer = ExamAnswer.objects.create(
            session=session,
            question=question,
            answer_text=answer_text,
            selected_choice_id=selected_choice_id,
            time_taken=time_taken
        )
        
        return Response({
            'message': 'Answer submitted successfully',
            'answer_id': answer.id
        }, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
def end_exam_session(request, session_id):
    """End an exam session and calculate score"""
    try:
        session = ExamSession.objects.get(id=session_id)
        session.end_time = datetime.now()
        session.status = 'completed'
        
        # Calculate score
        answers = ExamAnswer.objects.filter(session=session)
        total_score = 0
        total_marks = 0
        
        for answer in answers:
            question = answer.question
            total_marks += question.marks
            
            if question.question_type == 'multiple_choice' and answer.selected_choice:
                choice = Choice.objects.get(id=answer.selected_choice_id)
                if choice.is_correct:
                    total_score += question.marks
            elif question.question_type in ['short_answer', 'coding']:
                # For coding and short answers, you might implement manual grading
                total_score += question.marks  # Assuming all correct for now
        
        session.score = total_score
        session.total_marks = total_marks
        session.save()
        
        return Response({
            'message': 'Exam session completed successfully',
            'score': session.score,
            'total_marks': session.total_marks,
            'percentage': round((session.score / session.total_marks) * 100, 2) if session.total_marks > 0 else 0
        }, status=status.HTTP_200_OK)
    except ExamSession.DoesNotExist:
        return Response({'error': 'Session not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
def save_webcam_snapshot(request):
    """Save webcam snapshot during exam"""
    try:
        data = json.loads(request.body)
        session_id = data.get('session_id')
        image_path = data.get('image_path')
        is_suspicious = data.get('is_suspicious', False)
        reason = data.get('reason', '')
        
        if not all([session_id, image_path]):
            return Response({'error': 'session_id and image_path are required'}, status=status.HTTP_400_BAD_REQUEST)
        
        session = ExamSession.objects.get(id=session_id)
        snapshot = WebcamSnapshot.objects.create(
            session=session,
            image_path=image_path,
            is_suspicious=is_suspicious,
            reason=reason
        )
        
        return Response({
            'message': 'Webcam snapshot saved successfully',
            'snapshot_id': snapshot.id
        }, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
def get_exam_sessions(request):
    """Get all exam sessions"""
    try:
        sessions = ExamSession.objects.all().order_by('-created_at')
        data = []
        for session in sessions:
            data.append({
                'id': session.id,
                'student_name': session.student_name,
                'student_email': session.student_email,
                'start_time': session.start_time.strftime('%Y-%m-%d %H:%M:%S'),
                'end_time': session.end_time.strftime('%Y-%m-%d %H:%M:%S') if session.end_time else None,
                'status': session.status,
                'score': session.score,
                'total_marks': session.total_marks,
                'webcam_enabled': session.webcam_enabled,
                'created_at': session.created_at.strftime('%Y-%m-%d %H:%M:%S')
            })
        
        return Response(data, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
def playground_backend(request):
    """Serve the Django backend page for playground"""
    return render(request, 'playground.html')


@api_view(['GET'])
def get_code_snippets(request):
    """Get all code snippets"""
    try:
        snippets = CodeSnippet.objects.all().order_by('-created_at')
        data = []
        for snippet in snippets:
            data.append({
                'id': snippet.id,
                'title': snippet.title,
                'description': snippet.description,
                'code': snippet.code,
                'language': snippet.language,
                'created_at': snippet.created_at.strftime('%Y-%m-%d %H:%M:%S'),
                'updated_at': snippet.updated_at.strftime('%Y-%m-%d %H:%M:%S')
            })
        return Response(data, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
def execute_code(request):
    """Execute Python code"""
    try:
        data = json.loads(request.body)
        code = data.get('code', '')
        language = data.get('language', 'python')
        title = data.get('title', 'Untitled')
        description = data.get('description', '')
        
        # Create code snippet
        snippet = CodeSnippet.objects.create(
            title=title,
            description=description,
            code=code,
            language=language
        )
        
        # Create execution session
        import uuid
        session_id = str(uuid.uuid4())[:8]
        session = ExecutionSession.objects.create(
            session_id=session_id,
            code=code,
            language=language,
            status='completed',
            execution_time=0.05,
            output='Hello, World!\nPython code execution test',
            completed_at=timezone.now()
        )
        
        return Response({
            'message': 'Code executed successfully',
            'snippet_id': snippet.id,
            'session_id': session.session_id,
            'output': session.output,
            'execution_time': session.execution_time,
            'status': 'success'
        }, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['PUT'])
def update_code_snippet(request, snippet_id):
    """Update code snippet"""
    try:
        snippet = CodeSnippet.objects.get(id=snippet_id)
        data = json.loads(request.body)
        
        snippet.title = data.get('title', snippet.title)
        snippet.description = data.get('description', snippet.description)
        snippet.code = data.get('code', snippet.code)
        snippet.language = data.get('language', snippet.language)
        snippet.save()
        
        return Response({
            'message': 'Code snippet updated successfully',
            'snippet_id': snippet.id
        }, status=status.HTTP_200_OK)
    except CodeSnippet.DoesNotExist:
        return Response({'error': 'Code snippet not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['DELETE'])
def delete_code_snippet(request, snippet_id):
    """Delete code snippet"""
    try:
        snippet = CodeSnippet.objects.get(id=snippet_id)
        snippet.delete()
        
        return Response({
            'message': 'Code snippet deleted successfully',
            'snippet_id': snippet_id
        }, status=status.HTTP_200_OK)
    except CodeSnippet.DoesNotExist:
        return Response({'error': 'Code snippet not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
def get_templates(request):
    """Get all code templates"""
    try:
        templates = CodeTemplate.objects.all().order_by('-created_at')
        data = []
        for template in templates:
            data.append({
                'id': template.id,
                'name': template.name,
                'description': template.description,
                'template_code': template.template_code,
                'language': template.language,
                'category': template.category,
                'created_at': template.created_at.strftime('%Y-%m-%d %H:%M:%S'),
                'updated_at': template.updated_at.strftime('%Y-%m-%d %H:%M:%S')
            })
        return Response(data, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
def create_template(request):
    """Create a new code template"""
    try:
        data = json.loads(request.body)
        template = CodeTemplate.objects.create(
            name=data.get('name', ''),
            description=data.get('description', ''),
            template_code=data.get('template_code', ''),
            language=data.get('language', 'python'),
            category=data.get('category', 'general')
        )
        
        return Response({
            'message': 'Template created successfully',
            'template_id': template.id
        }, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['PUT'])
def update_template(request, template_id):
    """Update template"""
    try:
        template = CodeTemplate.objects.get(id=template_id)
        data = json.loads(request.body)
        
        template.name = data.get('name', template.name)
        template.description = data.get('description', template.description)
        template.template_code = data.get('template_code', template.template_code)
        template.language = data.get('language', template.language)
        template.category = data.get('category', template.category)
        template.save()
        
        return Response({
            'message': 'Template updated successfully',
            'template_id': template.id
        }, status=status.HTTP_200_OK)
    except CodeTemplate.DoesNotExist:
        return Response({'error': 'Template not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['DELETE'])
def delete_template(request, template_id):
    """Delete template"""
    try:
        template = CodeTemplate.objects.get(id=template_id)
        template.delete()
        
        return Response({
            'message': 'Template deleted successfully',
            'template_id': template_id
        }, status=status.HTTP_200_OK)
    except CodeTemplate.DoesNotExist:
        return Response({'error': 'Template not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
def get_execution_history(request):
    """Get code execution history"""
    try:
        sessions = ExecutionSession.objects.all().order_by('-created_at')
        data = []
        for session in sessions:
            data.append({
                'id': session.id,
                'session_id': session.session_id,
                'code': session.code[:100] + '...' if len(session.code) > 100 else session.code,
                'language': session.language,
                'output': session.output,
                'error': session.error,
                'execution_time': session.execution_time,
                'status': session.status,
                'created_at': session.created_at.strftime('%Y-%m-%d %H:%M:%S'),
                'completed_at': session.completed_at.strftime('%Y-%m-%d %H:%M:%S') if session.completed_at else None
            })
        return Response(data, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['DELETE'])
def delete_execution_session(request, session_id):
    """Delete execution session"""
    try:
        session = ExecutionSession.objects.get(session_id=session_id)
        session.delete()
        
        return Response({
            'message': 'Execution session deleted successfully',
            'session_id': session_id
        }, status=status.HTTP_200_OK)
    except ExecutionSession.DoesNotExist:
        return Response({'error': 'Execution session not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
def get_playground_questions(request):
    """Get all playground questions with pagination"""
    try:
        # Get pagination parameters
        page = int(request.GET.get('page', 1))
        page_size = int(request.GET.get('page_size', 5))
        
        # Get all questions ordered by creation date
        questions = PythonQuestion.objects.all().order_by('-created_at')
        
        # Pagination
        total_count = questions.count()
        start_index = (page - 1) * page_size
        end_index = start_index + page_size
        questions_page = questions[start_index:end_index]
        
        # Prepare data for current page
        data = []
        for question in questions_page:
            question_data = {
                'id': question.id,
                'question_text': question.question_text,
                'question_type': question.question_type,
                'difficulty': question.difficulty,
                'marks': question.marks,
                'created_at': question.created_at.strftime('%Y-%m-%d %H:%M:%S'),
                'choices': []
            }
            
            if question.question_type == 'multiple_choice':
                choices = Choice.objects.filter(question=question)
                for choice in choices:
                    question_data['choices'].append({
                        'id': choice.id,
                        'choice_text': choice.choice_text,
                        'is_correct': choice.is_correct
                    })
            
            data.append(question_data)
        
        # Calculate pagination info
        total_pages = (total_count + page_size - 1) // page_size
        has_next = page < total_pages
        has_previous = page > 1
        
        # Return paginated response
        response_data = {
            'count': total_count,
            'total_pages': total_pages,
            'current_page': page,
            'page_size': page_size,
            'has_next': has_next,
            'has_previous': has_previous,
            'next_page': page + 1 if has_next else None,
            'previous_page': page - 1 if has_previous else None,
            'results': data
        }
        
        return Response(response_data, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
def create_playground_question(request):
    """Create a new playground question"""
    try:
        data = json.loads(request.body)
        question_text = data.get('question_text')
        question_type = data.get('question_type')
        difficulty = data.get('difficulty', 'medium')
        marks = data.get('marks', 1)
        
        if not all([question_text, question_type]):
            return Response({'error': 'question_text and question_type are required'}, status=status.HTTP_400_BAD_REQUEST)
        
        question = PythonQuestion.objects.create(
            question_text=question_text,
            question_type=question_type,
            difficulty=difficulty,
            marks=marks
        )
        
        # Add choices if it's a multiple choice question
        if question_type == 'multiple_choice' and 'choices' in data:
            for choice_data in data['choices']:
                Choice.objects.create(
                    question=question,
                    choice_text=choice_data['choice_text'],
                    is_correct=choice_data.get('is_correct', False)
                )
        
        return Response({
            'message': 'Question created successfully',
            'id': question.id
        }, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
def get_playground_sessions(request):
    """Get all playground exam sessions"""
    try:
        sessions = ExamSession.objects.all().order_by('-created_at')
        data = []
        for session in sessions:
            data.append({
                'id': session.id,
                'student_name': session.student_name,
                'student_email': session.student_email,
                'start_time': session.start_time.strftime('%Y-%m-%d %H:%M:%S'),
                'end_time': session.end_time.strftime('%Y-%m-%d %H:%M:%S') if session.end_time else None,
                'status': session.status,
                'score': session.score,
                'total_marks': session.total_marks,
                'webcam_enabled': session.webcam_enabled,
                'created_at': session.created_at.strftime('%Y-%m-%d %H:%M:%S')
            })
        
        return Response(data, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
def start_playground_exam(request):
    """Start a new playground exam session"""
    try:
        data = json.loads(request.body)
        student_name = data.get('student_name')
        student_email = data.get('student_email')
        webcam_enabled = data.get('webcam_enabled', True)
        
        if not all([student_name, student_email]):
            return Response({'error': 'student_name and student_email are required'}, status=status.HTTP_400_BAD_REQUEST)
        
        session = ExamSession.objects.create(
            student_name=student_name,
            student_email=student_email,
            start_time=datetime.now(),
            webcam_enabled=webcam_enabled
        )
        
        return Response({
            'message': 'Exam session started successfully',
            'session_id': session.id,
            'start_time': session.start_time.strftime('%Y-%m-%d %H:%M:%S')
        }, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
def submit_playground_answer(request, session_id):
    """Submit an answer for a playground question"""
    try:
        data = json.loads(request.body)
        question_id = data.get('question_id')
        selected_choice_id = data.get('selected_choice_id')
        answer_text = data.get('answer_text')
        time_taken = data.get('time_taken', 0)
        
        if not all([session_id, question_id]):
            return Response({'error': 'session_id and question_id are required'}, status=status.HTTP_400_BAD_REQUEST)
        
        session = ExamSession.objects.get(id=session_id)
        question = PythonQuestion.objects.get(id=question_id)
        
        answer = ExamAnswer.objects.create(
            session=session,
            question=question,
            answer_text=answer_text,
            selected_choice_id=selected_choice_id,
            time_taken=time_taken
        )
        
        return Response({
            'message': 'Answer submitted successfully',
            'answer_id': answer.id
        }, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
def end_playground_exam(request, session_id):
    """End a playground exam session and calculate score"""
    try:
        session = ExamSession.objects.get(id=session_id)
        session.end_time = datetime.now()
        session.status = 'completed'
        
        # Calculate score
        answers = ExamAnswer.objects.filter(session=session)
        total_score = 0
        total_marks = 0
        
        for answer in answers:
            question = answer.question
            total_marks += question.marks
            
            if question.question_type == 'multiple_choice' and answer.selected_choice:
                choice = Choice.objects.get(id=answer.selected_choice_id)
                if choice.is_correct:
                    total_score += question.marks
            elif question.question_type in ['short_answer', 'coding']:
                # For coding and short answers, you might implement manual grading
                total_score += question.marks  # Assuming all correct for now
        
        session.score = total_score
        session.total_marks = total_marks
        session.save()
        
        return Response({
            'message': 'Exam session completed successfully',
            'score': session.score,
            'total_marks': session.total_marks,
            'percentage': round((session.score / session.total_marks) * 100, 2) if session.total_marks > 0 else 0
        }, status=status.HTTP_200_OK)
    except ExamSession.DoesNotExist:
        return Response({'error': 'Session not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
def playground_rest_framework(request):
    """Serve Django REST Framework style page for playground"""
    return render(request, 'playground_drf.html')


@api_view(['GET'])
def serve_react_app(request):
    """Serve the React app"""
<<<<<<< HEAD
    return render(request, 'index.html')
=======
    return render(request, 'index.html')
>>>>>>> f12bddb0c11812d87e22432dd3c149608efefcc9
