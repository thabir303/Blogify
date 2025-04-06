# backend/blogify/user_module/utils.py
from django.core.mail import send_mail
from .models import CustomUser
from django.utils.crypto import get_random_string

def send_pin_number(user):
    pin = get_random_string(length=6,allowed_chars='ABIR0123456789')
    user.activation_pin = pin
    user.save()
    subject = 'Your PIN number to activate your account'
    message = f'Your activation PIN is {pin}. Do not share it with anyone.'
    from_email = 'tanvirhasanabir8@gmail.com'
    send_mail(
        subject,
        message,
        from_email,
        [user.email],
    )

def account_activate(email,pin):

    try:
        user = CustomUser.objects.get(email=email)
    except CustomUser.DoesNotExist:
        return None, "User with this email does not exist."
    
    if user.activation_pin != pin :
        return None, "Invalid pin."
    
    user.is_active = True
    user.activation_pin = ''
    user.save()

    return user, "Account activated successfully. You can login now."