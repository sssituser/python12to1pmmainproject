#!/usr/bin/env python
import os
import sys
import django

# Set up Django environment
sys.path.append(r'd:\SSSIT MAIN PROJECT\python12to1pmmainproject\placement')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'placement.settings')
django.setup()

from django.contrib.auth import get_user_model, authenticate
from django.contrib.auth.hashers import check_password

User = get_user_model()

def check_admin_user():
    """Check admin user credentials"""
    try:
        # Get admin user
        admin_user = User.objects.filter(username='admin').first()
        
        if not admin_user:
            print("❌ Admin user not found")
            return
        
        print(f"✅ Admin user found: {admin_user.username}")
        print(f"📧 Email: {admin_user.email}")
        print(f"🔑 Role: {admin_user.role}")
        print(f"🟢 Active: {admin_user.is_active}")
        print(f"👨‍💼 Staff: {admin_user.is_staff}")
        print(f"🔐 Superuser: {admin_user.is_superuser}")
        
        # Test password verification
        print(f"\n🔍 Testing password 'admin123'...")
        if check_password('admin123', admin_user.password):
            print("✅ Password verification: PASSED")
        else:
            print("❌ Password verification: FAILED")
            print("🔄 Resetting admin password...")
            admin_user.set_password('admin123')
            admin_user.save()
            print("✅ Password reset successfully")
        
        # Test authentication
        print(f"\n🔍 Testing authentication...")
        auth_user = authenticate(username='admin', password='admin123')
        if auth_user:
            print("✅ Authentication: SUCCESS")
            print(f"👤 Authenticated user: {auth_user.username}")
        else:
            print("❌ Authentication: FAILED")
            
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == '__main__':
    check_admin_user()
