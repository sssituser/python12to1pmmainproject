from django.urls import path
from myapp.views import *

urlpatterns = [
    path('login/', login_view, name='login'),
    path("profile/", Profile_view, name='profile'),
    path("profile/update/", update_profile, name='profile'),
    path("upload-resume/", upload_resume, name='resume'),
]