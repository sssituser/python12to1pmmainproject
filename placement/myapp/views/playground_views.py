from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

from myapp.models import Playground
from myapp.serializers import PlaygroundSerializer


# GET ALL PLAYGROUNDS
@api_view(['GET'])
def get_playgrounds(request):

    playgrounds = Playground.objects.all()
    serializer = PlaygroundSerializer(playgrounds, many=True)

    return Response(serializer.data)


# CREATE PLAYGROUND
@api_view(['POST'])
def create_playground(request):

    serializer = PlaygroundSerializer(data=request.data)

    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# GET SINGLE PLAYGROUND
@api_view(['GET'])
def get_playground(request, pk):

    try:
        playground = Playground.objects.get(id=pk)
    except Playground.DoesNotExist:
        return Response({"error": "Not found"}, status=404)

    serializer = PlaygroundSerializer(playground)

    return Response(serializer.data)


# DELETE PLAYGROUND
@api_view(['DELETE'])
def delete_playground(request, pk):

    try:
        playground = Playground.objects.get(id=pk)
    except Playground.DoesNotExist:
        return Response({"error": "Not found"}, status=404)

    playground.delete()

    return Response({"message": "Deleted successfully"})