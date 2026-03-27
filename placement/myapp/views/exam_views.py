from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from django.shortcuts import get_object_or_404
import json

from ..models import ExamSession, ExamAnswer, PythonQuestion, Choice, WebcamSnapshot
from ..serializers import PythonQuestionSerializer


# ---------------- START EXAM SESSION ----------------
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
    }, status=status.HTTP_201_CREATED)


# ---------------- SUBMIT ANSWER ----------------
@api_view(['POST'])
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

    return Response({
        "score": session.score,
        "total_marks": session.total_marks
    })


# ---------------- SAVE WEBCAM SNAPSHOT ----------------
@api_view(['POST'])
def save_webcam_snapshot(request):
    data = request.data

    session_id = data.get('session_id')
    image_path = data.get('image_path')
    is_suspicious = data.get('is_suspicious', False)
    reason = data.get('reason', '')

    if not session_id or not image_path:
        return Response(
            {"error": "session_id and image_path required"},
            status=status.HTTP_400_BAD_REQUEST
        )

    session = get_object_or_404(ExamSession, id=session_id)

    snapshot = WebcamSnapshot.objects.create(
        session=session,
        image_path=image_path,
        is_suspicious=is_suspicious,
        reason=reason
    )

    return Response({
        "message": "Snapshot saved",
        "snapshot_id": snapshot.id
    }, status=status.HTTP_201_CREATED)


# ---------------- GET ALL EXAM SESSIONS ----------------
@api_view(['GET'])
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
def get_questions(request):

    questions = PythonQuestion.objects.all()

    serializer = PythonQuestionSerializer(questions, many=True)

    return Response(serializer.data)


# ---------------- CREATE QUESTION ----------------
@api_view(['POST'])
def create_question(request):

    serializer = PythonQuestionSerializer(data=request.data)

    if serializer.is_valid():

        serializer.save()

        return Response(serializer.data, status=status.HTTP_201_CREATED)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
   
 # ---------------- DELETE EXAM SESSION ----------------
@api_view(['DELETE'])
def delete_exam_session(request, pk):

    session = get_object_or_404(ExamSession, id=pk)
    session.delete()

    return Response({"message": "Deleted successfully"}, status=status.HTTP_200_OK)
