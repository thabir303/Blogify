# backend/blogify/blog_module/models.py
from django.db import models
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError

User = get_user_model()

class Blog(models.Model):
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    DRAFT = 'draft'
    PUBLISHED = 'published'
    MOODS = [ (DRAFT, 'Draft'),
              (PUBLISHED, 'Published')                  
            ]
    title = models.CharField(max_length=200)
    content = models.TextField()
    status = models.CharField(max_length=200, choices=MOODS, default=DRAFT)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    # author = models.ForeignKey(User, on_delete=models.CASCADE)

    def __str__(self):
        return self.title
    
    def save(self, *args, **kwargs):
        if self.id:
            old_one = Blog.objects.get(id=self.id)
            if old_one.status == self.PUBLISHED and self.status == self.DRAFT:
                raise ValidationError('Published posts cannot be changed to draft mood.')
        super().save(*args, **kwargs)
    
class Comment(models.Model):
    blog = models.ForeignKey(Blog, related_name='comments',on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    parent = models.ForeignKey('self', null=True, blank=True, on_delete=models.CASCADE, related_name='replies')


    def __str__(self):
        return f'{self.user.username} comment on {self.blog.title}'
    
