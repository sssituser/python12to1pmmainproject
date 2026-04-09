import traceback
import logging
import json
from django.conf import settings
from django.http import JsonResponse
from django.utils.deprecation import MiddlewareMixin
from rest_framework.response import Response
from rest_framework import status

logger = logging.getLogger(__name__)

class ExceptionMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        try:
            response = self.get_response(request)
            return response
        except Exception as e:
            return self.handle_exception(request, e)

    def handle_exception(self, request, exception):
        # Log the exception with traceback for debugging
        logger.error(f"Global Exception Handler: Unhandled exception at {request.method} {request.path}: {str(exception)}")
        logger.error(traceback.format_exc())

        # Standardized Error Format for the entire application
        error_data = {
            'success': False,
            'error': str(exception)
        }
        
        # Include trace ONLY if DEBUG is True to avoid leaking sensitive info in production
        if settings.DEBUG:
            error_data['trace'] = traceback.format_exc().split('\n')[-3:] # Last few lines for context
            error_data['full_trace'] = traceback.format_exc()

        # Return a standardized JSON response with 500 status code
        return JsonResponse(error_data, status=500)

class APIResponseMiddleware(MiddlewareMixin):
    """
    Middleware to handle API responses and errors consistently
    without using try-except blocks in views
    """
    
    def process_request(self, request):
        """Add request metadata for logging"""
        request.start_time = getattr(self, 'get_current_time', lambda: None)()
        return None
    
    def process_response(self, request, response):
        """Add response headers and logging"""
        if hasattr(response, 'status_code'):
            logger.info(f"Request: {request.method} {request.path} - Status: {response.status_code}")
        return response
    
    def process_exception(self, request, exception):
        """
        Handle exceptions globally instead of try-except blocks
        """
        logger.error(f"Exception in {request.method} {request.path}: {str(exception)}")
        
        # Return standardized error response
        return JsonResponse({
            "success": False,
            "error": str(exception),
            "message": "An error occurred during processing"
        }, status=500)

class CourseValidationMiddleware(MiddlewareMixin):
    """
    Middleware for course-related validation and error handling
    """
    
    def process_request(self, request):
        """Validate course-related requests"""
        if '/api/courses/' in request.path:
            # Add course context to request
            request.is_course_api = True
            
            # Validate course ID for specific endpoints
            if request.path.count('/') >= 4 and request.path.split('/')[-2].isdigit():
                try:
                    request.course_id = int(request.path.split('/')[-2])
                except ValueError:
                    return JsonResponse({
                        "success": False,
                        "error": "Invalid course ID format",
                        "message": "Course ID must be a valid integer"
                    }, status=400)
        
        return None

class LeaveValidationMiddleware(MiddlewareMixin):
    """
    Middleware for leave-related validation and error handling
    """
    
    def process_request(self, request):
        """Validate leave-related requests"""
        if '/api/leave-requests/' in request.path:
            # Add leave context to request
            request.is_leave_api = True
            
            # Validate leave ID for specific endpoints
            path_parts = request.path.strip('/').split('/')
            if len(path_parts) >= 3 and path_parts[2].isdigit():
                try:
                    request.leave_id = int(path_parts[2])
                except ValueError:
                    return JsonResponse({
                        "success": False,
                        "error": "Invalid leave ID format",
                        "message": "Leave ID must be a valid integer"
                    }, status=400)
            
            # Validate JSON for POST/PUT requests
            if request.method in ['POST', 'PUT'] and request.content_type == 'application/json':
                try:
                    if not request.body:
                        return JsonResponse({
                            "success": False,
                            "error": "Empty request body",
                            "message": "Request body cannot be empty"
                        }, status=400)
                    
                    # Validate JSON format
                    json.loads(request.body)
                except json.JSONDecodeError:
                    return JsonResponse({
                        "success": False,
                        "error": "Invalid JSON format",
                        "message": "Please provide valid JSON data"
                    }, status=400)
        
        return None

class AuthenticationMiddleware(MiddlewareMixin):
    """
    Middleware to handle authentication for API endpoints
    """
    
    def process_request(self, request):
        """Check authentication for protected endpoints"""
        # Skip authentication for public endpoints
        public_endpoints = [
            '/api/student/courses/',
            '/api/faculty/courses/',
            '/api/courses/',
            '/api/leave-requests/'
        ]
        
        if any(endpoint in request.path for endpoint in public_endpoints):
            # For now, allow all requests (can be enhanced with real auth)
            request.user_authenticated = True
            request.user_role = self.get_user_role(request)
        
        return None
    
    def get_user_role(self, request):
        """Determine user role from request headers or token"""
        # This is a placeholder - implement real authentication logic
        user_agent = request.META.get('HTTP_USER_AGENT', '').lower()
        
        if 'faculty' in user_agent or 'faculty' in request.path:
            return 'faculty'
        elif 'student' in user_agent or 'student' in request.path:
            return 'student'
        else:
            return 'guest'

class LoggingMiddleware(MiddlewareMixin):
    """
    Middleware for comprehensive logging
    """
    
    def process_request(self, request):
        """Log incoming requests"""
        logger.info(f"Incoming request: {request.method} {request.path}")
        return None
    
    def process_response(self, request, response):
        """Log outgoing responses"""
        logger.info(f"Response: {request.method} {request.path} - {getattr(response, 'status_code', 'N/A')}")
        return None
