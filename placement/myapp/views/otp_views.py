from rest_framework.views import APIView
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from myapp.models import OTP
from myapp.email_utils import send_plain_email

User = get_user_model()


class Send_OTP(APIView):
    def post(self, request):
        email = request.data.get("email")

        otp_obj = OTP(email=email)
        otp_obj.generate_otp()
        otp_obj.save()

        sent = send_plain_email(
            "Your OTP Code",
            f"Your OTP is {otp_obj.otp}",
            email,
        )

        if not sent:
            return Response({"error": "Failed to send OTP email. Please try again."}, status=500)

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