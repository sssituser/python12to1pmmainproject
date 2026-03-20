from rest_framework.decorators import api_view
from rest_framework.response import Response
from ..models import ExamAttempt

@api_view(["GET"])
def report_detail_view(request, id):

    try:
        obj = ExamAttempt.objects.get(id=id)

        data = {
            "id": obj.id,
            "name": obj.student_name,
            "score": obj.score,
            "total": 30,
            "exam": obj.exam_type,
            "date": obj.date,
        }

        return Response(data)

    except ExamAttempt.DoesNotExist:
        return Response({"error": "Not found"}, status=404)