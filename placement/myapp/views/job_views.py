from rest_framework import viewsets
from ..models import Job
from ..serializers import JobSerializer
from ..models import AppliedJob
from ..serializers import AppliedJobSerializer


class JobViewSet(viewsets.ModelViewSet):

    queryset = Job.objects.all().order_by("-created_at")
    serializer_class = JobSerializer

from rest_framework.permissions import IsAuthenticated

class AppliedJobViewSet(viewsets.ModelViewSet):
    queryset = AppliedJob.objects.all()
    serializer_class = AppliedJobSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return AppliedJob.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)