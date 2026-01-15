"""
ColdIQ Feature Expansion Tests - Iteration 10
Tests for:
1. Server-side analysis (readability, spam, CTA, subject analysis)
2. Fix Suggestions with priority badges
3. Performance Tracking endpoint
4. Sequence Analysis endpoint
5. Contact form for Growth Agency
6. Tier-gating for Pro features
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
TEST_ACCOUNTS = {
    "free": {"email": "free@test.com", "password": "Test1234!"},
    "starter": {"email": "starter@test.com", "password": "Test1234!"},
    "pro": {"email": "pro@test.com", "password": "Test1234!"}
}


class TestAuthAndSetup:
    """Test authentication and get tokens for different tiers"""
    
    @pytest.fixture(scope="class")
    def api_client(self):
        session = requests.Session()
        session.headers.update({"Content-Type": "application/json"})
        return session
    
    def test_health_check(self, api_client):
        """Verify API is accessible"""
        response = api_client.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        print("✓ Health check passed")
    
    def test_login_free_user(self, api_client):
        """Login as free tier user"""
        response = api_client.post(f"{BASE_URL}/api/auth/login", json=TEST_ACCOUNTS["free"])
        assert response.status_code == 200
        data = response.json()
        assert "token" in data
        assert data["user"]["subscription_tier"] == "free"
        print(f"✓ Free user login successful, tier: {data['user']['subscription_tier']}")
    
    def test_login_starter_user(self, api_client):
        """Login as starter tier user"""
        response = api_client.post(f"{BASE_URL}/api/auth/login", json=TEST_ACCOUNTS["starter"])
        assert response.status_code == 200
        data = response.json()
        assert "token" in data
        assert data["user"]["subscription_tier"] == "starter"
        print(f"✓ Starter user login successful, tier: {data['user']['subscription_tier']}")
    
    def test_login_pro_user(self, api_client):
        """Login as pro tier user"""
        response = api_client.post(f"{BASE_URL}/api/auth/login", json=TEST_ACCOUNTS["pro"])
        assert response.status_code == 200
        data = response.json()
        assert "token" in data
        assert data["user"]["subscription_tier"] == "pro"
        print(f"✓ Pro user login successful, tier: {data['user']['subscription_tier']}")


class TestServerSideAnalysis:
    """Test server-side analysis metrics (Starter+ features)"""
    
    @pytest.fixture(scope="class")
    def starter_token(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json=TEST_ACCOUNTS["starter"])
        return response.json()["token"]
    
    @pytest.fixture(scope="class")
    def pro_token(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json=TEST_ACCOUNTS["pro"])
        return response.json()["token"]
    
    def test_analysis_returns_readability_score(self, starter_token):
        """Verify readability_score is returned for Starter+ users"""
        headers = {"Authorization": f"Bearer {starter_token}"}
        payload = {
            "subject": "Quick question about your marketing strategy",
            "body": "Hi John, I noticed your company recently expanded. We help similar companies improve their outreach. Would you be open to a quick call?"
        }
        response = requests.post(f"{BASE_URL}/api/analysis/analyze", json=payload, headers=headers)
        assert response.status_code == 200
        data = response.json()
        
        # Server-side metrics should always be present for Starter+
        assert "readability_score" in data
        assert data["readability_score"] is not None
        assert isinstance(data["readability_score"], int)
        assert 0 <= data["readability_score"] <= 100
        print(f"✓ Readability score returned: {data['readability_score']}")
        
        assert "readability_level" in data
        assert data["readability_level"] in ["Easy", "Medium", "Moderate", "Hard", "Unknown"]
        print(f"✓ Readability level: {data['readability_level']}")
    
    def test_analysis_returns_spam_keywords(self, starter_token):
        """Verify spam_keywords detection works"""
        headers = {"Authorization": f"Bearer {starter_token}"}
        # Email with spam trigger words
        payload = {
            "subject": "ACT NOW - Limited time offer!",
            "body": "Hi, this is a FREE opportunity to earn money fast! Guaranteed results with no risk. Click here to get started today!"
        }
        response = requests.post(f"{BASE_URL}/api/analysis/analyze", json=payload, headers=headers)
        assert response.status_code == 200
        data = response.json()
        
        assert "spam_keywords" in data
        assert data["spam_keywords"] is not None
        assert isinstance(data["spam_keywords"], list)
        # Should detect spam words like "free", "guaranteed", "no risk", etc.
        assert len(data["spam_keywords"]) > 0
        print(f"✓ Spam keywords detected: {data['spam_keywords']}")
        
        assert "spam_risk_score" in data
        assert data["spam_risk_score"] is not None
        assert data["spam_risk_score"] > 0  # Should have high spam risk
        print(f"✓ Spam risk score: {data['spam_risk_score']}")
    
    def test_analysis_returns_subject_line_analysis(self, starter_token):
        """Verify subject_line_analysis is returned"""
        headers = {"Authorization": f"Bearer {starter_token}"}
        payload = {
            "subject": "{{first_name}}, quick question about {{company}}",
            "body": "Hi, I wanted to reach out about your recent expansion."
        }
        response = requests.post(f"{BASE_URL}/api/analysis/analyze", json=payload, headers=headers)
        assert response.status_code == 200
        data = response.json()
        
        assert "subject_line_analysis" in data
        assert data["subject_line_analysis"] is not None
        sla = data["subject_line_analysis"]
        
        assert "length" in sla
        assert "has_personalization" in sla
        assert "effectiveness" in sla
        print(f"✓ Subject line analysis: length={sla['length']}, personalization={sla['has_personalization']}, effectiveness={sla['effectiveness']}")
    
    def test_analysis_returns_cta_analysis(self, starter_token):
        """Verify cta_analysis is returned"""
        headers = {"Authorization": f"Bearer {starter_token}"}
        payload = {
            "subject": "Quick question",
            "body": "Hi John, I help companies like yours improve outreach. Would you be open to a 15-minute call this week?"
        }
        response = requests.post(f"{BASE_URL}/api/analysis/analyze", json=payload, headers=headers)
        assert response.status_code == 200
        data = response.json()
        
        assert "cta_analysis" in data
        assert data["cta_analysis"] is not None
        cta = data["cta_analysis"]
        
        assert "cta_present" in cta
        assert "cta_clarity" in cta
        assert "cta_type" in cta
        assert "friction_level" in cta
        print(f"✓ CTA analysis: present={cta['cta_present']}, type={cta['cta_type']}, clarity={cta['cta_clarity']}")
    
    def test_analysis_returns_fix_suggestions(self, starter_token):
        """Verify fix_suggestions are returned with priority badges"""
        headers = {"Authorization": f"Bearer {starter_token}"}
        # Email with issues to trigger suggestions
        payload = {
            "subject": "Hi",  # Too short
            "body": "Buy now! This is a limited time offer. Act fast to get your free trial. Guaranteed results!"
        }
        response = requests.post(f"{BASE_URL}/api/analysis/analyze", json=payload, headers=headers)
        assert response.status_code == 200
        data = response.json()
        
        assert "fix_suggestions" in data
        assert data["fix_suggestions"] is not None
        assert isinstance(data["fix_suggestions"], list)
        assert len(data["fix_suggestions"]) > 0
        
        # Check structure of suggestions
        for suggestion in data["fix_suggestions"]:
            assert "type" in suggestion
            assert "priority" in suggestion
            assert suggestion["priority"] in ["high", "medium", "low"]
            assert "issue" in suggestion
            assert "fix" in suggestion
        
        print(f"✓ Fix suggestions returned: {len(data['fix_suggestions'])} suggestions")
        for s in data["fix_suggestions"][:3]:
            print(f"  - [{s['priority'].upper()}] {s['type']}: {s['issue']}")
    
    def test_analysis_returns_inbox_placement_score(self, starter_token):
        """Verify inbox_placement_score is returned"""
        headers = {"Authorization": f"Bearer {starter_token}"}
        payload = {
            "subject": "Quick question about your marketing",
            "body": "Hi, I noticed your company is growing. Would you be interested in learning how we help similar companies?"
        }
        response = requests.post(f"{BASE_URL}/api/analysis/analyze", json=payload, headers=headers)
        assert response.status_code == 200
        data = response.json()
        
        assert "inbox_placement_score" in data
        assert data["inbox_placement_score"] is not None
        assert isinstance(data["inbox_placement_score"], int)
        assert 0 <= data["inbox_placement_score"] <= 100
        print(f"✓ Inbox placement score: {data['inbox_placement_score']}")


class TestSequenceAnalysis:
    """Test sequence analysis endpoint (Pro+ feature)"""
    
    @pytest.fixture(scope="class")
    def free_token(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json=TEST_ACCOUNTS["free"])
        return response.json()["token"]
    
    @pytest.fixture(scope="class")
    def starter_token(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json=TEST_ACCOUNTS["starter"])
        return response.json()["token"]
    
    @pytest.fixture(scope="class")
    def pro_token(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json=TEST_ACCOUNTS["pro"])
        return response.json()["token"]
    
    def test_sequence_analysis_blocked_for_free(self, free_token):
        """Verify sequence analysis is blocked for free tier"""
        headers = {"Authorization": f"Bearer {free_token}"}
        payload = {
            "emails": [
                {"subject": "Initial outreach", "body": "Hi, I wanted to reach out...", "position": 1},
                {"subject": "Following up", "body": "Just checking in...", "position": 2}
            ]
        }
        response = requests.post(f"{BASE_URL}/api/analysis/sequence", json=payload, headers=headers)
        assert response.status_code == 403
        print("✓ Sequence analysis correctly blocked for free tier")
    
    def test_sequence_analysis_blocked_for_starter(self, starter_token):
        """Verify sequence analysis is blocked for starter tier"""
        headers = {"Authorization": f"Bearer {starter_token}"}
        payload = {
            "emails": [
                {"subject": "Initial outreach", "body": "Hi, I wanted to reach out...", "position": 1},
                {"subject": "Following up", "body": "Just checking in...", "position": 2}
            ]
        }
        response = requests.post(f"{BASE_URL}/api/analysis/sequence", json=payload, headers=headers)
        assert response.status_code == 403
        print("✓ Sequence analysis correctly blocked for starter tier")
    
    def test_sequence_analysis_works_for_pro(self, pro_token):
        """Verify sequence analysis works for pro tier"""
        headers = {"Authorization": f"Bearer {pro_token}"}
        payload = {
            "emails": [
                {"subject": "Quick question about your marketing", "body": "Hi John, I noticed your company recently expanded. We help similar companies improve their outreach. Would you be open to a quick call?", "position": 1},
                {"subject": "Following up on my last email", "body": "Hi John, just wanted to follow up on my previous email. I know you're busy, but I think we could really help. Let me know if you have 15 minutes this week.", "position": 2}
            ]
        }
        response = requests.post(f"{BASE_URL}/api/analysis/sequence", json=payload, headers=headers)
        assert response.status_code == 200
        data = response.json()
        
        assert "overall_score" in data
        assert isinstance(data["overall_score"], int)
        assert 0 <= data["overall_score"] <= 100
        
        assert "key_insight" in data
        assert "issues" in data
        assert "email_scores" in data
        assert "recommendations" in data
        
        print(f"✓ Sequence analysis successful for pro tier")
        print(f"  Overall score: {data['overall_score']}")
        print(f"  Key insight: {data['key_insight'][:100]}...")
    
    def test_sequence_requires_minimum_2_emails(self, pro_token):
        """Verify sequence requires at least 2 emails"""
        headers = {"Authorization": f"Bearer {pro_token}"}
        payload = {
            "emails": [
                {"subject": "Single email", "body": "Just one email...", "position": 1}
            ]
        }
        response = requests.post(f"{BASE_URL}/api/analysis/sequence", json=payload, headers=headers)
        assert response.status_code == 400
        print("✓ Sequence correctly requires minimum 2 emails")
    
    def test_sequence_max_5_emails(self, pro_token):
        """Verify sequence has maximum 5 emails"""
        headers = {"Authorization": f"Bearer {pro_token}"}
        payload = {
            "emails": [
                {"subject": f"Email {i}", "body": f"Body {i}", "position": i}
                for i in range(1, 7)  # 6 emails
            ]
        }
        response = requests.post(f"{BASE_URL}/api/analysis/sequence", json=payload, headers=headers)
        assert response.status_code == 400
        print("✓ Sequence correctly limits to maximum 5 emails")


class TestContactForm:
    """Test Growth Agency contact form"""
    
    @pytest.fixture(scope="class")
    def api_client(self):
        session = requests.Session()
        session.headers.update({"Content-Type": "application/json"})
        return session
    
    def test_contact_form_submission(self, api_client):
        """Verify contact form submits successfully"""
        payload = {
            "name": "Test User",
            "email": "test@agency.com",
            "company": "Test Agency",
            "team_size": "6-10",
            "message": "Interested in Growth Agency plan"
        }
        response = api_client.post(f"{BASE_URL}/api/contact/growth-agency", json=payload)
        assert response.status_code == 200
        data = response.json()
        
        assert "message" in data
        assert "id" in data
        print(f"✓ Contact form submitted successfully, ID: {data['id']}")
    
    def test_contact_form_requires_name(self, api_client):
        """Verify contact form requires name"""
        payload = {
            "email": "test@agency.com",
            "company": "Test Agency"
        }
        response = api_client.post(f"{BASE_URL}/api/contact/growth-agency", json=payload)
        assert response.status_code == 422  # Validation error
        print("✓ Contact form correctly requires name")
    
    def test_contact_form_requires_email(self, api_client):
        """Verify contact form requires email"""
        payload = {
            "name": "Test User",
            "company": "Test Agency"
        }
        response = api_client.post(f"{BASE_URL}/api/contact/growth-agency", json=payload)
        assert response.status_code == 422  # Validation error
        print("✓ Contact form correctly requires email")
    
    def test_contact_form_requires_company(self, api_client):
        """Verify contact form requires company"""
        payload = {
            "name": "Test User",
            "email": "test@agency.com"
        }
        response = api_client.post(f"{BASE_URL}/api/contact/growth-agency", json=payload)
        assert response.status_code == 422  # Validation error
        print("✓ Contact form correctly requires company")


class TestPerformanceTracking:
    """Test performance tracking (Pro+ feature)"""
    
    @pytest.fixture(scope="class")
    def free_token(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json=TEST_ACCOUNTS["free"])
        return response.json()["token"]
    
    @pytest.fixture(scope="class")
    def pro_token(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json=TEST_ACCOUNTS["pro"])
        return response.json()["token"]
    
    def test_analysis_history_accessible(self, pro_token):
        """Verify analysis history is accessible for performance tracking"""
        headers = {"Authorization": f"Bearer {pro_token}"}
        response = requests.get(f"{BASE_URL}/api/analysis/history?limit=100", headers=headers)
        assert response.status_code == 200
        data = response.json()
        
        assert "analyses" in data
        assert "total" in data
        print(f"✓ Analysis history accessible, total: {data['total']}")
    
    def test_insights_dashboard_for_pro(self, pro_token):
        """Verify insights dashboard works for pro tier"""
        headers = {"Authorization": f"Bearer {pro_token}"}
        response = requests.get(f"{BASE_URL}/api/insights/dashboard", headers=headers)
        assert response.status_code == 200
        data = response.json()
        
        assert "available" in data
        assert data["available"] == True
        print(f"✓ Insights dashboard available for pro tier")


class TestTierFeatures:
    """Test tier-specific feature access"""
    
    @pytest.fixture(scope="class")
    def free_token(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json=TEST_ACCOUNTS["free"])
        return response.json()["token"]
    
    @pytest.fixture(scope="class")
    def starter_token(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json=TEST_ACCOUNTS["starter"])
        return response.json()["token"]
    
    @pytest.fixture(scope="class")
    def pro_token(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json=TEST_ACCOUNTS["pro"])
        return response.json()["token"]
    
    def test_free_user_features(self, free_token):
        """Verify free user has correct features"""
        headers = {"Authorization": f"Bearer {free_token}"}
        response = requests.get(f"{BASE_URL}/api/auth/me", headers=headers)
        assert response.status_code == 200
        data = response.json()
        
        features = data.get("features", {})
        assert features.get("analyses_limit") == 3
        assert features.get("spam_detection") == False
        assert features.get("readability_score") == False
        assert features.get("sequence_analysis") == False
        assert features.get("performance_tracking") == False
        print("✓ Free user has correct feature restrictions")
    
    def test_starter_user_features(self, starter_token):
        """Verify starter user has correct features"""
        headers = {"Authorization": f"Bearer {starter_token}"}
        response = requests.get(f"{BASE_URL}/api/auth/me", headers=headers)
        assert response.status_code == 200
        data = response.json()
        
        features = data.get("features", {})
        assert features.get("analyses_limit") == 50
        assert features.get("spam_detection") == True
        assert features.get("readability_score") == True
        assert features.get("cta_analysis") == True
        assert features.get("subject_analysis") == True
        assert features.get("sequence_analysis") == False  # Pro only
        assert features.get("performance_tracking") == False  # Pro only
        print("✓ Starter user has correct features (spam, readability, CTA, subject)")
    
    def test_pro_user_features(self, pro_token):
        """Verify pro user has correct features"""
        headers = {"Authorization": f"Bearer {pro_token}"}
        response = requests.get(f"{BASE_URL}/api/auth/me", headers=headers)
        assert response.status_code == 200
        data = response.json()
        
        features = data.get("features", {})
        assert features.get("analyses_limit") == 999999  # Unlimited
        assert features.get("spam_detection") == True
        assert features.get("readability_score") == True
        assert features.get("sequence_analysis") == True
        assert features.get("performance_tracking") == True
        assert features.get("ai_rewrites") == True
        assert features.get("multiple_variants") == True
        print("✓ Pro user has all features including sequence analysis and performance tracking")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
