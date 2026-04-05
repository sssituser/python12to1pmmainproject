from django.contrib.auth import authenticate, get_user_model
User = get_user_model()
username = "VARDHAN"
password = "03-2003" # From the screenshot

print(f"Checking login for: {username} with password: {password}")

user = authenticate(username=username, password=password)
if user:
    print(f"AUTHENTICATION SUCCESS: {user.username}, Role: {getattr(user, 'role', 'N/A')}")
else:
    print("AUTHENTICATION FAILED")
    # Check if user exists independently
    u = User.objects.filter(username=username).first()
    if u:
        print(f"USER {username} exists, but password check failed.")
        print(f"Last Login: {u.last_login}")
        print(f"Is Active: {u.is_active}")
    else:
        print(f"USER {username} does not exist.")
