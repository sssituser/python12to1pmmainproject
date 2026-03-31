from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

# IMPORT VIEWS
from .views.auth_views import *
from .views.profile_views import *
from .views.leave_views import *
from .views.exam_views import *
from .views.playground_views import *
from .views.job_views import JobViewSet, AppliedJobViewSet, AdminJobViewSet
from .views import course_views
from .views.course_views import CourseViewSet
from . import api_views
from .views.stats_views import *
from .views.otp_views import *
from .views.monitoring_views import get_login_email_status, get_login_email_history, get_auto_deletion_info


# ROUTER
router = DefaultRouter()
router.register(r'jobs', JobViewSet, basename='jobs')
router.register(r'applied-jobs', AppliedJobViewSet)
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
    path("send_otp/", Send_OTP.as_view()),
    path("verify_register/", Verify_OTP_Register.as_view()),
    path('faculty/student/<int:pk>/active/', api_views.toggle_student_active),
    


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

    path('playground-questions/', api_views.playground_questions_api, name='playground-questions'),
    path('playgrounds/create/', create_playground),
    path('playgrounds/<int:pk>/', get_playground),
    path('playgrounds/delete/<int:pk>/', delete_playground),
    path('execute-code-api/', api_views.execute_code_api),

    # ================= JOB ROUTER =================
    path('', include(router.urls)),

    # ================= EXAM REPORTS =================
    path('all-exam-results/', api_views.exam_reports_api),
    path('user-combined-results/', api_views.user_combined_results_api),
    path('save-exam-report/', api_views.save_exam_report_api),
    path('exam-report-detail/<int:pk>/', api_views.exam_report_detail_api),
    path('leaderboard/', api_views.leaderboard_api),
    path('weekly-exam-results/', api_views.weekly_exam_reports_api),
    path('monthly-exam-results/', api_views.monthly_exam_reports_api),
    
    # DASHBOARD & STATS
    path('dashboard-stats/', api_views.dashboard_stats_api),
    path('student-stats/', api_views.student_stats_api),
    path('student/<int:id>/', student_detail),
    path('students/', api_views.student_stats_api),
    path('admin/create-credentials/', api_views.admin_create_credentials_api),
    path('admin/exam-settings/', api_views.exam_settings_api, name='exam_settings'),

    # ================= COURSE SYSTEM =================
    path('student/courses/', course_views.student_courses),
    path('faculty/courses/', course_views.faculty_courses),
    path('course/create/', course_views.create_course),
    path('course/<int:course_id>/', course_views.get_course_details),
    path('course/<str:course_name>/topics/', course_views.get_course_topics),
    path('run-code/', api_views.run_code_api, name='run-code'),

    # ================= AUTO-DELETION MONITORING =================
    path('login-email-status/', get_login_email_status, name='login_email_status'),
    path('login-email-history/', get_login_email_history, name='login_email_history'),
    path('auto-deletion-info/', get_auto_deletion_info, name='auto_deletion_info'),

]

