# backend/blogify/user_module/views.py
from django.shortcuts import render
# from .models import CustomUser
from rest_framework.generics import CreateAPIView
from rest_framework import serializers,status,viewsets
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import get_user_model, authenticate, logout
from .serializers import UserRegistrationSerializer, ActivationSerializer
from .utils import account_activate,send_pin_number
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.exceptions import ValidationError
import jwt

User = get_user_model()
class UserRegistrationView(CreateAPIView):
    permission_classes = [AllowAny]

    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer

    def create(self, request, *args, **kwargs):
        try:
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            print(f'perform_create called')
            user = serializer.save()
            print(f'user - {user} , {user.password}')
            send_pin_number(user)
            print("Hi")
            return Response({
                    'success': True,
                    'message': 'Registration successful! Please check your email to activate your account.',
                    'username': user.username,
                    'email': user.email,
            }, status=status.HTTP_200_OK)
        except ValidationError as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)
        

class AccountActivationView(APIView):
    permission_classes = [AllowAny]

    def post(self,request):
        email = request.data.get('email')
        pin = request.data.get('pin')

        user, message = account_activate(email,pin)

        if user: 
            return Response({
                "message": message,
                "success": True,
            }, status=status.HTTP_200_OK)
        return Response({
            "success": False,
            "error": message
        }, status=status.HTTP_400_BAD_REQUEST)  
      
class UserLoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')

        print(f'{email} - {password}')
        # user = authenticate(email=email,password=password)
        
        # print(f'user - {user}')

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({
                'success': False,
                'message': 'User is not found. Please check your email and password.',
                "error":"Invalid or inactive user."
                },
                status = status.HTTP_400_BAD_REQUEST)
        
        print(f'userpassword - {user.password}')
        print(f'check_password - {user.check_password(password)}')
        
        if user.check_password(password) and user.is_active:
            refresh = RefreshToken.for_user(user)
            access_token = refresh.access_token
            access_token['username'] = user.username
            return Response({
                'success':True,
                'message':'Login successful',
                'refresh' : str(refresh),
                'access' : str(refresh.access_token),
                'username':user.username,
                'email': user.email,

            },status=status.HTTP_200_OK)
             
        return Response({
            "success": False, 
            "message": "Invalid or inactive user."
            }, 
            status=status.HTTP_400_BAD_REQUEST)
    
class PasswordResetRequestView(APIView):
    permission_classes = [AllowAny]
    
    def post(self,request):
        email = request.data.get('email')

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({"error": "Email does not exist."}, status=status.HTTP_400_BAD_REQUEST)
        
        send_pin_number(user)
        return Response({"message":"Password reset PIN sent to your email address."},status=status.HTTP_200_OK)
    
class PasswordResetConfirmView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email')
        pin = request.data.get('pin')
        new_password = request.data.get('new_password')

        try :
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({
                    "error":"User not found"
                },status=status.HTTP_400_BAD_REQUEST)
        
        if user.activation_pin != pin:
            return Response(
                {"error":"Invalid pin number."}, 
                status=status.HTTP_400_BAD_REQUEST)
        
        user.set_password(new_password)
        user.activation_pin = ''
        user.save()

        return Response(
            {"message":"Password successfully reset."},
            status=status.HTTP_200_OK)
    
class TokenVerifyView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []  

    def get(self, request):
        token_header = request.headers.get("Authorization")
        if not token_header:
            return Response(
                {"error": "Authorization token missing"}, 
                status=status.HTTP_400_BAD_REQUEST)

        try:
            token = token_header.split(" ")[1]  
            print(f"Received token: {token}") 

            decoded_token = jwt.decode(token, options=
                                       {
                                           "verify_signature": False, 
                                           "verify_exp": True
                                       })
            print(f"Decoded token: {decoded_token}") 

            user_id = decoded_token.get('user_id')
            if user_id:
                try:
                    user = User.objects.get(id=user_id)
                    return Response({
                        "message":"Token is valid",
                        'username': user.username,
                        'email': user.email
                    }, status=status.HTTP_200_OK)
                except User.DoesNotExist:
                    return Response({"error":"User not found"}, status=status.HTTP_404_NOT_FOUND)
            
            return Response({"message": "Token is valid"}, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"error": "Invalid or expired token"}, status=status.HTTP_401_UNAUTHORIZED)

class UserLogoutView(APIView):
    permission_classes = [AllowAny]
    # authentication_classes = []  

    def post(self,request):
        # if request.user.is_authenticated:
            logout(request)
            response = Response({
            'message':'Logged out successfully'
            }, status=status.HTTP_200_OK)
            return response
        # else : 
        #     return Response({"error":"User is not authenticated"},status=status.HTTP_400_BAD_REQUEST)