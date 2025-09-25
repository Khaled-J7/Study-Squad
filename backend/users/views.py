# backend/users/views.py
import json
import traceback
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser
from django.contrib.auth.models import User, Group
from django.db.models import Q  # Import Q objects for complex searches
from .models import Studio, Lesson, Profile
from .serializers import (
    StudioSerializer,
    StudioCreateSerializer,
    StudioDashboardSerializer,
    StudioCoverSerializer,
    StudioUpdateSerializer,
    SubscriberSerializer,
    LessonCreateSerializer,
    LessonDetailSerializer,
    LessonUpdateSerializer,
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


# --- , DEDICATED CV UPLOAD AND DELETE VIEW ---
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


# --- Studio Create View ---
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


#  ---  STUDIO DASHBOARD VIEW ---
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def studio_dashboard_view(request):
    """
    Provides all necessary data for the teacher's studio dashboard.
    """
    user = request.user
    try:
        # 2. We fetch the studio owned by the currently logged-in user.
        #    Using .get() will raise an error if it doesn't exist.
        studio = Studio.objects.get(owner=user)
    except Studio.DoesNotExist:
        # 3. This is a crucial security and error-handling step.
        return Response(
            {"error": "You do not have a studio. Access denied."},
            status=status.HTTP_403_FORBIDDEN,
        )

    # 4. We pass the fetched studio instance to our new serializer.
    serializer = StudioDashboardSerializer(studio)

    # 5. We return the serialized data with a success status.
    return Response(serializer.data, status=status.HTTP_200_OK)


# ---  STUDIO COVER UPDATE VIEW ---
@api_view(["PUT"])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])
def studio_cover_update_view(request):
    """
    Handles updating the cover image for a user's studio.
    """
    try:
        # Robustly get the studio associated with the requesting user
        studio = Studio.objects.get(owner=request.user)
    except Studio.DoesNotExist:
        return Response(
            {"error": "You do not have a studio to update."},
            status=status.HTTP_403_FORBIDDEN,
        )

    # Check if the cover_image is in the request files
    if "cover_image" not in request.FILES:
        return Response(
            {"error": "No image file provided."}, status=status.HTTP_400_BAD_REQUEST
        )

    # The data for the serializer is just the file itself
    data = {"cover_image": request.FILES["cover_image"]}
    serializer = StudioCoverSerializer(instance=studio, data=data, partial=True)

    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ---  STUDIO UPDATE VIEW ---
@api_view(["GET", "PUT"])
@permission_classes([IsAuthenticated])
def studio_update_view(request):
    """
    Handles fetching (GET) and updating (PUT) a teacher's studio details.
    """
    try:
        studio = Studio.objects.get(owner=request.user)
    except Studio.DoesNotExist:
        return Response(
            {"error": "You do not have a studio to manage."},
            status=status.HTTP_403_FORBIDDEN,
        )

    if request.method == "GET":
        # For a GET request, we serialize the existing studio data to pre-fill the form
        serializer = StudioUpdateSerializer(studio)
        return Response(serializer.data)

    elif request.method == "PUT":
        # For a PUT request, we validate and save the incoming data
        serializer = StudioUpdateSerializer(
            instance=studio, data=request.data, partial=True
        )
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        # If the data is invalid, return the errors
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


#  --- STUDIO DELETE VIEW ---
@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def studio_delete_view(request):
    """
    Handles the permanent deletion of a user's studio.
    This is a critical, irreversible action.
    """
    user = request.user
    try:
        # Find the studio owned by the requesting user.
        studio_to_delete = Studio.objects.get(owner=user)
    except Studio.DoesNotExist:
        # This is a security measure in case a non-teacher tries to access this.
        return Response(
            {"error": "You do not have a studio to delete."},
            status=status.HTTP_403_FORBIDDEN,
        )

    # Perform the deletion. Django's cascading delete will handle associated lessons, etc.
    studio_to_delete.delete()

    # Revert the user's role by removing them from the "Teachers" group.
    try:
        teachers_group = Group.objects.get(name="Teachers")
        user.groups.remove(teachers_group)
    except Group.DoesNotExist:
        # This is a fallback for server integrity, should not normally happen.
        # We can still return a success message as the studio was deleted.
        pass

    return Response(
        {"message": "Studio has been successfully and permanently deleted."},
        status=status.HTTP_204_NO_CONTENT,
    )


#  --- MY COURSES VIEW ---
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def my_courses_view(request):
    """
    Fetches all lessons (courses) associated with the authenticated teacher's studio.
    """
    try:
        # Find the studio owned by the requesting user.
        studio = Studio.objects.get(owner=request.user)
    except Studio.DoesNotExist:
        return Response(
            {"error": "You do not have a studio."}, status=status.HTTP_403_FORBIDDEN
        )

    # Fetch all lessons for that studio, ordering by the most recently created.
    courses = studio.lessons.all().order_by("-created_at")  # type: ignore

    # We can reuse our existing LessonCardSerializer, as it has all the data we need for the cards.
    serializer = LessonCardSerializer(courses, many=True)

    return Response(serializer.data, status=status.HTTP_200_OK)


# --- NEW SUBSCRIBERS LIST & SEARCH VIEW ---
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def studio_subscribers_view(request):
    """
    Fetches a list of all subscribers for the authenticated teacher's studio.
    Also handles search functionality based on a query parameter.
    """
    try:
        # First, we get the teacher's studio.
        studio = Studio.objects.get(owner=request.user)
    except Studio.DoesNotExist:
        return Response(
            {"error": "You do not have a studio."}, status=status.HTTP_403_FORBIDDEN
        )

    # We get all subscribers for that studio.
    subscribers = studio.subscribers.all()

    # We check if the frontend sent a search query.
    # e.g., /api/studio/subscribers/?q=john
    search_query = request.query_params.get("q", None)
    if search_query:
        # If a query exists, we filter the list.
        # This Q object allows us to search across multiple fields at once (OR logic).
        subscribers = subscribers.filter(
            Q(username__icontains=search_query)
            | Q(first_name__icontains=search_query)
            | Q(last_name__icontains=search_query)
        )

    # We serialize the final list of subscribers (either all or the filtered results).
    serializer = SubscriberSerializer(subscribers, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


# --- NEW SUBSCRIBER VIEW ---
@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def block_subscriber_view(request, user_id):
    """
    Removes (blocks) a specific subscriber from the teacher's studio.
    """
    try:
        # Get the teacher's studio.
        studio = Studio.objects.get(owner=request.user)
    except Studio.DoesNotExist:
        return Response(
            {"error": "You do not have a studio."}, status=status.HTTP_403_FORBIDDEN
        )

    try:
        # Find the specific subscriber we want to block by their ID.
        subscriber_to_block = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response(
            {"error": "Subscriber not found."}, status=status.HTTP_404_NOT_FOUND
        )

    # This is the core logic: we remove the user from the many-to-many relationship.
    studio.subscribers.remove(subscriber_to_block)

    # We return a success response with no content, which is standard for DELETE operations.
    return Response(status=status.HTTP_204_NO_CONTENT)


#  --- NEW COURSE CREATE VIEW ---
@api_view(["POST"])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])  # We need this to handle file uploads
def course_create_view(request):
    """
    Handles the creation of a new Lesson (course).
    """
    try:
        # We ensure the user has a studio to add a course to.
        studio = Studio.objects.get(owner=request.user)
    except Studio.DoesNotExist:
        return Response(
            {"error": "You must have a studio to create a course."},
            status=status.HTTP_403_FORBIDDEN,
        )

    # We pass the incoming form data to our new serializer.
    serializer = LessonCreateSerializer(data=request.data)
    if serializer.is_valid():
        # If the data is valid, we save the new lesson, associating it with the teacher's studio.
        # We use a generic LessonCardSerializer for the response to keep it consistent.
        lesson = serializer.save(studio=studio)
        response_serializer = LessonCardSerializer(lesson)
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)

    # If the data is invalid, we return the errors.
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ---  COURSE DELETE VIEW ---
@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def course_delete_view(request, lesson_id):
    """
    Handles the permanent deletion of a specific course (Lesson).
    """
    try:
        # We query for a Lesson that has the given id AND belongs to a studio owned by the user making the request.
        lesson_to_delete = Lesson.objects.get(id=lesson_id, studio__owner=request.user)
    except Lesson.DoesNotExist:
        # If the lesson doesn't exist or the user is not the owner
        return Response(
            {
                "error": "Course not found or you don't have the permission to delete it."
            },
            status=status.HTTP_403_FORBIDDEN,
        )

    # If the security check passes, we proceed with the deletion.
    lesson_to_delete.delete()

    # We return a 204 No Content response, which is the standard for a successful DELETE operation.
    return Response(status=status.HTTP_204_NO_CONTENT)


# ---  COURSE DETAIL VIEW ---
@api_view(["GET"])
@permission_classes([IsAuthenticated])  # Or IsAuthenticatedOrReadOnly if public
def course_detail_view(request, lesson_id):
    """
    Fetches the full, detailed data for a single course.
    """
    try:
        # We can add more complex permission checks here later for public viewing.
        # For now, we just fetch the lesson by its ID.
        lesson = Lesson.objects.get(id=lesson_id)
    except Lesson.DoesNotExist:
        return Response(
            {"error": "Course not found."}, status=status.HTTP_404_NOT_FOUND
        )

    # We use our new detailed serializer to return all the data.
    serializer = LessonDetailSerializer(lesson)
    return Response(serializer.data)


# ✅ --- NEW COURSE UPDATE VIEW ---
@api_view(["PUT"])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])  # To handle potential file re-uploads
def course_update_view(request, lesson_id):
    """
    Handles updating an existing course (Lesson).
    """
    try:
        # We ensure the lesson exists AND is owned by the user making the request.
        lesson = Lesson.objects.get(id=lesson_id, studio__owner=request.user)
    except Lesson.DoesNotExist:
        return Response(
            {"error": "Course not found or you do not have permission to edit it."},
            status=status.HTTP_403_FORBIDDEN,
        )

    # We pass the existing lesson instance and the new data to our serializer.
    # partial=True allows the frontend to only send the fields that have changed.
    serializer = LessonUpdateSerializer(
        instance=lesson, data=request.data, partial=True
    )
    if serializer.is_valid():
        # If the data is valid, we save the changes...
        updated_lesson = serializer.save()
        # ...and return the full, updated course data using the detail serializer.
        response_serializer = LessonDetailSerializer(updated_lesson)
        return Response(response_serializer.data, status=status.HTTP_200_OK)

    # If the data is not valid, we return the errors.
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
