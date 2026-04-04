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
        print(f"Current user: {user}, role: {getattr(user, 'role', 'unknown')}, is_staff: {getattr(user, 'is_staff', 'unknown')}")
        
        if user and (user.is_staff or getattr(user, 'role', None) == 'faculty'):
            print("Returning all applications for faculty user")
            return AppliedJob.objects.all().select_related('user', 'job').order_by('-applied_date')
        else:
            print(f"Returning filtered applications for user: {user}")
            return AppliedJob.objects.filter(user=user).select_related('user', 'job').order_by('-applied_date')
    
    def list(self, request, *args, **kwargs):
        try:
            queryset = self.get_queryset()
            print(f"Queryset count: {queryset.count()}")
            
            # Debug: Print first few applications
            for app in queryset[:3]:
                print(f"App: {app.id}, user: {app.user.username}, job: {app.job.job_title if app.job else 'No job'}")
            
            serializer = self.get_serializer(queryset, many=True)
            return Response(serializer.data)
        except Exception as e:
            print(f"Error in FacultyApplicationsViewSet.list: {str(e)}")
            import traceback
            traceback.print_exc()
            return Response(
                {"error": f"Internal server error: {str(e)}"}, 
                status=500
            )

    def update(self, request, *args, **kwargs):
        """
        Accept or reject student applications
        """
        try:
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
            
        except Exception as e:
            print(f"Error updating application: {str(e)}")
            import traceback
            traceback.print_exc()
            return Response({"error": str(e)}, status=500)


# ================= ADMIN JOB API =================
class AdminJobViewSet(viewsets.ModelViewSet):
    """
    Job management API for authenticated faculty users
    """
    queryset = Job.objects.all().order_by("-created_at")
    serializer_class = JobSerializer

    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def perform_create(self, serializer):
        serializer.save()


# ================= TEST DATA CREATION =================
from rest_framework.response import Response
from rest_framework.views import APIView

class CreateSampleApplicationsView(APIView):
    """
    Create sample AppliedJob data for testing
    """
    permission_classes = [AllowAny]

    def get(self, request):
        try:
            from django.utils import timezone
            
            print("Creating sample applications...")
            
            # Get existing users or create simple ones
            try:
                student1 = User.objects.get(username='student1')
            except User.DoesNotExist:
                student1 = User.objects.create_user(
                    username='student1',
                    email='student1@example.com',
                    password='password123',
                    role='student'
                )
                print("Created student1")
                
            try:
                student2 = User.objects.get(username='student2')
            except User.DoesNotExist:
                student2 = User.objects.create_user(
                    username='student2',
                    email='student2@example.com', 
                    password='password123',
                    role='student'
                )
                print("Created student2")
            
            # Get existing jobs or create simple ones
            job1, created1 = Job.objects.get_or_create(
                job_title='Software Engineer',
                defaults={
                    'company': 'Tech Corp',
                    'description': 'Develop software applications',
                    'location': 'Bangalore'
                }
            )
            if created1:
                print("Created job1: Software Engineer")
                
            job2, created2 = Job.objects.get_or_create(
                job_title='Frontend Developer',
                defaults={
                    'company': 'Web Solutions',
                    'description': 'Build user interfaces',
                    'location': 'Mumbai'
                }
            )
            if created2:
                print("Created job2: Frontend Developer")
            
            # Create sample applications
            app1, app_created1 = AppliedJob.objects.get_or_create(
                user=student1,
                job=job1,
                defaults={'applied_date': timezone.now()}
            )
            if app_created1:
                print("Created application for student1")
                
            app2, app_created2 = AppliedJob.objects.get_or_create(
                user=student2,
                job=job2,
                defaults={'applied_date': timezone.now()}
            )
            if app_created2:
                print("Created application for student2")
            
            # Check final count
            total_apps = AppliedJob.objects.count()
            print(f"Total applications in database: {total_apps}")
            
            return Response({
                "message": "Sample applications created successfully",
                "total_applications": total_apps,
                "applications": [
                    {"user": app1.user.username, "job": app1.job.job_title},
                    {"user": app2.user.username, "job": app2.job.job_title}
                ]
            })
        except Exception as e:
            print(f"Error creating sample applications: {str(e)}")
            import traceback
            traceback.print_exc()
            return Response({"error": str(e)}, status=500)