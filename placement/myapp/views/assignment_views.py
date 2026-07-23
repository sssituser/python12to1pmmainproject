from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.utils import timezone
from myapp.models import Assignment, AssignmentSubmission, Batch, CourseEnrollment
from myapp.serializers import AssignmentSerializer, AssignmentSubmissionSerializer

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_assignments(request):
    """
    List assignments.
    Students see assignments for their enrolled batch.
    Faculty see assignments for their assigned batches.
    """
    user = request.user
    if user.role == 'student':
        # Get active enrollments to find batch
        enrollment = CourseEnrollment.objects.filter(student=user).first()
        if not enrollment or not enrollment.batch:
            return Response({"success": False, "message": "You are not enrolled in any batch."}, status=status.HTTP_400_BAD_REQUEST)
        assignments = Assignment.objects.filter(batch=enrollment.batch).order_by('-created_at')
        serializer = AssignmentSerializer(assignments, many=True)
        return Response({"success": True, "data": serializer.data})
        
    elif user.role == 'faculty':
        batch_id = request.GET.get('batch_id')
        if batch_id:
            assignments = Assignment.objects.filter(batch_id=batch_id).order_by('-created_at')
        else:
            assignments = Assignment.objects.filter(faculty=user).order_by('-created_at')
        serializer = AssignmentSerializer(assignments, many=True)
        return Response({"success": True, "data": serializer.data})
        
    return Response({"success": False, "message": "Unauthorized role."}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_assignment(request):
    """
    Create assignment (Faculty only)
    """
    if request.user.role != 'faculty':
        return Response({"success": False, "message": "Only faculty can create assignments."}, status=status.HTTP_403_FORBIDDEN)
        
    batch_id = request.data.get('batch')
    title = request.data.get('title')
    description = request.data.get('description', '')
    file_url = request.data.get('file_url', '')
    due_date = request.data.get('due_date')
    
    if not batch_id or not title or not due_date:
        return Response({"success": False, "message": "Batch, title, and due_date are required fields."}, status=status.HTTP_400_BAD_REQUEST)
        
    batch = get_object_or_404(Batch, id=batch_id)
    assignment = Assignment.objects.create(
        batch=batch,
        faculty=request.user,
        title=title,
        description=description,
        file_url=file_url,
        due_date=due_date
    )
    
    serializer = AssignmentSerializer(assignment)
    return Response({"success": True, "data": serializer.data}, status=status.HTTP_201_CREATED)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def submit_assignment(request):
    """
    Submit assignment (Student only)
    """
    if request.user.role != 'student':
        return Response({"success": False, "message": "Only students can submit assignments."}, status=status.HTTP_403_FORBIDDEN)
        
    assignment_id = request.data.get('assignment')
    submitted_file_url = request.data.get('submitted_file_url')
    
    if not assignment_id or not submitted_file_url:
        return Response({"success": False, "message": "assignment and submitted_file_url are required."}, status=status.HTTP_400_BAD_REQUEST)
        
    assignment = get_object_or_404(Assignment, id=assignment_id)
    
    # Check if student already submitted
    submission, created = AssignmentSubmission.objects.update_or_create(
        assignment=assignment,
        student=request.user,
        defaults={
            "submitted_file_url": submitted_file_url,
            "submitted_at": timezone.now()
        }
    )
    
    serializer = AssignmentSubmissionSerializer(submission)
    return Response({"success": True, "data": serializer.data, "created": created})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def evaluate_submission(request):
    """
    Grade and feedback on a submission (Faculty only)
    """
    if request.user.role != 'faculty':
        return Response({"success": False, "message": "Only faculty can grade assignments."}, status=status.HTTP_403_FORBIDDEN)
        
    submission_id = request.data.get('submission_id')
    grade = request.data.get('grade')
    feedback = request.data.get('feedback', '')
    
    if not submission_id or grade is None:
        return Response({"success": False, "message": "submission_id and grade are required."}, status=status.HTTP_400_BAD_REQUEST)
        
    submission = get_object_or_404(AssignmentSubmission, id=submission_id)
    submission.grade = grade
    submission.feedback = feedback
    submission.evaluated_by = request.user
    submission.save()
    
    serializer = AssignmentSubmissionSerializer(submission)
    return Response({"success": True, "data": serializer.data})
