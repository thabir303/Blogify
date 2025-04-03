# backend/blogify/blogify/urls.py
from django.contrib import admin
from django.urls import path,include
from rest_framework.permissions import AllowAny

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/',include('user_module.urls'))
]
