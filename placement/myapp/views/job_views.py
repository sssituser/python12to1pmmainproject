from rest_framework import viewsets, response
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAdminUser
from rest_framework.exceptions import ValidationError
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.response import Response

from ..models import Job, AppliedJob, User
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


# ================= FACULTY APPLICATIONS API =================
class FacultyApplicationsViewSet(viewsets.ModelViewSet):
    """
    API for faculty to view all student job applications
    """
    queryset = AppliedJob.objects.all().select_related('user', 'job').order_by('-applied_date')
    serializer_class = AppliedJobSerializer
    
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]
    
    def get_queryset(self):
        # For faculty users, return all applications (not filtered by current user)
        user = self.request.user
        username = self.request.query_params.get('username')
        print(f"Current user: {user}, role: {getattr(user, 'role', 'unknown')}, is_staff: {getattr(user, 'is_staff', 'unknown')}, filter_username: {username}")
        
        if user and (user.is_staff or getattr(user, 'role', None) == 'faculty'):
            print("Returning all applications for faculty user")
            qs = AppliedJob.objects.all().select_related('user', 'job').order_by('-applied_date')
            if username:
                qs = qs.filter(user__username__iexact=username)
            return qs
        else:
            print(f"Returning filtered applications for user: {user}")
            return AppliedJob.objects.filter(user=user).select_related('user', 'job').order_by('-applied_date')
    
    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        print(f"Queryset count: {queryset.count()}")
        
        # Debug: Print first few applications
        for app in queryset[:3]:
            print(f"App: {app.id}, user: {app.user.username}, job: {app.job.job_title if app.job else 'No job'}")
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    def update(self, request, *args, **kwargs):
        """
        Accept or reject student applications
        """
        application = self.get_object()
        action = request.data.get('action')  # 'accept' or 'reject'
        
        if action not in ['accept', 'reject']:
            return Response({"error": "Invalid action. Use 'accept' or 'reject'."}, status=400)
        
        # Update application status
        application.status = action
        application.save()
        
        print(f"Application {application.id} {action}ed by {request.user.username}")
        
        return Response({
            "message": f"Application {action}ed successfully",
            "application_id": application.id,
            "status": application.status
        })


# ================= ADMIN JOB API =================
class AdminJobViewSet(viewsets.ModelViewSet):
    """
    Job management API for authenticated faculty users
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
        serializer.save()
