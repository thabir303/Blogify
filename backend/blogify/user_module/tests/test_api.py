# backend/blogify/user_module/tests/test_api.py
import json
from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from django.contrib.auth import get_user_model
from unittest.mock import patch
from rest_framework import status

User = get_user_model()

class UserAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.register_url = reverse('register')
        self.activate_url = reverse('activate')
        self.login_url = reverse('login')
        self.password_reset_request_url = reverse('password_reset')
        self.password_reset_confirm_url = reverse('password_reset_confirmation')
        self.token_verify_url = reverse('token_verify')
        self.logout_url = reverse('logout')
        
        self.user_data = {
            'username': 'testuser',
            'email': 'test@example.com',
            'password': 'TestPassword123',
            'password2': 'TestPassword123' 
        }
        
        self.test_user = User.objects.create_user(
            username='existinguser', 
            email='existing@example.com',
            password='ExistingPass123'
        )
        self.test_user.is_active = True
        self.test_user.save()

    @patch('user_module.views.send_pin_number')
    def test_user_registration(self, mock_send_pin):
        
        response = self.client.post(self.register_url, self.user_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])
        self.assertEqual(response.data['email'], self.user_data['email'])
        self.assertEqual(response.data['username'], self.user_data['username'])
        self.assertTrue(mock_send_pin.called)
        
        self.assertTrue(User.objects.filter(email=self.user_data['email']).exists())

    def test_user_registration_duplicate_email(self):
        duplicate_data = {
            'username': 'newuser',
            'email': 'existing@example.com',  # Already exists
            'password': 'TestPassword123',
            'password2': 'TestPassword123'
        }
        
        response = self.client.post(self.register_url, duplicate_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(response.data['success'])

    def test_account_activation(self):
        
        inactive_user = User.objects.create_user(
            username='inactiveuser',
            email='inactive@example.com',
            password='InactivePass123'
        )
        inactive_user.is_active = False
        inactive_user.activation_pin = '123456'
        inactive_user.save()
        
        activation_data = {
            'email': 'inactive@example.com',
            'pin': '123456'
        }
        
        response = self.client.post(self.activate_url, activation_data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])
        
        inactive_user.refresh_from_db()
        self.assertTrue(inactive_user.is_active)
        self.assertEqual(inactive_user.activation_pin, '')

    def test_account_activation_invalid_pin(self):
       
        inactive_user = User.objects.create_user(
            username='inactiveuser2',
            email='inactive2@example.com',
            password='InactivePass123'
        )
        inactive_user.is_active = False
        inactive_user.activation_pin = '123456'
        inactive_user.save()
        
        activation_data = {
            'email': 'inactive2@example.com',
            'pin': 'WRONG'
        }
        
        response = self.client.post(self.activate_url, activation_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(response.data['success'])
        
        inactive_user.refresh_from_db()
        self.assertFalse(inactive_user.is_active)

    def test_user_login_success(self):
        login_data = {
            'email': 'existing@example.com',
            'password': 'ExistingPass123'
        }
        
        response = self.client.post(self.login_url, login_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])
        self.assertEqual(response.data['message'], 'Login successful')
        self.assertEqual(response.data['email'], 'existing@example.com')
        self.assertEqual(response.data['username'], 'existinguser')
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)

    def test_user_login_invalid_credentials(self):
        login_data = {
            'email': 'existing@example.com',
            'password': 'WrongPassword'
        }
        
        response = self.client.post(self.login_url, login_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(response.data['success'])

    def test_user_login_nonexistent_user(self):
        login_data = {
            'email': 'nonexistent@example.com',
            'password': 'SomePassword'
        }
        
        response = self.client.post(self.login_url, login_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(response.data['success'])

    @patch('user_module.views.send_pin_number')
    def test_password_reset_request(self, mock_send_pin):
        reset_data = {
            'email': 'existing@example.com'
        }
        
        response = self.client.post(self.password_reset_request_url, reset_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['message'], 'Password reset PIN sent to your email address.')
        self.assertTrue(mock_send_pin.called)

    def test_password_reset_request_nonexistent_email(self):
        reset_data = {
            'email': 'nonexistent@example.com'
        }
        
        response = self.client.post(self.password_reset_request_url, reset_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['error'], 'Email does not exist.')

    def test_password_reset_confirm(self):
       
        self.test_user.activation_pin = '123456'
        self.test_user.save()
        
        reset_confirm_data = {
            'email': 'existing@example.com',
            'pin': '123456',
            'new_password': 'NewPassword123'
        }
        
        response = self.client.post(self.password_reset_confirm_url, reset_confirm_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['message'], 'Password successfully reset.')
        
        self.test_user.refresh_from_db()
        self.assertEqual(self.test_user.activation_pin, '')
        
        login_data = {
            'email': 'existing@example.com',
            'password': 'NewPassword123'
        }
        login_response = self.client.post(self.login_url, login_data, format='json')
        self.assertEqual(login_response.status_code, status.HTTP_200_OK)

    def test_password_reset_confirm_invalid_pin(self):
        
        self.test_user.activation_pin = '123456'
        self.test_user.save()
        
        reset_confirm_data = {
            'email': 'existing@example.com',
            'pin': 'WRONG',
            'new_password': 'NewPassword123'
        }
        
        response = self.client.post(self.password_reset_confirm_url, reset_confirm_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['error'], 'Invalid pin number.')

    def test_token_verify_valid_token(self):
      
        login_data = {
            'email': 'existing@example.com',
            'password': 'ExistingPass123'
        }
        login_response = self.client.post(self.login_url, login_data, format='json')
        token = login_response.data['access']
        
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        response = self.client.get(self.token_verify_url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['message'], 'Token is valid')
        self.assertEqual(response.data['username'], 'existinguser')
        self.assertEqual(response.data['email'], 'existing@example.com')

    def test_token_verify_no_token(self):
        response = self.client.get(self.token_verify_url)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['error'], 'Authorization token missing')

    def test_token_verify_invalid_token(self):
        self.client.credentials(HTTP_AUTHORIZATION='Bearer invalidtoken')
        response = self.client.get(self.token_verify_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(response.data['error'], 'Invalid or expired token')

    def test_user_logout(self):
       
        login_data = {
            'email': 'existing@example.com',
            'password': 'ExistingPass123'
        }
        self.client.post(self.login_url, login_data, format='json')
        
        response = self.client.post(self.logout_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['message'], 'Logged out successfully')


class TokenEndpointsTests(TestCase):
    
    def setUp(self):
        self.client = APIClient()
        self.token_url = reverse('token')
        self.token_refresh_url = reverse('token_refresh')
        
        self.user = User.objects.create_user(
            username='jwtuser', 
            email='jwt@example.com',
            password='JWTPassword123'
        )
        self.user.is_active = True
        self.user.save()
        
    def test_login_and_use_token_for_protected_endpoint(self):
        
        login_data = {
            'email': 'jwt@example.com',
            'password': 'JWTPassword123'
        }
        
        login_url = reverse('login')
        response = self.client.post(login_url, login_data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)
        
        token = response.data['access']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        
        token_verify_url = reverse('token_verify')
        verify_response = self.client.get(token_verify_url)
        
        self.assertEqual(verify_response.status_code, status.HTTP_200_OK)
        self.assertEqual(verify_response.data['message'], 'Token is valid')
        self.assertEqual(verify_response.data['username'], 'jwtuser')
        self.assertEqual(verify_response.data['email'], 'jwt@example.com')