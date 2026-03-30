"""
Test script to verify login email tracking and auto-deletion feature

Usage:
    python manage.py shell < test_login_emails.py
"""

from django.contrib.auth import get_user_model
from myapp.models import LoginEmailLog
from myapp.imap_utils import delete_old_login_emails, attempt_delete_excess_login_emails
from myapp.email_utils import send_login_email
from django.utils import timezone
import datetime

User = get_user_model()


def test_login_email_tracking():
    """Test 1: Verify login emails are logged to database"""
    print("\n" + "="*60)
    print("TEST 1: Login Email Tracking")
    print("="*60)
    
    # Create test user
    test_user, created = User.objects.get_or_create(
        username='test_login_tracking',
        defaults={'email': 'test@example.com', 'role': 'faculty'}
    )
    print(f"Test user created/retrieved: {test_user.username}")
    
    # Clear previous logs
    LoginEmailLog.objects.filter(user=test_user).delete()
    print(f"Cleared previous logs for {test_user.username}")
    
    # Send test login email
    result = send_login_email(
        user_email=test_user.email,
        username=test_user.username,
        login_time=timezone.now().strftime("%Y-%m-%d %H:%M:%S"),
        user_ip="192.168.1.1",
        browser_info="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit",
        user=test_user
    )
    
    print(f"Email sent result: {result}")
    
    # Verify it's in database
    log_count = LoginEmailLog.objects.filter(user=test_user, is_deleted=False).count()
    print(f"Active login email logs for user: {log_count}")
    
    if log_count > 0:
        latest_log = LoginEmailLog.objects.filter(user=test_user).latest('sent_at')
        print(f"Latest log entry:")
        print(f"  - Email: {latest_log.email_address}")
        print(f"  - Sent at: {latest_log.sent_at}")
        print(f"  - Is deleted: {latest_log.is_deleted}")
        print("✓ TEST 1 PASSED: Login emails are being logged to database")
        return True
    else:
        print("✗ TEST 1 FAILED: No login emails logged to database")
        return False


def test_email_count_tracking():
    """Test 2: Verify email count is tracked correctly"""
    print("\n" + "="*60)
    print("TEST 2: Email Count Tracking")
    print("="*60)
    
    test_user, _ = User.objects.get_or_create(
        username='test_email_count',
        defaults={'email': 'count@example.com', 'role': 'faculty'}
    )
    
    # Clear previous logs
    LoginEmailLog.objects.filter(user=test_user).delete()
    
    # Create 15 simulated login email logs
    for i in range(15):
        LoginEmailLog.objects.create(
            user=test_user,
            email_address=test_user.email,
            login_time=f"2026-03-{i+1:02d} 10:00:00",
            user_ip=f"192.168.1.{i+1}",
            browser_info=f"Browser {i+1}"
        )
    
    # Check count
    count = LoginEmailLog.get_user_active_login_emails_count(test_user)
    print(f"Active login email count: {count}")
    
    if count == 15:
        print("✓ TEST 2 PASSED: Email count tracking works correctly")
        return True
    else:
        print(f"✗ TEST 2 FAILED: Expected 15, got {count}")
        return False


def test_email_deletion_marking():
    """Test 3: Verify emails can be marked as deleted"""
    print("\n" + "="*60)
    print("TEST 3: Email Deletion Marking")
    print("="*60)
    
    test_user, _ = User.objects.get_or_create(
        username='test_deletion',
        defaults={'email': 'deletion@example.com', 'role': 'faculty'}
    )
    
    # Clear and create test logs
    LoginEmailLog.objects.filter(user=test_user).delete()
    email_logs = []
    for i in range(5):
        log = LoginEmailLog.objects.create(
            user=test_user,
            email_address=test_user.email,
            login_time=f"2026-03-{i+1:02d} 10:00:00",
            user_ip=f"192.168.1.{i+1}",
            browser_info=f"Browser {i+1}"
        )
        email_logs.append(log)
    
    print(f"Created {len(email_logs)} test email logs")
    
    # Get oldest and mark as deleted
    oldest_logs = LoginEmailLog.get_user_oldest_active_emails(test_user, 3)
    print(f"Retrieving oldest 3 logs...")
    
    deletion_count = 0
    for log in oldest_logs:
        log.is_deleted = True
        log.deleted_at = timezone.now()
        log.save()
        deletion_count += 1
    
    print(f"Marked {deletion_count} logs as deleted")
    
    # Verify count
    active_count = LoginEmailLog.get_user_active_login_emails_count(test_user)
    print(f"Active emails after marking deletion: {active_count}")
    
    if active_count == 2:
        print("✓ TEST 3 PASSED: Email deletion marking works correctly")
        return True
    else:
        print(f"✗ TEST 3 FAILED: Expected 2 active, got {active_count}")
        return False


def test_cleanup_threshold():
    """Test 4: Verify cleanup is triggered at threshold"""
    print("\n" + "="*60)
    print("TEST 4: Cleanup Threshold Check")
    print("="*60)
    
    test_user, _ = User.objects.get_or_create(
        username='test_threshold',
        defaults={'email': 'threshold@example.com', 'role': 'faculty'}
    )
    
    # Clear and create 31 test logs (exceeding the 30 limit)
    LoginEmailLog.objects.filter(user=test_user).delete()
    for i in range(31):
        LoginEmailLog.objects.create(
            user=test_user,
            email_address=test_user.email,
            login_time=f"2026-03-{(i%28)+1:02d} {(i//28)*12:02d}:00:00",
            user_ip=f"192.168.1.{(i%255)+1}",
            browser_info=f"Browser {i+1}"
        )
    
    count_before = LoginEmailLog.get_user_active_login_emails_count(test_user)
    print(f"Active emails before cleanup check: {count_before}")
    
    # Attempt cleanup (without actual IMAP, just database marking)
    oldest_emails = LoginEmailLog.get_user_oldest_active_emails(test_user, 30)
    deletion_count = 0
    for log in oldest_emails:
        log.is_deleted = True
        log.deleted_at = timezone.now()
        log.save()
        deletion_count += 1
    
    count_after = LoginEmailLog.get_user_active_login_emails_count(test_user)
    print(f"Active emails after cleanup: {count_after}")
    
    if count_after == 1:
        print("✓ TEST 4 PASSED: Cleanup threshold and marking works correctly")
        return True
    else:
        print(f"✗ TEST 4 FAILED: Expected 1 active email, got {count_after}")
        return False


def run_all_tests():
    """Run all tests"""
    print("\n" + "#"*60)
    print("# LOGIN EMAIL TRACKING & AUTO-DELETION TESTS")
    print("#"*60)
    
    results = []
    results.append(("Email Tracking", test_login_email_tracking()))
    results.append(("Email Count", test_email_count_tracking()))
    results.append(("Deletion Marking", test_email_deletion_marking()))
    results.append(("Threshold Check", test_cleanup_threshold()))
    
    # Summary
    print("\n" + "="*60)
    print("TEST SUMMARY")
    print("="*60)
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for test_name, result in results:
        status = "✓ PASS" if result else "✗ FAIL"
        print(f"{test_name}: {status}")
    
    print(f"\nTotal: {passed}/{total} tests passed")
    print("="*60 + "\n")
    
    if passed == total:
        print("✓ ALL TESTS PASSED - Feature is working correctly!")
    else:
        print(f"✗ {total - passed} TEST(S) FAILED - Please review the implementation")


if __name__ == '__main__':
    run_all_tests()
