from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.generics import ListAPIView
from rest_framework.views import APIView
from rest_framework import status
from django.utils import timezone
from .models import Exam, ExamAttempt, User
from .serializers import ExamSerializer

@api_view(['POST'])
def login_view(request):
    username = request.data.get('username')
    password = request.data.get('password')
    try:
        user = User.objects.get(username=username, password=password)
        return Response({
            "message": "Login successful",
            "user": {
                "username": user.username,
                "email": user.email
            }
        })
    except User.DoesNotExist:
        return Response({"error": "Invalid username or password"}, status=400)


class FinishedExamListView(ListAPIView):
    serializer_class = ExamSerializer

    def get_queryset(self):
        user_id = self.request.query_params.get('user_id')
        return Exam.objects.filter(
            is_finished=True, user_id=user_id
        ).select_related('attempt')


class UpdateAttemptView(APIView):
    def patch(self, request, pk):
        try:
            exam = Exam.objects.get(pk=pk)
        except Exam.DoesNotExist:
            return Response({"error": "Exam not found"}, status=status.HTTP_404_NOT_FOUND)

        attempt, _ = ExamAttempt.objects.get_or_create(exam=exam)
        new_status = request.data.get('status')
        attempt.status = new_status
        attempt.attempted_at = timezone.now() if new_status == 'attempted' else None
        attempt.save()
        return Response(ExamSerializer(exam).data, status=status.HTTP_200_OK)