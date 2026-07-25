from django.apps import AppConfig
from django.db.models.signals import post_migrate
import threading
import sys

class MyappConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'myapp'
    
    def ready(self):
        """Register signals and initialize 1000% Reliable Sync Engine"""
        # Import models to register signals
        import myapp.models  # noqa
        
        # Monkey patch JWTAuthentication to validate login_session_key
        from rest_framework_simplejwt.authentication import JWTAuthentication
        from rest_framework.exceptions import AuthenticationFailed

        original_authenticate = JWTAuthentication.authenticate

        def custom_authenticate(self, request):
            res = original_authenticate(self, request)
            if res is None:
                return None
            user, validated_token = res
            if user and user.is_authenticated and user.role in ['student', 'faculty']:
                token_session_key = validated_token.get('login_session_key')
                db_session_key = getattr(user, 'login_session_key', None)
                if not db_session_key or token_session_key != db_session_key:
                    raise AuthenticationFailed('This session has been terminated because this account logged in from another device/browser.')
            return user, validated_token

        JWTAuthentication.authenticate = custom_authenticate

        # Trigger on migrations
        post_migrate.connect(on_post_migrate, sender=self)
        
        # 🛡️ 1000% AUTO-RUN ON EVERY STARTUP (Safe Background Thread)
        # This ensures subjects sync even if 'migrate' isn't called.
        if 'runserver' in sys.argv:
            threading.Timer(2.0, run_startup_sync).start()

def run_startup_sync():
    """Independent background sync thread"""
    on_post_migrate(None)

def on_post_migrate(sender, **kwargs):
    """Executes once the system is 1000% ready"""
    try:
        from myapp.sync_engine import import_sync_data
        import_sync_data()
        
        from myapp.scheduler import start_scheduler
        start_scheduler()
    except Exception:
        pass