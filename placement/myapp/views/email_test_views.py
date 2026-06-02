from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.conf import settings

from myapp.email_utils import send_plain_email


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def smtp_test_email(request):
    """
    Sends a test email using the configured SMTP backend.

    Request JSON:
      - to_email: required
      - subject: optional
      - message: optional
    """
    to_email = (request.data.get("to_email") or "").strip()
    if not to_email:
        return Response({"error": "to_email is required"}, status=400)

    subject = (request.data.get("subject") or "SMTP Test Email").strip()
    message = (request.data.get("message") or "SMTP test from SSSIT Placement Portal backend.").strip()

    sent = send_plain_email(subject, message, to_email)

    # Return non-sensitive diagnostics to quickly spot config issues.
    diagnostics = {
        "EMAIL_BACKEND": getattr(settings, "EMAIL_BACKEND", None),
        "EMAIL_HOST": getattr(settings, "EMAIL_HOST", None),
        "EMAIL_PORT": getattr(settings, "EMAIL_PORT", None),
        "EMAIL_USE_TLS": getattr(settings, "EMAIL_USE_TLS", None),
        "EMAIL_USE_SSL": getattr(settings, "EMAIL_USE_SSL", None),
        "DEFAULT_FROM_EMAIL": getattr(settings, "DEFAULT_FROM_EMAIL", None),
        "EMAIL_HOST_USER": getattr(settings, "EMAIL_HOST_USER", None),
        "EMAIL_TIMEOUT": getattr(settings, "EMAIL_TIMEOUT", None),
    }

    if sent:
        return Response({"success": True, "message": "Test email sent", "diagnostics": diagnostics})

    # send_plain_email logs the exception server-side; client just needs to know it failed.
    return Response(
        {"success": False, "error": "Failed to send email. Check server logs for SMTP error.", "diagnostics": diagnostics},
        status=500,
    )

