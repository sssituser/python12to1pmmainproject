from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework.response import Response
from django.http import JsonResponse
from rest_framework import routers

# IMPORT VIEWS - ESSENTIAL ONLY
from .views.auth_views import login, register, reset_password, change_password, send_otp, verify_otp
from .views.profile_views import profile_view, update_profile, upload_resume, faculty_profile_view, faculty_profile_update, faculty_avatar_upload, faculty_avatar_delete, faculty_profile_public, faculty_list_minimal, faculty_stats, faculty_profile_minimal_test
from .views.leave_views import get_all_leave_requests, create_leave_request, get_leave_request, approve_leave_request, reject_leave_request, delete_leave_request, my_leave_requests
from .views.exam_views import get_questions, create_question, start_exam_session, submit_answer, end_exam_session, save_webcam_snapshot, get_exam_sessions, automated_exam_config_view
from .views.playground_views import create_playground, get_playground, delete_playground
from .views.job_views import JobViewSet, AppliedJobViewSet, AdminJobViewSet, FacultyApplicationsViewSet
from .views.python_views import (
    playground_questions_api, run_code_api, exam_reports_api, 
    exam_report_detail_api, save_exam_report_api, delete_exam_report_api, 
    weekly_exam_reports_api, monthly_exam_reports_api, exam_questions_api, 
    exam_settings_api, leaderboard_api, toggle_student_active, user_combined_results_api,
    exam_proctoring_logs_api
)
from .views.stats_views import dashboard_stats_api, students_api, student_stats_api, student_detail
from .views.admin_views import all_users_api, create_faculty_api, toggle_student_status_api, delete_user_api, update_faculty_api, update_student_api, toggle_faculty_status_api
from .views.course_views import CourseViewSet, student_courses, faculty_courses, create_course, get_course_details, get_course_topics
from .views.monitoring_views import get_login_email_status, get_login_email_history, get_auto_deletion_info
from .views.playground_dispatcher import playground_questions_dispatcher
router = DefaultRouter()
router.register(r'jobs', JobViewSet, basename='job')
router.register(r'applied-jobs', AppliedJobViewSet, basename='applied-job')
router.register(r'admin/jobs', AdminJobViewSet, basename='admin-job')
router.register(r'faculty-applications', FacultyApplicationsViewSet, basename='faculty-application')
router.register(r'courses', CourseViewSet, basename='courses')

urlpatterns = [
    # Router URLs - MUST COME FIRST
    path('', include(router.urls)),
    
    # Auth and user URLs
    path('login/', login, name='api_login'),
    path('register/', register, name='api_register'),
    path('jwt/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('jwt/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path("reset-password/", reset_password),
    path("change-password/", change_password),
    path("send_otp/", send_otp),
    path("verify_otp/", verify_otp),
    
    
    # Profile URLs
    path('profile/', profile_view, name='profile'),
    path('profile/update/', update_profile, name='update_profile'),
    path('profile/upload-resume/', upload_resume, name='upload_resume'),
    
    # Faculty Profile URLs
    path('faculty/profile/', faculty_profile_view, name='faculty_profile'),
    path('faculty/profile/update/', faculty_profile_update, name='faculty_profile_update'),
    path('faculty/profile/avatar/upload/', faculty_avatar_upload, name='faculty_avatar_upload'),
    path('faculty/profile/avatar/delete/', faculty_avatar_delete, name='faculty_avatar_delete'),
    path('faculty/profile/<int:profile_id>/public/', faculty_profile_public, name='faculty_profile_public'),
    path('faculty/profile/list/minimal/', faculty_list_minimal, name='faculty_list_minimal'),
    path('faculty/profile/stats/', faculty_stats, name='faculty_stats'),
    
    # Leave Request URLs
    path('leave-requests/', get_all_leave_requests),
    path('leave-requests/create/', create_leave_request),
    path('leave-requests/<int:pk>/', get_leave_request),
    path('leave-requests/<int:pk>/approve/', approve_leave_request),
    path('leave-requests/<int:pk>/reject/', reject_leave_request),
    path('leave-requests/<int:pk>/delete/', delete_leave_request),
    path('leave-requests/my-requests/', my_leave_requests),
    
    # Exam System URLs
    path('questions/', get_questions),
    path('questions/create/', create_question),
    path('exam/start/', start_exam_session),
    path('exam/<int:session_id>/submit/', submit_answer),
    path('exam/<int:session_id>/end/', end_exam_session),
    path('exam/webcam/snapshot/', save_webcam_snapshot),
    path('exam/sessions/', get_exam_sessions),
    path('automated-exam-config/', automated_exam_config_view),
    
    # Daily Exam System URLs
    path('exam-reports/', exam_reports_api),
    path('exam-reports/<int:pk>/', exam_report_detail_api),
    path('exam-report-detail/<int:pk>/', exam_report_detail_api),
    path('exam-proctoring-logs/<int:pk>/', exam_proctoring_logs_api),
    path('exam-reports/save/', save_exam_report_api),
    path('save-exam-report/', save_exam_report_api),
    path('exam-reports/delete/<int:pk>/', delete_exam_report_api),
    path('exam-reports/weekly/', weekly_exam_reports_api),
    path('exam-reports/monthly/', monthly_exam_reports_api),
    path('exam-reports/daily/', exam_reports_api),  # Daily exam reports
    path('all-exam-results/', exam_reports_api),  # For Dashboard.jsx compatibility
    path('exam-questions/', exam_questions_api),
    path('user-combined-results/', user_combined_results_api),
    path('all-exam-results/', user_combined_results_api),
    path('exam-settings/', exam_settings_api),
    path('admin/exam-settings/', exam_settings_api),
    path('leaderboard/', leaderboard_api),
    
    # Dashboard and Student URLs
    path('dashboard-stats/', dashboard_stats_api),
    path('students/', students_api),
    path('student-stats/', student_stats_api),
    path('student/<int:id>/', student_detail),
    path('user-combined-results/', user_combined_results_api),
    
    # Admin URLs
    path('admin/jobs/', JobViewSet.as_view({'get': 'list', 'post': 'create'})),
    path('admin/exam-settings/', exam_settings_api),
    
    # Admin Management System URLs
    path('all-users/', all_users_api),
    path('create-faculty/', create_faculty_api),
    path('toggle-student-status/<int:student_id>/', toggle_student_status_api),
    path('toggle-faculty-status/<int:faculty_id>/', toggle_faculty_status_api),
    path('delete-user/<int:user_id>/', delete_user_api),
    path('update-faculty/<int:faculty_id>/', update_faculty_api),
    path('update-student/<int:student_id>/', update_student_api),
    
    # Playground URLs
    path('playground-questions/', playground_questions_api, name='playground-questions'),
    path('playground-questions/python/', playground_questions_api, name='playground-questions-python'),
    path('playground-questions/<str:subject>/', playground_questions_dispatcher, name='playground-questions-subject'),
    path('playgrounds/create/', create_playground),
    path('playgrounds/<int:pk>/', get_playground),
    path('playgrounds/delete/<int:pk>/', delete_playground),
    
    # Course System URLs
    path('student/courses/', student_courses),
    path('faculty/courses/', faculty_courses),
    path('course/create/', create_course),
    path('course/<int:course_id>/', get_course_details),
    path('course/<str:course_name>/topics/', get_course_topics),
    path('run-code/', run_code_api, name='run-code'),
    
    # Auto-deletion Monitoring URLs
    path('login-email-status/', get_login_email_status, name='login_email_status'),
    path('login-email-history/', get_login_email_history, name='login_email_history'),
    path('auto-deletion-info/', get_auto_deletion_info, name='auto_deletion_info'),
    
    # Test endpoints
    path('test-faculty-profile/', lambda request: JsonResponse({'message': 'Test endpoint working'}), name='test_faculty_profile'),
    path('test-faculty-minimal/', faculty_profile_minimal_test, name='test_faculty_minimal'),
    
    # Dashboard Stats & Student Management
    path('dashboard-stats/', dashboard_stats_api, name='dashboard_stats'),
    path('student-stats/', student_stats_api, name='student_stats'),
    path('students/toggle-active/<int:pk>/', toggle_student_active, name='toggle_student_active'),
    
    # Generic Students list (fallback for frontend)
    path('students/', student_stats_api, name='students_list'),
]
