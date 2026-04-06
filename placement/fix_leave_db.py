import os
import django
from django.db import connection

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'placement.settings')
django.setup()

def fix_leave_table():
    with connection.cursor() as cursor:
        try:
            print("Checking myapp_leaverequest table...")
            cursor.execute("SHOW COLUMNS FROM myapp_leaverequest LIKE 'user_id'")
            column = cursor.fetchone()
            
            if not column:
                print("Adding missing user_id column to LeaveRequest table...")
                cursor.execute("ALTER TABLE myapp_leaverequest ADD COLUMN user_id BIGINT NULL")
                cursor.execute("ALTER TABLE myapp_leaverequest ADD CONSTRAINT fk_leave_user FOREIGN KEY (user_id) REFERENCES myapp_user(id)")
                print("User ID column and foreign key added successfully!")
            else:
                print("User ID column exists. Checking type/constraint...")
                try:
                    cursor.execute("ALTER TABLE myapp_leaverequest MODIFY COLUMN user_id BIGINT NULL")
                    print("Converted user_id to BIGINT.")
                except Exception as e:
                    print(f"Note: Could not modify column (maybe already BIGINT): {e}")
                
                try:
                    cursor.execute("ALTER TABLE myapp_leaverequest ADD CONSTRAINT fk_leave_user FOREIGN KEY (user_id) REFERENCES myapp_user(id)")
                    print("Foreign key constraint added successfully!")
                except Exception as e:
                    print(f"Note: Could not add constraint (maybe already exists): {e}")
        except Exception as e:
            print(f"Error patching LeaveRequest table: {e}")

if __name__ == "__main__":
    fix_leave_table()
