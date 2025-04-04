# backend/blogify/user_module/urls.py
from django.urls import path,include
from .views import UserLoginView, UserRegistrationView, AccountActivationView,PasswordResetRequestView,PasswordResetConfirmView,TokenVerifyView,UserLogoutView
# from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework.permissions import AllowAny

# router = DefaultRouter()
# router.register(r'users', UserRegistrationView, basename='user')

urlpatterns = [
    path('auth/register/', UserRegistrationView.as_view(), name = 'register'),
    path('auth/activate/',AccountActivationView.as_view(), name='activate'),
    path('auth/login/', UserLoginView.as_view(), name = 'login'),
    path('auth/logout/', UserLogoutView.as_view(), name = 'logout'),

    # path('', include(router.urls)),
    path('auth/password-reset/',PasswordResetRequestView.as_view(), name='password_reset'),
    path('auth/password-reset-confirm/',PasswordResetConfirmView.as_view(), name='password_reset_confirmation'),

    path('auth/token/', TokenObtainPairView.as_view(), name='token'), 
    path('auth/token/verify/',  TokenVerifyView.as_view(), name='token_verify'), 
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

]
