# backend/blogify/blogify/urls.py
from django.contrib import admin
from django.urls import path,include
# from ../urls

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/',include('user_module.urls'))
]
