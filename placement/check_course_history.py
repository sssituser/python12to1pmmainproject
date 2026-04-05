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
        cursor.execute('DESCRIBE myapp_faculty_course_history')
        columns = cursor.fetchall()
        print('FacultyCourseHistory table structure:')
        for column in columns:
            print(f'  {column[0]}: {column[1]}')
            
        # Check if course column exists
        cursor.execute("SHOW COLUMNS FROM myapp_faculty_course_history LIKE 'course%'")
        course_columns = cursor.fetchall()
        print(f'\nCourse-related columns:')
        for column in course_columns:
            print(f'  {column[0]}: {column[1]}')
            
except Exception as e:
    print(f'Error: {e}')
