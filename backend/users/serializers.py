# backend/users/serializers.py
import json
from rest_framework import serializers
from django.contrib.auth.models import User
from .models import (
    Profile,
    Tag,
    Studio,
    Lesson,
    Post,
    Comment,
    StudioRating,
)
from django.utils import timezone
from datetime import timedelta
from django.db.models import Avg


# --- (ProfileSerializer, TagSerializer, UserSerializer, etc. are unchanged) ---
class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = ["profile_picture", "headline", "contact_email", "cv_file", "degrees"]


class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ["id", "name"]


class UserSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer(read_only=True)

    class Meta:
        model = User
        fields = ["id", "username", "first_name", "last_name", "profile"]


# --- ✅ REFACTORED: The Main Studio Serializer ---
class StudioSerializer(serializers.ModelSerializer):
    """
    The primary serializer for the Studio model.
    It now includes calculated fields for subscribers and average rating.
    """

    owner = UserSerializer(read_only=True)
    tags = TagSerializer(many=True, read_only=True)

    # --- NEW: Calculated Fields ---
    subscribers_count = serializers.SerializerMethodField()
    average_rating = serializers.SerializerMethodField()

    class Meta:
        model = Studio
        fields = [
            "id",
            "name",
            "description",
            "cover_image",
            "owner",
            "tags",
            "created_at",
            "subscribers_count",
            "average_rating",
        ]

    def get_subscribers_count(self, obj):
        """
        Calculates the total number of subscribers for the studio.
        'obj' here is the Studio instance.
        """
        return obj.subscribers.count()

    def get_average_rating(self, obj):
        """
        Calculates the average rating for the studio from all StudioRating entries.
        """
        # We use Django's aggregation function to get the average of the 'rating' field.
        # The '.get('rating__avg', 0) or 0' part ensures we return 0 if there are no ratings yet.
        return obj.ratings.aggregate(Avg("rating")).get("rating__avg", 0) or 0


class UserStudioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Studio
        fields = ["id", "name"]


class CourseStudioSerializer(serializers.ModelSerializer):
    owner = UserSerializer(read_only=True)

    class Meta:
        model = Studio
        fields = ["id", "name", "owner"]


class LessonCardSerializer(serializers.ModelSerializer):
    studio = CourseStudioSerializer(read_only=True)
    tags = TagSerializer(many=True, read_only=True)

    class Meta:
        model = Lesson
        fields = [
            "id",
            "title",
            "studio",
            "tags",
            "cover_image",
            "description",
            "created_at",
            "lesson_type",
        ]


# --- A detailed serializer for a single lesson ---
class LessonDetailSerializer(serializers.ModelSerializer):
    """
    Serializes all fields for a single Lesson object, including all
    possible content types, for the course viewer modal.
    """

    # Explicitly tell the serializer to include the many-to-many relationship for tags, using the TagSerializer
    tags = TagSerializer(many=True, read_only=True)

    class Meta:
        model = Lesson
        # We include every field needed to display the lesson content.
        fields = [
            "id",
            "title",
            "description",
            "cover_image",
            "lesson_type",
            "markdown_content",
            "lesson_file",
            "lesson_video",
            "tags",
        ]


class TeacherCardSerializer(serializers.ModelSerializer):
    """
    A serializer for the "Teacher Card" on the Explore page.
    """

    # This correctly nests the full profile data, including cv_file and contact_email.
    profile = ProfileSerializer(read_only=True)
    # studio_id to link to the studio page.
    studio_id = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "first_name",  # Pass the first_name directly
            "last_name",  # Pass the last_name directly
            "profile",  # Pass the entire nested profile object: Contains picture, degrees, cv_file
            "studio_id",  # Pass the studio ID for linking
        ]

    def get_studio_id(self, obj):
        """
        Safely gets the ID of the teacher's studio for linking purposes.
        'obj' is the User instance.
        """
        studio = Studio.objects.filter(owner=obj).first()
        return studio.id if studio else None  # type: ignore


class UserRegisterSerializer(serializers.ModelSerializer):
    password2 = serializers.CharField(style={"input_type": "password"}, write_only=True)

    class Meta:
        model = User
        fields = [
            "username",
            "email",
            "first_name",
            "last_name",
            "password",
            "password2",
        ]
        extra_kwargs = {
            "password": {"write_only": True},
            "first_name": {"required": True},
            "last_name": {"required": True},
        }

    def validate(self, attrs):
        if attrs["password"] != attrs["password2"]:
            raise serializers.ValidationError({"password": "Passwords must match."})
        return attrs

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data["username"],
            email=validated_data["email"],
            first_name=validated_data["first_name"],
            last_name=validated_data["last_name"],
            password=validated_data["password"],
        )
        Profile.objects.create(user=user)
        return user


class CurrentUserSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer(read_only=True)
    studio = UserStudioSerializer(read_only=True, source="studio_set.first")

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "profile",
            "studio",
        ]


# --- ✅ NEW: StudioRating Serializer ---
class StudioRatingSerializer(serializers.ModelSerializer):
    """
    Serializer for the StudioRating model.
    """

    class Meta:
        model = StudioRating
        fields = ["id", "user", "rating", "created_at"]


# --- THE SIMPLIFIED ProfileUpdateSerializer ---
class ProfileUpdateSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username", required=False)

    class Meta:
        model = Profile
        # NOTE: 'cv_file' is now removed from this list.
        fields = [
            "username",
            "headline",
            "contact_email",
            "profile_picture",
            "degrees",
        ]

    def validate_username(self, value):
        user = self.context["request"].user
        if value == user.username:
            return value
        if User.objects.exclude(pk=user.pk).filter(username=value).exists():
            raise serializers.ValidationError("This username is already taken.")
        if user.profile.username_last_changed:
            if timezone.now() < user.profile.username_last_changed + timedelta(days=30):
                raise serializers.ValidationError(
                    "You can only change your username once every 30 days."
                )
        return value

    def update(self, instance, validated_data):
        user_data = validated_data.pop("user", {})
        if "username" in user_data and instance.user.username != user_data["username"]:
            instance.user.username = user_data["username"]
            instance.user.save()
            instance.username_last_changed = timezone.now()

        super().update(instance, validated_data)
        return instance


# --- ✅ NEW: StudioCreateSerializer ---
# This serializer will handle the creation of a new studio.
class StudioCreateSerializer(serializers.ModelSerializer):
    # The frontend will send a list of tag names (strings).
    tags = serializers.ListField(
        child=serializers.CharField(max_length=50), write_only=True, required=False
    )

    class Meta:
        model = Studio
        # These are the fields the user will fill out in the form.
        fields = [
            "name",
            "description",
            "cover_image",
            "tags",
        ]

    def create(self, validated_data):
        # Pop the tag_names from the validated data before creating the studio
        tag_names = validated_data.pop("tags", [])

        # Create the studio instance
        studio = Studio.objects.create(**validated_data)

        # Loop through the tag names, get or create the Tag object, and add it
        for tag_name in tag_names:
            tag, _ = Tag.objects.get_or_create(name=tag_name.strip())
            studio.tags.add(tag)

        return studio


# --- ✅ NEW: STUDIO DASHBOARD SERIALIZER ---
class StudioDashboardSerializer(serializers.ModelSerializer):
    """
    A dedicated serializer to gather all data needed for the teacher's dashboard.
    """

    subscribers_count = serializers.SerializerMethodField()
    average_rating = serializers.SerializerMethodField()
    lessons_count = serializers.SerializerMethodField()
    owner = UserSerializer(read_only=True)
    lessons = serializers.SerializerMethodField()

    class Meta:
        model = Studio
        fields = [
            "id",
            "name",
            "description",
            "cover_image",
            "owner",
            "subscribers_count",
            "average_rating",
            "lessons_count",
            "lessons",
        ]

    def get_subscribers_count(self, obj):
        return obj.subscribers.count()

    def get_average_rating(self, obj):
        # Using the same safe aggregation method as the main StudioSerializer
        return obj.ratings.aggregate(Avg("rating")).get("rating__avg", 0) or 0

    def get_lessons_count(self, obj):
        return obj.lessons.count()

    def get_lessons(self, obj):
        # Fetch the 5 most recently created lessons for this studio.
        recent_lessons = obj.lessons.order_by("-created_at")[:5]
        # Use the existing LessonCardSerializer to format the data.
        return LessonCardSerializer(recent_lessons, many=True).data


# --- ✅ NEW: StudioCoverSerializer ---
class StudioCoverSerializer(serializers.ModelSerializer):
    """
    A simple serializer for updating only the studio's cover image.
    """

    class Meta:
        model = Studio
        fields = ["cover_image"]


class StudioUpdateSerializer(serializers.ModelSerializer):
    """
    A dedicated serializer for updating the core details of a studio.
    """

    # On GET, it will serialize the tag objects. On PUT, it accepts a list of strings.
    tags = TagSerializer(many=True, read_only=True)
    tag_names = serializers.ListField(
        child=serializers.CharField(max_length=50), write_only=True, required=False
    )

    class Meta:
        model = Studio
        fields = ["name", "description", "tags", "tag_names"]

    def update(self, instance, validated_data):
        # Handle standard fields
        instance.name = validated_data.get("name", instance.name)
        instance.description = validated_data.get("description", instance.description)

        # Handle the tags
        if "tag_names" in validated_data:
            tag_names = validated_data.pop("tag_names")
            # First, clear the existing tags
            instance.tags.clear()
            # Then, add the new ones
            for tag_name in tag_names:
                tag, _ = Tag.objects.get_or_create(name=tag_name.strip())
                instance.tags.add(tag)

        instance.save()
        return instance


# --- ✅ NEW: SubscriberSerializer ---
class SubscriberSerializer(serializers.ModelSerializer):
    """
    Serializes user data for the Subscribers page.
    It includes the nested profile to get the user's avatar.
    """

    # We reuse the ProfileSerializer to include profile details like the profile picture.
    profile = ProfileSerializer(read_only=True)

    class Meta:
        model = User
        # We specify the exact fields the frontend card will need.
        fields = ["id", "username", "first_name", "last_name", "profile"]


# --- Serializer for Creating a Course ---
class LessonCreateSerializer(serializers.ModelSerializer):
    """
    Handles the creation of a new Lesson (course) of any type.
    This serializer is designed to accept all possible content fields
    and validates the main required information.
    """

    # We accept a list of tag names (strings) from the frontend.
    tag_names = serializers.ListField(
        child=serializers.CharField(max_length=50), write_only=True, required=False
    )

    class Meta:
        model = Lesson
        # These are all the fields the frontend can send when creating any type of lesson.
        # The view logic will handle which content field is used based on 'lesson_type'.
        fields = [
            "title",
            "description",
            "cover_image",
            "lesson_type",
            "markdown_content",
            "lesson_file",
            "lesson_video",
            "tag_names",
        ]

    def create(self, validated_data):
        # We pop the tag_names so we can process them separately.
        tag_names = validated_data.pop("tag_names", [])

        # Create the main Lesson instance with the remaining data.
        lesson = Lesson.objects.create(**validated_data)

        # Loop through the provided tag names, get or create the Tag object, and associate it.
        for tag_name in tag_names:
            tag, _ = Tag.objects.get_or_create(name=tag_name.strip())
            lesson.tags.add(tag)

        return lesson


# --- ✅ NEW: Serializer for Updating a Course ---
class LessonUpdateSerializer(serializers.ModelSerializer):
    """
    Handles the update of an existing Lesson (course).
    It is designed to accept partial data (PATCH) and handle tag updates.
    """

    # We expect the frontend to send a list of tag names (strings).
    tags = TagSerializer(many=True, read_only=True)

    class Meta:
        model = Lesson
        # These are all the fields a teacher can update on the edit page.
        # We don't include 'lesson_type' as that should not be changed after creation.
        fields = [
            "title",
            "description",
            "cover_image",
            "markdown_content",
            "lesson_file",
            "lesson_video",
            "tags",
        ]

    def update(self, instance, validated_data):
        # This is the core logic that runs when serializer.save() is called in the view.

        # We handle the simple fields first.
        instance.title = validated_data.get("title", instance.title)
        instance.description = validated_data.get("description", instance.description)
        instance.cover_image = validated_data.get("cover_image", instance.cover_image)
        instance.markdown_content = validated_data.get(
            "markdown_content", instance.markdown_content
        )
        instance.lesson_file = validated_data.get("lesson_file", instance.lesson_file)
        instance.lesson_video = validated_data.get(
            "lesson_video", instance.lesson_video
        )

        # If the frontend sent a new list of tags, we update them.
        if "tag_names" in validated_data:
            tag_names = validated_data.pop("tag_names")
            # First, we remove all existing tags from the lesson.
            instance.tags.clear()
            # Then, we loop through the new list of tag names and add them.
            for tag_name in tag_names:
                tag, _ = Tag.objects.get_or_create(name=tag_name.strip())
                instance.tags.add(tag)

        # Finally, we save the updated lesson instance to the database.
        instance.save()
        return instance
