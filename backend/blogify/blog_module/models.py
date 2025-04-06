from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class Blog(models.Model):
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    DRAFT = 'draft',
    PUBLISHED = 'published'
    MOODS = [ (DRAFT, 'Draft'),
              (PUBLISHED, 'Published')                  
            ]
    title = models.CharField(max_length=200)
    content = models.TextField()
    status = models.CharField(max_length=200)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    author = models.ForeignKey(User, on_delete=models.CASCADE)

    def __str__(self):
        return self.title
    
class Comment(models.Model):
    blog = models.ForeignKey(Blog, related_name='comments',on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'{self.user.username} comment on {self.blog.title}'
    
