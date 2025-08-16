from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Studio
from .serializers import StudioSerializer


@api_view(["GET"])
def studio_list_view(request):
    """
    A view that returns a list of all studios
    """
    # 1. Get all Studios objects from the database
    studios = Studio.objects.all()

    # 2. Serialize the queryset (= Translate it to JSON)
    serializer = StudioSerializer(
        studios, many=True
    )  # `many=True` => serializing a list of objects

    # 3. Return the serialized data in a Response object
    return Response(serializer.data)