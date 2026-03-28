from rest_framework.decorators import api_view
from rest_framework.response import Response
from ..models import ExamAttempt

@api_view(["GET"])
def examleaderboard_view(request):

    date = request.GET.get("date")
    batch = request.GET.get("batch")
    exam_type = request.GET.get("examType")
    queryset = ExamAttempt.objects.all()

    # 🔥 FILTERS
    if date:
        queryset = queryset.filter(exam_date__date=date)

    # Batch is ignored since neither `ExamAttempt` nor related `User` has `batch` field

    if exam_type:
        queryset = queryset.filter(exam_title__icontains=exam_type)

    # 🔥 SORTING (IMPORTANT)
    queryset = queryset.order_by("-score", "time_taken")

    # 🔥 RANKING
    data = []
    rank = 1

    for obj in queryset:
        data.append({
            "rank": rank,
            "name": obj.user.username if obj.user else "Unknown",
            "score": obj.score,
            "time": f"{obj.time_taken}s"
        })
        rank += 1

    return Response(data)
