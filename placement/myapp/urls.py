<<<<<<< HEAD
from django.urls import path,include
=======

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

>>>>>>> 712decab9631b18f4f0a23a3fcb4b9db9676bc29
from myapp.views import *
from .views import JobViewSet

router = DefaultRouter()
router.register(r'jobs', JobViewSet)

from rest_framework.routers import DefaultRouter

router = DefaultRouter()

# Job APIs
router.register(r'jobs', JobViewSet)


# Applied Job APIs
router.register(r'applied-jobs', AppliedJobViewSet)

urlpatterns = [

<<<<<<< HEAD
    # Login
    path('login/', login_view, name='login'),
<<<<<<< HEAD

    # path('exams/finished/', FinishedExamListView.as_view(), name='finished-exams'),
    # path('exams/<int:pk>/attempt/', UpdateAttemptView.as_view(), name='update-attempt'),
    path('', include(router.urls)),
=======
>>>>>>> f12bddb0c11812d87e22432dd3c149608efefcc9


<<<<<<< HEAD
    path("profile/", Profile_view, name='profile'),
    path("profile/update/", update_profile, name='profile'),
    path("upload-resume/", upload_resume, name='resume'),
=======
    # Profile
    # path("profile/", Profile_view, name='profile'),
    # path("profile/update/", update_profile, name='update_profile'),
    # path("upload-resume/", upload_resume, name='resume'),

    # # Exams
    # path('exams/finished/', FinishedExamListView.as_view(), name='finished-exams'),
    # path('exams/<int:pk>/attempt/', UpdateAttemptView.as_view(), name='update-attempt'),

    # Leave Requests

>>>>>>> f12bddb0c11812d87e22432dd3c149608efefcc9
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
<<<<<<< HEAD
=======
=======
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
>>>>>>> 712decab9631b18f4f0a23a3fcb4b9db9676bc29
>>>>>>> f12bddb0c11812d87e22432dd3c149608efefcc9
]