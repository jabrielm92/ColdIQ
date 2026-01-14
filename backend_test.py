import requests
import sys
import json
from datetime import datetime
import uuid

class ColdIQAPITester:
    def __init__(self, base_url="https://email-analyzer-1.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.token = None
        self.user_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []
        self.failed_tests = []

    def log_test(self, name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
        
        result = {
            "test": name,
            "success": success,
            "details": details,
            "timestamp": datetime.now().isoformat()
        }
        self.test_results.append(result)
        
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} - {name}")
        if details and not success:
            print(f"    Details: {details}")

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        
        if self.token:
            test_headers['Authorization'] = f'Bearer {self.token}'
        
        if headers:
            test_headers.update(headers)

        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers, timeout=30)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers, timeout=30)
            elif method == 'PATCH':
                response = requests.patch(url, json=data, headers=test_headers, timeout=30)
            elif method == 'DELETE':
                response = requests.delete(url, headers=test_headers, timeout=30)

            success = response.status_code == expected_status
            
            if success:
                self.log_test(name, True)
                try:
                    return response.json() if response.content else {}
                except:
                    return {}
            else:
                error_msg = f"Expected {expected_status}, got {response.status_code}"
                try:
                    error_detail = response.json().get('detail', '')
                    if error_detail:
                        error_msg += f" - {error_detail}"
                except:
                    pass
                self.log_test(name, False, error_msg)
                return {}

        except Exception as e:
            self.log_test(name, False, f"Request failed: {str(e)}")
            return {}

    def test_health_endpoints(self):
        """Test basic health endpoints"""
        print("\n🔍 Testing Health Endpoints...")
        
        self.run_test("API Root", "GET", "", 200)
        self.run_test("Health Check", "GET", "health", 200)

    def test_auth_signup(self):
        """Test user signup"""
        print("\n🔍 Testing Authentication - Signup...")
        
        # Generate unique test user
        timestamp = datetime.now().strftime('%H%M%S')
        test_email = f"test_user_{timestamp}@example.com"
        test_password = "TestPass123!"
        test_name = f"Test User {timestamp}"
        
        signup_data = {
            "email": test_email,
            "password": test_password,
            "full_name": test_name
        }
        
        response = self.run_test("User Signup", "POST", "auth/signup", 200, signup_data)
        
        if response and 'token' in response:
            self.token = response['token']
            self.user_id = response['user']['id']
            self.test_email = test_email
            self.test_password = test_password
            return True
        return False

    def test_auth_login(self):
        """Test user login"""
        print("\n🔍 Testing Authentication - Login...")
        
        if not hasattr(self, 'test_email'):
            self.log_test("Login Test", False, "No test user created for login")
            return False
        
        login_data = {
            "email": self.test_email,
            "password": self.test_password
        }
        
        response = self.run_test("User Login", "POST", "auth/login", 200, login_data)
        
        if response and 'token' in response:
            self.token = response['token']
            return True
        return False

    def test_auth_me(self):
        """Test get current user"""
        print("\n🔍 Testing Authentication - Get Me...")
        
        if not self.token:
            self.log_test("Get Current User", False, "No auth token available")
            return False
        
        response = self.run_test("Get Current User", "GET", "auth/me", 200)
        return bool(response)

    def test_onboarding(self):
        """Test onboarding completion"""
        print("\n🔍 Testing Onboarding...")
        
        if not self.token:
            self.log_test("Complete Onboarding", False, "No auth token available")
            return False
        
        onboarding_data = {
            "role": "salesperson",
            "target_industry": "SaaS / Software",
            "monthly_email_volume": "50-200"
        }
        
        response = self.run_test("Complete Onboarding", "POST", "auth/onboarding", 200, onboarding_data)
        return bool(response)

    def test_user_endpoints(self):
        """Test user-related endpoints"""
        print("\n🔍 Testing User Endpoints...")
        
        if not self.token:
            self.log_test("User Endpoints", False, "No auth token available")
            return False
        
        # Test usage endpoint
        self.run_test("Get User Usage", "GET", "user/usage", 200)
        
        # Test profile update
        profile_data = {
            "full_name": "Updated Test User"
        }
        self.run_test("Update Profile", "PATCH", "user/profile", 200, profile_data)

    def test_email_analysis(self):
        """Test email analysis functionality"""
        print("\n🔍 Testing Email Analysis...")
        
        if not self.token:
            self.log_test("Email Analysis", False, "No auth token available")
            return False
        
        # Test email analysis
        analysis_data = {
            "subject": "Quick question about your sales process",
            "body": "Hi {{first_name}},\n\nI noticed your company has been growing rapidly. I'd love to show you how our tool can help streamline your sales process.\n\nAre you free for a 15-minute call this week?\n\nBest,\nJohn",
            "target_industry": "SaaS",
            "target_role": "sales_manager"
        }
        
        print("    Analyzing email (this may take 10-15 seconds)...")
        response = self.run_test("Analyze Email", "POST", "analysis/analyze", 200, analysis_data)
        
        if response and 'id' in response:
            self.analysis_id = response['id']
            
            # Test get analysis history
            self.run_test("Get Analysis History", "GET", "analysis/history", 200)
            
            # Test get specific analysis
            self.run_test("Get Specific Analysis", "GET", f"analysis/{self.analysis_id}", 200)
            
            # Test feedback submission
            feedback_data = {"feedback": "helpful"}
            self.run_test("Submit Feedback", "PATCH", f"analysis/{self.analysis_id}/feedback", 200, feedback_data)
            
            return True
        return False

    def test_insights_endpoint(self):
        """Test insights dashboard"""
        print("\n🔍 Testing Insights...")
        
        if not self.token:
            self.log_test("Insights Dashboard", False, "No auth token available")
            return False
        
        response = self.run_test("Get Insights Dashboard", "GET", "insights/dashboard", 200)
        return bool(response)

    def test_billing_endpoints(self):
        """Test billing endpoints (without actual payment)"""
        print("\n🔍 Testing Billing Endpoints...")
        
        if not self.token:
            self.log_test("Billing Endpoints", False, "No auth token available")
            return False
        
        # Test create checkout session (this should work even with test keys)
        checkout_data = {
            "plan_tier": "starter",
            "origin_url": "https://email-analyzer-1.preview.emergentagent.com"
        }
        
        # Note: This might fail if Stripe is not properly configured, but we'll test it
        response = self.run_test("Create Checkout Session", "POST", "billing/create-checkout-session", 200, checkout_data)
        
        return bool(response)

    def test_tier_specific_features(self):
        """Test tier-specific feature restrictions"""
        print("\n🎯 Testing Tier-Specific Features...")
        
        if not self.token:
            self.log_test("Tier Features", False, "No auth token available")
            return False
        
        # Test GET /api/user/features
        features_response = self.run_test("Get User Features", "GET", "user/features", 200)
        if features_response:
            # Verify it has expected structure for free tier
            expected_keys = ["analyses_limit", "history_limit", "insights_dashboard", "export_csv", "templates", "api_access"]
            has_all_keys = all(key in features_response for key in expected_keys)
            self.log_test("Features Response Structure", has_all_keys, 
                         "Missing keys" if not has_all_keys else "All expected keys present")
        
        # Test auth/me includes features
        me_response = self.run_test("Auth Me Includes Features", "GET", "auth/me", 200)
        if me_response:
            has_features = "features" in me_response
            self.log_test("Auth Me Has Features Object", has_features,
                         "Features object missing" if not has_features else "Features object present")
        
        # Test insights dashboard (free tier should get available: false)
        insights_response = self.run_test("Insights Dashboard Access", "GET", "insights/dashboard", 200)
        if insights_response:
            # For free tier, should return available: false
            is_blocked = insights_response.get("available") == False
            self.log_test("Free Tier Insights Blocked", is_blocked,
                         "Free tier should be blocked from insights" if not is_blocked else "Correctly blocked")
        
        # Test CSV export (should be 403 for free tier)
        self.run_test("CSV Export Blocked for Free", "GET", "analysis/export/csv", 403)
        
        # Test templates (should return available: false for free tier)
        templates_response = self.run_test("Templates Access", "GET", "templates", 200)
        if templates_response:
            is_blocked = templates_response.get("available") == False
            self.log_test("Free Tier Templates Blocked", is_blocked,
                         "Free tier should be blocked from templates" if not is_blocked else "Correctly blocked")
        
        # Test API keys (should be 403 for free tier)
        self.run_test("API Keys Blocked for Free", "GET", "api-keys", 403)
        self.run_test("API Key Creation Blocked for Free", "POST", "api-keys", 403)
        
        # Test team management (should be 403 for free tier)
        self.run_test("Team Management Blocked for Free", "GET", "team", 403)
        
        return True

    def run_all_tests(self):
        """Run all API tests"""
        print("🚀 Starting ColdIQ API Tests...")
        print(f"Testing against: {self.base_url}")
        
        # Test in order of dependency
        self.test_health_endpoints()
        
        if self.test_auth_signup():
            self.test_auth_login()
            self.test_auth_me()
            self.test_onboarding()
            self.test_user_endpoints()
            self.test_email_analysis()
            self.test_insights_endpoint()
            self.test_billing_endpoints()
        else:
            print("❌ Signup failed - skipping authenticated tests")
        
        # Print summary
        print(f"\n📊 Test Summary:")
        print(f"Tests Run: {self.tests_run}")
        print(f"Tests Passed: {self.tests_passed}")
        print(f"Success Rate: {(self.tests_passed/self.tests_run*100):.1f}%")
        
        # Return success if more than 80% pass
        return (self.tests_passed / self.tests_run) >= 0.8

def main():
    tester = ColdIQAPITester()
    success = tester.run_all_tests()
    
    # Save detailed results
    with open('/app/backend_test_results.json', 'w') as f:
        json.dump({
            "summary": {
                "tests_run": tester.tests_run,
                "tests_passed": tester.tests_passed,
                "success_rate": (tester.tests_passed/tester.tests_run*100) if tester.tests_run > 0 else 0,
                "timestamp": datetime.now().isoformat()
            },
            "results": tester.test_results
        }, f, indent=2)
    
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())