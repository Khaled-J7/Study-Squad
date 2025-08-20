# backend/users/serializers.py

from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Profile, Tag, Studio, Lesson, Post, Comment

# --- Serializers for Core Models ---


# NEW serializer to handle profile-specific data
class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = ["bio", "profile_picture"]


class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag  # Corrected the typo here
        fields = ["id", "name"]


class UserSerializer(serializers.ModelSerializer):
    # UPDATE: We are nesting the profile data within the user
    profile = ProfileSerializer(read_only=True)

    class Meta:
        model = User
        # UPDATE: Added 'profile' to the fields list
        fields = ["id", "username", "first_name", "last_name", "profile"]


# --- Serializers for Search Results (Our Custom Cards) ---


class StudioCardSerializer(serializers.ModelSerializer):
    # This now has access to the user's profile through the updated UserSerializer
    owner = UserSerializer(read_only=True)
    tags = TagSerializer(many=True, read_only=True)
    # subscribers_count = serializers.IntegerField(source="subscribers.count", read_only=True) # We will add subscribers later

    class Meta:
        model = Studio
        fields = [
            "id",
            "name",
            "description",
            "cover_image",
            "owner",
            "tags",
            # "subscribers_count",
        ]


class LessonCardSerializer(serializers.ModelSerializer):
    studio = serializers.StringRelatedField(read_only=True)
    tags = TagSerializer(many=True, read_only=True)

    class Meta:
        model = Lesson
        fields = ["id", "title", "studio", "tags", "cover_image"]


class TeacherCardSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer(read_only=True)  # Updated to use the ProfileSerializer
    studio_name = serializers.CharField(source="studio.name", read_only=True)

    class Meta:
        model = User
        fields = ["id", "username", "profile", "studio_name"]
