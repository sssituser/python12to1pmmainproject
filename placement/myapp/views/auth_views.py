from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.contrib.auth import authenticate, login
from django.views.decorators.csrf import csrf_exempt
from django.shortcuts import render

@csrf_exempt
@api_view(['POST'])
def login_view(request):

    username = request.data.get('username')
    password = request.data.get('password')
    user = authenticate(username=username, password=password)
    if user:
        login(request, user)
        return Response({
            "message": "Login successful",
            "user": {
                "username": user.username,
                "email": user.email
            }
        })

    return Response({"error": "Invalid username or password"}, status=400)


