"""
Custom Rate Limiting (Throttle) Classes
=========================================
Applied per-endpoint to enforce specific request limits.

Scopes map to DEFAULT_THROTTLE_RATES in settings.py:
  - 'login'  → 10/minute  (brute-force protection)
  - 'anon'   → 30/minute  (general unauthenticated)
  - 'user'   → 200/minute (authenticated students/faculty)
  - 'exam'   → 60/minute  (exam submission endpoints)
"""

from rest_framework.throttling import AnonRateThrottle, UserRateThrottle, ScopedRateThrottle


class LoginRateThrottle(AnonRateThrottle):
    """
    Strict throttle for login attempts — 10 per minute per IP.
    Protects against brute-force attacks on student/faculty accounts.
    """
    scope = 'login'


class OTPRateThrottle(AnonRateThrottle):
    """
    Throttle for OTP send/verify — 10 per minute per IP.
    Prevents OTP spam and SMS/email flooding.
    """
    scope = 'login'


class RegisterRateThrottle(AnonRateThrottle):
    """
    Throttle for registration — 10 per minute per IP.
    Prevents automated account creation bots.
    """
    scope = 'login'


class ExamRateThrottle(UserRateThrottle):
    """
    Throttle for exam-related endpoints (submit, log-violation, start).
    60 requests per minute for authenticated users.
    """
    scope = 'exam'


class AuthenticatedUserThrottle(UserRateThrottle):
    """
    General throttle for authenticated API calls.
    200 requests per minute per user.
    """
    scope = 'user'
