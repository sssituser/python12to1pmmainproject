from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import ValidationError

from ..models import Job, AppliedJob
from ..serializers import JobSerializer, AppliedJobSerializer


class JobViewSet(viewsets.ModelViewSet):

    queryset = Job.objects.all().order_by("-created_at")
    serializer_class = JobSerializer

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