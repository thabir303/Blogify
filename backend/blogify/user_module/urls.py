# backend/blogify/user_module/urls.py
from django.urls import path,include
from .views import UserLoginView, UserRegistrationView, AccountActivationView
from rest_framework.routers import DefaultRouter


router = DefaultRouter()
router.register(r'users', UserRegistrationView, basename='user')

urlpatterns = [
    # path('register/', UserRegistrationView.as_view(), name = 'register'),
    path('activate/',AccountActivationView.as_view(), name='activate'),
    path('login/', UserLoginView.as_view(), name = 'login'),
    path('', include(router.urls)),

]
