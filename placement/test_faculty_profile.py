#!/usr/bin/env python
import os
import sys
import django

# Setup Django
sys.path.append(r'd:\SSSIT MAIN PROJECT\python12to1pmmainproject\placement')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'placement.settings')
django.setup()

try:
    from myapp.models import FacultyProfile
    print("✅ FacultyProfile import successful")
    
    # Check if table exists
    from django.db import connection
    with connection.cursor() as cursor:
        cursor.execute("SHOW TABLES LIKE 'myapp_faculty_profile'")
        result = cursor.fetchone()
        if result:
            print("✅ FacultyProfile table exists")
        else:
            print("❌ FacultyProfile table does not exist")
            
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()
