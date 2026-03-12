from rest_framework import serializers
from .models import User

class UserSerializer(serializers.ModelSerializer):

    class Meta:
        model = User

        fields = '__all__'

        
# ============jobserializer=====================
from .models import Job,AppliedJob

class JobSerializer(serializers.ModelSerializer):

    class Meta:
        model = Job
        fields = "__all__"
class AppliedJobSerializer(serializers.ModelSerializer):

    class Meta:
        model = AppliedJob
        fields = "__all__"

        
