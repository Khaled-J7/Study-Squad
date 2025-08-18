# backend/users/views.py
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.contrib.auth.models import User
from .models import Studio, Lesson
from .serializers import (
    StudioCardSerializer,
    LessonCardSerializer,
    TeacherCardSerializer,
)


# 🧠 This view is the "brain" of our search feature in the Explore Page
@api_view(["GET"])
def explore_view(request):
    """
    A single view to handle searching and filtering for the Explore page.
    """
    # Step 1: Get query parameters from the URL (eg: /api/explore/?type=studio&q=python)

    # `type=` to decide what to search for (studios, courses, or teachers)
    search_type = request.query_params.get(
        "type", "studio"
    )  # Default to searching for studios

    # `q=` is the main search query text
    query = request.query_params.get("q", "")

    # `tags=` a list of any tags the user wants to filter by
    tags = request.query_params.getlist("tags")  # Get a list of tags

    # Step 2: Decide Which Path to Take
    # .distinct() : ensures we avoid duplicates
    if search_type == "studio":
        queryset = Studio.objects.all()
        if query:
            queryset = queryset.filter(name__icontains=query)
        if tags:
            queryset = queryset.filter(tags__name__in=tags).distinct()
        serializer = StudioCardSerializer(queryset, many=True)

    elif search_type == "course":
        queryset = Lesson.objects.all()
        if query:
            queryset = queryset.filter(title__icontains=query)
        if tags:
            queryset = queryset.filter(tags__name__in=tags).distinct()
        serializer = LessonCardSerializer(queryset, many=True)

    elif search_type == "teacher":
        queryset = User.objects.filter(
            studio__isnull=False
        ).distinct()  # Only get users who have a studio
        if query:
            queryset = queryset.filter(username__icontains=query)
        serializer = TeacherCardSerializer(queryset, many=True)

    else:
        return Response({"error": "Invalid Search Type"}, status=400)

    return Response(serializer.data)
