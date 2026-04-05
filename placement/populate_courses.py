import os
import django

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'placement.settings')
django.setup()

from myapp.models import Course

COURSES = [
    {"title": "Python Full Stack", "level": "Beginner", "duration": "6 Months"},
    {"title": "Java Full Stack", "level": "Beginner", "duration": "6 Months"},
    {"title": ".net Full Stack", "level": "Beginner", "duration": "6 Months"},
    {"title": "Mern Full Stack", "level": "Beginner", "duration": "6 Months"},
    {"title": "Data Science and Agentic AI", "level": "Beginner", "duration": "6 Months"},
    {"title": "UI Full Stack", "level": "Beginner", "duration": "6 Months"},
]

def populate():
    print("Starting course population...")
    for c_data in COURSES:
        course, created = Course.objects.get_or_create(
            title=c_data["title"],
            defaults={
                "level": c_data["level"],
                "duration": c_data["duration"],
                "progress": 0,
                "topics": []
            }
        )
        if created:
            print(f"Created: {course.title}")
        else:
            print(f"Already exists: {course.title}")
    print("Course population complete!")

if __name__ == "__main__":
    populate()
