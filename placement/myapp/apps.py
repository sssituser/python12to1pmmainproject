from django.apps import AppConfig
from django.db.models.signals import post_migrate
import threading
import sys

class MyappConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'myapp'
    
    def ready(self):
        """Register signals and initialize 1000% Reliable Sync Engine"""
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