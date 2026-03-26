from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated,AllowAny
from rest_framework.exceptions import ValidationError

from ..models import Job, AppliedJob
from ..serializers import JobSerializer, AppliedJobSerializer
from rest_framework_simplejwt.authentication import JWTAuthentication



class JobViewSet(viewsets.ModelViewSet):

    queryset = Job.objects.all().order_by("-created_at")
    serializer_class = JobSerializer
    permission_classes = [AllowAny]

    def get_serializer_context(self):
        return {"request": self.request}

class AppliedJobViewSet(viewsets.ModelViewSet):
    queryset = AppliedJob.objects.all()
    serializer_class = AppliedJobSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return AppliedJob.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        user = self.request.user
        job = serializer.validated_data.get('job')

        if not job:
            raise ValidationError({"job": "Job is required"})

        # Prevent duplicate apply
        if AppliedJob.objects.filter(user=user, job=job).exists():
            raise ValidationError("Already applied")

        serializer.save(user=user)

# ================= ADMIN JOB API =================
from rest_framework.permissions import IsAdminUser

class AdminJobViewSet(viewsets.ModelViewSet):

    queryset = Job.objects.all().order_by("-created_at")
    serializer_class = JobSerializer
    # permission_classes = [IsAuthenticated]
    # authentication_classes = [JWTAuthentication]

    def perform_create(self, serializer):
        serializer.save()