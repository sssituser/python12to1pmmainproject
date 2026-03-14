from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.contrib.auth.hashers import check_password
from django.views.decorators.csrf import csrf_exempt
from myapp.models import User


@csrf_exempt
@api_view(['POST'])
def login_view(request):

    username = request.data.get('username')
    password = request.data.get('password')

    try:
        user = User.objects.get(username=username)

        if check_password(password, user.password):

            return Response({
                "access": "mock-token-" + username,
                "refresh": "mock-refresh-" + username,
                "user": {
                    "username": user.username,
                    "email": user.email
                }
            })

        else:
            return Response({"detail": "Invalid username or password"}, status=400)

    except User.DoesNotExist:
        return Response({"detail": "Invalid username or password"}, status=400)

    except Exception as e:
        return Response({"detail": str(e)}, status=500)