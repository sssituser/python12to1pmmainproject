from rest_framework import status
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.shortcuts import get_object_or_404

from ..models import Batch, BatchResource, CourseEnrollment
from ..serializers import BatchResourceSerializer

@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def list_batch_resources(request, batch_id):
    """
    List resources (videos, materials) for a specific batch.
    Access Control:
    - Students: Allowed ONLY if they are enrolled in the requested batch.
    - Faculty/Admin: Full access.
    """
    user = request.user
    batch = get_object_or_404(Batch, id=batch_id)

    # Access Verification for Students
    if user.role == 'student':
        is_enrolled = CourseEnrollment.objects.filter(user=user, batch=batch).exists()
        if not is_enrolled:
            return Response(
                {"detail": "Access Denied: You are not enrolled in this batch."},
                status=status.HTTP_403_FORBIDDEN
            )

    resources = BatchResource.objects.filter(batch=batch, is_active=True).order_by('-uploaded_at')
    serializer = BatchResourceSerializer(resources, many=True)
    return Response({
        "success": True,
        "data": serializer.data
    })

@api_view(['POST'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def create_batch_resource(request):
    """
    Upload or link a video/material to a specific batch.
    Access Control: Faculty and Admin only.
    """
    user = request.user
    if user.role not in ['admin', 'faculty']:
        return Response(
            {"detail": "Access Denied: Only Admins or Faculty can upload resources."},
            status=status.HTTP_403_FORBIDDEN
        )

    serializer = BatchResourceSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response({
            "success": True,
            "data": serializer.data,
            "message": "Resource added to batch successfully."
        }, status=status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['DELETE'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def delete_batch_resource(request, resource_id):
    """
    Remove a batch resource.
    Access Control: Faculty and Admin only.
    """
    user = request.user
    if user.role not in ['admin', 'faculty']:
        return Response(
            {"detail": "Access Denied: Only Admins or Faculty can delete resources."},
            status=status.HTTP_403_FORBIDDEN
        )

    resource = get_object_or_404(BatchResource, id=resource_id)
    resource.delete()
    return Response({
        "success": True,
        "message": "Resource deleted successfully."
    })
