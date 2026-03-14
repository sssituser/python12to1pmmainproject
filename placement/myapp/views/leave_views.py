from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from myapp.models import LeaveRequest
from myapp.serializers import LeaveRequestSerializer

# -----------------------------------------------------------
# LEAVE REQUEST FRONTEND PAGE
# -----------------------------------------------------------
@api_view(['GET'])
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
<input name="email" placeholder="Email">
<input name="student_id" placeholder="Student ID">
<input type="date" name="start_date" required>
<input type="date" name="end_date" required>
<select name="leave_type">
    <option value="Medical">Medical</option>
    <option value="Personal">Personal</option>
    <option value="Academic">Academic</option>
    <option value="Family">Family</option>
    <option value="Other">Other</option>
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
@api_view(['GET'])
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
@api_view(['GET'])
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
        serializer = LeaveRequestSerializer(data=request.data)
        print("Serializer created:", serializer)

        if serializer.is_valid():
            print("Serializer is valid")
            print("Validated data:", serializer.validated_data)
            leave = serializer.save()
            print("Leave saved:", leave)
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
@api_view(['GET'])
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
@api_view(['GET'])
@permission_classes([AllowAny])
def my_leave_requests(request):

    leaves = LeaveRequest.objects.all().order_by('-created_at')
    serializer = LeaveRequestSerializer(leaves, many=True)

    return Response({
        "success": True,
        "data": serializer.data,
        "count": leaves.count()
    })