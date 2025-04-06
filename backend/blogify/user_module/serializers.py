# backend/blogify/user_module/serializers.py
from rest_framework import serializers
# from .models import CustomUser
from django.contrib.auth import get_user_model
from .utils import account_activate

User = get_user_model()
class UserRegistrationSerializer(serializers.ModelSerializer):
    email = serializers.EmailField()

    class Meta:
        model = User
        fields = ['username','email','password']
        extra_kwargs = {
            'password' : {'write_only':True}
        }
    def validate_email(self, value):

        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("This email is already registered.")
        return value
    
    def create(self,validate_data):
            # password = validate_data.pop('password')
            # user = get_user_model()(**validate_data)
            # user.set_password(password)
            print("Validated Data:", validate_data)
            # print(f"Validated Data: {User}")
            password = validate_data.pop('password')
            try : 
                user = User.objects.create_user(
                    email = validate_data['email'],
                    username = validate_data['username'],
                    password = password
                )
                # user.save()
                print(f"User created: {user.email}")
                print(f"Is user active: {user.is_active}")
                print(f"Password hash length: {len(user.password)}")
                print(f"Password hash starts with: {user.password[:10]}")

                return user
            except Exception as e:
                print(f"Error creating user: {e}")
                raise

        
class ActivationSerializer(serializers.Serializer):
    email = serializers.EmailField()
    pin = serializers.CharField(max_length=6)

    def validate(self,data):
        user, message = account_activate(data['email'],data['pin'])
        if user is None:
            raise serializers.ValidationError(message)
        return user