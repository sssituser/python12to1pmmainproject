import threading
import logging

from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.exceptions import ValidationError
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.response import Response

from ..models import Job, AppliedJob, User
from ..serializers import JobSerializer, AppliedJobSerializer
from ..email_utils import send_job_notification_email

logger = logging.getLogger(__name__)


def _notify_all_students(job):
    """
    Runs in a background thread: sends a job notification email to every
    student user that has a valid email address.
    """
    try:
        students = User.objects.filter(role='student', email__isnull=False).exclude(email='')
        for student in students:
            try:
                send_job_notification_email(
                    user_email=student.email,
                    username=student.get_full_name() or student.username,
                    job=job,
                )
            except Exception as e:
                logger.error(f"Failed to send job notification to {student.email}: {e}")
    except Exception as e:
        logger.error(f"Error in _notify_all_students: {e}")


# ================= PUBLIC JOB API =================
class JobViewSet(viewsets.ModelViewSet):
    """
    Public API - Anyone can view jobs
    """
    queryset = Job.objects.all().order_by("-created_at")
    serializer_class = JobSerializer

    permission_classes = [AllowAny]
    authentication_classes = []
    def get_serializer_context(self):
        return {"request": self.request}


# ================= APPLIED JOB API =================
class AppliedJobViewSet(viewsets.ModelViewSet):
    """
    Protected API - Only logged-in users
    """
    queryset = AppliedJob.objects.all()
    serializer_class = AppliedJobSerializer

    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def get_queryset(self):
        return AppliedJob.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        user = self.request.user
        job = serializer.validated_data.get('job')

        if not job:
            raise ValidationError({"job": "Job is required"})

        # Prevent duplicate applications
        if AppliedJob.objects.filter(user=user, job=job).exists():
            raise ValidationError("Already applied for this job")

        serializer.save(user=user)


# ================= FACULTY APPLICATIONS API =================
class FacultyApplicationsViewSet(viewsets.ModelViewSet):
    queryset = AppliedJob.objects.all().select_related('user', 'job').order_by('-applied_date')
    serializer_class = AppliedJobSerializer
    
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]
    
    def get_queryset(self):
        user = self.request.user
        username = self.request.query_params.get('username')

        if user and (user.is_staff or getattr(user, 'role', None) == 'faculty'):
            qs = AppliedJob.objects.all().select_related('user', 'job').order_by('-applied_date')
            if username:
                qs = qs.filter(user__username__iexact=username)
            return qs
        else:
            return AppliedJob.objects.filter(user=user).select_related('user', 'job').order_by('-applied_date')
    
    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    def update(self, request, *args, **kwargs):
        application = self.get_object()
        action = request.data.get('action')

        if action == "accept":
            application.status = "accepted"
        elif action == "reject":
            application.status = "rejected"
        elif action == "pending":   
             application.status = "pending"
        else:
            return Response({"error": "Invalid action"}, status=400)

        application.save()

        return Response({
            "message": "Status updated successfully",
            "status": application.status
        })
  


# ================= ADMIN JOB API =================
class AdminJobViewSet(viewsets.ModelViewSet):
    """
    Job management API for authenticated faculty users.
    On job creation, all student users receive an email notification.
    """
    queryset = Job.objects.all().order_by("-created_at")
    serializer_class = JobSerializer

    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    def perform_create(self, serializer):
        job = serializer.save()
        # Send notifications in a daemon thread so the API response is immediate
        thread = threading.Thread(target=_notify_all_students, args=(job,), daemon=True)
        thread.start()
        logger.info(f"Job '{job.job_title}' created. Student notification thread started.")

