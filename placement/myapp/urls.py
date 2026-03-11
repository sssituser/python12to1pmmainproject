from django.urls import path, include
from myapp.views import *
from rest_framework.routers import DefaultRouter
from .views import JobViewSet

router = DefaultRouter()
router.register(r'jobs', JobViewSet)

urlpatterns = [
    path('login/', login_view, name='login'),
    path('exams/finished/', FinishedExamListView.as_view(), name='finished-exams'),
    path('exams/<int:pk>/attempt/', UpdateAttemptView.as_view(), name='update-attempt'),
    path('', include(router.urls)),

    

]