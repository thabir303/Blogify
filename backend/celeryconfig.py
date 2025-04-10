# /backend/celeryconfig.py
import os
import sys
from pathlib import Path

BACKEND_DIR = Path(__file__).parent
BLOGIFY_DIR = BACKEND_DIR / 'blogify'
sys.path.insert(0, str(BLOGIFY_DIR))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'blogify.settings')

import django
django.setup()

from celery import Celery

app = Celery('blogify')
app.config_from_object('django.conf:settings', namespace='CELERY')
app.autodiscover_tasks()

@app.task(bind=True)
def debug_task(self):
    print(f'Request: {self.request!r}')