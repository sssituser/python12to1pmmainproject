from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.contrib.auth import authenticate

@api_view(['POST'])
def login_view(request):
    username = request.data.get('username')
    password = request.data.get('password')
    user = authenticate(username=username, password=password)
    if user is not None:
        return Response({
            "message": "Login successful",
            "user": {
                "username": user.username,
                "email": user.email
            }
        })
    else:
        return Response({"error": "Invalid username or password"}, status=400)
    
def profile_view(request):
    