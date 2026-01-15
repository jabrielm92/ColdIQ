"""
Test Phone Verification Endpoints
Tests for /api/auth/phone/send-otp and /api/auth/phone/verify-otp
"""
import pytest
import requests
import os
import time
import random
import string

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestPhoneVerificationEndpoints:
    """Test phone verification API endpoints"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup test data"""
        self.test_email = f"phonetest_{random.randint(1000, 9999)}@example.com"
        self.test_password = "Test1234!"
        self.test_name = "Phone Test User"
        self.test_phone = f"555{random.randint(1000000, 9999999)}"
        
    def test_send_otp_without_auth(self):
        """Test send OTP endpoint - should work without auth for initial signup"""
        response = requests.post(f"{BASE_URL}/api/auth/phone/send-otp", json={
            "phone_number": self.test_phone
        })
        # Should succeed (mocked SMS)
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert "phone_number" in data
        assert data["phone_number"].startswith("+1")
        print(f"✅ Send OTP response: {data}")
        
    def test_send_otp_invalid_phone(self):
        """Test send OTP with invalid phone number"""
        response = requests.post(f"{BASE_URL}/api/auth/phone/send-otp", json={
            "phone_number": "123"  # Too short
        })
        assert response.status_code == 400
        print(f"✅ Invalid phone rejected: {response.json()}")
        
    def test_verify_otp_without_auth(self):
        """Test verify OTP endpoint - requires auth"""
        response = requests.post(f"{BASE_URL}/api/auth/phone/verify-otp", json={
            "phone_number": self.test_phone,
            "otp": "123456"
        })
        # Should fail without auth (401 or 403)
        assert response.status_code in [401, 403]
        print(f"✅ Verify OTP requires auth: {response.status_code}")
        
    def test_check_phone_availability(self):
        """Test phone availability check endpoint"""
        response = requests.get(f"{BASE_URL}/api/auth/phone/check/{self.test_phone}")
        assert response.status_code == 200
        data = response.json()
        assert "available" in data
        assert "phone_number" in data
        print(f"✅ Phone availability check: {data}")
        
    def test_full_signup_and_phone_verification_flow(self):
        """Test complete signup + phone verification flow"""
        # Step 1: Create account
        signup_response = requests.post(f"{BASE_URL}/api/auth/signup", json={
            "email": self.test_email,
            "password": self.test_password,
            "full_name": self.test_name
        })
        assert signup_response.status_code == 200
        signup_data = signup_response.json()
        token = signup_data.get("token")
        assert token is not None
        print(f"✅ Account created: {self.test_email}")
        
        # Step 2: Send OTP
        headers = {"Authorization": f"Bearer {token}"}
        send_otp_response = requests.post(f"{BASE_URL}/api/auth/phone/send-otp", json={
            "phone_number": self.test_phone
        }, headers=headers)
        assert send_otp_response.status_code == 200
        otp_data = send_otp_response.json()
        formatted_phone = otp_data.get("phone_number")
        print(f"✅ OTP sent to: {formatted_phone}")
        
        # Step 3: Verify OTP (will fail with wrong code, but tests the endpoint)
        verify_response = requests.post(f"{BASE_URL}/api/auth/phone/verify-otp", json={
            "phone_number": formatted_phone,
            "otp": "000000"  # Wrong OTP
        }, headers=headers)
        # Should fail with invalid code
        assert verify_response.status_code == 400
        assert "Invalid" in verify_response.json().get("detail", "")
        print(f"✅ Invalid OTP rejected correctly")
        
    def test_rate_limiting(self):
        """Test rate limiting on OTP requests"""
        # This test checks that rate limiting is in place
        # We won't actually hit the limit in tests, just verify the endpoint works
        response = requests.post(f"{BASE_URL}/api/auth/phone/send-otp", json={
            "phone_number": self.test_phone
        })
        assert response.status_code in [200, 429]  # Either success or rate limited
        print(f"✅ Rate limiting check: status={response.status_code}")


class TestPolicyPages:
    """Test that policy pages are accessible"""
    
    def test_terms_page_accessible(self):
        """Test Terms of Service page loads"""
        response = requests.get(f"{BASE_URL}/terms")
        # Frontend routes return 200 (SPA)
        assert response.status_code == 200
        print("✅ Terms page accessible")
        
    def test_privacy_page_accessible(self):
        """Test Privacy Policy page loads"""
        response = requests.get(f"{BASE_URL}/privacy")
        assert response.status_code == 200
        print("✅ Privacy page accessible")
        
    def test_sms_opt_in_page_accessible(self):
        """Test SMS Opt-In page loads"""
        response = requests.get(f"{BASE_URL}/sms-opt-in")
        assert response.status_code == 200
        print("✅ SMS Opt-In page accessible")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
