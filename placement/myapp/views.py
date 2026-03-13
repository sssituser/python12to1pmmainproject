from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.generics import ListAPIView
from django.contrib.auth import authenticate
from django.utils import timezone
from .models import (
    StudentProfile, Skill, Project, Job,
    LeaveRequest, PythonQuestion, Choice,
    ExamSession, ExamAnswer, WebcamSnapshot,
    CodeSnippet, CodeTemplate, ExecutionSession,
    Exam, ExamAttempt, MCQQuestion, MCQAnswer,
    CodingQuestion, CodeSubmission, TestCase
)
from .serializers import StudentProfileSerializer, ExamSerializer
from django.core.serializers.json import DjangoJSONEncoder
from django.http import HttpResponse
from django.shortcuts import render
from django.contrib.auth import login
import json
from datetime import datetime
import subprocess, tempfile, os


@api_view(['GET'])
def home(request):
    return HttpResponse("""
        <html><head><title>Placement System</title></head>
        <body><h1>Welcome to Placement System</h1>
        <a href="/admin/">Admin</a></body></html>
    """)


@api_view(['GET'])
def serve_react_app(request):
    return render(request, 'index.html')


@api_view(['GET'])
def playground_rest_framework(request):
    return render(request, 'playground_drf.html')


@api_view(['POST'])
def login_view(request):
    username = request.data.get('username')
    password = request.data.get('password')
    from .models import User as CustomUser
    try:
        user = CustomUser.objects.get(username=username)
        if user.password == password:
            return Response({
                "message": "Login successful",
                "user": {"id": user.id, "username": user.username, "email": user.email}
            })
        else:
            return Response({"error": "Invalid username or password"}, status=400)
    except CustomUser.DoesNotExist:
        return Response({"error": "Invalid username or password"}, status=400)


@api_view(['POST'])
def register_view(request):
    from .models import User as CustomUser
    username = request.data.get('username')
    email    = request.data.get('email')
    password = request.data.get('password')
    if not username or not email or not password:
        return Response({"error": "All fields required"}, status=400)
    if CustomUser.objects.filter(username=username).exists():
        return Response({"error": "Username already exists"}, status=400)
    if CustomUser.objects.filter(email=email).exists():
        return Response({"error": "Email already exists"}, status=400)
    user = CustomUser.objects.create(username=username, email=email, password=password)
    return Response({"message": "Registered", "user": {"id": user.id, "username": user.username}}, status=201)


@api_view(['GET'])
def Profile_view(request):
    user_id = request.query_params.get('user_id')
    from .models import User as CustomUser
    try:
        user = CustomUser.objects.get(pk=user_id)
        profile, _ = StudentProfile.objects.get_or_create(user=user)
        serializer = StudentProfileSerializer(profile)
        return Response(serializer.data)
    except CustomUser.DoesNotExist:
        return Response({"error": "User not found"}, status=404)


@api_view(['PUT'])
def update_profile(request):
    from .models import User as CustomUser
    user = CustomUser.objects.get(username=request.data.get("username"))
    profile = StudentProfile.objects.get(user=user)
    serializer = StudentProfileSerializer(profile, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        Skill.objects.filter(student=profile).delete()
        for s in request.data.get("skills", []):
            Skill.objects.create(student=profile, name=s)
        Project.objects.filter(student=profile).delete()
        for p in request.data.get("projects", []):
            Project.objects.create(student=profile, title=p.get("title"), description=p.get("description"))
        return Response({"message": "Profile updated"})
    return Response(serializer.errors)


@api_view(['POST'])
def upload_resume(request):
    profile = StudentProfile.objects.get(user=request.user)
    resume = request.FILES.get('resume')
    profile.resume = resume
    profile.save()
    return Response({"message": "Resume uploaded"})


# ── Leave Requests ──

@api_view(['GET'])
def get_leave_requests(request):
    try:
        leave_requests = LeaveRequest.objects.all().order_by('-created_at')
        data = [{
            'id': r.id, 'name': r.name,
            'start_date': r.start_date.strftime('%Y-%m-%d'),
            'end_date': r.end_date.strftime('%Y-%m-%d'),
            'reason': r.reason, 'status': r.status,
            'approved_by': r.approved_by,
            'created_at': r.created_at.strftime('%Y-%m-%d %H:%M:%S')
        } for r in leave_requests]
        return Response(data)
    except Exception as e:
        return Response({'error': str(e)}, status=500)


@api_view(['POST'])
def create_leave_request(request):
    try:
        data = request.data
        leave_request = LeaveRequest.objects.create(
            name=data.get('name'), start_date=data.get('startDate'),
            end_date=data.get('endDate'), reason=data.get('reason')
        )
        return Response({'message': 'Leave request created', 'id': leave_request.id}, status=201)
    except Exception as e:
        return Response({'error': str(e)}, status=500)


@api_view(['PUT'])
def update_leave_request(request, request_id):
    try:
        leave_request = LeaveRequest.objects.get(id=request_id)
        if 'status' in request.data:
            leave_request.status = request.data['status']
        if 'approved_by' in request.data:
            leave_request.approved_by = request.data['approved_by']
        leave_request.save()
        return Response({'message': 'Updated successfully'})
    except LeaveRequest.DoesNotExist:
        return Response({'error': 'Not found'}, status=404)
    except Exception as e:
        return Response({'error': str(e)}, status=500)


@api_view(['DELETE'])
def delete_leave_request(request, request_id):
    try:
        LeaveRequest.objects.get(id=request_id).delete()
        return Response({'message': 'Deleted successfully'})
    except LeaveRequest.DoesNotExist:
        return Response({'error': 'Not found'}, status=404)
    except Exception as e:
        return Response({'error': str(e)}, status=500)


# ── Playground / Questions ──

@api_view(['GET'])
def get_questions(request):
    try:
        questions = PythonQuestion.objects.all().order_by('-created_at')
        data = []
        for q in questions:
            qd = {'id': q.id, 'question_text': q.question_text, 'question_type': q.question_type,
                  'difficulty': q.difficulty, 'marks': q.marks,
                  'created_at': q.created_at.strftime('%Y-%m-%d %H:%M:%S'), 'choices': []}
            if q.question_type == 'multiple_choice':
                qd['choices'] = [{'id': c.id, 'choice_text': c.choice_text, 'is_correct': c.is_correct}
                                  for c in Choice.objects.filter(question=q)]
            data.append(qd)
        return Response(data)
    except Exception as e:
        return Response({'error': str(e)}, status=500)


@api_view(['POST'])
def create_question(request):
    try:
        q = PythonQuestion.objects.create(
            question_text=request.data.get('question_text'),
            question_type=request.data.get('question_type'),
            difficulty=request.data.get('difficulty', 'medium'),
            marks=request.data.get('marks', 1)
        )
        if request.data.get('question_type') == 'multiple_choice':
            for c in request.data.get('choices', []):
                Choice.objects.create(question=q, choice_text=c['choice_text'], is_correct=c.get('is_correct', False))
        return Response({'message': 'Question created', 'id': q.id}, status=201)
    except Exception as e:
        return Response({'error': str(e)}, status=500)


@api_view(['GET'])
def get_playground_questions(request):
    try:
        page      = int(request.GET.get('page', 1))
        page_size = int(request.GET.get('page_size', 5))
        questions = PythonQuestion.objects.all().order_by('-created_at')
        total_count  = questions.count()
        start        = (page - 1) * page_size
        questions_pg = questions[start:start + page_size]
        data = []
        for q in questions_pg:
            qd = {'id': q.id, 'question_text': q.question_text, 'question_type': q.question_type,
                  'difficulty': q.difficulty, 'marks': q.marks,
                  'created_at': q.created_at.strftime('%Y-%m-%d %H:%M:%S'), 'choices': []}
            if q.question_type == 'multiple_choice':
                qd['choices'] = [{'id': c.id, 'choice_text': c.choice_text, 'is_correct': c.is_correct}
                                  for c in Choice.objects.filter(question=q)]
            data.append(qd)
        total_pages = (total_count + page_size - 1) // page_size
        return Response({
            'count': total_count, 'total_pages': total_pages, 'current_page': page,
            'page_size': page_size, 'has_next': page < total_pages, 'has_previous': page > 1,
            'next_page': page + 1 if page < total_pages else None,
            'previous_page': page - 1 if page > 1 else None, 'results': data
        })
    except Exception as e:
        return Response({'error': str(e)}, status=500)


@api_view(['POST'])
def create_playground_question(request):
    try:
        q = PythonQuestion.objects.create(
            question_text=request.data.get('question_text'),
            question_type=request.data.get('question_type'),
            difficulty=request.data.get('difficulty', 'medium'),
            marks=request.data.get('marks', 1)
        )
        if request.data.get('question_type') == 'multiple_choice':
            for c in request.data.get('choices', []):
                Choice.objects.create(question=q, choice_text=c['choice_text'], is_correct=c.get('is_correct', False))
        return Response({'message': 'Question created', 'id': q.id}, status=201)
    except Exception as e:
        return Response({'error': str(e)}, status=500)


# ── Exam Sessions ──

@api_view(['POST'])
def start_exam_session(request):
    try:
        session = ExamSession.objects.create(
            student_name=request.data.get('student_name'),
            student_email=request.data.get('student_email'),
            start_time=datetime.now(),
            webcam_enabled=request.data.get('webcam_enabled', True)
        )
        return Response({'message': 'Session started', 'session_id': session.id,
                         'start_time': session.start_time.strftime('%Y-%m-%d %H:%M:%S')}, status=201)
    except Exception as e:
        return Response({'error': str(e)}, status=500)


@api_view(['POST'])
def submit_answer(request):
    try:
        session  = ExamSession.objects.get(id=request.data.get('session_id'))
        question = PythonQuestion.objects.get(id=request.data.get('question_id'))
        answer   = ExamAnswer.objects.create(
            session=session, question=question,
            answer_text=request.data.get('answer_text'),
            selected_choice_id=request.data.get('selected_choice_id'),
            time_taken=request.data.get('time_taken', 0)
        )
        return Response({'message': 'Answer submitted', 'answer_id': answer.id}, status=201)
    except Exception as e:
        return Response({'error': str(e)}, status=500)


@api_view(['POST'])
def end_exam_session(request, session_id):
    try:
        session = ExamSession.objects.get(id=session_id)
        session.end_time = datetime.now()
        session.status   = 'completed'
        answers = ExamAnswer.objects.filter(session=session)
        total_score = 0
        total_marks = 0
        for answer in answers:
            q = answer.question
            total_marks += q.marks
            if q.question_type == 'multiple_choice' and answer.selected_choice:
                if Choice.objects.get(id=answer.selected_choice_id).is_correct:
                    total_score += q.marks
        session.score       = total_score
        session.total_marks = total_marks
        session.save()
        return Response({'score': session.score, 'total_marks': session.total_marks,
                         'percentage': round((total_score / total_marks) * 100, 2) if total_marks > 0 else 0})
    except ExamSession.DoesNotExist:
        return Response({'error': 'Session not found'}, status=404)
    except Exception as e:
        return Response({'error': str(e)}, status=500)


@api_view(['GET'])
def get_exam_sessions(request):
    try:
        sessions = ExamSession.objects.all().order_by('-created_at')
        data = [{'id': s.id, 'student_name': s.student_name, 'student_email': s.student_email,
                 'start_time': s.start_time.strftime('%Y-%m-%d %H:%M:%S'),
                 'end_time': s.end_time.strftime('%Y-%m-%d %H:%M:%S') if s.end_time else None,
                 'status': s.status, 'score': s.score, 'total_marks': s.total_marks,
                 'created_at': s.created_at.strftime('%Y-%m-%d %H:%M:%S')} for s in sessions]
        return Response(data)
    except Exception as e:
        return Response({'error': str(e)}, status=500)


@api_view(['POST'])
def save_webcam_snapshot(request):
    try:
        session  = ExamSession.objects.get(id=request.data.get('session_id'))
        snapshot = WebcamSnapshot.objects.create(
            session=session, image_path=request.data.get('image_path'),
            is_suspicious=request.data.get('is_suspicious', False),
            reason=request.data.get('reason', '')
        )
        return Response({'message': 'Snapshot saved', 'snapshot_id': snapshot.id}, status=201)
    except Exception as e:
        return Response({'error': str(e)}, status=500)


@api_view(['GET'])
def get_playground_sessions(request):
    try:
        sessions = ExamSession.objects.all().order_by('-created_at')
        data = [{'id': s.id, 'student_name': s.student_name, 'student_email': s.student_email,
                 'status': s.status, 'score': s.score, 'total_marks': s.total_marks,
                 'created_at': s.created_at.strftime('%Y-%m-%d %H:%M:%S')} for s in sessions]
        return Response(data)
    except Exception as e:
        return Response({'error': str(e)}, status=500)


@api_view(['POST'])
def start_playground_exam(request):
    try:
        session = ExamSession.objects.create(
            student_name=request.data.get('student_name'),
            student_email=request.data.get('student_email'),
            start_time=datetime.now(),
            webcam_enabled=request.data.get('webcam_enabled', True)
        )
        return Response({'session_id': session.id}, status=201)
    except Exception as e:
        return Response({'error': str(e)}, status=500)


@api_view(['POST'])
def submit_playground_answer(request, session_id):
    try:
        session  = ExamSession.objects.get(id=session_id)
        question = PythonQuestion.objects.get(id=request.data.get('question_id'))
        answer   = ExamAnswer.objects.create(
            session=session, question=question,
            answer_text=request.data.get('answer_text'),
            selected_choice_id=request.data.get('selected_choice_id'),
            time_taken=request.data.get('time_taken', 0)
        )
        return Response({'answer_id': answer.id}, status=201)
    except Exception as e:
        return Response({'error': str(e)}, status=500)


@api_view(['POST'])
def end_playground_exam(request, session_id):
    try:
        session         = ExamSession.objects.get(id=session_id)
        session.end_time = datetime.now()
        session.status   = 'completed'
        session.save()
        return Response({'message': 'Completed'})
    except ExamSession.DoesNotExist:
        return Response({'error': 'Not found'}, status=404)
    except Exception as e:
        return Response({'error': str(e)}, status=500)


# ── Code Snippets ──

@api_view(['GET'])
def get_code_snippets(request):
    try:
        snippets = CodeSnippet.objects.all().order_by('-created_at')
        data = [{'id': s.id, 'title': s.title, 'description': s.description,
                 'code': s.code, 'language': s.language,
                 'created_at': s.created_at.strftime('%Y-%m-%d %H:%M:%S')} for s in snippets]
        return Response(data)
    except Exception as e:
        return Response({'error': str(e)}, status=500)


@api_view(['POST'])
def execute_code(request):
    try:
        import uuid
        snippet = CodeSnippet.objects.create(
            title=request.data.get('title', 'Untitled'),
            description=request.data.get('description', ''),
            code=request.data.get('code', ''),
            language=request.data.get('language', 'python')
        )
        session = ExecutionSession.objects.create(
            session_id=str(uuid.uuid4())[:8],
            code=request.data.get('code', ''),
            language=request.data.get('language', 'python'),
            status='completed', execution_time=0.05,
            output='Code executed', completed_at=timezone.now()
        )
        return Response({'snippet_id': snippet.id, 'session_id': session.session_id,
                         'output': session.output, 'status': 'success'}, status=201)
    except Exception as e:
        return Response({'error': str(e)}, status=500)


@api_view(['PUT'])
def update_code_snippet(request, snippet_id):
    try:
        snippet = CodeSnippet.objects.get(id=snippet_id)
        snippet.title       = request.data.get('title', snippet.title)
        snippet.description = request.data.get('description', snippet.description)
        snippet.code        = request.data.get('code', snippet.code)
        snippet.language    = request.data.get('language', snippet.language)
        snippet.save()
        return Response({'message': 'Updated', 'snippet_id': snippet.id})
    except CodeSnippet.DoesNotExist:
        return Response({'error': 'Not found'}, status=404)
    except Exception as e:
        return Response({'error': str(e)}, status=500)


@api_view(['DELETE'])
def delete_code_snippet(request, snippet_id):
    try:
        CodeSnippet.objects.get(id=snippet_id).delete()
        return Response({'message': 'Deleted'})
    except CodeSnippet.DoesNotExist:
        return Response({'error': 'Not found'}, status=404)
    except Exception as e:
        return Response({'error': str(e)}, status=500)


# ── Templates ──

@api_view(['GET'])
def get_templates(request):
    try:
        templates = CodeTemplate.objects.all().order_by('-created_at')
        data = [{'id': t.id, 'name': t.name, 'description': t.description,
                 'template_code': t.template_code, 'language': t.language,
                 'category': t.category} for t in templates]
        return Response(data)
    except Exception as e:
        return Response({'error': str(e)}, status=500)


@api_view(['POST'])
def create_template(request):
    try:
        t = CodeTemplate.objects.create(
            name=request.data.get('name', ''), description=request.data.get('description', ''),
            template_code=request.data.get('template_code', ''),
            language=request.data.get('language', 'python'),
            category=request.data.get('category', 'general')
        )
        return Response({'message': 'Created', 'template_id': t.id}, status=201)
    except Exception as e:
        return Response({'error': str(e)}, status=500)


@api_view(['PUT'])
def update_template(request, template_id):
    try:
        t = CodeTemplate.objects.get(id=template_id)
        t.name          = request.data.get('name', t.name)
        t.description   = request.data.get('description', t.description)
        t.template_code = request.data.get('template_code', t.template_code)
        t.language      = request.data.get('language', t.language)
        t.category      = request.data.get('category', t.category)
        t.save()
        return Response({'message': 'Updated', 'template_id': t.id})
    except CodeTemplate.DoesNotExist:
        return Response({'error': 'Not found'}, status=404)
    except Exception as e:
        return Response({'error': str(e)}, status=500)


@api_view(['DELETE'])
def delete_template(request, template_id):
    try:
        CodeTemplate.objects.get(id=template_id).delete()
        return Response({'message': 'Deleted'})
    except CodeTemplate.DoesNotExist:
        return Response({'error': 'Not found'}, status=404)
    except Exception as e:
        return Response({'error': str(e)}, status=500)




@api_view(['GET'])
def get_execution_history(request):
    try:
        sessions = ExecutionSession.objects.all().order_by('-created_at')
        data = [{'id': s.id, 'session_id': s.session_id,
                 'code': s.code[:100] + '...' if len(s.code) > 100 else s.code,
                 'language': s.language, 'output': s.output, 'status': s.status,
                 'created_at': s.created_at.strftime('%Y-%m-%d %H:%M:%S')} for s in sessions]
        return Response(data)
    except Exception as e:
        return Response({'error': str(e)}, status=500)


@api_view(['DELETE'])
def delete_execution_session(request, session_id):
    try:
        ExecutionSession.objects.get(session_id=session_id).delete()
        return Response({'message': 'Deleted'})
    except ExecutionSession.DoesNotExist:
        return Response({'error': 'Not found'}, status=404)
    except Exception as e:
        return Response({'error': str(e)}, status=500)


@api_view(['GET'])
def playground_backend(request):
    return render(request, 'playground.html')




class AllExamListView(ListAPIView):
    serializer_class = ExamSerializer
    def get_queryset(self):
        user_id = self.request.query_params.get('user_id')
        return Exam.objects.filter(user_id=user_id).select_related('attempt').prefetch_related(
            'mcq_questions', 'coding_questions__test_cases'
        ).order_by('-start_date')


class FinishedExamListView(ListAPIView):
    serializer_class = ExamSerializer
    def get_queryset(self):
        user_id = self.request.query_params.get('user_id')
        return Exam.objects.filter(is_finished=True, user_id=user_id).select_related('attempt')


class UpcomingExamListView(ListAPIView):
    serializer_class = ExamSerializer
    def get_queryset(self):
        user_id = self.request.query_params.get('user_id')
        return Exam.objects.filter(is_finished=False, user_id=user_id).select_related('attempt').order_by('start_date')


class UpdateAttemptView(APIView):
    def patch(self, request, pk):
        try:
            exam = Exam.objects.get(pk=pk)
        except Exam.DoesNotExist:
            return Response({"error": "Exam not found"}, status=status.HTTP_404_NOT_FOUND)
        attempt, _ = ExamAttempt.objects.get_or_create(exam=exam)
        attempt.status = request.data.get('status')
        attempt.attempted_at = timezone.now() if attempt.status == 'attempted' else None
        attempt.save()
        return Response(ExamSerializer(exam).data)


@api_view(['POST'])
def submit_mcq_answer(request):
    from .models import User as CustomUser
    try:
        user     = CustomUser.objects.get(pk=request.data.get('user_id'))
        question = MCQQuestion.objects.get(pk=request.data.get('question_id'))
    except Exception:
        return Response({"error": "Invalid"}, status=400)
    selected   = request.data.get('selected_option', '').upper()
    is_correct = selected == question.correct_option.upper()
    MCQAnswer.objects.update_or_create(
        user=user, question=question,
        defaults={'selected_option': selected, 'is_correct': is_correct}
    )
    return Response({"is_correct": is_correct, "correct_option": question.correct_option,
                     "marks_earned": question.marks if is_correct else 0})


@api_view(['POST'])
def submit_mcq_exam(request):
    from .models import User as CustomUser
    try:
        user = CustomUser.objects.get(pk=request.data.get('user_id'))
        exam = Exam.objects.get(pk=request.data.get('exam_id'))
    except Exception:
        return Response({"error": "Invalid user or exam"}, status=400)
    total_score = 0
    results = []
    for ans in request.data.get('answers', []):
        try:
            question   = MCQQuestion.objects.get(pk=ans['question_id'])
            selected   = ans.get('selected_option', '').upper()
            is_correct = selected == question.correct_option.upper()
            earned     = question.marks if is_correct else 0
            total_score += earned
            MCQAnswer.objects.update_or_create(
                user=user, question=question,
                defaults={'selected_option': selected, 'is_correct': is_correct}
            )
            results.append({"question_id": question.id, "selected": selected,
                            "correct": question.correct_option, "is_correct": is_correct, "marks_earned": earned})
        except MCQQuestion.DoesNotExist:
            continue
    exam.score = total_score
    exam.save()
    attempt, _ = ExamAttempt.objects.get_or_create(exam=exam)
    attempt.status = 'attempted'
    attempt.attempted_at = timezone.now()
    attempt.save()
    return Response({"total_score": total_score, "total_marks": exam.total_marks,
                     "percentage": round((total_score / exam.total_marks) * 100, 2), "results": results})


@api_view(['POST'])
def run_code(request):
    try:
        question = CodingQuestion.objects.get(pk=request.data.get('question_id'))
    except CodingQuestion.DoesNotExist:
        return Response({"error": "Question not found"}, status=400)
    language     = request.data.get('language', 'python')
    code         = request.data.get('code', '')
    test_cases   = TestCase.objects.filter(question=question)
    passed       = 0
    total        = test_cases.count()
    case_results = []
    for tc in test_cases:
        result   = _execute_code(language, code, tc.input_data)
        actual   = result.get('output', '').strip()
        expected = tc.expected_output.strip()
        is_pass  = actual == expected
        if is_pass:
            passed += 1
        case_results.append({
            "input":    tc.input_data if tc.is_sample else "Hidden",
            "expected": expected if tc.is_sample else "Hidden",
            "actual":   actual if tc.is_sample else ("✓" if is_pass else "✗"),
            "passed":   is_pass, "error": result.get('error', '')
        })
    return Response({"passed": passed, "total": total, "case_results": case_results})


def _execute_code(language, code, input_data):
    try:
        if language == 'python':
            with tempfile.NamedTemporaryFile(suffix='.py', mode='w', delete=False) as f:
                f.write(code); fname = f.name
            r = subprocess.run(['python', fname], input=input_data, capture_output=True, text=True, timeout=5)
            os.unlink(fname)
            return {'output': r.stdout, 'error': r.stderr}
        elif language == 'cpp':
            with tempfile.NamedTemporaryFile(suffix='.cpp', mode='w', delete=False) as f:
                f.write(code); fname = f.name
            exe  = fname.replace('.cpp', '.exe')
            comp = subprocess.run(['g++', fname, '-o', exe], capture_output=True, text=True)
            if comp.returncode != 0:
                os.unlink(fname); return {'output': '', 'error': comp.stderr}
            r = subprocess.run([exe], input=input_data, capture_output=True, text=True, timeout=5)
            os.unlink(fname); os.unlink(exe)
            return {'output': r.stdout, 'error': r.stderr}
        elif language == 'java':
            with tempfile.NamedTemporaryFile(suffix='.java', mode='w', delete=False, prefix='Main') as f:
                f.write(code); fname = f.name
            comp = subprocess.run(['javac', fname], capture_output=True, text=True)
            if comp.returncode != 0:
                os.unlink(fname); return {'output': '', 'error': comp.stderr}
            r = subprocess.run(['java', '-cp', os.path.dirname(fname), 'Main'],
                               input=input_data, capture_output=True, text=True, timeout=5)
            os.unlink(fname)
            return {'output': r.stdout, 'error': r.stderr}
    except subprocess.TimeoutExpired:
        return {'output': '', 'error': 'Time Limit Exceeded'}
    except Exception as e:
        return {'output': '', 'error': str(e)}