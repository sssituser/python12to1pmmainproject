from django.urls import path, include
from rest_framework.routers import DefaultRouter
from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from myapp.views import *
from myapp.views.job_views import JobViewSet

# IMPORT VIEWS
from myapp.views.auth_views import *
from myapp.views.profile_views import *
from myapp.views.leave_views import *
from myapp.views.exam_views import *
from myapp.views.playground_views import *
from myapp.views.exam_views import *
from myapp.views import login_view
from myapp.views.job_views import JobViewSet
from .views import JobViewSet, AppliedJobViewSet


# ROUTER
router = DefaultRouter()
router.register(r'jobs', JobViewSet, basename='jobs')
router.register(r'applied-jobs', AppliedJobViewSet)




urlpatterns = [

    # ================= HOME =================
    #path('', home, name='home'),

    # ================= AUTH =================
    path('login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    #path('register/', register_view, name='register'),

    # ================= PROFILE =================
    path('profile/', profile_view, name='profile'),
    path('profile/update/', update_profile, name='update_profile'),
    path('profile/upload-resume/', upload_resume, name='upload_resume'),

    # ================= LEAVE REQUEST =================
    path('leave-requests/', get_all_leave_requests),
    path('leave-requests/create/', create_leave_request),
    # path('leave-requests/<int:request_id>/update/', update_leave_request),
    path('leave-requests/<int:request_id>/delete/', delete_leave_request),

    # ================= EXAMS =================
    # path('exams/all/', AllExamListView.as_view()),
    # path('exams/finished/', FinishedExamListView.as_view()),
    # path('exams/upcoming/', UpcomingExamListView.as_view()),
    # path('exams/<int:pk>/attempt/', UpdateAttemptView.as_view()),
    path('mcq/submit-answer/', submit_answer),
    # path('mcq/submit-exam/', submit_mcq_exam),
    # path('code/run/', run_code),
    # Playground
    path('questions/', get_questions, name='get-questions'),
    path('questions/create/', create_question, name='create-question'),
    # Exam sessions
    path('exam-sessions/', get_exam_sessions, name='exam-sessions'),
    path('exam-sessions/start/', start_exam_session, name='start-exam-session'),
    path('exam-sessions/submit-answer/', submit_answer, name='submit-answer'),
    path('exam-sessions/<int:session_id>/end/', end_exam_session, name='end-exam-session'),
    path('exam-sessions/webcam/', save_webcam_snapshot, name='save-webcam-snapshot'),
    # path('exams/finished/', FinishedExamListView.as_view(), name='finished-exams'),
    # path('exams/<int:pk>/attempt/', UpdateAttemptView.as_view(), name='update-attempt'),
    path('', include(router.urls)),


    # ---------------- PLAYGROUND ----------------
    # path('playgrounds/', get_playgrounds),
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
    path("profile/", profile_view),
    path("profile/update/", update_profile),
    path("upload-resume/", upload_resume),

    # ---------------- EXAM SYSTEM ----------------
    path('exam-questions/', get_questions),
    path('exam-questions/create/', create_question),
    # ================= EXAM SESSION =================
    path('exam/start/', start_exam_session),
    path('exam/<int:session_id>/submit/', submit_answer),
    path('exam/<int:session_id>/end/', end_exam_session),

    path('exam/webcam/snapshot/', save_webcam_snapshot),
    path('exam/<int:pk>/delete/', delete_exam_session),
    path('exam/sessions/', get_exam_sessions),

    # ================= PLAYGROUND =================
    # path('playground/', playground_backend),
    # path('playground/rest/', playground_rest_framework),
    # path('playground/questions/', get_playground_questions),
    # path('playground/questions/create/', create_playground_question),
    # path('playground/sessions/', get_playground_sessions),
    # path('playground/sessions/start/', start_playground_exam),
    # path('playground/sessions/<int:session_id>/submit/', submit_playground_answer),
    # path('playground/sessions/<int:session_id>/end/', end_playground_exam),

    # ================= CODE SNIPPETS =================
    # path('code-snippets/', get_code_snippets),
    # path('code-snippets/execute/', execute_code),
    # path('code-snippets/<int:snippet_id>/update/', update_code_snippet),
    # path('code-snippets/<int:snippet_id>/delete/', delete_code_snippet),

    # ================= TEMPLATES =================
    # path('templates/', get_templates),
    # path('templates/create/', create_template),
    # path('templates/<int:template_id>/update/', update_template),
    # path('templates/<int:template_id>/delete/', delete_template),

    # ================= EXECUTION HISTORY =================
    # path('execution-history/', get_execution_history),
    # path('execution-history/<str:session_id>/delete/', delete_execution_session),

    # ================= JOB APIs =================
    path('api/', include(router.urls)),

    # ================= REACT =================
    # path('react/', serve_react_app),

    # ---------------- JOB API ----------------
    path('', include(router.urls)),
]