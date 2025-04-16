# backend/blogify/blog_module/tests/test_api.py
import json
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase, APIClient, force_authenticate
from django.contrib.auth import get_user_model
from ..models import Blog, Comment
from unittest.mock import patch

User = get_user_model()

class BlogApiTestCase(APITestCase):
    
    def setUp(self):
        
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpassword123'
        )
        
        self.another_user = User.objects.create_user(
            username='anotheruser',
            email='another@example.com',
            password='testpassword123'
        )
        
        self.published_blog = Blog.objects.create(
            title='Published Test Blog',
            content='This is a published test blog content',
            status=Blog.PUBLISHED,
            author=self.user
        )
        
        self.draft_blog = Blog.objects.create(
            title='Draft Test Blog',
            content='This is a draft test blog content',
            status=Blog.DRAFT,
            author=self.user
        )
        
        self.comment = Comment.objects.create(
            content='Test comment',
            user=self.user,
            blog=self.published_blog
        )
        
        self.client = APIClient()
    
    def blog_list_unauthenticated(self):
        
        self.client.force_authenticate(user=None)
        
        url = reverse('blog_list')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])
        self.assertEqual(len(response.data['data']), 1)  
        self.assertEqual(response.data['data'][0]['title'], 'Published Test Blog')

    def blog_list_authenticated(self):
        
        self.client.force_authenticate(user=self.user)
        
        url = reverse('blog_list')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])
        self.assertEqual(len(response.data['data']), 2)  

    def blog_list_with_filter(self):
        self.client.force_authenticate(user=self.user)
        
        url = reverse('blog_list') + '?status=draft'
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])
        self.assertEqual(len(response.data['data']), 1)
        self.assertEqual(response.data['data'][0]['status'], Blog.DRAFT)

    def blog_create_authenticated(self):
        
        self.client.force_authenticate(user=self.user)
        
        url = reverse('blog_create')
        data = {
            'title': 'New Test Blog',
            'content': 'This is a new test blog content',
            'status': Blog.PUBLISHED
        }
        
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(response.data['success'])
        self.assertEqual(response.data['blog']['title'], 'New Test Blog')
        self.assertEqual(Blog.objects.count(), 3)

    def blog_create_unauthenticated(self):
        
        self.client.force_authenticate(user=None)
        
        url = reverse('blog_create')
        data = {
            'title': 'New Test Blog',
            'content': 'This is a new test blog content',
            'status': Blog.PUBLISHED
        }
        
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(Blog.objects.count(), 2)  

    def blog_detail_published(self):
        
        self.client.force_authenticate(user=None)
        
        url = reverse('blog_detail', kwargs={'blog_id': self.published_blog.id})
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])
        self.assertEqual(response.data['blog']['id'], self.published_blog.id)
        
        self.published_blog.views = 0
        self.published_blog.save()
        self.published_blog.refresh_from_db()
        initial_views = self.published_blog.views

        # print(f"Initial views: {initial_views}")
        
        self.client.force_authenticate(user=self.another_user)
        # print(f"Request user: {self.another_user.username}")
        # print(f"Blog author: {self.published_blog.author.username}")
        
        response = self.client.get(url)
        self.published_blog.refresh_from_db()
        
        # print(f"After view - views: {self.published_blog.views}")
        expected_views = initial_views + 1
        self.assertEqual(self.published_blog.views, expected_views)

    def blog_detail_draft(self):
        
        url = reverse('blog_detail', kwargs={'blog_id': self.draft_blog.id})
        
        self.client.force_authenticate(user=None)
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        
        self.client.force_authenticate(user=self.another_user)
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        
        self.client.force_authenticate(user=self.user)
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])
        self.assertEqual(response.data['blog']['id'], self.draft_blog.id)

    def blog_edit_by_author(self):
        
        self.client.force_authenticate(user=self.user)
        
        url = reverse('blog_edit', kwargs={'blog_id': self.published_blog.id})
        data = {
            'title': 'Updated Test Blog',
            'content': 'This is updated content',
            'status': Blog.PUBLISHED
        }
        
        response = self.client.put(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])
        self.published_blog.refresh_from_db()
        self.assertEqual(self.published_blog.title, 'Updated Test Blog')

    def blog_edit_by_non_author(self):
        
        self.client.force_authenticate(user=self.another_user)
        
        url = reverse('blog_edit', kwargs={'blog_id': self.published_blog.id})
        data = {
            'title': 'Updated By Non-Author',
            'content': 'This should not work',
            'status': Blog.PUBLISHED
        }
        
        response = self.client.put(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.published_blog.refresh_from_db()
        self.assertNotEqual(self.published_blog.title, 'Updated By Non-Author')

    def blog_edit_published_to_draft(self):
        
        self.client.force_authenticate(user=self.user)
        
        url = reverse('blog_edit', kwargs={'blog_id': self.published_blog.id})
        data = {
            'title': self.published_blog.title,
            'content': self.published_blog.content,
            'status': Blog.DRAFT
        }
        
        response = self.client.put(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(response.data['success'])

    def blog_delete_by_author(self):
        
        self.client.force_authenticate(user=self.user)
        
        url = reverse('blog_delete', kwargs={'blog_id': self.published_blog.id})
        
        response = self.client.delete(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])
        self.assertEqual(Blog.objects.count(), 1)  

    def blog_delete_by_non_author(self):
        
        self.client.force_authenticate(user=self.another_user)
        
        url = reverse('blog_delete', kwargs={'blog_id': self.published_blog.id})
        
        response = self.client.delete(url)
        
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(Blog.objects.count(), 2)  

    @patch('blog_module.views.send_comment_notification_email.delay')
    def comment_create(self, mock_notification):
        
        self.client.force_authenticate(user=self.user)
        
        url = reverse('comment_create', kwargs={'blog_id': self.published_blog.id})
        data = {
            'content': 'This is a test comment'
        }
        
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(response.data['success'])
        self.assertEqual(Comment.objects.count(), 2)  
        
        mock_notification.assert_called_once()

    def comment_reply(self):
        
        self.client.force_authenticate(user=self.user)
        
        url = reverse('comment_reply', kwargs={'comment_id': self.comment.id})
        data = {
            'content': 'This is a test reply'
        }
        
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(response.data['success'])
        
        replies = Comment.objects.filter(parent=self.comment)
        self.assertEqual(replies.count(), 1)
        self.assertEqual(replies.first().content, 'This is a test reply')

    def user_blogs(self):
        
        self.client.force_authenticate(user=self.user)
        
        url = reverse('user-blogs')
        
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])
        self.assertEqual(len(response.data['data']), 2)