#!/usr/bin/env python
import os
import sys
import django
from pathlib import Path

# Set up Django environment
BASE_DIR = Path(__file__).resolve().parent / 'placement'
sys.path.append(str(BASE_DIR))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'placement.settings')
django.setup()

from django.contrib.auth import get_user_model
from django.contrib.auth.hashers import make_password

User = get_user_model()

def create_admin_user():
    """Create an admin user for testing"""
    try:
        # Check if admin user already exists
        if User.objects.filter(username='admin').exists():
            print("Admin user already exists")
            admin_user = User.objects.get(username='admin')
            print(f"Admin details: {admin_user.username}, Role: {admin_user.role}")
            return
        
        # Create admin user
        admin_user = User.objects.create(
            username='admin',
            email='admin@placement.com',
            first_name='System',
            last_name='Administrator',
            password=make_password('admin123'),
            role='admin',
            is_active=True,
            is_staff=True,
            is_superuser=True
        )
        
        print("✅ Admin user created successfully!")
        print("Username: admin")
        print("Password: admin123")
        print("Email: admin@placement.com")
        print("Role: admin")
        
    except Exception as e:
        print(f"❌ Error creating admin user: {e}")

if __name__ == '__main__':
    create_admin_user()
