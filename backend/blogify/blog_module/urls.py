# backend/blogify/blog_module/urls.py
from django.urls import path
from .views import BlogListView, BlogCreateView, BlogDetailView, BlogEditView, BlogDeleteView, CommentCreateView

urlpatterns = [
    
    path('blogs/', BlogListView.as_view(), name='blog_list'),
    path('blogs/create/', BlogCreateView.as_view(), name='blog_create'),
    path('blogs/<int:blog_id>/', BlogDetailView.as_view(), name='blog_detail'),
    path('blogs/<int:blog_id>/edit/', BlogEditView.as_view(), name='blog_edit'),
    path('blogs/<int:blog_id>/delete/', BlogDeleteView.as_view(), name='blog_delete'),
    path('blogs/<int:blog_id>/comments/', CommentCreateView.as_view(), name='comment_create'),
]
