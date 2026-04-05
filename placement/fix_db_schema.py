import os
import django
from django.db import connection

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'placement.settings')
django.setup()

def fix_db():
    with connection.cursor() as cursor:
        try:
            # Check if user_id exists in myapp_faculty_profile
            cursor.execute("DESCRIBE myapp_faculty_profile;")
            columns = [col[0] for col in cursor.fetchall()]
            print(f"Current columns in myapp_faculty_profile: {columns}")
            
            if 'user_id' not in columns:
                print("Missing 'user_id' column, creating it...")
                # Note: user_id is a foreign key to User table
                # We need to find the user table (likely myapp_user or auth_user)
                cursor.execute("ALTER TABLE myapp_faculty_profile ADD COLUMN user_id bigint NOT NULL;")
                cursor.execute("ALTER TABLE myapp_faculty_profile ADD CONSTRAINT myapp_faculty_profile_user_id_fk FOREIGN KEY (user_id) REFERENCES myapp_user(id);")
                print("Successfully added user_id column and foreign key constraint.")
            else:
                print("user_id column already exists.")
        except Exception as e:
            if "Table 'myapp_faculty_profile' doesn't exist" in str(e):
                print("Table myapp_faculty_profile does not exist. Running migrations to create it.")
                from django.core.management import call_command
                call_command('migrate', 'myapp')
            else:
                print(f"Error checking DB: {e}")

if __name__ == "__main__":
    fix_db()
