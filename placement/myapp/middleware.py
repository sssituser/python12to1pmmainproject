from django.http import JsonResponse
import traceback
import logging
from django.conf import settings

logger = logging.getLogger(__name__)

class ExceptionMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        try:
            response = self.get_response(request)
            return response
        except Exception as e:
            return self.process_exception(request, e)

    def process_exception(self, request, exception):
        # Log the exception for debugging
        logger.error(f"Unhandled exception at {request.path}: {str(exception)}")
        logger.error(traceback.format_exc())

        # Determine if we should include the trace (only in DEBUG mode)
        error_data = {
            'success': False,
            'error': str(exception)
        }
        
        if settings.DEBUG:
            error_data['trace'] = traceback.format_exc()

        # Return a standardized error response
        return JsonResponse(error_data, status=500)
