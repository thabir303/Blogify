# backend/blogify/user_module/models.py
from django.db import models
from .managers import CustomUserManager
from django.contrib.auth.models import AbstractBaseUser,PermissionsMixin
from django.contrib.auth import get_user_model

# Create your models here.

class CustomUser(AbstractBaseUser,PermissionsMixin):
    email = models.EmailField(unique=True)
    username = models.CharField(max_length=50)
    is_active = models.BooleanField(default=False)
    activation_pin = models.CharField(max_length=6)
    is_staff = models.BooleanField(default=False)

    objects = CustomUserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    def __str__(self):
        return self.email
