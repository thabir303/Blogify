# backend/blogify/blog_module/tasks.py
from celery import shared_task
from django.core.mail import send_mail
from django.contrib.auth import get_user_model
from django.conf import settings
from .models import Blog
from datetime import datetime, timedelta
from django.utils import timezone

User = get_user_model()

@shared_task
def send_comment_notification_email(blog_id, commenter_username, comment_content):

    try:
        blog = Blog.objects.get(id=blog_id)
        blog_owner = blog.author
        
        subject = f'New comment on your blog "{blog.title}"'
        message = f'''
        Hello {blog_owner.username},
        
        {commenter_username} has commented on your blog post "{blog.title}":
        
        "{comment_content}"
        
        Visit your blog to respond.
        
        Regards,
        Blogify
        '''
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.EMAIL_HOST_USER,
            recipient_list=[blog_owner.email],
        )
        
        return f"Email notification sent to {blog_owner.email}"
    except Exception as e:
        return f"Failed to send email: {str(e)}"

@shared_task
def notify_users_of_new_blog():
   
    print("Starting notify_users_of_new_blog task")

    one_hour_ago = timezone.now() - timedelta(minutes=1)
    new_blogs = Blog.objects.filter(created_at__gte=one_hour_ago, status=Blog.PUBLISHED)
    
    print(f"Found {new_blogs.count()} new blogs published in the last minute")

    if not new_blogs.exists():
        print("No new blogs to notify about")
        return "No new blogs to notify about"
    
    active_users = User.objects.filter(is_active=True)
    print(f"Found {active_users.count()} active users to notify")
    
    for blog in new_blogs:
        subject = f"New Blog Post: {blog.title}"
        
        recipients = [user.email for user in active_users if user.id != blog.author.id]
        
        if not recipients:
            continue

        print(f"Sending notifications about blog '{blog.title}' to {len(recipients)} users")

        
        message = f'''
        Hello Blogify User,
        
        A new blog post has been published:
        
        Title: {blog.title}
        Author: {blog.author.username}
        
        Check it out on Blogify!
        
        Regards,
        Blogify
        '''
        try:
            send_mail(
                subject=subject,
                message=message,
                from_email=settings.EMAIL_HOST_USER,
                recipient_list=recipients,
                fail_silently=False,
            )
            notification_count += 1
            print(f"Successfully sent notification for blog: {blog.title}")
        except Exception as e:
            print(f"Failed to send email for blog '{blog.title}': {str(e)}")
    
    return f"Notified users about {notification_count} new blog posts"