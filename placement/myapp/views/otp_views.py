from django.core.mail import send_mail
from rest_framework.views import APIView
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from myapp.models import OTP

User = get_user_model()


class Send_OTP(APIView):
    def post(self, request):
        email = request.data.get("email")

        otp_obj = OTP(email=email)
        otp_obj.generate_otp()
        otp_obj.save()

        send_mail(
            "Your OTP Code",
            f"Your OTP is {otp_obj.otp}",
            "your@email.com",
            [email],
        )

        return Response({"message": "OTP sent"})


class Verify_OTP_Register(APIView):
    def post(self, request):
        email = request.data.get("email")
        otp = request.data.get("otp")

        otp_obj = OTP.objects.filter(email=email, otp=otp).last()

        if not otp_obj:
            return Response({"error": "Invalid OTP"}, status=400)

        user = User.objects.create_user(
            username=request.data["username"],
            email=email,
            password=request.data["password"],
            role=request.data["role"],
            is_verified=True
        )

        return Response({"message": "Registered successfully"})