from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from myapp.views import *
from myapp.views.job_views import JobViewSet

router = DefaultRouter()
router.register(r'jobs', JobViewSet)

urlpatterns = [

    # ================= HOME =================
    #path('', home, name='home'),

    # ================= AUTH =================
    path('login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    #path('register/', register_view, name='register'),

    # ================= PROFILE =================
    path('profile/', Profile_view, name='profile'),
    path('profile/update/', update_profile, name='update_profile'),
    path('profile/upload-resume/', upload_resume, name='upload_resume'),

    # ================= LEAVE REQUEST =================
    #path('leave-requests/', get_leave_requests),
    #path('leave-requests/create/', create_leave_request),
    #path('leave-requests/<int:request_id>/update/', update_leave_request),
    #path('leave-requests/<int:request_id>/delete/', delete_leave_request),

    # ================= EXAMS =================
    #path('exams/all/', AllExamListView.as_view()),
    #path('exams/finished/', FinishedExamListView.as_view()),
    #path('exams/upcoming/', UpcomingExamListView.as_view()),
    #path('exams/<int:pk>/attempt/', UpdateAttemptView.as_view()),
    #path('mcq/submit-answer/', submit_mcq_answer),
    #path('mcq/submit-exam/', submit_mcq_exam),
    #path('code/run/', run_code),

    # ================= EXAM SESSION =================
    path('exam/start/', start_exam_session),
    path('exam/<int:session_id>/submit/', submit_answer),
    path('exam/<int:session_id>/end/', end_exam_session),

    path('exam/webcam/snapshot/', save_webcam_snapshot),
    path('exam/sessions/', get_exam_sessions),

    # ================= PLAYGROUND =================
    #path('playground/', playground_backend),
    #path('playground/rest/', playground_rest_framework),
    #path('playground/questions/', get_playground_questions),
    #path('playground/questions/create/', create_playground_question),
    #path('playground/sessions/', get_playground_sessions),
    #path('playground/sessions/start/', start_playground_exam),
    #path('playground/sessions/<int:session_id>/submit/', submit_playground_answer),
    #path('playground/sessions/<int:session_id>/end/', end_playground_exam),

    # ================= CODE SNIPPETS =================
    #path('code-snippets/', get_code_snippets),
    #path('code-snippets/execute/', execute_code),
    #path('code-snippets/<int:snippet_id>/update/', update_code_snippet),
    #path('code-snippets/<int:snippet_id>/delete/', delete_code_snippet),

    # ================= TEMPLATES =================
    #path('templates/', get_templates),
    #path('templates/create/', create_template),
    #path('templates/<int:template_id>/update/', update_template),
    #path('templates/<int:template_id>/delete/', delete_template),

    # ================= EXECUTION HISTORY =================
    #path('execution-history/', get_execution_history),
    #path('execution-history/<str:session_id>/delete/', delete_execution_session),

    # ================= JOB APIs =================
    path('api/', include(router.urls)),

    # ================= REACT =================
    #path('react/', serve_react_app),

]