# backend/blogify/blogify/urls.py
from django.contrib import admin
from django.urls import path,include
from django.http import JsonResponse


def health_check(_request):
    return JsonResponse({'status': 'ok'})

urlpatterns = [
    path('', health_check),
    path('admin/', admin.site.urls),
    path('api/',include('user_module.urls')),
    path('api/',include('blog_module.urls')),
]
