from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.utils import timezone
from rest_framework import status
import json
from ..models import ExamSession, ExamAnswer, PythonQuestion, Choice, WebcamSnapshot


@api_view(['POST'])
def start_exam_session(request):
    data = request.data
    session = ExamSession.objects.create(
        student_name=data.get("student_name"),
        student_email=data.get("student_email"),
        start_time=timezone.now()
    )
    return Response({
        "session_id": session.id
    })


@api_view(['POST'])
def submit_answer(request):

    data = request.data
    session = ExamSession.objects.get(id=data.get("session_id"))
    question = PythonQuestion.objects.get(id=data.get("question_id"))
    answer = ExamAnswer.objects.create(
        session=session,
        question=question,
        selected_choice_id=data.get("selected_choice_id"),
        answer_text=data.get("answer_text")
    )
    return Response({"answer_id": answer.id})


@api_view(['POST'])
def end_exam_session(request, session_id):
    session = ExamSession.objects.get(id=session_id)
    session.end_time = timezone.now()
    session.status = "completed"
    answers = ExamAnswer.objects.filter(session=session)
    total_score = 0
    total_marks = 0
    for answer in answers:
        question = answer.question
        total_marks += question.marks
        if answer.selected_choice_id:
            choice = Choice.objects.get(id=answer.selected_choice_id)
            if choice.is_correct:
                total_score += question.marks
    session.score = total_score
    session.total_marks = total_marks
    session.save()
    return Response({
        "score": session.score,
        "total": session.total_marks
    })

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