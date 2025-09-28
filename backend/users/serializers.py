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


# This file has been reverted to its pre-Cloudinary state.
# All `SerializerMethodField` logic for URLs has been removed.


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


# A new, lightweight serializer specifically for the studio cards on the explore page.
class StudioCardSerializer(serializers.ModelSerializer):
    owner = UserSerializer(read_only=True)
    tags = TagSerializer(many=True, read_only=True)
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
            "subscribers_count",
            "average_rating",
        ]

    def get_subscribers_count(self, obj):
        return obj.subscribers.count()

    def get_average_rating(self, obj):
        return obj.ratings.aggregate(Avg("rating")).get("rating__avg", 0) or 0


class StudioSerializer(serializers.ModelSerializer):
    owner = UserSerializer(read_only=True)
    tags = TagSerializer(many=True, read_only=True)
    subscribers_count = serializers.SerializerMethodField()
    average_rating = serializers.SerializerMethodField()
    is_subscribed = serializers.SerializerMethodField()
    lessons = lessons = serializers.SerializerMethodField()

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
            "is_subscribed",
            "lessons",
        ]

    def get_subscribers_count(self, obj):
        return obj.subscribers.count()

    def get_average_rating(self, obj):
        return obj.ratings.aggregate(Avg("rating")).get("rating__avg", 0) or 0

    def get_is_subscribed(self, obj):
        user = self.context.get("request").user  # type: ignore
        if user and user.is_authenticated:
            # This checks if the user is in the set of subscribers for the studio
            return obj.subscribers.filter(pk=user.pk).exists()
        return False

    def get_lessons(self, obj):
        return LessonCardSerializer(obj.lessons.all(), many=True).data


class StudioCoverSerializer(serializers.ModelSerializer):
    """
    A simple serializer for updating only the studio's cover image.
    """

    class Meta:
        model = Studio
        fields = ["cover_image"]


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


class LessonDetailSerializer(serializers.ModelSerializer):
    tags = serializers.SerializerMethodField()

    class Meta:
        model = Lesson
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

    def get_tags(self, obj):
        return [tag.name for tag in obj.tags.all()]


class TeacherCardSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer(read_only=True)
    studio_id = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ["id", "username", "first_name", "last_name", "profile", "studio_id"]

    def get_studio_id(self, obj):
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
    studio = serializers.SerializerMethodField()

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

    def get_studio(self, obj):
        """
        Explicitly fetches the user's studio from the database.
        'obj' here is the User instance.
        This is the most reliable way to get the studio, especially after
        it has just been created.
        """
        try:
            # We perform a direct database query to find the studio owned by this user.
            studio = Studio.objects.get(owner=obj)
            # If found, we serialize it using our UserStudioSerializer.
            return UserStudioSerializer(studio).data
        except Studio.DoesNotExist:
            # If no studio is found for this user, we correctly return null.
            return None


class StudioRatingSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudioRating
        fields = ["id", "user", "rating", "created_at"]


class ProfileUpdateSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username", required=False)

    class Meta:
        model = Profile
        fields = ["username", "headline", "contact_email", "profile_picture", "degrees"]

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


class StudioCreateSerializer(serializers.ModelSerializer):
    tags = serializers.ListField(
        child=serializers.CharField(max_length=50), write_only=True, required=False
    )

    class Meta:
        model = Studio
        fields = ["name", "description", "cover_image", "tags"]

    def create(self, validated_data):
        tag_names = validated_data.pop("tags", [])
        studio = Studio.objects.create(**validated_data)
        for tag_name in tag_names:
            tag, _ = Tag.objects.get_or_create(name=tag_name.strip())
            studio.tags.add(tag)
        return studio


class StudioDashboardSerializer(serializers.ModelSerializer):
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
        return obj.ratings.aggregate(Avg("rating")).get("rating__avg", 0) or 0

    def get_lessons_count(self, obj):
        return obj.lessons.count()

    def get_lessons(self, obj):
        recent_lessons = obj.lessons.order_by("-created_at")[:5]
        return LessonCardSerializer(recent_lessons, many=True).data


class StudioUpdateSerializer(serializers.ModelSerializer):
    tags = TagSerializer(many=True, read_only=True)
    tag_names = serializers.ListField(
        child=serializers.CharField(max_length=50), write_only=True, required=False
    )

    class Meta:
        model = Studio
        fields = ["name", "description", "tags", "tag_names", "cover_image"]
        extra_kwargs = {
            "name": {"required": False},
            "headline": {"required": False},
            "description": {"required": False},
        }

    def update(self, instance, validated_data):
        tag_names = validated_data.pop("tag_names", None)
        instance = super().update(instance, validated_data)
        if tag_names is not None:
            instance.tags.clear()
            for tag_name in tag_names:
                tag, _ = Tag.objects.get_or_create(name=tag_name.strip())
                instance.tags.add(tag)
        return instance


class SubscriberSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer(read_only=True)

    class Meta:
        model = User
        fields = ["id", "username", "first_name", "last_name", "profile"]


class LessonCreateSerializer(serializers.ModelSerializer):
    tag_names = serializers.ListField(
        child=serializers.CharField(max_length=50), write_only=True, required=False
    )

    class Meta:
        model = Lesson
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
        tag_names = validated_data.pop("tag_names", [])
        lesson = Lesson.objects.create(**validated_data)
        for tag_name in tag_names:
            tag, _ = Tag.objects.get_or_create(name=tag_name.strip())
            lesson.tags.add(tag)
        return lesson


class LessonUpdateSerializer(serializers.ModelSerializer):
    tags = serializers.ListField(
        child=serializers.CharField(max_length=50), write_only=True, required=False
    )

    class Meta:
        model = Lesson
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
        tags_data = validated_data.pop("tags", None)
        if tags_data is not None:
            instance.tags.clear()
            for tag_name in tags_data:
                tag, _ = Tag.objects.get_or_create(name=tag_name.strip())
                instance.tags.add(tag)
        return super().update(instance, validated_data)


# The Post and Comment serializers can be added back when that feature is built.
