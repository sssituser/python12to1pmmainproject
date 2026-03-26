from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
import json
from datetime import datetime

# Course data for students
def get_student_courses():
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

@csrf_exempt
@require_http_methods(["GET"])
def student_courses(request):
    """API endpoint for student courses"""
    try:
        courses = get_student_courses()
        return JsonResponse({
            "success": True,
            "data": courses,
            "message": "Student courses retrieved successfully"
        })
    except Exception as e:
        return JsonResponse({
            "success": False,
            "error": str(e),
            "message": "Failed to retrieve student courses"
        }, status=500)

@csrf_exempt
@require_http_methods(["GET"])
def faculty_courses(request):
    """API endpoint for faculty courses"""
    try:
        courses = get_faculty_courses()
        return JsonResponse({
            "success": True,
            "data": courses,
            "message": "Faculty courses retrieved successfully"
        })
    except Exception as e:
        return JsonResponse({
            "success": False,
            "error": str(e),
            "message": "Failed to retrieve faculty courses"
        }, status=500)

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