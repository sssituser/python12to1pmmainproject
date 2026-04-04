from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework.response import Response

# IMPORT VIEWS
from .views.auth_views import *
from .views.profile_views import *
from .views.leave_views import *
from .views.exam_views import *
from .views.playground_views import *
from .views.job_views import JobViewSet, AppliedJobViewSet, AdminJobViewSet, FacultyApplicationsViewSet, CreateSampleApplicationsView
from .views.html_views import playground_questions_html_api
from .views.css_views import playground_questions_css_api
from .views.javascript_views import playground_questions_javascript_api
from .views.bootstrap_views import playground_questions_bootstrap_api
from .views.oracle_views import playground_questions_oracle_api
from .views.java_views import playground_questions_java_api
from .views.react_views import playground_questions_react_api
from .views.django_views import playground_questions_django_api
from .views import course_views
from .views.course_views import CourseViewSet
from .views.python_views import *
from .views.stats_views import *
from .views.otp_views import *
from .views.monitoring_views import get_login_email_status, get_login_email_history, get_auto_deletion_info
from .views import python_views




# ROUTER
router = DefaultRouter()
router.register(r'jobs', JobViewSet, basename='jobs')
router.register(r'applied-jobs', AppliedJobViewSet)
router.register(r'faculty-applications', FacultyApplicationsViewSet, basename='faculty-applications')
router.register(r'admin/jobs', AdminJobViewSet, basename='admin-jobs')
router.register(r'courses', CourseViewSet, basename='courses')


urlpatterns = [

    # ================= AUTH =================
    # Custom login API (returns access/refresh + user payload)
    path('faculty/login/', login, name='api_login'),
    path('login/', login, name='api_login'),
    path('register/', register, name='api_register'),
    # JWT endpoints (if raw token endpoints are needed)
    path('jwt/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('jwt/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path("reset-password/", reset_password),
    path("change-password/", change_password),
    path("send_otp/", send_otp),
    path("verify_otp/", verify_otp),
    path("verify_register/", Verify_OTP_Register.as_view()),
    path('faculty/student/<int:pk>/active/', python_views.toggle_student_active),
    

    # ================= PROFILE =================
    path('profile/', profile_view, name='profile'),
    path('profile/update/', update_profile, name='update_profile'),
    path('profile/upload-resume/', upload_resume, name='upload_resume'),

    # ================= LEAVE REQUEST =================
    path('leave-requests/', get_all_leave_requests),
    path('leave-requests/create/', create_leave_request),
    path('leave-requests/<int:pk>/', get_leave_request),
    path('leave-requests/<int:pk>/approve/', approve_leave_request),
    path('leave-requests/<int:pk>/reject/', reject_leave_request),
    path('leave-requests/<int:pk>/delete/', delete_leave_request),
    path('leave-requests/my-requests/', my_leave_requests),



    # ================= EXAM SYSTEM =================
    path('questions/', get_questions),
    path('questions/create/', create_question),

    path('exam/start/', start_exam_session),
    path('exam/<int:session_id>/submit/', submit_answer),
    path('exam/<int:session_id>/end/', end_exam_session),
    path('exam/webcam/snapshot/', save_webcam_snapshot),
    path('exam/sessions/', get_exam_sessions),

    # ================= PLAYGROUND =================

    path('playground-questions/', python_views.playground_questions_api, name='playground-questions'),
    path('playground-questions/python/', python_views.playground_questions_api, name='playground-questions-python'),
    path('playground-questions/html/', playground_questions_html_api, name='playground-questions-html'),
    path('playground-questions/css/', playground_questions_css_api, name='playground-questions-css'),
    path('playground-questions/javascript/', playground_questions_javascript_api, name='playground-questions-javascript'),
    path('playground-questions/bootstrap/', playground_questions_bootstrap_api, name='playground-questions-bootstrap'),
    path('playground-questions/oracle/', playground_questions_oracle_api, name='playground-questions-oracle'),
    path('playground-questions/java/', playground_questions_java_api, name='playground-questions-java'),
    path('playground-questions/react/', playground_questions_react_api, name='playground-questions-react'),
    path('playground-questions/django/', playground_questions_django_api, name='playground-questions-django'),
    path('playgrounds/create/', create_playground),
    path('playgrounds/<int:pk>/', get_playground),
    path('playgrounds/delete/<int:pk>/', delete_playground),
    # ================= EXAM REPORTS =================
    path('all-exam-results/', python_views.exam_reports_api),
    path('user-combined-results/', python_views.user_combined_results_api),
    path('save-exam-report/', python_views.save_exam_report_api),
    path('exam-report-detail/<int:pk>/', python_views.exam_report_detail_api),
    path('leaderboard/', python_views.leaderboard_api),
    path('weekly-exam-results/', python_views.weekly_exam_reports_api),
    path('monthly-exam-results/', python_views.monthly_exam_reports_api),
    
    # DASHBOARD & STATS
    path('dashboard-stats/', python_views.dashboard_stats_api),
    path('student-stats/', python_views.student_stats_api),
    path('student/<int:id>/', student_detail),
    path('students/', python_views.student_stats_api),
    path('students/<int:student_id>/toggle-status/', python_views.toggle_student_status),
    path('admin/create-credentials/', python_views.admin_create_credentials_api),
    path('admin/exam-settings/', python_views.exam_settings_api, name='exam_settings'),

    # ================= COURSE SYSTEM =================
    path('student/courses/', course_views.student_courses),
    path('faculty/courses/', course_views.faculty_courses),
    path('course/create/', course_views.create_course),
    path('course/<int:course_id>/', course_views.get_course_details),
    path('course/<str:course_name>/topics/', course_views.get_course_topics),
    path('run-code/', python_views.run_code_api, name='run-code'),

    # ================= AUTO-DELETION MONITORING =================
    path('login-email-status/', get_login_email_status, name='login_email_status'),
    path('login-email-history/', get_login_email_history, name='login_email_history'),
    path('auto-deletion-info/', get_auto_deletion_info, name='auto_deletion_info'),

    # ================= TEST ENDPOINT =================
    path('test-create-applications/', lambda request: Response({"message": "Test endpoint working"}), name='test_create_applications'),
    path('create-sample-applications/', CreateSampleApplicationsView.as_view(), name='create_sample_applications'),

]

# ================= ROUTER URLS =================
urlpatterns += router.urls

