from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAdminUser
from rest_framework.exceptions import ValidationError
from rest_framework_simplejwt.authentication import JWTAuthentication

from ..models import Job, AppliedJob
from ..serializers import JobSerializer, AppliedJobSerializer


# ================= PUBLIC JOB API =================
class JobViewSet(viewsets.ModelViewSet):
    """
    Public API - Anyone can view jobs
    """
    queryset = Job.objects.all().order_by("-created_at")
    serializer_class = JobSerializer

    permission_classes = [AllowAny]
    authentication_classes = []   # ✅ disables JWT for this API

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


# ================= ADMIN JOB API =================
class AdminJobViewSet(viewsets.ModelViewSet):
    """
    Admin-only API - Manage jobs
    """
    queryset = Job.objects.all().order_by("-created_at")
    serializer_class = JobSerializer

    permission_classes = [IsAdminUser]
    authentication_classes = [JWTAuthentication]

    def perform_create(self, serializer):
        serializer.save()