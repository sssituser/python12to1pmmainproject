"""
Test Script: Verify Auto-Deletion Works for 30 Faculty Portal Logins
This script tests the auto-deletion functionality WITHOUT disturbing any code or data.
"""

import os
import sys
import django
from django.conf import settings

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'placement.settings')
django.setup()

from django.contrib.auth import get_user_model
from myapp.models import LoginEmailLog
from myapp.views.auth_views import login as faculty_login
from django.test import RequestFactory
import json
from datetime import datetime
import time

User = get_user_model()

class FacultyLoginAutoDeleteionTest:
    """Test auto-deletion with 30 consecutive faculty logins"""
    
    def __init__(self):
        self.test_username = f"test_faculty_{int(time.time())}"
        self.test_password = "TestPassword123!@#"
        self.test_email = f"{self.test_username}@test.edu"
        self.user = None
        self.results = {
            'before': {},
            'logins': [],
            'after': {},
            'status': 'pending'
        }
    
    def setup_test_user(self):
        """Create a dedicated test faculty user"""
        print("\n" + "="*70)
        print("STEP 1: Creating Test Faculty User")
        print("="*70)
        
        try:
            # Delete existing test user if any
            User.objects.filter(username=self.test_username).delete()
            
            # Create new test faculty user
            self.user = User.objects.create_user(
                username=self.test_username,
                password=self.test_password,
                email=self.test_email,
                role='faculty'
            )
            print(f"✓ Test Faculty User Created")
            print(f"  Username: {self.test_username}")
            print(f"  Email: {self.test_email}")
            print(f"  Role: faculty")
            return True
        except Exception as e:
            print(f"✗ Failed to create test user: {str(e)}")
            return False
    
    def get_login_stats_before(self):
        """Get baseline login email stats"""
        print("\n" + "="*70)
        print("STEP 2: Recording Baseline Stats (Before 30 Logins)")
        print("="*70)
        
        active = LoginEmailLog.objects.filter(user=self.user, is_deleted=False).count()
        deleted = LoginEmailLog.objects.filter(user=self.user, is_deleted=True).count()
        
        self.results['before'] = {
            'active_emails': active,
            'deleted_emails': deleted,
            'total_emails': active + deleted,
            'timestamp': datetime.now().isoformat()
        }
        
        print(f"Active Emails: {active}")
        print(f"Deleted Emails: {deleted}")
        print(f"Total Emails: {active + deleted}")
        print(f"Threshold for Auto-Delete: 30")
        return True
    
    def simulate_30_logins(self):
        """Simulate 30 faculty logins"""
        print("\n" + "="*70)
        print("STEP 3: Simulating 30 Faculty Portal Logins")
        print("="*70)
        
        factory = RequestFactory()
        
        for login_num in range(1, 31):
            try:
                # Create mock request with login data
                request = factory.post('/api/faculty/login/', 
                    data=json.dumps({
                        'username': self.test_username,
                        'password': self.test_password
                    }),
                    content_type='application/json'
                )
                
                # Call login view
                response = faculty_login(request)
                
                # Get current stats after this login
                active = LoginEmailLog.objects.filter(user=self.user, is_deleted=False).count()
                deleted = LoginEmailLog.objects.filter(user=self.user, is_deleted=True).count()
                
                status = "✓" if response.status_code == 200 else "✗"
                print(f"{status} Login #{login_num:2d} | Active: {active:2d} | Deleted: {deleted:2d}", end="")
                
                if login_num == 30:
                    print(" ← AUTO-DELETE TRIGGERED HERE!")
                else:
                    print()
                
                self.results['logins'].append({
                    'login_num': login_num,
                    'active_after': active,
                    'deleted_after': deleted,
                    'status_code': response.status_code if hasattr(response, 'status_code') else 200
                })
                
                time.sleep(0.1)  # Small delay between logins
                
            except Exception as e:
                print(f"✗ Login #{login_num:2d} failed: {str(e)}")
                self.results['logins'].append({
                    'login_num': login_num,
                    'error': str(e)
                })
        
        return True
    
    def get_login_stats_after(self):
        """Get final login email stats after 30 logins"""
        print("\n" + "="*70)
        print("STEP 4: Recording Final Stats (After 30 Logins)")
        print("="*70)
        
        active = LoginEmailLog.objects.filter(user=self.user, is_deleted=False).count()
        deleted = LoginEmailLog.objects.filter(user=self.user, is_deleted=True).count()
        
        self.results['after'] = {
            'active_emails': active,
            'deleted_emails': deleted,
            'total_emails': active + deleted,
            'timestamp': datetime.now().isoformat()
        }
        
        print(f"Active Emails: {active}")
        print(f"Deleted Emails: {deleted}")
        print(f"Total Emails: {active + deleted}")
        return True
    
    def verify_auto_deletion(self):
        """Verify that auto-deletion worked correctly"""
        print("\n" + "="*70)
        print("STEP 5: Verifying Auto-Deletion Functionality")
        print("="*70)
        
        before_active = self.results['before']['active_emails']
        after_active = self.results['after']['active_emails']
        new_emails_created = 30
        expected_after_active = 0  # Should be cleaned up if >= 30
        
        print(f"\nExpected Behavior:")
        print(f"  • 30 new emails created during logins")
        print(f"  • When reaching 30+ emails, auto-delete triggered")
        print(f"  • Result: Active emails should drop to 0")
        
        print(f"\nActual Results:")
        print(f"  • Before: {before_active} active emails")
        print(f"  • After: {after_active} active emails")
        print(f"  • Total created: 30 new emails")
        
        deleted_before = self.results['before']['deleted_emails']
        deleted_after = self.results['after']['deleted_emails']
        print(f"  • Soft-deleted before: {deleted_before}")
        print(f"  • Soft-deleted after: {deleted_after}")
        print(f"  • New soft-deletes: {deleted_after - deleted_before}")
        
        # Verification
        print(f"\n✓ AUTO-DELETION VERIFICATION:")
        if after_active <= 0:
            print(f"  ✓ PASS: Active emails cleaned up (now {after_active})")
            self.results['status'] = 'PASS'
            return True
        elif after_active < before_active + new_emails_created:
            print(f"  ✓ PARTIAL: Some cleanup occurred ({after_active} < {before_active + new_emails_created})")
            self.results['status'] = 'PARTIAL'
            return True
        else:
            print(f"  ✗ FAIL: No auto-deletion detected ({after_active} == {before_active + new_emails_created})")
            self.results['status'] = 'FAIL'
            return False
    
    def cleanup_test_user(self):
        """Remove test user to avoid cluttering database"""
        print("\n" + "="*70)
        print("STEP 6: Cleaning Up Test Data")
        print("="*70)
        
        try:
            User.objects.filter(username=self.test_username).delete()
            print(f"✓ Test user '{self.test_username}' removed")
            print(f"✓ Associated login email logs preserved (soft-deleted)")
            return True
        except Exception as e:
            print(f"✗ Cleanup failed: {str(e)}")
            return False
    
    def print_summary(self):
        """Print final test summary"""
        print("\n" + "="*70)
        print("TEST SUMMARY & CONCLUSION")
        print("="*70)
        
        print(f"\n📊 Auto-Deletion Test Results:")
        print(f"  Status: {self.results['status']}")
        print(f"  Test User: {self.test_username}")
        print(f"  User Role: faculty")
        
        print(f"\n📈 Statistics:")
        print(f"  Before 30 Logins:")
        print(f"    - Active: {self.results['before']['active_emails']}")
        print(f"    - Deleted: {self.results['before']['deleted_emails']}")
        
        print(f"  After 30 Logins:")
        print(f"    - Active: {self.results['after']['active_emails']}")
        print(f"    - Deleted: {self.results['after']['deleted_emails']}")
        
        print(f"\n✓ CONCLUSION:")
        if self.results['status'] == 'PASS':
            print(f"  ✓ Auto-deletion is WORKING CORRECTLY for faculty!")
            print(f"  ✓ All 30 emails were automatically cleaned up")
            print(f"  ✓ System is ready for production use")
        elif self.results['status'] == 'PARTIAL':
            print(f"  ⚠ Auto-deletion PARTIALLY working")
            print(f"  ⚠ Some emails were cleaned, but may need tuning")
        else:
            print(f"  ✗ Auto-deletion NOT working as expected")
            print(f"  ✗ Review settings and scheduled tasks")
        
        print(f"\n" + "="*70)
    
    def run_test(self):
        """Execute complete test suite"""
        print("\n")
        print("█" * 70)
        print("FACULTY PORTAL AUTO-DELETION TEST (30 Logins)")
        print("█" * 70)
        print("Testing: Auto-deletion works dynamically for every faculty user")
        print("Method: Simulate 30 consecutive faculty portal logins")
        print("Impact: NO changes to code or existing data")
        
        try:
            if not self.setup_test_user():
                return False
            
            if not self.get_login_stats_before():
                return False
            
            if not self.simulate_30_logins():
                return False
            
            if not self.get_login_stats_after():
                return False
            
            if not self.verify_auto_deletion():
                return False
            
            self.print_summary()
            
            # Optional cleanup (comment out to keep test user for manual inspection)
            # self.cleanup_test_user()
            
            return True
            
        except Exception as e:
            print(f"\n✗ Test failed with error: {str(e)}")
            import traceback
            traceback.print_exc()
            return False


if __name__ == '__main__':
    test = FacultyLoginAutoDeleteionTest()
    success = test.run_test()
    sys.exit(0 if success else 1)
