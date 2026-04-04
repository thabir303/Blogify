# backend/blogify/blog_module/tasks.py
from celery import shared_task
from django.contrib.auth import get_user_model
from .models import Blog
from user_module.utils import send_plain_email
from datetime import timedelta
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
        sent = send_plain_email(subject=subject, message=message, recipient_email=blog_owner.email)
        if not sent:
            return f"Failed to send email to {blog_owner.email}"
        
        return f"Email notification sent to {blog_owner.email}"
    except Exception as e:
        return f"Failed to send email: {str(e)}"

@shared_task
def notify_users_of_new_blog():
   
    print("Starting notify_users_of_new_blog task")

    one_hour_ago = timezone.now() - timedelta(hours=12)
    new_blogs = Blog.objects.filter(created_at__gte=one_hour_ago, status=Blog.PUBLISHED)
    
    print(f"Found {new_blogs.count()} new blogs published in the last minute")

    if not new_blogs.exists():
        print("No new blogs to notify about")
        return "No new blogs to notify about"
    
    active_users = User.objects.filter(is_active=True)
    print(f"Found {active_users.count()} active users to notify")
    notification_count = 0
    
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
        success_count = 0
        for recipient in recipients:
            if send_plain_email(subject=subject, message=message, recipient_email=recipient):
                success_count += 1
            else:
                print(f"Failed to send email for blog '{blog.title}' to {recipient}")

        if success_count:
            notification_count += 1
            print(f"Successfully sent {success_count} notifications for blog: {blog.title}")
    
    return f"Notified users about {notification_count} new blog posts"