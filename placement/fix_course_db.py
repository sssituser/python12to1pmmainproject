import os
import django
from django.db import connection

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'placement.settings')
django.setup()

def fix_db():
    with connection.cursor() as cursor:
        try:
            # Check for current columns in myapp_course
            cursor.execute("DESCRIBE myapp_course;")
            columns = [col[0] for col in cursor.fetchall()]
            print(f"Current columns in myapp_course: {columns}")
            
            # Add modules if missing
            if 'modules' not in columns:
                print("Missing 'modules' column, creating it...")
                cursor.execute("ALTER TABLE myapp_course ADD COLUMN modules longtext;")
                print("Successfully added modules.")

            # Add custom_videos if missing 
            if 'custom_videos' not in columns:
                print("Missing 'custom_videos' column, creating it...")
                cursor.execute("ALTER TABLE myapp_course ADD COLUMN custom_videos longtext;")
                print("Successfully added custom_videos.")
                
            print("Successfully updated Course table schema.")
        except Exception as e:
            print(f"Error checking DB: {e}")

if __name__ == "__main__":
    fix_db()
