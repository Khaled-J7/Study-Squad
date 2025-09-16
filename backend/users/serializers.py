# backend/users/serializers.py
import json
from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Profile, Tag, Studio, Lesson, Post, Comment
from django.utils import timezone
from datetime import timedelta


# --- (ProfileSerializer, TagSerializer, UserSerializer, etc. are unchanged) ---
class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = ["profile_picture", "about_me", "contact_email", "cv_file", "degrees"]


class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ["id", "name"]


class UserSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer(read_only=True)

    class Meta:
        model = User
        fields = ["id", "username", "first_name", "last_name", "profile"]


class UserStudioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Studio
        fields = ["id", "name", "job_title", "experience"]


class CourseStudioSerializer(serializers.ModelSerializer):
    owner = UserSerializer(read_only=True)

    class Meta:
        model = Studio
        fields = ["id", "name", "owner"]


class StudioCardSerializer(serializers.ModelSerializer):
    owner = UserSerializer(read_only=True)
    tags = TagSerializer(many=True, read_only=True)

    class Meta:
        model = Studio
        fields = [
            "id",
            "name",
            "job_title",
            "description",
            "cover_image",
            "owner",
            "tags",
            "social_links",
            "created_at",
        ]


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
    profile = ProfileSerializer(read_only=True)
    job_title = serializers.SerializerMethodField()
    experience = serializers.SerializerMethodField()
    degrees = serializers.JSONField(source="profile.degrees", read_only=True)
    social_links = serializers.SerializerMethodField()
    # NEW: Add a field for the studio's ID to fix the frontend link.
    studio_id = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "first_name",
            "last_name",
            "profile",
            "job_title",
            "experience",
            "degrees",
            "social_links",
            "studio_id",
        ]

    def get_studio_id(self, obj):
        """
        Safely gets the ID of the teacher's first studio.
        Returns the ID if a studio exists, otherwise returns None.
        """
        studio = Studio.objects.filter(owner=obj).first()
        return studio.id if studio else None # type: ignore

    def get_job_title(self, obj):
        studio = Studio.objects.filter(owner=obj).first()
        return studio.job_title if studio else ""

    def get_experience(self, obj):
        studio = Studio.objects.filter(owner=obj).first()
        return studio.experience if studio else []

    def get_social_links(self, obj):
        studio = Studio.objects.filter(owner=obj).first()
        return studio.social_links if studio else {}


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


# --- THE SIMPLIFIED ProfileUpdateSerializer ---
class ProfileUpdateSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username", required=False)

    class Meta:
        model = Profile
        # NOTE: 'cv_file' is now removed from this list.
        fields = [
            "username",
            "about_me",
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


class StudioCreateSerializer(serializers.ModelSerializer):
    tags = serializers.ListField(
        child=serializers.CharField(max_length=50), write_only=True, required=False
    )

    class Meta:
        model = Studio
        fields = [
            "name",
            "job_title",
            "description",
            "cover_image",
            "experience",
            "tags",
            "social_links",
        ]

    def create(self, validated_data):
        tag_names = validated_data.pop("tags", [])
        studio = Studio.objects.create(**validated_data)
        for tag_name in tag_names:
            tag, _ = Tag.objects.get_or_create(name=tag_name.strip())
            studio.tags.add(tag)
        return studio

    def update(self, instance, validated_data):
        instance.name = validated_data.get("name", instance.name)
        instance.job_title = validated_data.get("job_title", instance.job_title)
        instance.description = validated_data.get("description", instance.description)
        instance.cover_image = validated_data.get("cover_image", instance.cover_image)
        instance.experience = validated_data.get("experience", instance.experience)
        instance.social_links = validated_data.get(
            "social_links", instance.social_links
        )
        if "tags" in validated_data:
            tag_names = validated_data.pop("tags", [])
            instance.tags.clear()
            for tag_name in tag_names:
                tag, _ = Tag.objects.get_or_create(name=tag_name.strip())
                instance.tags.add(tag)
        instance.save()
        return instance
