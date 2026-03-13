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

    # EXAM ATTEMPTS
    #path('api/exams/finished/', FinishedExamListView.as_view()),
    #path('api/exams/<int:pk>/attempt/', UpdateAttemptView.as_view()),

    # HOME

]