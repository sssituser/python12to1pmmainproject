from myapp.models import StudentProfile, User
students = User.objects.filter(role='student')
for u in students:
    sids = list(StudentProfile.objects.filter(user=u).values_list('id', 'student_id'))
    print(u.username, u.id, sids)
