# backend/blogify/blog_module/signals.py
from django.db.models.signals import post_migrate
from django.dispatch import receiver
from django_celery_beat.models import PeriodicTask, IntervalSchedule
import json

@receiver(post_migrate)
def create_periodic_tasks(sender, **kwargs):

    if sender.name == 'blog_module':
        schedule, created = IntervalSchedule.objects.get_or_create(
            every=1,
            period=IntervalSchedule.MINUTES,
        )
        
        PeriodicTask.objects.get_or_create(
            name='Notify users of new blogs',
            task='blog_module.tasks.notify_users_of_new_blog',
            interval=schedule,
            kwargs=json.dumps({}),
            enabled=True,
        )