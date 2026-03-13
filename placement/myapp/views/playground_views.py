from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from ..models import PythonQuestion, Choice
import json

@api_view(['GET'])
def get_questions(request):

    questions = PythonQuestion.objects.all()
    data = []
    for q in questions:
        choices = Choice.objects.filter(question=q)
        data.append({
            "id": q.id,
            "question": q.question_text,
            "difficulty": q.difficulty,
            "marks": q.marks,
            "choices": [
                {"id": c.id, "text": c.choice_text}
                for c in choices
            ]
        })
    return Response(data)


@api_view(['POST'])
def create_question(request):
    """Create a new Python question"""
    try:
        data = json.loads(request.body)
        question_text = data.get('question_text')
        question_type = data.get('question_type')
        difficulty = data.get('difficulty', 'medium')
        marks = data.get('marks', 1)
        
        if not all([question_text, question_type]):
            return Response({'error': 'question_text and question_type are required'}, status=status.HTTP_400_BAD_REQUEST)
        
        question = PythonQuestion.objects.create(
            question_text=question_text,
            question_type=question_type,
            difficulty=difficulty,
            marks=marks
        )
        
        # Add choices if it's a multiple choice question
        if question_type == 'multiple_choice' and 'choices' in data:
            for choice_data in data['choices']:
                Choice.objects.create(
                    question=question,
                    choice_text=choice_data['choice_text'],
                    is_correct=choice_data.get('is_correct', False)
                )
        
        return Response({
            'message': 'Question created successfully',
            'id': question.id
        }, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
