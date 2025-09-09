# backend/users/views.py
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth.models import User, Group
from .models import Studio, Lesson, Profile, Degree
from .serializers import (
    ProfileUpdateSerializer,
    StudioCardSerializer,
    LessonCardSerializer,
    TeacherCardSerializer,
    UserRegisterSerializer,
    CurrentUserSerializer,
    StudioCreateSerializer,
)


# 🧠 This view is the "brain" of our Search&Filter features in the Explore Page
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


# --- Authentication Views ---


@api_view(["POST"])
def register_view(request):
    """
    Handles new user registration.
    """

    # Pass the incoming request data to our registration serializer.
    serializer = UserRegisterSerializer(data=request.data)
    # Check if the data is valid (e.g., passwords match, username isn't taken).
    if serializer.is_valid():
        user = (
            serializer.save()
        )  # The .save() method calls our custom .create() method.
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def logout_view(request):
    """
    A placeholder endpoint for logging out.
    With JWT, logout is handled on the frontend by deleting the token.
    This endpoint is a good practice to have for future blacklist features.
    """
    return Response({"detail": "Successfully logged out."}, status=status.HTTP_200_OK)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def current_user_view(request):
    """
    Gets the details of the currently logged-in user.
    """
    # The fix is to pass request.user, not request.data
    serializer = CurrentUserSerializer(request.user)
    return Response(serializer.data)


# --- NEW: Profile and Security Views ---
@api_view(["PUT"])
@permission_classes([IsAuthenticated])
def profile_update_view(request):
    """
    Handles updating the user's profile information.
    This includes their name, "About Me", contact email, and profile picture.
    """
    try:
        # We get the user's profile based on the authenticated user making the request.
        profile = request.user.profile
    except Profile.DoesNotExist:
        return Response(
            {"error": "Profile not found."}, status=status.HTTP_404_NOT_FOUND
        )

    # We pass the existing profile instance and the new data to our serializer.
    # The 'partial=True' allows for partial updates (e.g., only updating the 'about_me' field).
    # We are passing the 'request' context to the serializer so it can access the user for validation.
    serializer = ProfileUpdateSerializer(
        instance=profile, data=request.data, partial=True, context={"request": request}
    )

    if serializer.is_valid():
        # If the data is valid, the serializer's .update() method will handle saving everything.
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)

    # If the data is not valid, we return the errors.
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# --- NEW VIEW FOR CREATING A STUDIO ---
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def studio_create_view(request):
    """
    Handles the creation of a new Studio for an authenticated user.
    """
    user = request.user

    # First, we check if the user already owns a studio.
    # A user should only be able to create one studio.
    if Studio.objects.filter(owner=user).exists():
        return Response(
            {"error": "You have already created a studio."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    # We pass the incoming form data to our new serializer.
    serializer = StudioCreateSerializer(data=request.data)

    if serializer.is_valid():
        # If the data is valid, we call .save() but we also pass the owner,
        # which the serializer needs to create the studio instance correctly.
        studio = serializer.save(owner=user)
        profile = request.user.profile

        # --- LOGIC FOR HANDLING CV & DEGREES ---

        # Handle CV File
        if "cv_file" in request.FILES:
            profile.cv_file = request.FILES["cv_file"]
            profile.save()

        # Handle Degrees
        degree_names = request.data.getlist("degrees[name]")
        degree_files = request.FILES.getlist("degrees[file]")

        # Attach each Degree name to its correspondant Degree file
        for name, file in zip(degree_names, degree_files):
            if name and file:
                Degree.objects.create(profile=profile, name=name, file=file)

        # After the form completion in CreateStudioPage, We add the user to the Teacher
        teachers_group = Group.objects.get(name="Teachers")
        user.groups.add(teachers_group)

        # We return a success response with the data of the newly created studio.
        return Response(
            StudioCardSerializer(studio).data, status=status.HTTP_201_CREATED
        )

    # If the data is not valid, we return the errors.
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
