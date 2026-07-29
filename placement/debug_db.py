from myapp.models import StudentProfile, User

users = User.objects.filter(username='Karthikreddy')
print("Found users for Karthikreddy:", list(users))
for u in users:
    profiles = list(StudentProfile.objects.filter(user=u))
    print(f"User ID: {u.id}, username: {u.username}")
    for p in profiles:
        print(f"  Profile ID: {p.id}, student_id: {p.student_id}")

all_students = User.objects.filter(role='student')
print("\nAll Students & their Profiles:")
for u in all_students:
    profiles = list(StudentProfile.objects.filter(user=u))
    print(f"Student: {u.username} (id={u.id})")
    for p in profiles:
        print(f"  Profile ID: {p.id}, student_id: {p.student_id}")
