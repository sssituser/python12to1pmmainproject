import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
from myapp.email_utils import send_login_email, send_exam_confirmation_email

@csrf_exempt
@require_POST
def send_email_view(request):
    """
    POST /api/send-email/
    Body: JSON with 'type' = 'login_alert' | 'exam_result'
    """
    try:
        data = json.loads(request.body)
    except (json.JSONDecodeError, ValueError):
        return JsonResponse({"detail": "Invalid JSON"}, status=400)

    email_type = data.get("type")
    to_email   = data.get("to", "").strip()

    if not to_email:
        return JsonResponse({"detail": "No recipient email"}, status=400)

    try:
        success = False
        if email_type == "login_alert":
            success = send_login_email(
                user_email=to_email,
                username=data.get("username", "Student"),
                login_time=data.get("login_time", "Unknown"),
                user_ip=data.get("user_ip", "Unknown"),
                browser_info=data.get("browser_info", "Unknown")
            )

        elif email_type == "exam_result":
            success = send_exam_confirmation_email(
                user_email=to_email,
                exam_title=data.get("exam_title", "Assessment"),
                score=data.get("score", 0),
                total_marks=data.get("total_marks", 100)
            )

        else:
            return JsonResponse({"detail": f"Unknown email type: {email_type}"}, status=400)

        if success:
            return JsonResponse({"success": True, "sent_to": to_email})
        else:
            return JsonResponse({"success": False, "detail": "Failed to send email"}, status=500)

    except Exception as exc:
        return JsonResponse({"detail": str(exc)}, status=500)