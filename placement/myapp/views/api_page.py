from django.shortcuts import render
from django.http import HttpResponse
from django.template import loader
from rest_framework.decorators import api_view
from rest_framework.response import Response
from ..models import LeaveRequest
from ..serializers import LeaveRequestSerializer
import json

@api_view(['GET'])
def leave_requests_api_page(request):
    """
    Pure Django REST Framework page for leave requests API
    """
    # Get statistics for the page
    total_requests = LeaveRequest.objects.count()
    pending_requests = LeaveRequest.objects.filter(status='Pending').count()
    approved_requests = LeaveRequest.objects.filter(status='Approved').count()
    rejected_requests = LeaveRequest.objects.filter(status='Rejected').count()
    
    # Get all requests for display
    all_requests = LeaveRequest.objects.all().order_by('-created_at')
    serializer = LeaveRequestSerializer(all_requests, many=True)
    
    context = {
        'total_requests': total_requests,
        'pending_requests': pending_requests,
        'approved_requests': approved_requests,
        'rejected_requests': rejected_requests,
        'all_requests_data': json.dumps(serializer.data, indent=2)
    }
    
    template = loader.get_template('leave_requests_api.html')
    return HttpResponse(template.render(context, request))
