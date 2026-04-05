from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view
from rest_framework.response import Response
from ..models import ExamAttempt

@api_view(["GET"])
def report_detail_view(request, id):

    obj = get_object_or_404(ExamAttempt, id=id)

    data = {
        "id": obj.id,
        "name": obj.user.username,
        "score": obj.score,
        "total": obj.total_marks or 60,
        "exam": obj.exam_type,
        "date": obj.exam_date,
    }

    return Response(data)