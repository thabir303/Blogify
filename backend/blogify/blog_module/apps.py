from django.apps import AppConfig
from django.conf import settings

class BlogModuleConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'blog_module'
    
    def ready(self):
        if getattr(settings, 'ENABLE_CELERY', False):
            import blog_module.signals