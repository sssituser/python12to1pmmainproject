
from django.urls import path
from myapp.views import (
    home,
    serve_react_app,
    login_view,
    Profile_view,
    update_profile,
    upload_resume,
    get_leave_requests,
    create_leave_request,
    update_leave_request,
    delete_leave_request,
    get_questions,
    create_question,
    start_exam_session,
    submit_answer,
    end_exam_session,
    save_webcam_snapshot,
    get_exam_sessions,
    playground_backend,
    get_code_snippets,
    execute_code,
    update_code_snippet,
    delete_code_snippet,
    get_templates,
    create_template,
    update_template,
    delete_template,
    get_execution_history,
    delete_execution_session,
    get_playground_questions,
    create_playground_question,
    get_playground_sessions,
    start_playground_exam,
    submit_playground_answer,
    end_playground_exam,
    playground_rest_framework,
    # ✅ Exam views
    AllExamListView,
    FinishedExamListView,
    UpcomingExamListView,
    UpdateAttemptView,
    submit_mcq_answer,
    submit_mcq_exam,
    run_code,
    register_view,
)

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from myapp.views.auth_views import *
from myapp.views.profile_views import *
from myapp.views.leave_views import *
from myapp.views.exam_views import *
from myapp.views.playground_views import *

from myapp.views.job_views import JobViewSet



router = DefaultRouter()
router.register(r'jobs', JobViewSet)






# Applied Job APIs
#router.register(r'applied-jobs', AppliedJobViewSet)

urlpatterns = [

    path('', home, name='home'),
    path('login/', login_view, name='login'),
    path('register/', register_view, name='register'),
    path('profile/', Profile_view, name='profile'),
    path('profile/update/', update_profile, name='update-profile'),
    path('profile/upload-resume/', upload_resume, name='upload-resume'),

    # Leave requests
    path('leave-requests/', get_leave_requests, name='leave-requests'),
    path('leave-requests/create/', create_leave_request, name='create-leave-request'),
    path('leave-requests/<int:request_id>/update/', update_leave_request, name='update-leave-request'),
    path('leave-requests/<int:request_id>/delete/', delete_leave_request, name='delete-leave-request'),

    # Playground
    path('questions/', get_questions, name='get-questions'),
    path('questions/create/', create_question, name='create-question'),
    path('playground/', playground_backend, name='playground'),
    path('playground/rest/', playground_rest_framework, name='playground-rest'),
    path('playground/questions/', get_playground_questions, name='playground-questions'),
    path('playground/questions/create/', create_playground_question, name='create-playground-question'),
    path('playground/sessions/', get_playground_sessions, name='playground-sessions'),
    path('playground/sessions/start/', start_playground_exam, name='start-playground-exam'),
    path('playground/sessions/<int:session_id>/submit/', submit_playground_answer, name='submit-playground-answer'),
    path('playground/sessions/<int:session_id>/end/', end_playground_exam, name='end-playground-exam'),

    # Exam sessions
    path('exam-sessions/', get_exam_sessions, name='exam-sessions'),
    path('exam-sessions/start/', start_exam_session, name='start-exam-session'),
    path('exam-sessions/submit-answer/', submit_answer, name='submit-answer'),
    path('exam-sessions/<int:session_id>/end/', end_exam_session, name='end-exam-session'),
    path('exam-sessions/webcam/', save_webcam_snapshot, name='save-webcam-snapshot'),

    # Code snippets
    path('code-snippets/', get_code_snippets, name='code-snippets'),
    path('code-snippets/execute/', execute_code, name='execute-code'),
    path('code-snippets/<int:snippet_id>/update/', update_code_snippet, name='update-code-snippet'),
    path('code-snippets/<int:snippet_id>/delete/', delete_code_snippet, name='delete-code-snippet'),

    # Templates
    path('templates/', get_templates, name='get-templates'),
    path('templates/create/', create_template, name='create-template'),
    path('templates/<int:template_id>/update/', update_template, name='update-template'),
    path('templates/<int:template_id>/delete/', delete_template, name='delete-template'),

    # Execution history
    path('execution-history/', get_execution_history, name='execution-history'),
    path('execution-history/<str:session_id>/delete/', delete_execution_session, name='delete-execution-session'),

    # React app
    path('react/', serve_react_app, name='serve-react-app'),

    # ✅ Daily Exams
    path('exams/all/', AllExamListView.as_view(), name='all-exams'),
    path('exams/finished/', FinishedExamListView.as_view(), name='finished-exams'),
    path('exams/upcoming/', UpcomingExamListView.as_view(), name='upcoming-exams'),
    path('exams/<int:pk>/attempt/', UpdateAttemptView.as_view(), name='update-attempt'),
    path('mcq/submit-answer/', submit_mcq_answer, name='submit-mcq-answer'),
    path('mcq/submit-exam/', submit_mcq_exam, name='submit-mcq-exam'),
    path('code/run/', run_code, name='run-code'),

    # path('exams/finished/', FinishedExamListView.as_view(), name='finished-exams'),
    # path('exams/<int:pk>/attempt/', UpdateAttemptView.as_view(), name='update-attempt'),
    path('', include(router.urls)),

    path("profile/", Profile_view, name='profile'),
    path("profile/update/", update_profile, name='profile'),
    path("upload-resume/", upload_resume, name='resume'),

    # Profile
    # path("profile/", Profile_view, name='profile'),
    # path("profile/update/", update_profile, name='update_profile'),
    # path("upload-resume/", upload_resume, name='resume'),

    # # Exams
    # path('exams/finished/', FinishedExamListView.as_view(), name='finished-exams'),
    # path('exams/<int:pk>/attempt/', UpdateAttemptView.as_view(), name='update-attempt'),

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



    # JWT AUTH
    path("login/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("refresh/", TokenRefreshView.as_view(), name="token_refresh"),

    # PROFILE
    path("profile/", Profile_view, name="profile"),
    path("profile/update/", update_profile, name="update_profile"),
    path("upload-resume/", upload_resume, name="resume"),

    # JOB ROUTER
    path("api/", include(router.urls)),





    # ORIGINAL EXAM SYSTEM
    path('exam-questions/', get_questions),
    path('exam-questions/create/', create_question),

    path('exam/start/', start_exam_session),
    path('exam/<int:session_id>/submit/', submit_answer),
    path('exam/<int:session_id>/end/', end_exam_session),

    path('exam/webcam/snapshot/', save_webcam_snapshot),
    path('exam/sessions/', get_exam_sessions),


]