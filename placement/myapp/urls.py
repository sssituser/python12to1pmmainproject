from django.urls import path, include
from rest_framework.routers import DefaultRouter
from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

# IMPORT VIEWS
from myapp.views.auth_views import *
from myapp.views.profile_views import *
from myapp.views.leave_views import *
from myapp.views.playground_views import *
from myapp.views.exam_views import *
from myapp.views import login_view
from myapp.views.job_views import JobViewSet


# ROUTER
router = DefaultRouter()
router.register(r'jobs', JobViewSet, basename='jobs')


urlpatterns = [

    # ---------------- PLAYGROUND ----------------
    path('playgrounds/', get_playgrounds),
    path('playgrounds/create/', create_playground),
    path('playgrounds/<int:pk>/', get_playground),
    path('playgrounds/delete/<int:pk>/', delete_playground),

    # ---------------- LEAVE SYSTEM ----------------
    path('test/', test_endpoint),
    path('leave-requests/', get_all_leave_requests),
    path('leave-requests/create/', create_leave_request),
    path('leave-requests/<int:pk>/', get_leave_request),
    path('leave-requests/<int:pk>/approve/', approve_leave_request),
    path('leave-requests/<int:pk>/reject/', reject_leave_request),
    path('leave-requests/<int:pk>/delete/', delete_leave_request),
    path('leave-requests/my-requests/', my_leave_requests),

    # ---------------- AUTH ----------------
    path('login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    # ---------------- PROFILE ----------------
    path("profile/", Profile_view),
    path("profile/update/", update_profile),
    path("upload-resume/", upload_resume),

    # ---------------- EXAM SYSTEM ----------------
    path('exam-questions/', get_questions),
    path('exam-questions/create/', create_question),

    path('exam/start/', start_exam_session),
    path('exam/<int:session_id>/submit/', submit_answer),
    path('exam/<int:session_id>/end/', end_exam_session),

    path('exam/webcam/snapshot/', save_webcam_snapshot),
    path('exam/<int:pk>/delete/', delete_exam_session),
    path('exam/sessions/', get_exam_sessions),


    # ---------------- JOB API ----------------
    path('', include(router.urls)),
]