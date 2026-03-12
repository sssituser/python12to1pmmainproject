from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from myapp.views import *
from .views import JobViewSet

router = DefaultRouter()
router.register(r'jobs', JobViewSet)

urlpatterns = [

    # JWT AUTH
    path("api/login/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/refresh/", TokenRefreshView.as_view(), name="token_refresh"),

    # PROFILE
    path("api/profile/", Profile_view, name="profile"),
    path("api/profile/update/", update_profile, name="update_profile"),
    path("api/upload-resume/", upload_resume, name="resume"),

    # JOB ROUTER
    path("api/", include(router.urls)),

    # LEAVE REQUEST
    path('api/leave-requests/', get_leave_requests),
    path('api/leave-requests/create/', create_leave_request),
    path('api/leave-requests/<int:request_id>/update/', update_leave_request),
    path('api/leave-requests/<int:request_id>/delete/', delete_leave_request),

    # PLAYGROUND CODE
    path('api/code/', get_code_snippets),
    path('api/code/execute/', execute_code),
    path('api/code/<int:snippet_id>/update/', update_code_snippet),
    path('api/code/<int:snippet_id>/delete/', delete_code_snippet),

    # PLAYGROUND TEMPLATES
    path('api/templates/', get_templates),
    path('api/templates/create/', create_template),
    path('api/templates/<int:template_id>/update/', update_template),
    path('api/templates/<int:template_id>/delete/', delete_template),

    # HISTORY
    path('api/history/', get_execution_history),
    path('api/history/<str:session_id>/delete/', delete_execution_session),

    # PLAYGROUND QUESTIONS
    path('api/questions/', get_playground_questions),
    path('api/questions/create/', create_playground_question),

    # PLAYGROUND EXAM
    path('api/exam/sessions/', get_playground_sessions),
    path('api/exam/start/', start_playground_exam),
    path('api/exam/<int:session_id>/submit/', submit_playground_answer),
    path('api/exam/<int:session_id>/end/', end_playground_exam),

    # ORIGINAL EXAM SYSTEM
    path('api/exam-questions/', get_questions),
    path('api/exam-questions/create/', create_question),

    path('api/exam/start/', start_exam_session),
    path('api/exam/<int:session_id>/submit/', submit_answer),
    path('api/exam/<int:session_id>/end/', end_exam_session),

    path('api/exam/webcam/snapshot/', save_webcam_snapshot),
    path('api/exam/sessions/', get_exam_sessions),

    # EXAM ATTEMPTS
    path('api/exams/finished/', FinishedExamListView.as_view()),
    path('api/exams/<int:pk>/attempt/', UpdateAttemptView.as_view()),

    # HOME
    path("", home),
]