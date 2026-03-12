from rest_framework import serializers
from .models import User, LeaveRequest, PythonQuestion, Choice, ExamAttempt, CodeSnippet, CodeTemplate, ExecutionSession

class UserSerializer(serializers.ModelSerializer):

    class Meta:
        model = User
        fields = '__all__'

class LeaveRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = LeaveRequest
        fields = '__all__'

class PythonQuestionSerializer(serializers.ModelSerializer):
    choices = serializers.SerializerMethodField()
    
    class Meta:
        model = PythonQuestion
        fields = '__all__'
    
    def get_choices(self, obj):
        if obj.question_type == 'multiple_choice':
            choices = Choice.objects.filter(question=obj)
            return [
                {
                    'id': choice.id,
                    'text': choice.choice_text,
                    'is_correct': choice.is_correct
                }
                for choice in choices
            ]
        return []

class ExamAttemptSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = ExamAttempt
        fields = '__all__'

class CodeSnippetSerializer(serializers.ModelSerializer):
    class Meta:
        model = CodeSnippet
        fields = '__all__'

class CodeTemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = CodeTemplate
        fields = '__all__'

class ExecutionSessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExecutionSession
        fields = '__all__'