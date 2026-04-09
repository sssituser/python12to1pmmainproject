from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
import json
from datetime import datetime
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action, api_view
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated

from ..models import Course, CourseTopic, CourseEnrollment, StudentTopicProgress
from ..serializers import (
    CourseStudentSerializer,
    CourseFacultySerializer,
    CourseCreateUpdateSerializer,
)


# ===============================
# DRF VIEWSET FOR COURSE API
# ===============================

class CourseViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing courses with role-based serializers
    - GET: AllowAny (public access)
    - POST/PUT/DELETE: IsAuthenticated (faculty/admin only)
    """
    queryset = Course.objects.all()
    permission_classes = [AllowAny]

    def get_serializer_class(self):
        """Return appropriate serializer based on action and user role"""
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return CourseCreateUpdateSerializer

        # For list and retrieve, check if user is faculty/staff
        request = self.request
        if request.user and request.user.is_authenticated and (request.user.is_staff or request.user.is_superuser):
            return CourseFacultySerializer

        return CourseStudentSerializer

    def get_serializer_context(self):
        """Add request to serializer context"""
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

    def get_permissions(self):
        """Set permissions based on action"""
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [IsAuthenticated]
        else:
            permission_classes = [AllowAny]
        return [permission() for permission in permission_classes]

    def perform_create(self, serializer):
        """Save newly created course"""
        serializer.save()

    def perform_update(self, serializer):
        """Save updated course"""
        serializer.save()

    @action(detail=True, methods=['get'], permission_classes=[AllowAny])
    def topics(self, request, pk=None):
        """Get topics for a specific course"""
        course = self.get_object()
        # Topics are stored as a JSON list
        topics_list = course.topics if isinstance(course.topics, list) else []
        return Response({
            'course_id': course.id,
            'course_title': course.title,
            'topics': topics_list
        })

    @action(detail=False, methods=['get'], permission_classes=[AllowAny])
    def student(self, request):
        """Get courses for student view (with progress)"""
        courses = self.get_queryset()
        serializer = CourseStudentSerializer(
            courses,
            many=True,
            context={'request': request}
        )
        return Response({
            'success': True,
            'data': serializer.data,
            'message': 'Student courses retrieved successfully'
        })

    @action(detail=False, methods=['get'], permission_classes=[AllowAny])
    def faculty(self, request):
        """Get courses for faculty view (without progress)"""
        courses = self.get_queryset()
        serializer = CourseFacultySerializer(courses, many=True)
        return Response({
            'success': True,
            'data': serializer.data,
            'message': 'Faculty courses retrieved successfully'
        })


# ===============================
# LEGACY ENDPOINTS (Backwards Compatibility)
# ===============================
# Keep the original functions for backwards compatibility
# These can be deprecated once frontend is migrated to DRF

# Course data for students
def get_student_courses():
    """Get dynamic course data from DB for student view"""
    from ..models import Course
    from ..serializers import CourseStudentSerializer
    courses = Course.objects.all()
    serializer = CourseStudentSerializer(courses, many=True)
    return serializer.data

def get_faculty_courses():
    """Get dynamic course data from DB for faculty view"""
    from ..models import Course
    from ..serializers import CourseFacultySerializer
    courses = Course.objects.all()
    serializer = CourseFacultySerializer(courses, many=True)
    return serializer.data

@api_view(["GET"])
def student_courses(request):
    """API endpoint for student courses"""
    try:
        courses = get_student_courses()
        return Response({
            "success": True,
            "data": courses,
            "message": "Student courses retrieved successfully"
        })
    except Exception as e:
        return Response({
            "success": False,
            "error": str(e),
            "message": "Failed to retrieve student courses"
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(["GET"])
def faculty_courses(request):
    """API endpoint for faculty courses"""
    try:
        courses = get_faculty_courses()
        return Response({
            "success": True,
            "data": courses,
            "message": "Faculty courses retrieved successfully"
        })
    except Exception as e:
        return Response({
            "success": False,
            "error": str(e),
            "message": "Failed to retrieve faculty courses"
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@csrf_exempt
@require_http_methods(["GET"])
def get_course_details(request, course_id):
    """API endpoint to get specific course details"""
    try:
        from ..models import Course
        from ..serializers import CourseStudentSerializer
        course = Course.objects.filter(id=course_id).first()
        if course:
            serializer = CourseStudentSerializer(course)
            return JsonResponse({
                "success": True,
                "data": serializer.data,
                "message": "Course details retrieved successfully"
            })
        else:
            return JsonResponse({
                "success": False,
                "error": "Course not found",
                "message": f"Course with ID {course_id} not found"
            }, status=404)

    except Exception as e:
        return JsonResponse({
            "success": False,
            "error": str(e),
            "message": "Failed to retrieve course details"
        }, status=500)

@csrf_exempt
@require_http_methods(["POST"])
def create_course(request):
    """API endpoint for faculty to create new courses"""
    try:
        data = json.loads(request.body)

        # Validate required fields
        required_fields = ["title", "level", "duration", "topics"]
        for field in required_fields:
            if field not in data:
                return JsonResponse({
                    "success": False,
                    "error": f"Missing required field: {field}",
                    "message": "Please provide all required fields"
                }, status=400)

        # Create new course (in a real app, this would save to database)
        new_course = {
            "id": len(get_faculty_courses()) + 1,
            "title": data["title"],
            "level": data["level"],
            "duration": data["duration"],
            "topics": data["topics"],
            "created_at": datetime.now().isoformat()
        }

        return JsonResponse({
            "success": True,
            "data": new_course,
            "message": "Course created successfully"
        })

    except json.JSONDecodeError:
        return JsonResponse({
            "success": False,
            "error": "Invalid JSON",
            "message": "Please provide valid JSON data"
        }, status=400)
    except Exception as e:
        return JsonResponse({
            "success": False,
            "error": str(e),
            "message": "Failed to create course"
        }, status=500)

@csrf_exempt
@require_http_methods(["PUT"])
def update_course(request, course_id):
    """API endpoint for faculty to update existing courses"""
    try:
        course_id = int(course_id)
        data = json.loads(request.body)

        # In a real app, this would update the course in the database
        # For now, we'll simulate the update

        return JsonResponse({
            "success": True,
            "message": f"Course {course_id} updated successfully",
            "data": data
        })

    except ValueError:
        return JsonResponse({
            "success": False,
            "error": "Invalid course ID",
            "message": "Course ID must be a valid integer"
        }, status=400)
    except json.JSONDecodeError:
        return JsonResponse({
            "success": False,
            "error": "Invalid JSON",
            "message": "Please provide valid JSON data"
        }, status=400)
    except Exception as e:
        return JsonResponse({
            "success": False,
            "error": str(e),
            "message": "Failed to update course"
        }, status=500)

@csrf_exempt
@require_http_methods(["DELETE"])
def delete_course(request, course_id):
    """API endpoint for faculty to delete courses"""
    try:
        course_id = int(course_id)

        # In a real app, this would delete the course from the database
        # For now, we'll simulate the deletion

        return JsonResponse({
            "success": True,
            "message": f"Course {course_id} deleted successfully"
        })

    except ValueError:
        return JsonResponse({
            "success": False,
            "error": "Invalid course ID",
            "message": "Course ID must be a valid integer"
        }, status=400)
    except Exception as e:
        return JsonResponse({
            "success": False,
            "error": str(e),
            "message": "Failed to delete course"
        }, status=500)

@csrf_exempt
@require_http_methods(["GET"])
def get_course_topics(request, course_name):
    """API endpoint to get topics for a specific course"""
    try:
        course_name = course_name.lower().replace('-', ' ')
        courses = get_student_courses()

        course = None
        for c in courses:
            if course_name in c["title"].lower():
                course = c
                break

        if course:
            return JsonResponse({
                "success": True,
                "data": course["topics"],
                "message": f"Topics for {course['title']} retrieved successfully"
            })
        else:
            return JsonResponse({
                "success": False,
                "error": "Course not found",
                "message": f"Course '{course_name}' not found"
            }, status=404)

    except Exception as e:
        return JsonResponse({
            "success": False,
            "error": str(e),
            "message": "Failed to retrieve course topics"
        }, status=500)
    """Get course data for student view"""
    return [
        {
            "id": 1,
            "title": "Python (Basic)",
            "level": "Beginner",
            "duration": "3 hrs",
            "progress": 60,
            "locked": False,
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
            "id": 2,
            "title": "JavaScript",
            "level": "Intermediate",
            "duration": "4 hrs",
            "progress": 45,
            "locked": False,
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
            "id": 3,
            "title": "Java",
            "level": "Advanced",
            "duration": "6 hrs",
            "progress": 30,
            "locked": False,
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

# Course data for faculty
def get_faculty_courses():
    """Get course data for faculty view"""
    return [
        {
            "id": 1,
            "title": "Python (Basic)",
            "level": "Beginner",
            "duration": "3 hrs",
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
            "id": 2,
            "title": "JavaScript",
            "level": "Intermediate",
            "duration": "4 hrs",
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
            "id": 3,
            "title": "Java",
            "level": "Advanced",
            "duration": "6 hrs",
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

@api_view(["GET"])
def student_courses(request):
    """API endpoint for student courses"""
    try:
        courses = get_student_courses()
        return Response({
            "success": True,
            "data": courses,
            "message": "Student courses retrieved successfully"
        })
    except Exception as e:
        return Response({
            "success": False,
            "error": str(e),
            "message": "Failed to retrieve student courses"
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(["GET"])
def faculty_courses(request):
    """API endpoint for faculty courses"""
    try:
        courses = get_faculty_courses()
        return Response({
            "success": True,
            "data": courses,
            "message": "Faculty courses retrieved successfully"
        })
    except Exception as e:
        return Response({
            "success": False,
            "error": str(e),
            "message": "Failed to retrieve faculty courses"
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@csrf_exempt
@require_http_methods(["GET"])
def get_course_details(request, course_id):
    """API endpoint to get specific course details"""
    try:
        course_id = int(course_id)
        courses = get_student_courses()  # Can be used for both student and faculty
        
        course = None
        for c in courses:
            if c["id"] == course_id:
                course = c
                break
        
        if course:
            return JsonResponse({
                "success": True,
                "data": course,
                "message": "Course details retrieved successfully"
            })
        else:
            return JsonResponse({
                "success": False,
                "error": "Course not found",
                "message": f"Course with ID {course_id} not found"
            }, status=404)
            
    except ValueError:
        return JsonResponse({
            "success": False,
            "error": "Invalid course ID",
            "message": "Course ID must be a valid integer"
        }, status=400)
    except Exception as e:
        return JsonResponse({
            "success": False,
            "error": str(e),
            "message": "Failed to retrieve course details"
        }, status=500)

@csrf_exempt
@require_http_methods(["POST"])
def create_course(request):
    """API endpoint for faculty to create new courses"""
    try:
        data = json.loads(request.body)
        
        # Validate required fields
        required_fields = ["title", "level", "duration", "topics"]
        for field in required_fields:
            if field not in data:
                return JsonResponse({
                    "success": False,
                    "error": f"Missing required field: {field}",
                    "message": "Please provide all required fields"
                }, status=400)
        
        # Create new course (in a real app, this would save to database)
        new_course = {
            "id": len(get_faculty_courses()) + 1,
            "title": data["title"],
            "level": data["level"],
            "duration": data["duration"],
            "topics": data["topics"],
            "created_at": datetime.now().isoformat()
        }
        
        return JsonResponse({
            "success": True,
            "data": new_course,
            "message": "Course created successfully"
        })
        
    except json.JSONDecodeError:
        return JsonResponse({
            "success": False,
            "error": "Invalid JSON",
            "message": "Please provide valid JSON data"
        }, status=400)
    except Exception as e:
        return JsonResponse({
            "success": False,
            "error": str(e),
            "message": "Failed to create course"
        }, status=500)

@csrf_exempt
@require_http_methods(["PUT"])
def update_course(request, course_id):
    """API endpoint for faculty to update existing courses"""
    try:
        course_id = int(course_id)
        data = json.loads(request.body)
        
        # In a real app, this would update the course in the database
        # For now, we'll simulate the update
        
        return JsonResponse({
            "success": True,
            "message": f"Course {course_id} updated successfully",
            "data": data
        })
        
    except ValueError:
        return JsonResponse({
            "success": False,
            "error": "Invalid course ID",
            "message": "Course ID must be a valid integer"
        }, status=400)
    except json.JSONDecodeError:
        return JsonResponse({
            "success": False,
            "error": "Invalid JSON",
            "message": "Please provide valid JSON data"
        }, status=400)
    except Exception as e:
        return JsonResponse({
            "success": False,
            "error": str(e),
            "message": "Failed to update course"
        }, status=500)

@csrf_exempt
@require_http_methods(["DELETE"])
def delete_course(request, course_id):
    """API endpoint for faculty to delete courses"""
    try:
        course_id = int(course_id)
        
        # In a real app, this would delete the course from the database
        # For now, we'll simulate the deletion
        
        return JsonResponse({
            "success": True,
            "message": f"Course {course_id} deleted successfully"
        })
        
    except ValueError:
        return JsonResponse({
            "success": False,
            "error": "Invalid course ID",
            "message": "Course ID must be a valid integer"
        }, status=400)
    except Exception as e:
        return JsonResponse({
            "success": False,
            "error": str(e),
            "message": "Failed to delete course"
        }, status=500)

@csrf_exempt
@require_http_methods(["GET"])
def get_course_topics(request, course_name):
    """API endpoint to get topics for a specific course"""
    try:
        course_name = course_name.lower().replace('-', ' ')
        courses = get_student_courses()
        
        course = None
        for c in courses:
            if course_name in c["title"].lower():
                course = c
                break
        
        if course:
            return JsonResponse({
                "success": True,
                "data": course["topics"],
                "message": f"Topics for {course['title']} retrieved successfully"
            })
        else:
            return JsonResponse({
                "success": False,
                "error": "Course not found",
                "message": f"Course '{course_name}' not found"
            }, status=404)
            
    except Exception as e:
        return JsonResponse({
            "success": False,
            "error": str(e),
            "message": "Failed to retrieve course topics"
        }, status=500)
