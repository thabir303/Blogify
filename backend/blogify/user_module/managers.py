# backend/blogify/user_module/managers.py
from django.contrib.auth.models import BaseUserManager
from django.core.validators import validate_email
from django.core.exceptions import ValidationError

class CustomUserManager(BaseUserManager):

    def _create_user(self, email, password, **extra_fields):
        print(f"Creating user with email: {email}")
        if not email:
            raise ValueError('You have not provided a valid e-mail address')
        
        validate_email(email)
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)

        print(f"User created with email: {email}") 
        return user
    
    def create_user(self,email=None,password=None,**extra_fields):
        print(f"Creating regular user: {email}")
        extra_fields.setdefault('is_staff',False)
        extra_fields.setdefault('is_superuser',False)
        extra_fields.setdefault('is_active', False)
        return self._create_user(email,password,**extra_fields)
    
    def create_superuser(self,email=None,password=None,**extra_fields):
        print(f"Creating superuser: {email}")  
        extra_fields.setdefault('is_staff',True)
        extra_fields.setdefault('is_superuser',True)
        extra_fields.setdefault('is_active',True)
        return self._create_user(email,password,**extra_fields)