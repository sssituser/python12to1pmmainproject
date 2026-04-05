#!/usr/bin/env python
import os
import sys
import django

# Setup Django
sys.path.append(r'd:\SSSIT MAIN PROJECT\python12to1pmmainproject\placement')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'placement.settings')
django.setup()

from myapp.models import User, FacultyProfile

try:
    # Check faculty users
    faculty_users = User.objects.filter(role='faculty')
    print(f'Found {faculty_users.count()} faculty users')
    
    if faculty_users.exists():
        user = faculty_users.first()
        print(f'Faculty user: {user.username}')
        print(f'User ID: {user.id}')
        print(f'User role: {user.role}')
        
        # Check or create profile
        profile, created = FacultyProfile.objects.get_or_create(user=user)
        print(f'Profile {"created" if created else "exists"}: {profile.id}')
        print(f'Full name: {profile.full_name}')
        print(f'Email: {profile.email}')
        print(f'Department: {profile.department}')
        print(f'Designation: {profile.designation}')
        
        print('✅ Faculty profile setup complete!')
    else:
        print('❌ No faculty users found')
        
        # Create a test faculty user
        try:
            faculty_user = User.objects.create_user(
                username='faculty_test',
                email='faculty@test.com',
                password='test123',
                role='faculty',
                first_name='Test',
                last_name='Faculty'
            )
            print('✅ Created test faculty user')
            
            # Create profile
            profile = FacultyProfile.objects.create(
                user=faculty_user,
                first_name='Test',
                last_name='Faculty',
                department='Computer Science',
                designation='Professor'
            )
            print('✅ Created faculty profile')
            
        except Exception as e:
            print(f'❌ Error creating test user: {e}')

except Exception as e:
    print(f'❌ Error: {e}')
    import traceback
    traceback.print_exc()
