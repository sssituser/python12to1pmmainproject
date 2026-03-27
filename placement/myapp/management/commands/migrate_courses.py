"""
Management command to migrate hardcoded course data to database
Run with: python manage.py migrate_courses
"""

from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from myapp.models import Course, CourseTopic, CourseEnrollment, StudentTopicProgress


class Command(BaseCommand):
    help = 'Migrate hardcoded course data to database'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Starting course migration...'))

        # Define hardcoded course data
        courses_data = [
            {
                "title": "Python (Basic)",
                "level": "Beginner",
                "duration": "3 hrs",
                "is_locked": False,
                "topics": [
                    "Python Basics",
                    "Variables and Data Types",
                    "Loops",
                    "Functions",
                    "Lists and Tuples",
                    "Dictionaries",
                    "File Handling",
                    "Exception Handling",
                    "Modules and Packages",
                    "OOP Concepts",
                    "Decorators",
                    "Generators"
                ]
            },
            {
                "title": "JavaScript",
                "level": "Intermediate",
                "duration": "4 hrs",
                "is_locked": False,
                "topics": [
                    "JavaScript Basics",
                    "Variables and Data Types",
                    "Functions",
                    "Arrays and Objects",
                    "DOM Manipulation",
                    "Events",
                    "Async JavaScript",
                    "ES6+ Features",
                    "Modules",
                    "Error Handling",
                    "Fetch API",
                    "Local Storage"
                ]
            },
            {
                "title": "Java",
                "level": "Advanced",
                "duration": "6 hrs",
                "is_locked": False,
                "topics": [
                    "Java Basics",
                    "Variables and Data Types",
                    "Control Flow",
                    "Methods",
                    "Arrays",
                    "OOP Concepts",
                    "Inheritance",
                    "Polymorphism",
                    "Exception Handling",
                    "Collections",
                    "File I/O",
                    "Multithreading"
                ]
            }
        ]

        # Create courses and topics
        created_count = 0
        for course_data in courses_data:
            topics = course_data.pop('topics')

            try:
                course, created = Course.objects.get_or_create(
                    title=course_data['title'],
                    defaults=course_data
                )

                if created:
                    self.stdout.write(
                        self.style.SUCCESS(f"✓ Created course: {course.title}")
                    )
                    created_count += 1

                    # Create topics for this course
                    for idx, topic_text in enumerate(topics, 1):
                        CourseTopic.objects.get_or_create(
                            course=course,
                            topic_text=topic_text,
                            defaults={'order': idx}
                        )
                    self.stdout.write(
                        self.style.SUCCESS(f"  └─ Added {len(topics)} topics")
                    )
                else:
                    self.stdout.write(
                        self.style.WARNING(f"⊘ Course already exists: {course.title}")
                    )

            except Exception as e:
                self.stdout.write(
                    self.style.ERROR(f"✗ Error creating course {course_data['title']}: {str(e)}")
                )

        self.stdout.write(
            self.style.SUCCESS(f'\n✓ Migration complete! Created {created_count} new courses.')
        )

        # Optionally create enrollments for existing students
        self.stdout.write(self.style.SUCCESS('Creating enrollments for existing students...'))

        try:
            students = User.objects.filter(is_staff=False, is_superuser=False)
            all_courses = Course.objects.all()
            enrollment_count = 0

            for student in students:
                for course in all_courses:
                    enrollment, created = CourseEnrollment.objects.get_or_create(
                        user=student,
                        course=course
                    )
                    if created:
                        enrollment_count += 1

                        # Create topic progress for each topic
                        for topic in course.topics.all():
                            StudentTopicProgress.objects.get_or_create(
                                enrollment=enrollment,
                                topic=topic
                            )

            self.stdout.write(
                self.style.SUCCESS(f'✓ Created {enrollment_count} new enrollments')
            )

        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f"✗ Error creating enrollments: {str(e)}")
            )

        self.stdout.write(self.style.SUCCESS('\n✓ All done!'))
