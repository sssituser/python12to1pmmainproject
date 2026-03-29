from django.apps import AppConfig

class MyappConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'myapp'
    
    def ready(self):
        """Initialize background scheduler on Django startup"""
        try:
            from myapp.scheduler import start_scheduler
            start_scheduler()
        except ImportError:
            pass
        except Exception as e:
            import logging
            logger = logging.getLogger(__name__)
            logger.warning(f"Could not start scheduler: {e}")