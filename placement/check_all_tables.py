#!/usr/bin/env python
import os
import sys
import django

# Setup Django
sys.path.append(r'd:\SSSIT MAIN PROJECT\python12to1pmmainproject\placement')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'placement.settings')
django.setup()

from django.db import connection

def check_table_structure(table_name):
    try:
        with connection.cursor() as cursor:
            cursor.execute(f'DESCRIBE {table_name}')
            columns = cursor.fetchall()
            print(f'\n{table_name} structure:')
            for column in columns:
                print(f'  {column[0]}: {column[1]}')
    except Exception as e:
        print(f'Error checking {table_name}: {e}')

# Check all faculty-related tables
tables = [
    'myapp_faculty_profile',
    'myapp_faculty_achievement',
    'myapp_faculty_research', 
    'myapp_faculty_course_history'
]

for table in tables:
    check_table_structure(table)
