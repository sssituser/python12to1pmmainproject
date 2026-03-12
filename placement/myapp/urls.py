from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from myapp.views import *
from myapp.api_views import *

router = DefaultRouter()

urlpatterns = [

    # JWT AUTH
    path("api/login/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/refresh/", TokenRefreshView.as_view(), name="token_refresh"),

    # NEW API ENDPOINTS - PURE DJANGO REST FRAMEWORK
    
    # USER AUTHENTICATION
    path('api/auth/login/', login_api, name='api_login'),
    
    # LEAVE REQUEST API
    path('api/leave-requests/', leave_requests_api, name='leave_requests_api'),
    path('api/leave-requests/<int:pk>/', leave_request_detail_api, name='leave_request_detail_api'),
    
    # PLAYGROUND API
    path('api/playground/', playground_api, name='playground_api'),
    path('api/playground/templates/', code_templates_api, name='code_templates_api'),
    path('api/playground/snippets/', code_snippets_api, name='code_snippets_api'),
    path('api/playground/execute/', execute_code_api, name='execute_code_api'),
    
    # REPORTS API
    path('api/reports/', exam_reports_api, name='exam_reports_api'),
    path('api/reports/<int:pk>/', exam_report_detail_api, name='exam_report_detail_api'),
    path('api/reports/save/', save_exam_report_api, name='save_exam_report_api'),
    path('api/reports/<int:pk>/delete/', delete_exam_report_api, name='delete_exam_report_api'),
    
    # EXAM QUESTIONS API
    path('api/exam/questions/', exam_questions_api, name='exam_questions_api'),

    # LEGACY ENDPOINTS (Keep for backward compatibility)
    
    # PROFILE - Temporarily disabled
    # path("api/profile/", Profile_view, name="profile"),
    # path("api/profile/update/", update_profile, name="update_profile"),
    # path("api/upload-resume/", upload_resume, name="resume"),

    # LEAVE REQUEST - Legacy
    path('api/leave-requests/legacy/', get_leave_requests),
    path('api/leave-requests/create/legacy/', create_leave_request),
    path('api/leave-requests/<int:request_id>/update/legacy/', update_leave_request),
    path('api/leave-requests/<int:request_id>/delete/legacy/', delete_leave_request),

    # JOB ROUTER - Temporarily disabled
    # path("api/", include(router.urls)),

    # PLAYGROUND CODE - Legacy
    path('api/code/', get_code_snippets),
    path('api/code/execute/', execute_code),
    path('api/code/<int:snippet_id>/update/', update_code_snippet),
    path('api/code/<int:snippet_id>/delete/', delete_code_snippet),

    # PLAYGROUND TEMPLATES - Legacy
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

    # EXAM ATTEMPTS - Temporarily disabled
    # path('api/exams/finished/', FinishedExamListView.as_view()),
    # path('api/exams/<int:pk>/attempt/', UpdateAttemptView.as_view()),

    # HOME
    path("", home),

    # API DOCUMENTATION
    path("api/docs/", api_documentation, name='api_documentation'),

    # DJANGO REST FRAMEWORK TEMPLATES
    path("leave-request-drf/", leave_request_drf, name='leave_request_drf'),
    path("playground-drf/", playground_drf_new, name='playground_drf_new'),
    path("reports-drf/", reports_drf, name='reports_drf'),
]