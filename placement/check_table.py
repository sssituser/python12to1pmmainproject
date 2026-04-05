#!/usr/bin/env python
import os
import sys
import django

# Setup Django
sys.path.append(r'd:\SSSIT MAIN PROJECT\python12to1pmmainproject\placement')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'placement.settings')
django.setup()

from django.db import connection

try:
    with connection.cursor() as cursor:
        cursor.execute('DESCRIBE myapp_faculty_profile')
        columns = cursor.fetchall()
        print('Table structure:')
        for column in columns:
            print(f'  {column[0]}: {column[1]}')
            
        # Check if user_id column exists
        cursor.execute("SHOW COLUMNS FROM myapp_faculty_profile LIKE 'user%'")
        user_columns = cursor.fetchall()
        print(f'\nUser-related columns:')
        for column in user_columns:
            print(f'  {column[0]}: {column[1]}')
            
except Exception as e:
    print(f'Error: {e}')
    import traceback
    traceback.print_exc()
