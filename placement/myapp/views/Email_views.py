# ═══════════════════════════════════════════════════════════════
#  DJANGO SMTP EMAIL ENDPOINT
#  Add this to your views.py and wire up urls.py
# ═══════════════════════════════════════════════════════════════
#
#  1. Install dependencies (if not already):
#       pip install django  (already have it)
#
#  2. Add to settings.py:
#
#     EMAIL_BACKEND      = 'django.core.mail.backends.smtp.EmailBackend'
#     EMAIL_HOST         = 'smtp.gmail.com'
#     EMAIL_PORT         = 587
#     EMAIL_USE_TLS      = True
#     EMAIL_HOST_USER    = 'your-app@gmail.com'   # ← change
#     EMAIL_HOST_PASSWORD = 'your-app-password'   # ← use App Password, not real password
#     DEFAULT_FROM_EMAIL = 'Placement Portal <your-app@gmail.com>'
#
#  3. Add to urls.py:
#     from .views import send_email_view
#     path('api/send-email/', send_email_view),
#
# ═══════════════════════════════════════════════════════════════

import json
from django.core.mail import send_mail
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST


# ── HTML email templates ───────────────────────────────────────

def _login_html(username, login_time):
    return f"""
    <div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;background:#0d0d0d;
                color:#e5e5e5;border-radius:12px;overflow:hidden;">
      <div style="background:#16a34a;padding:24px 32px;">
        <h1 style="margin:0;font-size:22px;color:#fff;">Placement Portal 🚀</h1>
      </div>
      <div style="padding:32px;">
        <h2 style="color:#4ade80;">Login Successful</h2>
        <p>Hi <strong>{username}</strong>,</p>
        <p>Your account was accessed on <strong>{login_time}</strong>.</p>
        <p style="color:#9ca3af;font-size:13px;">
          If this wasn't you, please change your password immediately.
        </p>
      </div>
      <div style="padding:16px 32px;background:#111;font-size:12px;color:#6b7280;text-align:center;">
        © Placement Portal · Automated alert, do not reply
      </div>
    </div>
    """


def _exam_result_html(data):
    status_color = "#4ade80" if data["passed"] else "#f87171"
    status_text  = "✅ PASSED" if data["passed"] else "❌ FAILED"
    percent = round((data["score"] / data["total_marks"]) * 100, 1) if data["total_marks"] else 0

    return f"""
    <div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;background:#0d0d0d;
                color:#e5e5e5;border-radius:12px;overflow:hidden;">
      <div style="background:#4f46e5;padding:24px 32px;">
        <h1 style="margin:0;font-size:22px;color:#fff;">Placement Portal — Exam Result</h1>
      </div>
      <div style="padding:32px;">
        <h2 style="color:#a5b4fc;">{data['exam_title']}</h2>
        <p>Hi <strong>{data['username']}</strong>, your result is ready.</p>

        <div style="text-align:center;margin:24px 0;">
          <span style="font-size:28px;font-weight:bold;color:{status_color};">{status_text}</span>
        </div>

        <table style="width:100%;border-collapse:collapse;font-size:14px;">
          <tr style="border-bottom:1px solid #333;">
            <td style="padding:10px 0;color:#9ca3af;">Score</td>
            <td style="padding:10px 0;text-align:right;font-weight:bold;">
              {data['score']} / {data['total_marks']} ({percent}%)
            </td>
          </tr>
          <tr style="border-bottom:1px solid #333;">
            <td style="padding:10px 0;color:#9ca3af;">Correct Answers</td>
            <td style="padding:10px 0;text-align:right;">
              {data['correct_answers']} / {data['total_questions']}
            </td>
          </tr>
          <tr style="border-bottom:1px solid #333;">
            <td style="padding:10px 0;color:#9ca3af;">Time Taken</td>
            <td style="padding:10px 0;text-align:right;">{data['time_taken']}</td>
          </tr>
          <tr>
            <td style="padding:10px 0;color:#9ca3af;">Submitted At</td>
            <td style="padding:10px 0;text-align:right;">{data['submitted_at']}</td>
          </tr>
        </table>
      </div>
      <div style="padding:16px 32px;background:#111;font-size:12px;color:#6b7280;text-align:center;">
        © Placement Portal · Automated result email, do not reply
      </div>
    </div>
    """


# ── View ───────────────────────────────────────────────────────

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
        if email_type == "login_alert":
            subject  = "🔐 New Login to Placement Portal"
            html_msg = _login_html(data.get("username", "Student"), data.get("login_time", ""))

        elif email_type == "exam_result":
            passed  = data.get("passed", False)
            subject = f"{'✅ Passed' if passed else '❌ Failed'} — {data.get('exam_title','Exam')} Result"
            html_msg = _exam_result_html(data)

        else:
            return JsonResponse({"detail": f"Unknown email type: {email_type}"}, status=400)

        send_mail(
            subject=subject,
            message="",          # plain-text fallback (empty — HTML only)
            from_email=None,     # uses DEFAULT_FROM_EMAIL from settings
            recipient_list=[to_email],
            html_message=html_msg,
            fail_silently=False,
        )
        return JsonResponse({"success": True, "sent_to": to_email})

    except Exception as exc:
        return JsonResponse({"detail": str(exc)}, status=500)