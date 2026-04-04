# backend/blogify/user_module/utils.py
from django.core.mail import send_mail
from django.conf import settings
from .models import CustomUser
from django.utils.crypto import get_random_string
import json
import logging
import urllib.error
import urllib.request

logger = logging.getLogger(__name__)


def _send_with_smtp(subject, message, recipient_email):
    from_email = settings.DEFAULT_FROM_EMAIL or settings.EMAIL_HOST_USER
    send_mail(
        subject,
        message,
        from_email,
        [recipient_email],
        fail_silently=False,
    )
    return True


def _send_with_resend(subject, message, recipient_email):
    api_key = getattr(settings, 'RESEND_API_KEY', '')
    from_email = getattr(settings, 'RESEND_FROM_EMAIL', '') or getattr(settings, 'DEFAULT_FROM_EMAIL', '')

    if not api_key or not from_email:
        logger.error('Resend fallback is not configured. Set RESEND_API_KEY and RESEND_FROM_EMAIL.')
        return False

    payload = json.dumps({
        'from': from_email,
        'to': [recipient_email],
        'subject': subject,
        'text': message,
    }).encode('utf-8')

    request = urllib.request.Request(
        'https://api.resend.com/emails',
        data=payload,
        headers={
            'Authorization': f'Bearer {api_key}',
            'Content-Type': 'application/json',
        },
        method='POST',
    )

    try:
        with urllib.request.urlopen(request, timeout=getattr(settings, 'EMAIL_TIMEOUT', 10)) as response:
            if 200 <= response.status < 300:
                return True
            logger.error('Resend API returned status %s for %s', response.status, recipient_email)
    except urllib.error.HTTPError as exc:
        details = exc.read().decode('utf-8', errors='replace')
        logger.error('Resend API HTTP error %s for %s: %s', exc.code, recipient_email, details)
    except Exception as exc:
        logger.exception('Failed to send activation PIN via Resend to %s: %s', recipient_email, exc)

    return False


def _log_render_smtp_hint(exc):
    if isinstance(exc, OSError) and getattr(exc, 'errno', None) in (101, 113):
        logger.error(
            'SMTP network error for %s:%s. Render Free blocks outbound SMTP ports 25, 465, and 587. '
            'Use a paid Render instance or set EMAIL_DELIVERY_PROVIDER=resend with RESEND_API_KEY and RESEND_FROM_EMAIL.',
            settings.EMAIL_HOST,
            settings.EMAIL_PORT,
        )


def send_pin_number(user):
    pin = get_random_string(length=6, allowed_chars='ABIR0123456789')
    user.activation_pin = pin
    user.save()
    subject = 'Your PIN number to activate your account'
    message = f'Your activation PIN is {pin}. Do not share it with anyone.'

    provider = getattr(settings, 'EMAIL_DELIVERY_PROVIDER', 'smtp').lower()
    if provider not in {'smtp', 'resend'}:
        logger.warning('Unknown EMAIL_DELIVERY_PROVIDER=%s. Falling back to smtp.', provider)
        provider = 'smtp'

    delivery_order = [provider]
    if provider == 'smtp':
        delivery_order.append('resend')
    else:
        delivery_order.append('smtp')

    for delivery_provider in delivery_order:
        if delivery_provider == 'resend':
            if not getattr(settings, 'RESEND_API_KEY', ''):
                continue
            if _send_with_resend(subject, message, user.email):
                return True
            continue

        try:
            if _send_with_smtp(subject, message, user.email):
                return True
        except Exception as exc:
            _log_render_smtp_hint(exc)
            logger.exception('Failed to send activation PIN email to %s via SMTP: %s', user.email, exc)

    logger.error('All email delivery methods failed for %s', user.email)
    return False


def account_activate(email, pin):

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