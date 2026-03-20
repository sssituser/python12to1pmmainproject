import os
import sys
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'placement.settings')
django.setup()

# Check if job_title column exists in MySQL
from django.db import connection

with connection.cursor() as cursor:
    cursor.execute("DESCRIBE myapp_job;")
    rows = cursor.fetchall()
    print("=== myapp_job columns ===")
    for row in rows:
        print(row)

print()

# Check pending migrations
from django.db.migrations.executor import MigrationExecutor
executor = MigrationExecutor(connection)
plan = executor.migration_plan(executor.loader.graph.leaf_nodes())
if plan:
    print("=== Pending migrations ===")
    for step in plan:
        print(f"  - {step[0]}")
else:
    print("=== No pending migrations ===")
