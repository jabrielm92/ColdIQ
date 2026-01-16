"""
ColdIQ Tier Features Test Suite
Tests all tier-specific features: Free, Starter, Pro, Agency
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://coldiq-dashboard.preview.emergentagent.com')

# Test credentials for each tier
TEST_ACCOUNTS = {
    "free": {"email": "free@test.com", "password": "Test1234!"},
    "starter": {"email": "starter@test.com", "password": "Test1234!"},
    "pro": {"email": "pro@test.com", "password": "Test1234!"},
    "agency": {"email": "agency@test.com", "password": "Test1234!"}
}

class TestHealthAndAuth:
    """Basic health and authentication tests"""
    
    def test_api_health(self):
        """Test API health endpoint"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        print("✓ API health check passed")
    
    def test_login_free_tier(self):
        """Test Free tier login"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json=TEST_ACCOUNTS["free"])
        assert response.status_code == 200
        data = response.json()
        assert "token" in data
        assert data["user"]["subscription_tier"] == "free"
        print(f"✓ Free tier login successful - tier: {data['user']['subscription_tier']}")
    
    def test_login_starter_tier(self):
        """Test Starter tier login"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json=TEST_ACCOUNTS["starter"])
        assert response.status_code == 200
        data = response.json()
        assert "token" in data
        assert data["user"]["subscription_tier"] == "starter"
        print(f"✓ Starter tier login successful - tier: {data['user']['subscription_tier']}")
    
    def test_login_pro_tier(self):
        """Test Pro tier login"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json=TEST_ACCOUNTS["pro"])
        assert response.status_code == 200
        data = response.json()
        assert "token" in data
        assert data["user"]["subscription_tier"] == "pro"
        print(f"✓ Pro tier login successful - tier: {data['user']['subscription_tier']}")
    
    def test_login_agency_tier(self):
        """Test Agency tier login"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json=TEST_ACCOUNTS["agency"])
        assert response.status_code == 200
        data = response.json()
        assert "token" in data
        assert data["user"]["subscription_tier"] == "agency"
        print(f"✓ Agency tier login successful - tier: {data['user']['subscription_tier']}")


class TestFreeTierFeatures:
    """Test Free tier limitations"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json=TEST_ACCOUNTS["free"])
        self.token = response.json()["token"]
        self.headers = {"Authorization": f"Bearer {self.token}"}
    
    def test_free_tier_usage_limit(self):
        """Free tier should have 3 analyses limit"""
        response = requests.get(f"{BASE_URL}/api/user/usage", headers=self.headers)
        assert response.status_code == 200
        data = response.json()
        assert data["limit"] == 3
        assert data["tier"] == "free"
        print(f"✓ Free tier limit: {data['limit']} analyses")
    
    def test_free_tier_insights_locked(self):
        """Free tier should not have insights dashboard access"""
        response = requests.get(f"{BASE_URL}/api/insights/dashboard", headers=self.headers)
        assert response.status_code == 200
        data = response.json()
        assert data["available"] == False
        assert data["required_tier"] == "starter"
        print("✓ Free tier insights correctly locked")
    
    def test_free_tier_templates_locked(self):
        """Free tier should not have templates access"""
        response = requests.get(f"{BASE_URL}/api/templates", headers=self.headers)
        assert response.status_code == 200
        data = response.json()
        assert data["available"] == False
        assert data["required_tier"] == "pro"
        print("✓ Free tier templates correctly locked")
    
    def test_free_tier_csv_export_forbidden(self):
        """Free tier should not be able to export CSV"""
        response = requests.get(f"{BASE_URL}/api/analysis/export/csv", headers=self.headers)
        assert response.status_code == 403
        print("✓ Free tier CSV export correctly forbidden")


class TestStarterTierFeatures:
    """Test Starter tier features"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json=TEST_ACCOUNTS["starter"])
        self.token = response.json()["token"]
        self.headers = {"Authorization": f"Bearer {self.token}"}
    
    def test_starter_tier_usage_limit(self):
        """Starter tier should have 50 analyses limit"""
        response = requests.get(f"{BASE_URL}/api/user/usage", headers=self.headers)
        assert response.status_code == 200
        data = response.json()
        assert data["limit"] == 50
        assert data["tier"] == "starter"
        print(f"✓ Starter tier limit: {data['limit']} analyses")
    
    def test_starter_tier_insights_available(self):
        """Starter tier should have basic insights dashboard access"""
        response = requests.get(f"{BASE_URL}/api/insights/dashboard", headers=self.headers)
        assert response.status_code == 200
        data = response.json()
        assert data["available"] == True
        print("✓ Starter tier insights available")
    
    def test_starter_tier_templates_locked(self):
        """Starter tier should not have templates access"""
        response = requests.get(f"{BASE_URL}/api/templates", headers=self.headers)
        assert response.status_code == 200
        data = response.json()
        assert data["available"] == False
        print("✓ Starter tier templates correctly locked")


class TestProTierFeatures:
    """Test Pro tier features"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json=TEST_ACCOUNTS["pro"])
        self.token = response.json()["token"]
        self.headers = {"Authorization": f"Bearer {self.token}"}
    
    def test_pro_tier_unlimited_analyses(self):
        """Pro tier should have unlimited analyses"""
        response = requests.get(f"{BASE_URL}/api/user/usage", headers=self.headers)
        assert response.status_code == 200
        data = response.json()
        assert data["limit"] == 999999  # Unlimited
        assert data["tier"] == "pro"
        print(f"✓ Pro tier has unlimited analyses (limit: {data['limit']})")
    
    def test_pro_tier_insights_with_advanced(self):
        """Pro tier should have advanced insights"""
        response = requests.get(f"{BASE_URL}/api/insights/dashboard", headers=self.headers)
        assert response.status_code == 200
        data = response.json()
        assert data["available"] == True
        print("✓ Pro tier insights available")
    
    def test_pro_tier_templates_available(self):
        """Pro tier should have templates access"""
        response = requests.get(f"{BASE_URL}/api/templates", headers=self.headers)
        assert response.status_code == 200
        data = response.json()
        assert data["available"] == True
        assert "templates" in data
        template_count = len(data["templates"])
        print(f"✓ Pro tier templates available - {template_count} templates found")
        # Should have at least 17 system templates
        assert template_count >= 17, f"Expected at least 17 templates, got {template_count}"
    
    def test_pro_tier_csv_export_allowed(self):
        """Pro tier should be able to export CSV"""
        response = requests.get(f"{BASE_URL}/api/analysis/export/csv", headers=self.headers)
        # 200 if has data, 404 if no data to export
        assert response.status_code in [200, 404]
        print("✓ Pro tier CSV export endpoint accessible")
    
    def test_pro_tier_team_forbidden(self):
        """Pro tier should not have team access"""
        response = requests.get(f"{BASE_URL}/api/team", headers=self.headers)
        assert response.status_code == 403
        print("✓ Pro tier team access correctly forbidden")


class TestAgencyTierFeatures:
    """Test Agency tier features"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json=TEST_ACCOUNTS["agency"])
        self.token = response.json()["token"]
        self.headers = {"Authorization": f"Bearer {self.token}"}
    
    def test_agency_tier_unlimited_analyses(self):
        """Agency tier should have unlimited analyses"""
        response = requests.get(f"{BASE_URL}/api/user/usage", headers=self.headers)
        assert response.status_code == 200
        data = response.json()
        assert data["limit"] == 999999
        assert data["tier"] == "agency"
        print(f"✓ Agency tier has unlimited analyses")
    
    def test_agency_tier_templates_available(self):
        """Agency tier should have templates access"""
        response = requests.get(f"{BASE_URL}/api/templates", headers=self.headers)
        assert response.status_code == 200
        data = response.json()
        assert data["available"] == True
        print("✓ Agency tier templates available")
    
    def test_agency_tier_team_access(self):
        """Agency tier should have team access"""
        response = requests.get(f"{BASE_URL}/api/team", headers=self.headers)
        assert response.status_code == 200
        data = response.json()
        assert "team" in data
        assert "members" in data
        print(f"✓ Agency tier team access - {data['seats_used']}/{data['seats_total']} seats used")
    
    def test_agency_tier_team_analytics(self):
        """Agency tier should have team analytics access"""
        response = requests.get(f"{BASE_URL}/api/team/analytics", headers=self.headers)
        assert response.status_code == 200
        data = response.json()
        assert data["available"] == True
        print("✓ Agency tier team analytics available")
    
    def test_agency_tier_api_keys_access(self):
        """Agency tier should have API keys access"""
        response = requests.get(f"{BASE_URL}/api/api-keys", headers=self.headers)
        assert response.status_code == 200
        data = response.json()
        assert "api_keys" in data
        print(f"✓ Agency tier API keys access - {len(data['api_keys'])} keys")


class TestBillingPrices:
    """Test billing prices endpoint"""
    
    def test_get_prices(self):
        """Test getting subscription prices"""
        response = requests.get(f"{BASE_URL}/api/billing/prices")
        assert response.status_code == 200
        data = response.json()
        assert "plans" in data
        assert len(data["plans"]) == 3  # Starter, Pro, Agency
        
        # Verify price structure
        for plan in data["plans"]:
            assert "tier" in plan
            assert "monthly_price" in plan
            assert "annual_price" in plan
            print(f"✓ {plan['name']}: ${plan['monthly_price']}/mo or ${plan['annual_price']}/yr")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
