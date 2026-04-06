#!/usr/bin/env python
import os
import sys
import django

# Set up Django environment
sys.path.append(r'd:\SSSIT MAIN PROJECT\python12to1pmmainproject\placement')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'placement.settings')
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()

def check_admin_role():
    """Check admin user role field"""
    try:
        admin_user = User.objects.filter(username='admin').first()
        
        if not admin_user:
            print("❌ Admin user not found")
            return
        
        print(f"✅ Admin user found: {admin_user.username}")
        print(f"📧 Email: {admin_user.email}")
        print(f"🔑 Role field: '{admin_user.role}'")
        print(f"🔑 Role type: {type(admin_user.role)}")
        print(f"🟢 Active: {admin_user.is_active}")
        print(f"👨‍💼 Staff: {admin_user.is_staff}")
        print(f"🔐 Superuser: {admin_user.is_superuser}")
        
        # Fix role if needed
        if not admin_user.role or admin_user.role == '':
            print("🔄 Fixing admin role field...")
            admin_user.role = 'admin'
            admin_user.save()
            print("✅ Admin role fixed!")
        
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == '__main__':
    check_admin_role()
