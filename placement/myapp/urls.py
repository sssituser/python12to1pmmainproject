from django.urls import path, include
from myapp.views import *
from rest_framework.routers import DefaultRouter

router = DefaultRouter()

# Job APIs
router.register(r'jobs', JobViewSet)

# Applied Job APIs
router.register(r'applied-jobs', AppliedJobViewSet)

urlpatterns = [

    # Login
    path('login/', login_view, name='login'),

    # Profile
    path("profile/", Profile_view, name='profile'),
    path("profile/update/", update_profile, name='update_profile'),
    path("upload-resume/", upload_resume, name='resume'),

    # Exams
    path('exams/finished/', FinishedExamListView.as_view(), name='finished-exams'),
    path('exams/<int:pk>/attempt/', UpdateAttemptView.as_view(), name='update-attempt'),

    # Leave Requests
    path('leave-requests/', get_leave_requests, name='get_leave_requests'),
    path('leave-requests/create/', create_leave_request, name='create_leave_request'),
    path('leave-requests/<int:request_id>/update/', update_leave_request, name='update_leave_request'),
    path('leave-requests/<int:request_id>/delete/', delete_leave_request, name='delete_leave_request'),

    # Playground Code APIs
    path('code/', get_code_snippets, name='get_code_snippets'),
    path('code/execute/', execute_code, name='execute_code'),
    path('code/<int:snippet_id>/update/', update_code_snippet, name='update_code_snippet'),
    path('code/<int:snippet_id>/delete/', delete_code_snippet, name='delete_code_snippet'),

    # Templates APIs
    path('templates/', get_templates, name='get_templates'),
    path('templates/create/', create_template, name='create_template'),
    path('templates/<int:template_id>/update/', update_template, name='update_template'),
    path('templates/<int:template_id>/delete/', delete_template, name='delete_template'),

    # Execution History
    path('history/', get_execution_history, name='get_execution_history'),
    path('history/<str:session_id>/delete/', delete_execution_session, name='delete_execution_session'),

    # Playground Exam
    path('questions/', get_playground_questions, name='get_playground_questions'),
    path('questions/create/', create_playground_question, name='create_playground_question'),

    path('exam/sessions/', get_playground_sessions, name='get_playground_sessions'),
    path('exam/start/', start_playground_exam, name='start_playground_exam'),
    path('exam/<int:session_id>/submit/', submit_playground_answer, name='submit_playground_answer'),
    path('exam/<int:session_id>/end/', end_playground_exam, name='end_playground_exam'),

    # Original Exam System
    path('exam-questions/', get_questions, name='get_questions'),
    path('exam-questions/create/', create_question, name='create_question'),
    path('exam/start/', start_exam_session, name='start_exam_session'),
    path('exam/<int:session_id>/submit/', submit_answer, name='submit_answer'),
    path('exam/<int:session_id>/end/', end_exam_session, name='end_exam_session'),
    path('exam/webcam/snapshot/', save_webcam_snapshot, name='save_webcam_snapshot'),
    path('exam/sessions/', get_exam_sessions, name='get_exam_sessions'),

    # Include router APIs
    path('', include(router.urls)),

    # Home
    path('', home, name='home'),
]