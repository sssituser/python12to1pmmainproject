from django.urls import path
from myapp.views import *

urlpatterns = [
    path('login/', login_view, name='login'),
    path('exams/finished/', FinishedExamListView.as_view(), name='finished-exams'),
    path('exams/<int:pk>/attempt/', UpdateAttemptView.as_view(), name='update-attempt'),

]