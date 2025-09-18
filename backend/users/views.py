# backend/users/views.py
import json
import traceback
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser
from django.contrib.auth.models import User, Group
from .models import Studio, Lesson, Profile
from .serializers import (
    StudioSerializer,
    StudioCreateSerializer,
    ProfileSerializer,
    ProfileUpdateSerializer,
    LessonCardSerializer,
    TeacherCardSerializer,
    UserRegisterSerializer,
    CurrentUserSerializer,
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
        serializer = StudioSerializer(queryset, many=True)

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


# --- NEW, DEDICATED CV UPLOAD AND DELETE VIEW ---
@api_view(["POST", "DELETE"])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])
def cv_upload_view(request):
    """
    A dedicated view to handle uploading or deleting the CV file for a user's profile.
    """
    try:
        # Accessing request.data first ensures the multipart parser runs correctly.
        _ = request.data
        profile = request.user.profile

        if request.method == "POST":
            cv_file = request.FILES.get("cv_file")
            if not cv_file:
                return Response(
                    {"error": "No CV file was provided."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            profile.cv_file = cv_file
            profile.save()

        elif request.method == "DELETE":
            if profile.cv_file:
                # Set save=True here to ensure the change is committed.
                profile.cv_file.delete(save=True)
            else:
                # If no file exists, the operation is still a success.
                pass

        return Response(
            {"message": "CV operation successful."}, status=status.HTTP_200_OK
        )

    except Exception as e:
        return Response(
            {
                "error": "A server error occurred during the CV operation.",
                "detail": str(e),
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


# Handles updates for all text-based and image-based profile information.
@api_view(["PUT"])
@permission_classes([IsAuthenticated])
@parser_classes(
    [MultiPartParser, FormParser]
)  # We still need this for the profile picture
def profile_update_view(request):
    """
    Handles updating the user's profile information.
    This version now handles the 'degrees' field manually for maximum robustness.
    """
    try:
        profile = request.user.profile

        serializer = ProfileUpdateSerializer(
            instance=profile,
            data=request.data,
            partial=True,
            context={"request": request},
        )

        if serializer.is_valid():
            serializer.save()

            # --- Handle degrees manually after other data is saved ---
            if "degrees" in request.data:
                degrees_json_string = request.data.get("degrees")
                try:
                    # We parse the string from the frontend back into a Python list
                    degrees_list = json.loads(degrees_json_string)
                    profile.degrees = degrees_list
                    profile.save()  # Save the updated degrees list
                except json.JSONDecodeError:
                    # This is a fallback in case of malformed data
                    return Response(
                        {"error": "Invalid format for degrees."},
                        status=status.HTTP_400_BAD_REQUEST,
                    )
            # After a successful save, we refetch the user to send the latest data back.
            request.user.refresh_from_db()
            updated_user_serializer = CurrentUserSerializer(request.user)
            return Response(updated_user_serializer.data, status=status.HTTP_200_OK)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    except Exception as e:
        return Response(
            {
                "error": "A server error occurred during the profile update.",
                "detail": str(e),
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


# --- ✅ NEW: Studio Create View ---
@api_view(["POST"])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])  # To handle the cover image upload
def studio_create_view(request):
    """
    Handles the creation of a new studio for a user.
    """
    user = request.user

    # 1. Prevent users from creating more than one studio
    if Studio.objects.filter(owner=user).exists():
        return Response(
            {"error": "You have already created a studio."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    # 2. Validate the incoming form data
    serializer = StudioCreateSerializer(data=request.data)
    if serializer.is_valid():
        # 3. Save the new studio, passing the logged-in user as the owner
        studio = serializer.save(owner=user)

        # 4. Elevate the user's role to "Teacher"
        try:
            teachers_group = Group.objects.get(name="Teachers")
            user.groups.add(teachers_group)
        except Group.DoesNotExist:
            # This is a fallback in case the group was somehow deleted
            return Response(
                {"error": "Critical server error: 'Teachers' group not found."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        # 5. Return the full data of the newly created studio
        # We use the main StudioSerializer here to include all calculated fields
        response_serializer = StudioSerializer(studio)
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)

    # If validation fails, return the errors
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
