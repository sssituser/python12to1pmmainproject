from django.shortcuts import get_object_or_404
from django.conf import settings
from django.core.mail import get_connection, EmailMessage
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from myapp.models import EmailConfiguration, LeaveRequest
from myapp.serializers import LeaveRequestSerializer


def _leave_details_text(leave):
    details = [
        f"Name: {leave.name}",
        f"Email: {leave.email or 'Not provided'}",
        f"Student ID: {leave.student_id}",
        f"Phone: {leave.phone or 'Not provided'}",
        f"Leave Type: {leave.leave_type}",
        f"Start Date: {leave.start_date}",
        f"End Date: {leave.end_date}",
        f"Reason: {leave.reason}",
        f"Status: {leave.status}",
        f"Approved By: {leave.approved_by or 'Pending'}",
    ]
    return "\n".join(details)


def _send_leave_email(leave, subject, intro_message):
    recipient = (leave.email or "").strip()
    email_enabled = getattr(settings, "LEAVE_EMAIL_ENABLED", True)

    if not email_enabled:
        return {"sent": False, "reason": "Leave email notifications are disabled in settings."}

    if not recipient:
        return {"sent": False, "reason": "Recipient email is empty."}

    body = (
        f"Hello {leave.name},\n\n"
        f"{intro_message}\n\n"
        f"Leave Request Details:\n"
        f"{_leave_details_text(leave)}\n\n"
        f"Thanks\n"
        f"From - SSSIT"
    )

    try:
        email_config = EmailConfiguration.objects.filter(is_active=True).order_by('-updated_at').first()

        if email_config:
            sender = email_config.default_from_email or email_config.email_host_user
            connection = get_connection(
                backend='django.core.mail.backends.smtp.EmailBackend',
                host=email_config.email_host,
                port=email_config.email_port,
                username=email_config.email_host_user,
                password=email_config.email_host_password,
                use_tls=email_config.email_use_tls,
                use_ssl=email_config.email_use_ssl,
                timeout=getattr(settings, "EMAIL_TIMEOUT", 30),
            )
        else:
            sender = getattr(settings, "DEFAULT_FROM_EMAIL", "") or getattr(settings, "EMAIL_HOST_USER", "")
            if not sender:
                print(f"Email skipped for leave {leave.id}: sender email is not configured.")
                return {"sent": False, "reason": "Sender email is not configured."}
            connection = get_connection(timeout=getattr(settings, "EMAIL_TIMEOUT", 30))

        message = EmailMessage(
            subject=subject,
            body=body,
            from_email=sender,
            to=[recipient],
            connection=connection,
        )
        sent_count = message.send(fail_silently=False)
        print(
            f"Leave email status for leave {leave.id}: sent={bool(sent_count)}, "
            f"subject='{subject}', to='{recipient}', from='{sender}'"
        )
        return {"sent": bool(sent_count), "reason": "Email sent successfully." if sent_count else "No email was sent."}
    except Exception as exc:
        print(f"Email sending failed for leave {leave.id}: {exc}")
        return {"sent": False, "reason": str(exc)}

# -----------------------------------------------------------
# LEAVE REQUEST FRONTEND PAGE
# -----------------------------------------------------------
@api_view(['GET','PUT'])
@permission_classes([AllowAny])
def leave_request_page(request):
    html = """
<!DOCTYPE html>
<html>
<head>
    <title>Leave Management</title>
    <style>
        body { font-family: Arial; background:#f4f6f8; padding:40px; }
        .container { display:flex; gap:40px; }
        form { background:white; padding:20px; width:350px; border-radius:8px; box-shadow:0 0 10px rgba(0,0,0,0.1); }
        input,textarea,select { width:100%; padding:8px; margin-bottom:10px; }
        button { padding:8px 12px; border:none; cursor:pointer; }
        .submit { background:#007bff; color:white; }
        .leave-card { background:white; padding:15px; margin-bottom:10px; border-radius:6px; box-shadow:0 0 5px rgba(0,0,0,0.1); }
        .approve { background:green; color:white; margin-right:5px; }
        .reject { background:red; color:white; }
    </style>
</head>
<body>

<h1>Leave Management System</h1>

<div class="container">

<!-- Leave Form -->
<form id="leaveForm">
<h3>Submit Leave</h3>
<input name="name" placeholder="Name" required>
<input name="email" placeholder="Email" type="email" required>
<input name="student_id" placeholder="Student ID">
<input type="date" name="start_date" required>
<input type="date" name="end_date" required>
<select name="leave_type">
    <option value="SL">Sick Leave / Medical Leave</option>
    <option value="CL">Casual Leave</option>
    <option value="EL">Earned Leave / Privilege Leave</option>
    <option value="PTO">Paid Time Off</option>
    <option value="ML">Maternity Leave</option>
    <option value="PL">Paternity Leave</option>
    <option value="BL">Bereavement Leave</option>
    <option value="CO">Compensatory Off</option>
    <option value="PH">Public Holidays</option>
    <option value="LWP">Loss of Pay / Leave Without Pay</option>
    <option value="WFH">Work From Home / Remote Leave</option>
    <option value="SAB">Sabbatical Leave</option>
    <option value="MRL">Marriage Leave</option>
    <option value="STL">Study / Examination Leave</option>
</select>
<textarea name="reason" placeholder="Reason"></textarea>
<button class="submit" type="submit">Submit</button>
</form>

<!-- Leave List -->
<div>
<h3>Leave Requests</h3>
<div id="leaveList"></div>
</div>

</div>

<script>
// LOAD LEAVES
function loadLeaves(){
    fetch("/api/leave-requests/")
    .then(res=>res.json())
    .then(data=>{
        const container = document.getElementById("leaveList");
        container.innerHTML="";
        data.data.forEach(leave=>{
            const card = document.createElement("div");
            card.className="leave-card";
            card.innerHTML = `
<b>${leave.name}</b><br>
Type: ${leave.leave_type}<br>
Reason: ${leave.reason}<br>
Status: ${leave.status}<br><br>
<button class="approve" onclick="approveLeave(${leave.id})">Approve</button>
<button class="reject" onclick="rejectLeave(${leave.id})">Reject</button>
`;
            container.appendChild(card);
        });
    });
}

// SUBMIT LEAVE
document.getElementById("leaveForm").addEventListener("submit",function(e){
    e.preventDefault();
    const data = Object.fromEntries(new FormData(this));
    fetch("/api/leave-requests/create/",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify(data)
    })
    .then(res=>res.json())
    .then(data=>{
        alert("Leave submitted successfully");
        loadLeaves();
    });
});

// APPROVE LEAVE
function approveLeave(id){
    fetch(`/api/leave-requests/${id}/approve/`,{ method:"PUT" })
    .then(()=>loadLeaves());
}

// REJECT LEAVE
function rejectLeave(id){
    fetch(`/api/leave-requests/${id}/reject/`,{ method:"PUT" })
    .then(()=>loadLeaves());
}

// LOAD DATA WHEN PAGE OPENS
loadLeaves();
</script>

</body>
</html>
    """
    return Response(html)


# -----------------------------------------------------------
# TEST ENDPOINT
# -----------------------------------------------------------
@api_view(['GET','PUT'])
@permission_classes([AllowAny])
def test_endpoint(request):
    """Simple test endpoint to check if server is working"""
    return Response({
        "message": "Server is working!",
        "method": request.method,
        "data_received": request.data
    })


# -----------------------------------------------------------
# GET ALL LEAVES
# -----------------------------------------------------------
@api_view(['GET','PUT'])
@permission_classes([AllowAny])
def get_all_leave_requests(request):

    leaves = LeaveRequest.objects.all().order_by('-created_at')

    serializer = LeaveRequestSerializer(leaves, many=True)

    return Response({
        "success": True,
        "data": serializer.data,
        "count": leaves.count()
    })


# -----------------------------------------------------------
# CREATE LEAVE
# -----------------------------------------------------------
@api_view(['POST'])
@permission_classes([AllowAny])
def create_leave_request(request):

    print("=== LEAVE REQUEST DEBUG ===")
    print("Received data:", request.data)
    print("Request method:", request.method)
    print("Request headers:", request.headers)
    print("Content type:", request.content_type)
    
    try:
        if not request.data.get("email"):
            return Response({
                "success": False,
                "errors": {"email": ["Email is required to send leave notifications."]}
            }, status=status.HTTP_400_BAD_REQUEST)

        serializer = LeaveRequestSerializer(data=request.data)
        print("Serializer created:", serializer)

        if serializer.is_valid():
            print("Serializer is valid")
            print("Validated data:", serializer.validated_data)
            leave = serializer.save()
            print("Leave saved:", leave)
            email_result = _send_leave_email(
                leave,
                subject="Leave Request Submitted Successfully",
                intro_message=(
                    "You have submitted your leave request successfully and the status is still pending. "
                    "We will update you soon."
                ),
            )
            print(f"Leave submission email result for leave {leave.id}: {email_result}")
            return Response({
                "success": True,
                "message": "Leave request created successfully",
                "data": LeaveRequestSerializer(leave).data
            }, status=status.HTTP_201_CREATED)
        else:
            print("Serializer errors:", serializer.errors)
            return Response({
                "success": False,
                "errors": serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        print("Exception occurred:", str(e))
        print("Exception type:", type(e))
        import traceback
        print("Traceback:", traceback.format_exc())
        return Response({
            "success": False,
            "error": str(e),
            "message": "Server error occurred"
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# -----------------------------------------------------------
# GET SINGLE LEAVE
# -----------------------------------------------------------
@api_view(['GET','PUT'])
@permission_classes([AllowAny])
def get_leave_request(request, pk):

    try:
        leave = LeaveRequest.objects.get(id=pk)
        serializer = LeaveRequestSerializer(leave)
        return Response({
            "success": True,
            "data": serializer.data
        })
    except LeaveRequest.DoesNotExist:
        return Response({
            "success": False,
            "message": "Leave request not found"
        }, status=status.HTTP_404_NOT_FOUND)


# -----------------------------------------------------------
# APPROVE LEAVE
# -----------------------------------------------------------
@api_view(['PUT'])
@permission_classes([AllowAny])
def approve_leave_request(request, pk):

    try:
        leave = LeaveRequest.objects.get(id=pk)
        leave.status = "Approved"
        leave.approved_by = request.data.get("approved_by", "System")
        leave.save()
        email_result = _send_leave_email(
            leave,
            subject="Your leave got approved",
            intro_message="Your leave got approved.",
        )
        print(f"Leave approval email result for leave {leave.id}: {email_result}")
        
        return Response({
            "success": True,
            "message": "Leave approved successfully",
            "data": LeaveRequestSerializer(leave).data
        })
    except LeaveRequest.DoesNotExist:
        return Response({
            "success": False,
            "message": "Leave request not found"
        }, status=status.HTTP_404_NOT_FOUND)


# -----------------------------------------------------------
# REJECT LEAVE
# -----------------------------------------------------------
@api_view(['PUT'])
@permission_classes([AllowAny])
def reject_leave_request(request, pk):

    try:
        leave = LeaveRequest.objects.get(id=pk)
        leave.status = "Rejected"
        leave.approved_by = request.data.get("approved_by", "System")
        leave.save()
        email_result = _send_leave_email(
            leave,
            subject="Your leave got rejected",
            intro_message="Your leave got rejected.",
        )
        print(f"Leave rejection email result for leave {leave.id}: {email_result}")
        
        return Response({
            "success": True,
            "message": "Leave rejected successfully",
            "data": LeaveRequestSerializer(leave).data
        })
    except LeaveRequest.DoesNotExist:
        return Response({
            "success": False,
            "message": "Leave request not found"
        }, status=status.HTTP_404_NOT_FOUND)


# -----------------------------------------------------------
# DELETE LEAVE
# -----------------------------------------------------------
@api_view(['DELETE'])
@permission_classes([AllowAny])
def delete_leave_request(request, pk):

    try:
        leave = LeaveRequest.objects.get(id=pk)
        leave.delete()
        
        return Response({
            "success": True,
            "message": "Leave request deleted successfully"
        })
    except LeaveRequest.DoesNotExist:
        return Response({
            "success": False,
            "message": "Leave request not found"
        }, status=status.HTTP_404_NOT_FOUND)


# -----------------------------------------------------------
# MY LEAVE REQUESTS
# -----------------------------------------------------------
@api_view(['GET','PUT'])
@permission_classes([AllowAny])
def my_leave_requests(request):

    leaves = LeaveRequest.objects.all().order_by('-created_at')
    serializer = LeaveRequestSerializer(leaves, many=True)

    return Response({
        "success": True,
        "data": serializer.data,
        "count": leaves.count()
    })
