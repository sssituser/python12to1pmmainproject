from django.urls import path
from myapp.views import *

urlpatterns = [
    # Leave Request URLs
    path('login/', login_view, name='login'),
    path('leave-requests/', get_leave_requests, name='get_leave_requests'),
    path('leave-requests/create/', create_leave_request, name='create_leave_request'),
    path('leave-requests/<int:request_id>/update/', update_leave_request, name='update_leave_request'),
    path('leave-requests/<int:request_id>/delete/', delete_leave_request, name='delete_leave_request'),
    
    # Playground Code API URLs
    path('code/', get_code_snippets, name='get_code_snippets'),
    path('code/execute/', execute_code, name='execute_code'),
    path('code/<int:snippet_id>/update/', update_code_snippet, name='update_code_snippet'),
    path('code/<int:snippet_id>/delete/', delete_code_snippet, name='delete_code_snippet'),
    
    # Playground Templates API URLs
    path('templates/', get_templates, name='get_templates'),
    path('templates/create/', create_template, name='create_template'),
    path('templates/<int:template_id>/update/', update_template, name='update_template'),
    path('templates/<int:template_id>/delete/', delete_template, name='delete_template'),
    
    # Playground History API URLs
    path('history/', get_execution_history, name='get_execution_history'),
    path('history/<str:session_id>/delete/', delete_execution_session, name='delete_execution_session'),
    
    # Playground Exam System URLs (for playground_rest.html)
    path('questions/', get_playground_questions, name='get_playground_questions'),
    path('questions/create/', create_playground_question, name='create_playground_question'),
    path('exam/sessions/', get_playground_sessions, name='get_playground_sessions'),
    path('exam/start/', start_playground_exam, name='start_playground_exam'),
    path('exam/<int:session_id>/submit/', submit_playground_answer, name='submit_playground_answer'),
    path('exam/<int:session_id>/end/', end_playground_exam, name='end_playground_exam'),
    
    # Original Exam/Question URLs (for other parts of system)
    path('exam-questions/', get_questions, name='get_questions'),
    path('exam-questions/create/', create_question, name='create_question'),
    path('exam/start/', start_exam_session, name='start_exam_session'),
    path('exam/<int:session_id>/submit/', submit_answer, name='submit_answer'),
    path('exam/<int:session_id>/end/', end_exam_session, name='end_exam_session'),
    path('exam/webcam/snapshot/', save_webcam_snapshot, name='save_webcam_snapshot'),
    path('exam/sessions/', get_exam_sessions, name='get_exam_sessions'),
    
    # Home
    path('', home, name='home'),
]