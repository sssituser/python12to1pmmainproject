from rest_framework.decorators import api_view, permission_classes, throttle_classes
from myapp.throttles import ExamRateThrottle, AuthenticatedUserThrottle
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from django.shortcuts import get_object_or_404
import json

from myapp.models import (
    ExamSession, ExamAnswer, PythonQuestion, Choice,
    AutomatedExamConfig, ExamQuestion, ExamQuestionChoice, ExamPaper,
    ExamPaperQuestionRelation, ExamViolationLog
)
from myapp.serializers import PythonQuestionSerializer, AutomatedExamConfigSerializer
from myapp.email_utils import send_exam_confirmation_email
import threading
import random


# ============================================================
# PLACEMENT EXAM DYNAMIC STORAGE
# Stores exams as JSON in a simple in-memory + persistent dict
# Uses AutomatedExamConfig as backend storage with JSONField
# ============================================================

_EXAM_STORE = []   # Simple in-process store (persists for session)

@api_view(['POST'])
@permission_classes([AllowAny])
@throttle_classes([AuthenticatedUserThrottle])
def create_placement_exam(request):
    """
    Persist a complete 10-step wizard exam to the database.
    Stores the full payload in AutomatedExamConfig with extended JSON.
    """
    data = request.data

    title = str(data.get('title', '')).strip()
    if not title:
        return Response({"error": "Exam title is required"}, status=400)

    exam_type = data.get('exam_type', 'daily')
    subject = str(data.get('subject', 'PYTHON')).upper()
    course_name = str(data.get('course_name', '')).strip().upper()
    duration = int(data.get('duration', 60))
    total_questions = int(data.get('total_questions', 30))
    total_marks = int(data.get('total_marks', 30))
    pass_marks = int(data.get('pass_marks', 15))
    marks_per_question = int(data.get('marks_per_question', 1))

    # Persist via AutomatedExamConfig (reuse existing infrastructure)
    import json as _json
    config_key = f"{course_name}_{exam_type}_{subject}_{title}".replace(' ', '_')[:100]

    # Create a unique course_name key per exam (avoids UniqueConstraint collision)
    unique_course_key = f"{course_name or subject}::{exam_type}::{title}"[:255]

    config_data = {
        'exam_name': title,
        'subjects': [subject],
        'duration': duration,
        'passing_strategy': 'marks',
        'requirement': pass_marks,
        'question_count': total_questions,
        'marks_per_question': marks_per_question,
    }

    # Save or update the config using update_or_create
    config, created = AutomatedExamConfig.objects.update_or_create(
        course_name=unique_course_key,
        defaults=config_data
    )

    # Save questions if provided
    questions = data.get('questions', [])
    paper = None
    if questions:
        paper = ExamPaper.objects.create(
            title=title,
            subject=subject,
            duration=duration,
            total_marks=total_marks,
            instructions=data.get('description', '')
        )
        for idx, q in enumerate(questions):
            question = ExamQuestion.objects.create(
                subject=subject,
                topic=data.get('topic', ''),
                difficulty=q.get('difficulty', 'medium'),
                question_text=q.get('question', ''),
                question_type='mcq',
                marks=q.get('marks', marks_per_question)
            )
            opts = q.get('options', [])
            correct_idx = q.get('correct', 0)
            for oi, opt_text in enumerate(opts):
                ExamQuestionChoice.objects.create(
                    question=question,
                    choice_text=opt_text,
                    is_correct=(oi == correct_idx)
                )
            ExamPaperQuestionRelation.objects.create(
                paper=paper, question=question, order=idx + 1
            )

    # Store full metadata in memory store for list API
    exam_entry = {
        'id': config.id,
        'title': title,
        'exam_type': exam_type,
        'subject': subject,
        'course': course_name,
        'duration': duration,
        'total_questions': len(questions) if questions else total_questions,
        'total_marks': total_marks,
        'pass_marks': pass_marks,
        'paper_id': paper.id if paper else None,
        'status': 'scheduled',
        'created_at': timezone.now().isoformat(),
        'settings': {
            'webcam_required': data.get('webcam_required', False),
            'face_detection': data.get('face_detection', True),
            'multi_face_detection': data.get('multi_face_detection', True),
            'fullscreen_required': data.get('fullscreen_required', True),
            'tab_switch_limit': data.get('tab_switch_limit', 3),
            'disable_copy_paste': data.get('disable_copy_paste', True),
            'randomize_questions': data.get('randomize_questions', True),
            'randomize_options': data.get('randomize_options', True),
            'negative_marking': data.get('negative_marking', False),
            'negative_marks': data.get('negative_marks', 0.25),
            'auto_submit': data.get('auto_submit', True),
            'risk_threshold': data.get('risk_threshold', 50),
            'departments': data.get('departments', []),
            'years': data.get('years', []),
            'start_time': data.get('start_time', ''),
            'end_time': data.get('end_time', ''),
            'show_result_immediately': data.get('show_result_immediately', True),
            'show_leaderboard': data.get('show_leaderboard', True),
            'certificate_enabled': data.get('certificate_enabled', False),
        }
    }
    # Deduplicate by id
    global _EXAM_STORE
    _EXAM_STORE = [e for e in _EXAM_STORE if e['id'] != config.id]
    _EXAM_STORE.insert(0, exam_entry)

    return Response({
        "status": "success",
        "exam_id": config.id,
        "paper_id": paper.id if paper else None,
        "message": f"Exam '{title}' published successfully!"
    })


@api_view(['GET'])
@permission_classes([AllowAny])
@throttle_classes([AuthenticatedUserThrottle])
def list_placement_exams(request):
    """
    List all published placement exams (from in-memory store + DB)
    """
    global _EXAM_STORE

    # Also pull from DB for persistence across restarts
    db_configs = AutomatedExamConfig.objects.all().order_by('-id')[:50]
    db_entries = []
    for c in db_configs:
        # Extract exam_type from the course_name key (format: "course::type::title")
        parts = c.course_name.split("::")
        exam_type = parts[1] if len(parts) >= 2 else 'daily'
        title = parts[2] if len(parts) >= 3 else c.exam_name
        paper = ExamPaper.objects.filter(title=title).order_by('-id').first()
        db_entries.append({
            'id': c.id,
            'title': title,
            'exam_type': exam_type,
            'subject': c.subjects[0] if c.subjects else 'N/A',
            'course': parts[0] if parts else c.course_name,
            'duration': c.duration,
            'total_questions': c.question_count,
            'total_marks': c.question_count * c.marks_per_question,
            'pass_marks': c.requirement,
            'paper_id': paper.id if paper else None,
            'start_time': None,
            'end_time': None,
            'status': 'scheduled',
            'settings': {
                'webcam_required': False,
                'face_detection': True,
                'fullscreen_required': True,
            }
        })

    # Merge: in-memory takes priority (has richer metadata)
    mem_ids = {e['id'] for e in _EXAM_STORE}
    merged = list(_EXAM_STORE) + [e for e in db_entries if e['id'] not in mem_ids]

    return Response(merged)


# ---------------- MULTI-SUBJECT EXAM ENGINE APIS ----------------

@api_view(['POST'])
@permission_classes([AllowAny])
@throttle_classes([ExamRateThrottle])
def log_exam_violation(request):
    """
    Log secure assessment visibility, tab switches, and full-screen exits.
    Calculates dynamic Browser Lock Score on the fly.
    """
    data = request.data
    session_id = data.get('session_id')
    violation_type = data.get('violation_type')
    remarks = data.get('remarks', '')
    image_snapshot = data.get('image_snapshot', '')

    if not session_id or not violation_type:
        return Response({"error": "session_id and violation_type are required"}, status=400)

    session = get_object_or_404(ExamSession, id=session_id)
    
    # Calculate penalty scores
    penalty_mapping = {
        'TAB_SWITCH': 5,
        'FULLSCREEN_EXIT': 10,
        'FACE_MISSING': 10,
        'MULTIPLE_FACE': 25,
        'PHONE_DETECTED': 30,
        'COPY_ATTEMPT': 5,
    }
    severity = penalty_mapping.get(violation_type, 5)

    violation = ExamViolationLog.objects.create(
        session=session,
        violation_type=violation_type,
        severity_score=severity,
        image_snapshot=image_snapshot,
        remarks=remarks
    )

    # Accumulate Browser Lock Risk Score
    session.browser_lock_score += severity
    
    # Determine risk verdict
    if session.browser_lock_score > 50:
        session.final_verdict = 'High Risk'
    elif session.browser_lock_score > 20:
        session.final_verdict = 'Suspicious'
    else:
        session.final_verdict = 'Safe'
        
    session.save()

    return Response({
        "status": "success",
        "violation_id": violation.id,
        "browser_lock_score": session.browser_lock_score,
        "final_verdict": session.final_verdict
    })


@api_view(['POST'])
@permission_classes([AllowAny])
@throttle_classes([AuthenticatedUserThrottle])
def create_exam_question_api(request):
    """
    Create custom questions manually inside Question Bank
    """
    data = request.data
    subject = data.get('subject', 'PYTHON').upper()
    topic = data.get('topic', '').strip()
    difficulty = data.get('difficulty', 'medium')
    question_text = data.get('question_text', '').strip()
    question_type = data.get('question_type', 'mcq')
    marks = int(data.get('marks', 2))
    choices = data.get('choices', [])

    if not question_text:
        return Response({"error": "question_text is required"}, status=400)

    question = ExamQuestion.objects.create(
        subject=subject,
        topic=topic,
        difficulty=difficulty,
        question_text=question_text,
        question_type=question_type,
        marks=marks
    )

    for choice_data in choices:
        ExamQuestionChoice.objects.create(
            question=question,
            choice_text=choice_data.get('choice_text'),
            is_correct=choice_data.get('is_correct', False)
        )

    return Response({"status": "success", "question_id": question.id})


@api_view(['POST'])
@permission_classes([AllowAny])
@throttle_classes([AuthenticatedUserThrottle])
def auto_generate_exam_paper(request):
    """
    Dynamically select random questions matching customized rules
    """
    data = request.data
    title = data.get('title', 'Automated Exam')
    subject = data.get('subject', 'PYTHON').upper()
    easy_count = int(data.get('easy_count', 10))
    medium_count = int(data.get('medium_count', 10))
    hard_count = int(data.get('hard_count', 5))
    duration = int(data.get('duration', 60))

    # Fetch pool of questions
    easy_q = list(ExamQuestion.objects.filter(subject=subject, difficulty='easy'))
    medium_q = list(ExamQuestion.objects.filter(subject=subject, difficulty='medium'))
    hard_q = list(ExamQuestion.objects.filter(subject=subject, difficulty='hard'))

    selected_questions = []
    selected_questions.extend(random.sample(easy_q, min(easy_count, len(easy_q))))
    selected_questions.extend(random.sample(medium_q, min(medium_count, len(medium_q))))
    selected_questions.extend(random.sample(hard_q, min(hard_count, len(hard_q))))

    if not selected_questions:
        return Response({"error": "No questions exist matching criteria in Question Bank"}, status=400)

    total_marks = sum(q.marks for q in selected_questions)
    
    paper = ExamPaper.objects.create(
        title=title,
        subject=subject,
        duration=duration,
        total_marks=total_marks
    )

    for idx, q in enumerate(selected_questions):
        ExamPaperQuestionRelation.objects.create(
            paper=paper,
            question=q,
            order=idx + 1
        )

    return Response({
        "status": "success",
        "paper_id": paper.id,
        "total_questions": len(selected_questions),
        "total_marks": total_marks
    })


@api_view(['GET'])
@permission_classes([AllowAny])
@throttle_classes([AuthenticatedUserThrottle])
def get_exam_paper_questions(request, paper_id):
    """
    Fetch all questions and choices belonging to an Exam Paper
    """
    paper = get_object_or_404(ExamPaper, id=paper_id)
    relations = ExamPaperQuestionRelation.objects.filter(paper=paper).order_by('order')
    
    questions_list = []
    for rel in relations:
        q = rel.question
        choices = []
        correct_index = 0
        for i, c in enumerate(q.choices.all()):
            choices.append({"id": c.id, "choice_text": c.choice_text})
            if c.is_correct:
                correct_index = i
        questions_list.append({
            "id": q.id,
            "question_text": q.question_text,
            "question_type": q.question_type,
            "difficulty": q.difficulty,
            "marks": q.marks,
            "choices": choices,
            "correct": correct_index
        })

    return Response({
        "paper_id": paper.id,
        "title": paper.title,
        "subject": paper.subject,
        "duration": paper.duration,
        "total_marks": paper.total_marks,
        "instructions": paper.instructions,
        "questions": questions_list
    })


# ---------------- AUTOMATED EXAM CONFIG ----------------
@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
@throttle_classes([AuthenticatedUserThrottle])
def automated_exam_config_view(request):
    if request.method == 'POST':
        data = request.data
        course_name = str(data.get('course_name', '')).strip()
        
        if not course_name:
            # For 1000% reliability, don't 400. Just ignore if possible or return success with a warning.
            return Response({"status": "skipped", "message": "course_name required for save"}, status=200)

        # 🛡️ 1000% Persist automated configuration for the entire Course (Safe Case-Insensitive Match)
        course_name_normalized = course_name.upper()
        
        config = AutomatedExamConfig.objects.filter(course_name__iexact=course_name_normalized).first()
        
        # 🏗️ SAFE TYPE CONVERSION SYSTEM
        def safe_int(val, default):
            try:
                if val is None or str(val).strip() == "": return default
                return int(val)
            except: return default

        defaults = {
            'course_name': course_name_normalized, 
            'exam_name': data.get('exam_name', 'Daily Assessment'),
            'subjects': data.get('subjects', []),
            'duration': safe_int(data.get('duration'), 80),
            'passing_strategy': data.get('passing_strategy', 'percentage'),
            'requirement': safe_int(data.get('requirement'), 50),
            'question_count': safe_int(data.get('question_count'), 25),
            'marks_per_question': safe_int(data.get('marks_per_question'), 2),
        }

        if config:
            for key, value in defaults.items():
                setattr(config, key, value)
            config.save()
            msg = f"Successfully updated automated config for {course_name_normalized}"
        else:
            config = AutomatedExamConfig.objects.create(**defaults)
            msg = f"Successfully created automated config for {course_name_normalized}"

        return Response({
            "status": "success", 
            "config_id": config.id, 
            "message": msg
        })


    # GET logic: Fetch the active config for a specific course (🛡️ Robust Lookup)
    course_name = request.query_params.get('course_name', '').strip()
    if not course_name:
        # 1000% Reliability: Return empty instead of 400 error
        return Response({"status": "not_found", "message": "No course_name provided"}, status=200)
        
    config = AutomatedExamConfig.objects.filter(course_name__iexact=course_name).first()
    if not config:
        return Response({"status": "not_found", "message": "No specific faculty override found for this course."}, status=200)

        
    return Response({
        "status": "success",
        "exam_name": config.exam_name,
        "subjects": config.subjects,
        "duration": config.duration,
        "passing_strategy": config.passing_strategy,
        "requirement": config.requirement,
        "question_count": config.question_count,
        "marks_per_question": config.marks_per_question,
    })


# ---------------- START EXAM SESSION ----------------
@api_view(['POST'])
@throttle_classes([ExamRateThrottle])
def start_exam_session(request):
    data = request.data

    session = ExamSession.objects.create(
        student_name=data.get("student_name"),
        student_email=data.get("student_email"),
        start_time=timezone.now()
    )

    return Response({
        "session_id": session.id
    }, status=status.HTTP_201_CREATED)


# ---------------- SUBMIT ANSWER ----------------
@api_view(['POST'])
@throttle_classes([ExamRateThrottle])
def submit_answer(request, session_id=None):
    data = request.data

    # Use session_id from URL if available, else from data
    s_id = session_id or data.get("session_id")
    session = get_object_or_404(ExamSession, id=s_id)
    question = get_object_or_404(PythonQuestion, id=data.get("question_id"))

    answer = ExamAnswer.objects.create(
        session=session,
        question=question,
        selected_choice_id=data.get("selected_choice_id"),
        answer_text=data.get("answer_text")
    )

    return Response({
        "answer_id": answer.id
    }, status=status.HTTP_201_CREATED)


# ---------------- END EXAM SESSION ----------------
@api_view(['POST'])
@throttle_classes([ExamRateThrottle])
def end_exam_session(request, session_id):
    session = get_object_or_404(ExamSession, id=session_id)

    session.end_time = timezone.now()
    session.status = "completed"

    answers = ExamAnswer.objects.filter(session=session)

    total_score = 0
    total_marks = 0

    for answer in answers:

        question = answer.question
        total_marks += question.marks

        if answer.selected_choice_id:
            try:
                choice = Choice.objects.get(id=answer.selected_choice_id)

                if choice.is_correct:
                    total_score += question.marks

            except Choice.DoesNotExist:
                pass

    session.score = total_score
    session.total_marks = total_marks
    session.save()

    # Send exam report email notification
    if session.student_email:
        try:
            threading.Thread(
                target=send_exam_confirmation_email,
                args=(session.student_email, "Placement Portal Exam", session.score, session.total_marks)
            ).start()
        except Exception as e:
            print(f"Error starting email thread: {e}")

    return Response({
        "score": session.score,
        "total_marks": session.total_marks
    })


# Webcam snapshot save endpoint was removed as webcam proctoring is disabled.


# ---------------- GET ALL EXAM SESSIONS ----------------
@api_view(['GET'])
@throttle_classes([AuthenticatedUserThrottle])
def get_exam_sessions(request):

    sessions = ExamSession.objects.all().order_by('-created_at')

    data = []

    for session in sessions:

        data.append({
            "id": session.id,
            "student_name": session.student_name,
            "student_email": session.student_email,
            "start_time": session.start_time,
            "end_time": session.end_time,
            "status": session.status,
            "score": session.score,
            "total_marks": session.total_marks,
            "webcam_enabled": session.webcam_enabled,
            "created_at": session.created_at
        })

    return Response(data)


# ---------------- GET ALL QUESTIONS ----------------
@api_view(['GET'])
@throttle_classes([AuthenticatedUserThrottle])
def get_questions(request):

    questions = PythonQuestion.objects.all()

    serializer = PythonQuestionSerializer(questions, many=True)

    return Response(serializer.data)


# ---------------- CREATE QUESTION ----------------
@api_view(['POST'])
@throttle_classes([AuthenticatedUserThrottle])
def create_question(request):

    serializer = PythonQuestionSerializer(data=request.data)

    if serializer.is_valid():

        serializer.save()

        return Response(serializer.data, status=status.HTTP_201_CREATED)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
   
 # ---------------- DELETE EXAM SESSION ----------------
@api_view(['DELETE'])
@throttle_classes([AuthenticatedUserThrottle])
def delete_exam_session(request, pk):

    session = get_object_or_404(ExamSession, id=pk)
    session.delete()

    return Response({"message": "Deleted successfully"}, status=status.HTTP_200_OK)


# ---------------- IMPORT EXAM QUESTIONS FILE ----------------
import csv
import io
import re

@api_view(['POST'])
@permission_classes([AllowAny])
@throttle_classes([AuthenticatedUserThrottle])
def import_exam_questions_file(request):
    """
    Parse CSV, Excel, DOCX, or PDF uploaded by faculty,
    and return JSON list of structured questions for the draft.
    """
    if 'file' not in request.FILES:
        return Response({"error": "No file uploaded"}, status=400)
    
    uploaded_file = request.FILES['file']
    filename = uploaded_file.name.lower()
    
    questions = []
    
    try:
        if filename.endswith('.csv'):
            file_data = uploaded_file.read().decode('utf-8-sig', errors='ignore')
            reader = csv.reader(io.StringIO(file_data))
            header = next(reader, None)  # skip header
            for row in reader:
                if not row or len(row) < 6:
                    continue
                question_text = row[0].strip()
                options = [row[1].strip(), row[2].strip(), row[3].strip(), row[4].strip()]
                correct_indicator = row[5].strip()
                
                correct_idx = 0
                if correct_indicator.isdigit():
                    correct_idx = int(correct_indicator)
                elif correct_indicator.upper() in ['A', 'B', 'C', 'D']:
                    correct_idx = ord(correct_indicator.upper()) - ord('A')
                else:
                    for idx, opt in enumerate(options):
                        if opt.lower() == correct_indicator.lower():
                            correct_idx = idx
                            break
                
                difficulty = row[6].strip().lower() if len(row) > 6 else 'medium'
                if difficulty not in ['easy', 'medium', 'hard']:
                    difficulty = 'medium'
                    
                marks = int(row[7].strip()) if len(row) > 7 and row[7].strip().isdigit() else 1
                
                questions.append({
                    "question": question_text,
                    "options": options,
                    "correct": correct_idx,
                    "difficulty": difficulty,
                    "marks": marks
                })
                
        elif filename.endswith('.xlsx') or filename.endswith('.xls'):
            import openpyxl
            wb = openpyxl.load_workbook(uploaded_file, data_only=True)
            sheet = wb.active
            rows = iter(sheet.rows)
            header = next(rows, None)  # skip header
            for r in rows:
                row = [cell.value for cell in r]
                if not row or len(row) < 6 or not row[0]:
                    continue
                question_text = str(row[0]).strip()
                options = [str(row[1]).strip(), str(row[2]).strip(), str(row[3]).strip(), str(row[4]).strip()]
                correct_indicator = str(row[5]).strip()
                
                correct_idx = 0
                if correct_indicator.isdigit():
                    correct_idx = int(correct_indicator)
                elif correct_indicator.upper() in ['A', 'B', 'C', 'D']:
                    correct_idx = ord(correct_indicator.upper()) - ord('A')
                else:
                    for idx, opt in enumerate(options):
                        if opt.lower() == correct_indicator.lower():
                            correct_idx = idx
                            break
                            
                difficulty = str(row[6]).strip().lower() if len(row) > 6 and row[6] else 'medium'
                if difficulty not in ['easy', 'medium', 'hard']:
                    difficulty = 'medium'
                    
                marks = int(row[7]) if len(row) > 7 and str(row[7]).isdigit() else 1
                
                questions.append({
                    "question": question_text,
                    "options": options,
                    "correct": correct_idx,
                    "difficulty": difficulty,
                    "marks": marks
                })
                
        elif filename.endswith('.docx'):
            import docx
            doc = docx.Document(uploaded_file)
            full_text = "\n".join([p.text for p in doc.paragraphs])
            questions = parse_raw_text_to_questions(full_text)
            
        elif filename.endswith('.pdf'):
            import pypdf
            reader = pypdf.PdfReader(uploaded_file)
            full_text = ""
            for page in reader.pages:
                full_text += page.extract_text() + "\n"
            questions = parse_raw_text_to_questions(full_text)
            
        else:
            return Response({"error": "Unsupported file format. Please upload CSV, Excel, Word (docx), or PDF."}, status=400)
            
    except Exception as e:
        return Response({"error": f"Failed to parse file: {str(e)}"}, status=500)
        
    return Response({"status": "success", "questions": questions})

def parse_raw_text_to_questions(text):
    questions = []
    lines = text.split('\n')
    current_q = None
    
    q_pattern = re.compile(r'^(?:Q(?:uestion)?\s*\d+[\.:]|\d+[\.:])\s*(.*)', re.IGNORECASE)
    opt_pattern = re.compile(r'^\s*([A-D])[\)\.\-\s]\s*(.*)', re.IGNORECASE)
    ans_pattern = re.compile(r'^\s*(?:Correct\s*)?Ans(?:wer)?[\s\.:]+([A-D]|\d+)', re.IGNORECASE)
    
    for line in lines:
        line_str = line.strip()
        if not line_str:
            continue
            
        q_match = q_pattern.match(line_str)
        if q_match:
            if current_q and len(current_q['options']) >= 2:
                while len(current_q['options']) < 4:
                    current_q['options'].append("")
                questions.append(current_q)
            current_q = {
                "question": q_match.group(1).strip(),
                "options": [],
                "correct": 0,
                "difficulty": "medium",
                "marks": 1
            }
            continue
            
        if current_q:
            opt_match = opt_pattern.match(line_str)
            if opt_match:
                opt_val = opt_match.group(2).strip()
                current_q['options'].append(opt_val)
                continue
                
            ans_match = ans_pattern.match(line_str)
            if ans_match:
                ans_val = ans_match.group(1).upper()
                if ans_val in ['A', 'B', 'C', 'D']:
                    current_q['correct'] = ord(ans_val) - ord('A')
                elif ans_val.isdigit():
                    current_q['correct'] = int(ans_val)
                continue
                
            if not current_q['options']:
                current_q['question'] += " " + line_str
                
    if current_q and len(current_q['options']) >= 2:
        while len(current_q['options']) < 4:
            current_q['options'].append("")
        questions.append(current_q)
        
    return questions

