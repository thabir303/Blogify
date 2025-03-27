# backend/blogify/user_module/views.py
from django.shortcuts import render
# from .models import CustomUser
from rest_framework.generics import CreateAPIView
from rest_framework import serializers,status,viewsets
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import get_user_model, authenticate
from .serializers import UserRegistrationSerializer, ActivationSerializer
from .utils import account_activate,send_pin_number
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()
class UserRegistrationView(CreateAPIView):

    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer

    def perform_create(self, serializer):
        print(f'perform_create called')
        user = serializer.save()
        print(f'user - {user} , {user.password}')
        send_pin_number(user)

class AccountActivationView(APIView):
    def post(self,request):
        email = request.data.get('email')
        pin = request.data.get('pin')

        user, message = account_activate(email,pin)

        if user: 
            return Response({"message": message}, status=status.HTTP_200_OK)
        return Response({"error": message},status=status.HTTP_400_BAD_REQUEST)
    
class UserLoginView(APIView):
    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')

        print(f'{email} - {password}')
        # user = authenticate(email=email,password=password)
        
        # print(f'user - {user}')

        try:
            user = get_user_model().objects.get(email=email)
        except get_user_model().DoesNotExist:
            return Response({"error":"Invalid or inactive user."},status = status.HTTP_400_BAD_REQUEST)
        
        print(f'userpassword - {user.password}')
        print(f'check_password - {user.check_password(password)}')
        
        if user.check_password(password) and user.is_active:
            refresh = RefreshToken.for_user(user)
            return Response({
                'refresh' : str(refresh),
                'access' : str(refresh.access_token)
            },status=status.HTTP_200_OK)
            
        return Response({"error":"Invalid or inactive user."}, status = status.HTTP_400_BAD_REQUEST)
    