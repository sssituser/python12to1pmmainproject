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

from myapp.models import Course, CourseTopic, CourseEnrollment, StudentTopicProgress
from myapp.serializers import (
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
    queryset = Course.objects.all().order_by('id')
    permission_classes = [AllowAny]

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return CourseCreateUpdateSerializer
        request = self.request
        if request.user and request.user.is_authenticated and (request.user.is_staff or request.user.is_superuser):
            return CourseFacultySerializer
        return CourseStudentSerializer

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [IsAuthenticated]
        else:
            permission_classes = [AllowAny]
        return [permission() for permission in permission_classes]

# ===============================
# LIVE DATABASE API ENDPOINTS
# ===============================

@api_view(["GET"])
def student_courses(request):
    """API endpoint for student courses - Live DB Mirror"""
    try:
        courses = Course.objects.all().order_by('id')
        serializer = CourseStudentSerializer(courses, many=True)
        return Response({
            "success": True,
            "data": serializer.data,
            "message": "Student courses retrieved successfully"
        })
    except Exception as e:
        return Response({"success": False, "error": str(e)}, status=500)

@api_view(["GET"])
def faculty_courses(request):
    """API endpoint for faculty courses - Live DB Mirror"""
    try:
        courses = Course.objects.all().order_by('id')
        serializer = CourseFacultySerializer(courses, many=True)
        return Response({
            "success": True,
            "data": serializer.data,
            "message": "Faculty courses retrieved successfully"
        })
    except Exception as e:
        return Response({"success": False, "error": str(e)}, status=500)

@csrf_exempt
@require_http_methods(["GET"])
def get_course_details(request, course_id):
    """API endpoint to get specific course details"""
    try:
        course = Course.objects.filter(id=course_id).first()
        if course:
            serializer = CourseStudentSerializer(course)
            return JsonResponse({"success": True, "data": serializer.data})
        return JsonResponse({"success": False, "error": "Course not found"}, status=404)
    except Exception as e:
        return JsonResponse({"success": False, "error": str(e)}, status=500)

@csrf_exempt
@require_http_methods(["POST"])
def create_course(request):
    """API endpoint for faculty to create new courses - Saves to DB"""
    try:
        data = json.loads(request.body)
        course = Course.objects.create(
            title=data.get("title"),
            level=data.get("level", "Beginner"),
            duration=data.get("duration", "0"),
            modules=data.get("modules", []),
            topics=data.get("topics", [])
        )
        return JsonResponse({"success": True, "data": {"id": course.id}, "message": "Course created successfully"})
    except Exception as e:
        return JsonResponse({"success": False, "error": str(e)}, status=500)

@csrf_exempt
@require_http_methods(["PUT"])
def update_course(request, course_id):
    """API endpoint for faculty to update existing courses - Saves to DB"""
    try:
        data = json.loads(request.body)
        Course.objects.filter(id=course_id).update(
            title=data.get("title"),
            level=data.get("level"),
            duration=data.get("duration"),
            modules=data.get("modules"),
            topics=data.get("topics")
        )
        return JsonResponse({"success": True, "message": "Course updated successfully"})
    except Exception as e:
        return JsonResponse({"success": False, "error": str(e)}, status=500)

@csrf_exempt
@require_http_methods(["DELETE"])
def delete_course(request, course_id):
    """API endpoint for faculty to delete courses - Deletes from DB"""
    try:
        Course.objects.filter(id=course_id).delete()
        return JsonResponse({"success": True, "message": "Course deleted successfully"})
    except Exception as e:
        return JsonResponse({"success": False, "error": str(e)}, status=500)

@csrf_exempt
@require_http_methods(["GET"])
def get_course_topics(request, course_name):
    """API endpoint to get topics for a specific course - Live DB lookup"""
    try:
        # Search by title
        course = Course.objects.filter(title__icontains=course_name).first()
        if course:
            return JsonResponse({
                "success": True, 
                "data": course.modules if (course.modules and len(course.modules) > 0) else course.topics,
                "message": "Topics retrieved successfully"
            })
        return JsonResponse({"success": False, "error": "Course not found"}, status=404)
    except Exception as e:
        return JsonResponse({"success": False, "error": str(e)}, status=500)
