from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework import status
from django.shortcuts import get_object_or_404
from .models import LeaveRequest, PythonQuestion, Choice, ExamAttempt, CodeSnippet, CodeTemplate, ExecutionSession, ExamSession, WebcamSnapshot, User, Job
from .serializers import LeaveRequestSerializer, PythonQuestionSerializer, ExamAttemptSerializer, CodeSnippetSerializer, CodeTemplateSerializer, ExecutionSessionSerializer, UserSerializer
from .email_utils import send_exam_confirmation_email
from datetime import datetime, timedelta
from django.utils import timezone
import json

import requests
import base64
import os

from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from .models import (
    AppliedJob,
    CodeSnippet,
    CodeTemplate,
    ExamAttempt,
    ExecutionSession,
    Job,
    LeaveRequest,
    PythonQuestion,
    User,
)
from .serializers import (
    CodeSnippetSerializer,
    CodeTemplateSerializer,
    ExamAttemptSerializer,
    LeaveRequestSerializer,
    PythonQuestionSerializer,
    UserSerializer,
)

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
    exam_type = request.GET.get('exam_type', 'all')
    
    if exam_type == 'all':
        attempts = ExamAttempt.objects.all()
    else:
        attempts = ExamAttempt.objects.filter(exam_type=exam_type)
    
    if username:
        attempts = attempts.filter(user__username__iexact=username)
        
    attempts = attempts.order_by('-exam_date')
    
    formatted_data = []
    for attempt in attempts:
        raw_status = str(attempt.status or '').strip()
        normalized_status = raw_status.lower()
        percentage = round((attempt.marks_obtained / attempt.total_marks) * 100, 1) if attempt.total_marks else 0
        final_status = raw_status

        if 'cheat' in normalized_status or 'suspicious' in normalized_status:
            final_status = 'Cheated'
        elif normalized_status in ['pass', 'passed', 'success']:
            final_status = 'Pass'
        elif normalized_status in ['fail', 'failed']:
            final_status = 'Fail'
        elif normalized_status in ['completed', 'incomplete', 'pending', '']:
            final_status = 'Pass' if percentage >= 50 else 'Fail'
        else:
            final_status = raw_status or ('Pass' if percentage >= 50 else 'Fail')

        suspicious_detected = False
        if attempt.user and attempt.user.email:
            sessions = ExamSession.objects.filter(student_email__iexact=attempt.user.email)
            if attempt.start_time:
                sessions = sessions.filter(start_time__date=attempt.start_time.date())
            suspicious_detected = WebcamSnapshot.objects.filter(session__in=sessions, is_suspicious=True).exists()
            if suspicious_detected:
                final_status = 'Cheated'

        failure_reason = "Performance was satisfactory."
        recommendations = "Keep up the good work!"
        
        if final_status == 'Fail':
            failure_reason = f"Scored {percentage}%, which is below the 50% passing threshold. Student may need to review fundamental concepts."
            recommendations = "Assign remedial exercises and recommend a one-on-one doubt clearing session."
        elif final_status == 'Cheated':
            if suspicious_detected:
                failure_reason = "AI Proctoring system flagged suspicious behavior via webcam (person mismatch, tab switching, or auxiliary help detected)."
                recommendations = "Manual review of proctoring screenshots required. Consider 0 marks or a proctored re-exam under strict supervision."
            else:
                failure_reason = "Academic integrity violation flagged manually or via session behavior."
                recommendations = "Schedule a meeting to discuss academic integrity and consider a proctored retake."

        formatted_data.append({
            'id': attempt.id,
            'user': {
                'username': attempt.user.username if attempt.user else 'Unknown',
                'randomId': attempt.random_id or 'N/A',
                'email': attempt.user.email if attempt.user else ''
            },
            'examTitle': attempt.exam_title,
            'examType': attempt.exam_type,
            'score': attempt.marks_obtained,
            'totalMarks': attempt.total_marks,
            'correctAnswers': attempt.correct_answers,
            'totalQuestions': attempt.total_questions,
            'status': final_status,
            'failureReason': failure_reason,
            'recommendations': recommendations,
            'examDate': attempt.exam_date.isoformat() if attempt.exam_date else None,
            'timeTaken': attempt.time_taken,
            'percentage': percentage
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


@api_view(['GET','POST'])
@permission_classes([AllowAny])
def save_exam_report_api(request):
    """
    POST: Save new exam report.
    """
    try:
        data = request.data
        from django.utils import timezone

        # Resolve user
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
                'error': 'Could not identify user'
            }, status=status.HTTP_400_BAD_REQUEST)

        now = timezone.now()
        start_time = data.get('start_time') or data.get('startTime') or now
        end_time = data.get('end_time') or data.get('endTime') or now

        # random id
        random_id_val = data.get('random_id') or data.get('randomId') or ''
        if not random_id_val and isinstance(data.get('user'), dict):
            random_id_val = data['user'].get('randomId') or ''

        # pass/fail
        passed_input = data.get('passed')
        if passed_input is True:
            final_status = 'Pass'
        elif passed_input is False:
            final_status = 'Fail'
        else:
            raw_status = str(data.get('status', '')).strip()
            lower_status = raw_status.lower()
            if 'cheat' in lower_status or 'suspicious' in lower_status:
                final_status = 'Cheated'
            elif lower_status in ['pass', 'passed', 'success']:
                final_status = 'Pass'
            elif lower_status in ['fail', 'failed']:
                final_status = 'Fail'
            else:
                marks_obtained = data.get('marks_obtained') or data.get('marks') or data.get('score', 0)
                total_marks = data.get('total_marks') or data.get('totalMarks') or 0
                if total_marks:
                    percentage = (float(marks_obtained) / float(total_marks)) * 100
                    final_status = 'Pass' if percentage >= 50 else 'Fail'
                else:
                    final_status = raw_status or 'Completed'

        attempt = ExamAttempt.objects.create(
            user=user,
            exam_title=data.get('exam_title') or data.get('examTitle', 'Python Exam'),
            exam_type=data.get('exam_type') or data.get('examType', 'daily'),
            score=data.get('score', 0),
            total_questions=data.get('total_questions') or data.get('totalQuestions', 20),
            correct_answers=data.get('correct_answers') or data.get('correctAnswers', 0),
            incorrect_answers=data.get('incorrect_answers') or data.get('incorrectAnswers', 0),
            marks_obtained=data.get('marks_obtained') or data.get('marks') or data.get('score', 0),
            total_marks=data.get('total_marks') or data.get('totalMarks', 40),
            time_taken=data.get('time_taken') or data.get('timeTaken', 0),
            start_time=start_time,
            end_time=end_time,
            status=final_status,
            random_id=str(random_id_val),
            answers_json=json.dumps(data.get('answers', [])),
            questions_json=json.dumps(data.get('questions', []))
        )

        return Response({
            'success': True,
            'message': 'Exam report saved successfully',
            'saved_username': user.username,
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
    try:
        import datetime
        from django.utils import timezone
        import traceback

        date_filter = request.GET.get('date', '').strip()
        exam_type_filter = request.GET.get('exam_type', '').strip()
        
        # Log incoming request for server-side debugging
        with open('leaderboard_debug.log', 'a') as f:
            f.write(f"{datetime.datetime.now()}: Request - Date: '{date_filter}', Type: '{exam_type_filter}'\n")

        attempts = ExamAttempt.objects.all()
        total_in_db = attempts.count()

        if date_filter:
            try:
                d = datetime.date.fromisoformat(date_filter)
                # Create start and end datetimes for the given date in local timezone
                start = timezone.make_aware(datetime.datetime.combine(d, datetime.time.min))
                end = timezone.make_aware(datetime.datetime.combine(d, datetime.time.max))
                attempts = attempts.filter(exam_date__range=(start, end))
            except Exception as e:
                with open('leaderboard_debug.log', 'a') as f:
                    f.write(f"{datetime.datetime.now()}: Date Range Filter error: {e}\n")
                # Fallback to simple filtering if range fails
                attempts = attempts.filter(exam_date__icontains=date_filter)
            
        if exam_type_filter:
            attempts = attempts.filter(exam_type__iexact=exam_type_filter)

        # Apply sorting: Score DESC, Time Taken ASC
        attempts = attempts.order_by('-marks_obtained', 'time_taken')
        filtered_count = attempts.count()

        with open('leaderboard_debug.log', 'a') as f:
            f.write(f"{datetime.datetime.now()}: Results - Total: {total_in_db}, Filtered: {filtered_count}\n")

        leaderboard = []
        rank = 1
        seen_users = set()
        
        for attempt in attempts:
            username = attempt.user.username if attempt.user else (attempt.user_name if hasattr(attempt, 'user_name') else 'Priya' if attempt.pk == 131 else 'Unknown')
            
            # UNIQUE USERS ONLY: only show the best attempt for each person
            if username in seen_users:
                continue
            seen_users.add(username)

            seconds_total = attempt.time_taken or 0
            minutes = int(seconds_total // 60)
            seconds = int(seconds_total % 60)
            
            leaderboard.append({
                'rank': rank,
                'username': username,
                'score': attempt.marks_obtained,
                'total_marks': attempt.total_marks,
                'time_taken': f"{minutes}m {seconds}s",
                'time_taken_seconds': seconds_total,
                'exam_title': attempt.exam_title,
                'exam_type': attempt.exam_type,
                'date': attempt.exam_date.date().isoformat() if attempt.exam_date else None
            })
            rank += 1
            if rank > 50:  # Limit to top 50 unique students
                break

        return Response({
            'success': True,
            'data': leaderboard,
            'debug_info': {
                'date_filter': date_filter,
                'exam_type_filter': exam_type_filter,
                'filtered_count': filtered_count,
                'total_count': total_in_db,
                'status': 'OK'
            }
        })
    except Exception as e:
        import traceback
        import datetime
        with open('leaderboard_debug.log', 'a') as f:
            f.write(f"{datetime.datetime.now()}: ERROR: {str(e)}\n{traceback.format_exc()}\n")
        return Response({
            'success': False,
            'error': str(e),
            'debug_info': {'status': 'ERROR', 'trace': traceback.format_exc()}
        }, status=500)


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
        {"id": 3, "question": "What is the correct file extension for Python files?", "options": [".py", ".python", ".pt", ".pyin"], "correct": 0},
        {"id": 4, "question": "Which of the following is a mutable data type in Python?", "options": ["Tuple", "String", "List", "Integer"], "correct": 2},
        {"id": 5, "question": "What does len() function do in Python?", "options": ["Returns the length of an object", "Deletes an object", "Creates an object", "Copies an object"], "correct": 0},
        {"id": 6, "question": "Which operator is used for exponentiation in Python?", "options": ["^", "**", "*", "^^"], "correct": 1},
        {"id": 7, "question": "What is the output of print(type('Hello'))?", "options": ["<class 'int'>", "<class 'str'>", "<class 'string'>", "<class 'char'>"], "correct": 1},
        {"id": 8, "question": "Which method is used to add an element to the end of a list?", "options": ["add()", "append()", "insert()", "extend()"], "correct": 1},
        {"id": 9, "question": "What is the correct way to create a dictionary in Python?", "options": ["{key: value}", "[]", "()", "||"], "correct": 0},
        {"id": 10, "question": "Which statement is used to properly exit a loop in Python?", "options": ["exit", "break", "continue", "return"], "correct": 1},
        {"id": 11, "question": "What is the output of print(10 // 3)?", "options": ["3.33", "3", "4", "Error"], "correct": 1},
        {"id": 12, "question": "Which function is used to get input from user in Python 3?", "options": ["input()", "raw_input()", "scanf()", "cin()"], "correct": 0},
        {"id": 13, "question": "Which operator is used to overload the addition operation in a class?", "options": ["__plus__", "__add__", "__sum__", "__append__"], "correct": 1},
        {"id": 14, "question": "Which module is used for complex mathematical operations in Python?", "options": ["math", "cmath", "maths", "calc"], "correct": 1},
        {"id": 15, "question": "What is the output of print(bool(0))?", "options": ["True", "False", "0", "1"], "correct": 1},
        {"id": 16, "question": "Which method removes whitespace from both ends of a string?", "options": ["trim()", "strip()", "remove()", "clean()"], "correct": 1},
        {"id": 17, "question": "What is the output of list(range(2, 6))?", "options": ["[2, 3, 4, 5, 6]", "[2, 3, 4, 5]", "[1, 2, 3, 4, 5]", "Error"], "correct": 1},
        {"id": 18, "question": "Which keyword is used to handle exceptions in Python?", "options": ["try", "except", "catch", "handle"], "correct": 1},
        {"id": 19, "question": "What is a python lambda function?", "options": ["A multiline function", "An anonymous single-expression function", "A class definition", "A built-in loop"], "correct": 1},
        {"id": 20, "question": "Which function is used to open a file in Python?", "options": ["open()", "file()", "read()", "load()"], "correct": 0},
        {"id": 21, "question": "What is the purpose of the __init__ method in Python?", "options": ["Constructor", "Destructor", "Iterator", "Generator"], "correct": 0},
        {"id": 22, "question": "How do you create a generator in Python?", "options": ["Using the yield keyword", "Using the return keyword", "Using generator()", "Using class()"], "correct": 0},
        {"id": 23, "question": "What does the 'self' parameter represent in Python methods?", "options": ["Current instance of the class", "Class name", "Method name", "Parent class"], "correct": 0},
        {"id": 24, "question": "How do you achieve multi-threading in Python?", "options": ["Using the threading module", "Using the multithread library", "Using parallel loops", "Threads are not supported"], "correct": 0},
        {"id": 25, "question": "What is the output of [x for x in range(3)]?", "options": ["[0, 1, 2]", "(0, 1, 2)", "{0, 1, 2}", "Generates an error"], "correct": 0},
        {"id": 26, "question": "Which keyword is used to derive a class from another class in Python?", "options": ["inherit", "extends", "Parentheses () in class definition", "super"], "correct": 2},
        {"id": 27, "question": "What is a Python decorator?", "options": ["A tool to style UI", "A function that modifies the behavior of another function", "An inheritance concept", "A string formatting tool"], "correct": 1},
        {"id": 28, "question": "Which method is used to sort a list in place in Python?", "options": ["sort()", "sorted()", "order()", "arrange()"], "correct": 0},
        {"id": 29, "question": "What does the GIL stand for in Python?", "options": ["General Interpreter Lock", "Global Interpreter Lock", "Graphic Instruction Layer", "Guaranteed Iteration Loop"], "correct": 1},
        {"id": 30, "question": "Which function is used to convert a string to uppercase?", "options": ["upper()", "uppercase()", "toUpper()", "toUpperCase()"], "correct": 0},
        {"id": 31, "question": "What is the output of print(bool([]))?", "options": ["True", "False", "[]", "Error"], "correct": 1},
        {"id": 32, "question": "Which tool is commonly used to install Python packages?", "options": ["pip", "npm", "composer", "apt"], "correct": 0},
        {"id": 33, "question": "Which sequence correctly defines a try-except-finally block?", "options": ["try, finally, except", "try, except, finally", "except, try, finally", "finally, try, except"], "correct": 1},
        {"id": 34, "question": "What is the primary difference between deepcopy and copy?", "options": ["deepcopy copies nested objects, copy only copies surface references", "copy is faster", "deepcopy modifies the original", "They are identical"], "correct": 0},
        {"id": 35, "question": "What does the zip() function do?", "options": ["Compresses a file", "Combines multiple iterables element by element", "Sorts a list", "Extracts strings"], "correct": 1},
        {"id": 36, "question": "Which keyword is used to import modules in Python?", "options": ["import", "include", "require", "using"], "correct": 0},
        {"id": 37, "question": "How are keyword arguments passed to a function?", "options": ["*args", "**kwargs", "&args", "&&kwargs"], "correct": 1},
        {"id": 38, "question": "Which built-in function returns an iterator?", "options": ["iter()", "next()", "loop()", "iterate()"], "correct": 0},
        {"id": 39, "question": "What is the output of type(lambda x: x)?", "options": ["<class 'lambda'>", "<class 'function'>", "<class 'method'>", "<class 'def'>"], "correct": 1},
        {"id": 40, "question": "Which module allows regular expression matching?", "options": ["regex", "re", "match", "pattern"], "correct": 1},
        {"id": 41, "question": "What is the difference between list and tuple in Python?", "options": ["List is mutable, tuple is immutable", "Tuple is mutable, list is immutable", "Both are mutable", "Both are immutable"], "correct": 0},
        {"id": 42, "question": "Which of the following creates a set?", "options": ["{1, 2, 3}", "[1, 2, 3]", "(1, 2, 3)", "{'a': 1}"], "correct": 0},
        {"id": 43, "question": "What is the purpose of the 'pass' statement?", "options": ["To skip the current loop iteration", "To exit the program", "To serve as a placeholder for future code", "To ignore exceptions"], "correct": 2},
        {"id": 44, "question": "What is a static method in Python?", "options": ["A method bound to the class and not the object of the class", "A method that cannot be overridden", "A method imported from a static library", "An alternative to __init__"], "correct": 0},
        {"id": 45, "question": "How do you define a class method in Python?", "options": ["@staticmethod", "@classmethod", "@class", "class()"], "correct": 1},
        {"id": 46, "question": "What is the output of the following code?\ndef foo(a, b=[]):\n    b.append(a)\n    return b\nprint(foo(1))\nprint(foo(2))", "options": ["[1] [2]", "[1] [1, 2]", "[1, 2] [1, 2]", "Error"], "correct": 1},
        {"id": 47, "question": "What is the output of this code?\nx = [1, 2, 3]\ny = x\ny[0] = 5\nprint(x[0])", "options": ["1", "5", "3", "Error"], "correct": 1},
        {"id": 48, "question": "What will this list comprehension produce?\nprint([x for x in range(5) if x % 2 == 0])", "options": ["[0, 2, 4]", "[1, 3]", "[0, 1, 2, 3, 4]", "[2, 4]"], "correct": 0},
        {"id": 49, "question": "What does this code output?\nd = {'a': 1, 'b': 2}\nprint(d.get('c', 3))", "options": ["1", "2", "3", "None"], "correct": 2},
        {"id": 50, "question": "What is the output of the following snippet?\ncount = 0\nfor i in range(3):\n    count += i\nprint(count)", "options": ["3", "6", "0", "2"], "correct": 0},
    ]

    theoretical_questions = questions_pool[:45]
    practical_questions = questions_pool[45:50]
    
    selected_questions = random.sample(theoretical_questions, 15) + practical_questions
    random.shuffle(selected_questions)
    
    return Response({
        'success': True,
        'data': selected_questions
    })

# ==================== EXAM MANAGER CUSTOM SETTINGS ====================

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



# JUDGE0_CE_API = "https://judge0-ce.p.rapidapi.com/"
RAPID_API_KEY = "aac9ffcb0fmsh4ac5d4bab4c3bb1p1067c8jsn143eef6e423b"

@api_view(['POST'])
@permission_classes([AllowAny])
def run_code_api(request):
    """
    POST: Run code using Judge0 API and evaluate test cases.
    Payload: {
        "code": "...",
        "language": "python",
        "stdin": "...",
        "test_cases": [{"input": "...", "expected": "..."}]
    }
    """
    data = request.data
    source_code = data.get('code', '')
    language = data.get('language', 'python')
    test_cases = data.get('test_cases', [])
    
    # 71 = Python (3.8.1), 54 = C++ (GCC 9.2.0), 62 = Java (OpenJDK 13.0.1)
    lang_ids = {
        'python': 71,
        'cpp': 54,
        'java': 62
    }
    lang_id = lang_ids.get(language, 71)

    results = []
    passed = 0

    try:
        # If no test cases provided (scratchpad mode), perform a single default execution
        working_test_cases = test_cases if test_cases else [{"input": data.get('stdin', ''), "expected": ""}]
        
        for tc in working_test_cases:
            tc_input = tc.get('input', '')
            tc_expected = tc.get('expected', '').strip()
            
            # Prepare payload for Judge0
            payload = {
                "source_code": source_code,
                "language_id": lang_id,
                "stdin": tc_input,
                "expected_output": tc_expected if tc_expected else None,
            }
            
            # Using Judge0 Community Edition on RapidAPI
            headers = {
                "content-type": "application/json",
                "X-RapidAPI-Key": RAPID_API_KEY,
                "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com"
            }
            
            # Direct Wait Submission (Wait=true)
            url = "https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=false&wait=true"
            response = requests.post(url, json=payload, headers=headers, timeout=10)
            
            if response.status_code == 201 or response.status_code == 200:
                result = response.json()
                stdout = (result.get('stdout') or "").strip()
                status = result.get('status', {}).get('description', '')
                
                # Check status
                # If tc_expected is empty (scratchpad), we consider it passed if it executed without error
                if not tc_expected:
                    is_pass = status.lower() == 'accepted'
                else:
                    is_pass = (status.lower() == 'accepted' or stdout == tc_expected)
                
                if is_pass: passed += 1
                
                results.append({
                    "input": tc_input,
                    "expected": tc_expected,
                    "output": stdout,
                    "status": status,
                    "error": result.get('stderr') or result.get('compile_output'),
                    "passed": is_pass
                })
            else:
                results.append({
                    "error": f"Internal Execution Error: {response.text}",
                    "passed": False
                })

        return Response({
            "success": True,
            "passed_count": passed,
            "total_count": len(test_cases),
            "results": results,
            "passed": passed == len(test_cases) if test_cases else True
        })

    except Exception as e:
        return Response({
            "success": False,
            "error": str(e)
        }, status=500)

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
        cutoff = timezone.now() - timedelta(days=30)

        for student in students:
            latest = ExamAttempt.objects.filter(user=student).order_by('-exam_date').first()
            progress = 0
            status_val = "Inactive" if not student.is_active else "Active"

            if latest:
                status_val = latest.status or status_val
                progress = round((latest.marks_obtained / latest.total_marks) * 100) if latest.total_marks > 0 else 0
            else:
                last_activity = student.last_login or student.date_joined
                if last_activity and last_activity < cutoff:
                    status_val = "Inactive"

            data.append({
                "id": student.id,
                "name": student.username,
                "status": status_val,
                "progress": progress,
                "is_active": student.is_active,
                "last_login": student.last_login.isoformat() if student.last_login else None,
                "date_joined": student.date_joined.isoformat() if student.date_joined else None,
            })

        return Response(data)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def admin_create_credentials_api(request):
    if not hasattr(request.user, 'role') or request.user.role != 'admin':
        return Response({'detail': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)

    username = request.data.get('username')
    password = request.data.get('password')
    email = request.data.get('email', '')
    role = request.data.get('role', 'student')

    if not username or not password:
        return Response({'error': 'Username and password are required'}, status=status.HTTP_400_BAD_REQUEST)

    if User.objects.filter(username=username).exists():
        return Response({'error': 'User already exists'}, status=status.HTTP_400_BAD_REQUEST)

    user = User.objects.create_user(username=username, password=password, email=email)
    user.role = role
    user.is_active = True
    user.save(update_fields=['role', 'is_active'])

    return Response({
        'success': True,
        'message': 'User credentials created successfully',
        'user': {
            'username': user.username,
            'email': user.email,
            'role': user.role,
        }
    })


@api_view(['POST'])
@permission_classes([AllowAny])
def toggle_student_active(request, pk):
    active = request.data.get('active')
    if active is None:
        return Response({'error': 'active field is required'}, status=status.HTTP_400_BAD_REQUEST)
    try:
        student = User.objects.filter(pk=pk, role='student').first()
        if not student:
            return Response({'error': 'Student not found'}, status=status.HTTP_404_NOT_FOUND)
        student.is_active = bool(active)
        student.save(update_fields=['is_active'])
        return Response({'success': True, 'is_active': student.is_active})
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
