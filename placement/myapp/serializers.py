from rest_framework import serializers
from .models import User, Exam, ExamAttempt  # add Exam, ExamAttempt here

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = '__all__'


class ExamAttemptSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExamAttempt
        fields = ['id', 'status', 'attempted_at']


class ExamSerializer(serializers.ModelSerializer):
    attempt = ExamAttemptSerializer(read_only=True)
    start_time = serializers.TimeField(format="%I:%M %p")
    end_time = serializers.TimeField(format="%I:%M %p")

    class Meta:
        model = Exam
        fields = [
            'id', 'title', 'start_date', 'start_time',
            'end_time', 'duration_minutes', 'is_finished',
            'attempt', 'created_at'
        ]