from django.contrib.auth import get_user_model
User = get_user_model()
u = User.objects.filter(username='VARDHAN').first()
if u:
    print(f"User found: {u.username}")
    print(f"Is active: {u.is_active}")
    print(f"Role: {getattr(u, 'role', 'N/A')}")
    print(f"Email: {u.email}")
else:
    print("User VARDHAN not found.")

# Also list all students to see if there's a typo
print("\nAll student-like users:")
for user in User.objects.all():
    print(f"  {user.id}: {user.username} (email: {user.email}, role: {getattr(user, 'role', 'N/A')}, active: {user.is_active})")
