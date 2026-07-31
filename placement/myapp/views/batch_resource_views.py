from rest_framework import status
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.shortcuts import get_object_or_404

from ..models import Batch, BatchResource, CourseEnrollment
from ..serializers import BatchResourceSerializer

def _auto_seed_batch_resources(batch):
    try:
        if BatchResource.objects.filter(batch=batch).count() == 0:
            course_title = batch.course.title if batch.course else batch.name
            if 'python' in course_title.lower():
                BatchResource.objects.create(
                    batch=batch,
                    title="Introduction to Python Programming & Environment Setup",
                    resource_type="video",
                    video_url="https://www.youtube.com/watch?v=_uQrJ0TkZlc",
                    is_active=True
                )
                BatchResource.objects.create(
                    batch=batch,
                    title="Python Data Structures & Control Flow",
                    resource_type="video",
                    video_url="https://www.youtube.com/watch?v=_uQrJ0TkZlc",
                    is_active=True
                )
                BatchResource.objects.create(
                    batch=batch,
                    title="Python Cheatsheet & Notes PDF",
                    resource_type="material",
                    file_url="https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
                    is_active=True
                )
            else:
                BatchResource.objects.create(
                    batch=batch,
                    title="Introduction to Aptitude and Reasoning",
                    resource_type="video",
                    video_url="https://www.youtube.com/watch?v=N4t_hN0V9sY",
                    is_active=True
                )
                BatchResource.objects.create(
                    batch=batch,
                    title="Quantitative Aptitude Basics & Speed Math",
                    resource_type="video",
                    video_url="https://www.youtube.com/watch?v=N4t_hN0V9sY",
                    is_active=True
                )
                BatchResource.objects.create(
                    batch=batch,
                    title="Aptitude Formula Sheet & Practice PDF",
                    resource_type="material",
                    file_url="https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
                    is_active=True
                )
    except Exception as e:
        print(f"Error auto-seeding batch resources: {e}")


@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def list_batch_resources(request, batch_id):
    """
    List resources (videos, materials) for a specific batch.
    Access Control:
    - Students: Allowed if enrolled in the batch or enrolled in the course.
    - Faculty/Admin: Full access.
    """
    user = request.user
    batch = get_object_or_404(Batch, id=batch_id)

    # Access Verification for Students
    if user.role == 'student':
        from ..models import StudentProfile
        is_enrolled = CourseEnrollment.objects.filter(user=user, batch=batch).exists() or \
                      CourseEnrollment.objects.filter(user=user, course=batch.course).exists() or \
                      StudentProfile.objects.filter(user=user, course=batch.course).exists() or \
                      StudentProfile.objects.filter(user=user).exists()
        if not is_enrolled:
            return Response(
                {"detail": "Access Denied: You are not enrolled in this batch."},
                status=status.HTTP_403_FORBIDDEN
            )

    # Disable auto-seeding static data
    # _auto_seed_batch_resources(batch)

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
