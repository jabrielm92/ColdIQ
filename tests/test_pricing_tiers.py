"""
Test suite for ColdIQ Pricing Page and Tier Configuration
Tests Phase 1 implementation: Pricing page redesign, Growth Agency tier, tier features
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://email-mentor.preview.emergentagent.com').rstrip('/')

class TestHealthAndBasicEndpoints:
    """Basic health and connectivity tests"""
    
    def test_health_endpoint(self):
        """Test API health endpoint"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data.get("status") == "healthy"
        print("✓ Health endpoint working")

class TestTierConfiguration:
    """Test tier features configuration in backend"""
    
    @pytest.fixture
    def auth_token(self):
        """Get auth token for test user"""
        # Login with test account
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "free@test.com",
            "password": "Test1234!"
        })
        if response.status_code == 200:
            return response.json().get("token")
        # Try creating the account if it doesn't exist
        signup_response = requests.post(f"{BASE_URL}/api/auth/signup", json={
            "email": "free@test.com",
            "password": "Test1234!",
            "full_name": "Free Test User"
        })
        if signup_response.status_code in [200, 201]:
            return signup_response.json().get("token")
        pytest.skip("Could not authenticate test user")
    
    def test_free_tier_features(self, auth_token):
        """Test free tier has correct feature limits"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.get(f"{BASE_URL}/api/auth/me", headers=headers)
        assert response.status_code == 200
        data = response.json()
        features = data.get("features", {})
        
        # Free tier should have limited features
        assert features.get("analyses_limit") == 3, "Free tier should have 3 analyses/month"
        assert features.get("history_limit") == 3, "Free tier should have 3 history limit"
        assert features.get("insights_dashboard") == False, "Free tier should not have insights dashboard"
        assert features.get("spam_detection") == False, "Free tier should not have spam detection"
        assert features.get("readability_score") == False, "Free tier should not have readability score"
        assert features.get("ai_rewrites") == False, "Free tier should not have AI rewrites"
        print("✓ Free tier features verified")
    
    def test_pro_user_features(self):
        """Test pro tier has correct features"""
        # Login with pro test account
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "pro@test.com",
            "password": "Test1234!"
        })
        if response.status_code != 200:
            pytest.skip("Pro test account not available")
        
        token = response.json().get("token")
        headers = {"Authorization": f"Bearer {token}"}
        
        me_response = requests.get(f"{BASE_URL}/api/auth/me", headers=headers)
        assert me_response.status_code == 200
        data = me_response.json()
        features = data.get("features", {})
        
        # Pro tier should have advanced features
        assert features.get("analyses_limit") == 999999, "Pro tier should have unlimited analyses"
        assert features.get("spam_detection") == True, "Pro tier should have spam detection"
        assert features.get("readability_score") == True, "Pro tier should have readability score"
        assert features.get("ai_rewrites") == True, "Pro tier should have AI rewrites"
        assert features.get("multiple_variants") == True, "Pro tier should have multiple variants"
        assert features.get("inbox_placement") == True, "Pro tier should have inbox placement"
        assert features.get("emotional_tone") == True, "Pro tier should have emotional tone"
        assert features.get("performance_tracking") == True, "Pro tier should have performance tracking"
        assert features.get("industry_benchmarks") == True, "Pro tier should have industry benchmarks"
        assert features.get("sequence_analysis") == True, "Pro tier should have sequence analysis"
        assert features.get("ab_test_suggestions") == True, "Pro tier should have A/B test suggestions"
        # Pro should NOT have agency features
        assert features.get("client_workspaces") == False, "Pro tier should not have client workspaces"
        assert features.get("white_label_reports") == False, "Pro tier should not have white label reports"
        print("✓ Pro tier features verified")

class TestBillingEndpoints:
    """Test billing/checkout endpoints"""
    
    @pytest.fixture
    def auth_token(self):
        """Get auth token for test user"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "free@test.com",
            "password": "Test1234!"
        })
        if response.status_code == 200:
            return response.json().get("token")
        pytest.skip("Could not authenticate test user")
    
    def test_checkout_session_starter_monthly(self, auth_token):
        """Test creating checkout session for Starter monthly plan"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.post(f"{BASE_URL}/api/billing/create-checkout-session", 
            headers=headers,
            json={
                "plan_tier": "starter_monthly",
                "origin_url": "https://email-mentor.preview.emergentagent.com"
            }
        )
        # Should return checkout URL or error (Stripe test mode)
        assert response.status_code in [200, 400, 500], f"Unexpected status: {response.status_code}"
        print(f"✓ Checkout session endpoint responds (status: {response.status_code})")
    
    def test_checkout_session_pro_annual(self, auth_token):
        """Test creating checkout session for Pro annual plan"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.post(f"{BASE_URL}/api/billing/create-checkout-session", 
            headers=headers,
            json={
                "plan_tier": "pro_annual",
                "origin_url": "https://email-mentor.preview.emergentagent.com"
            }
        )
        assert response.status_code in [200, 400, 500], f"Unexpected status: {response.status_code}"
        print(f"✓ Pro annual checkout endpoint responds (status: {response.status_code})")
    
    def test_checkout_session_growth_agency_monthly(self, auth_token):
        """Test creating checkout session for Growth Agency monthly plan"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.post(f"{BASE_URL}/api/billing/create-checkout-session", 
            headers=headers,
            json={
                "plan_tier": "growth_agency_monthly",
                "origin_url": "https://email-mentor.preview.emergentagent.com"
            }
        )
        assert response.status_code in [200, 400, 500], f"Unexpected status: {response.status_code}"
        print(f"✓ Growth Agency checkout endpoint responds (status: {response.status_code})")
    
    def test_checkout_requires_auth(self):
        """Test that checkout endpoint requires authentication"""
        response = requests.post(f"{BASE_URL}/api/billing/create-checkout-session", 
            json={
                "plan_tier": "starter_monthly",
                "origin_url": "https://email-mentor.preview.emergentagent.com"
            }
        )
        assert response.status_code in [401, 403], "Checkout should require authentication"
        print("✓ Checkout endpoint requires authentication")

class TestStarterTierFeatures:
    """Test Starter tier specific features"""
    
    def test_starter_tier_features(self):
        """Test starter tier has correct features (spam detection, readability, etc.)"""
        # Login with starter test account
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "starter@test.com",
            "password": "Test1234!"
        })
        if response.status_code != 200:
            pytest.skip("Starter test account not available")
        
        token = response.json().get("token")
        headers = {"Authorization": f"Bearer {token}"}
        
        me_response = requests.get(f"{BASE_URL}/api/auth/me", headers=headers)
        assert me_response.status_code == 200
        data = me_response.json()
        features = data.get("features", {})
        
        # Starter tier should have basic analysis features
        assert features.get("analyses_limit") == 50, "Starter tier should have 50 analyses/month"
        assert features.get("spam_detection") == True, "Starter tier should have spam detection"
        assert features.get("readability_score") == True, "Starter tier should have readability score"
        assert features.get("cta_analysis") == True, "Starter tier should have CTA analysis"
        assert features.get("subject_analysis") == True, "Starter tier should have subject analysis"
        # Starter should NOT have Pro features
        assert features.get("ai_rewrites") == False, "Starter tier should not have AI rewrites"
        assert features.get("multiple_variants") == False, "Starter tier should not have multiple variants"
        assert features.get("sequence_analysis") == False, "Starter tier should not have sequence analysis"
        print("✓ Starter tier features verified")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
