from django.urls import path
from myapp.views import *

urlpatterns = [
    path('login/', login_view, name='login'),
]