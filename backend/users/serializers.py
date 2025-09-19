# backend/users/serializers.py
import json
from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Profile, Tag, Studio, Lesson, Post, Comment, StudioRating
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
