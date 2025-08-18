# backend/users/serializers.py

from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Profile, Tag, Studio, Lesson, Post, Comment


# --- Serializers for Core Models ---


class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model: Tag
        fields = ["id", "name"]


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "first_name", "last_name"]


# --- Serializers for Search Results (Custom Cards) ---


class StudioCardSerializer(serializers.ModelSerializer):
    """
    A serializer specifically for the "Studio Card" on the Explore page.
    It includes the owner's name and the tags.
    """

    owner = UserSerializer(read_only=True)
    tags = TagSerializer(many=True, read_only=True)
    subscribers_count = serializers.IntegerField(
        source="subscribers.count", read_only=True
    )

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
        ]


class LessonCardSerializer(serializers.ModelSerializer):
    """
    A serializer for the "Course Card" on the Explore page.
    """

    studio = serializers.StringRelatedField(
        read_only=True
    )  # Shows the studio name by using the result of the __str__ method from our Studio model

    class Meta:
        model = Lesson
        fields = ["id", "title", "studio", 'tags']  # Simplified for a card view


class TeacherCardSerializer(serializers.ModelSerializer):
    """
    A serializer for the "Teacher Card" on the Explore page.
    """

    profile = serializers.StringRelatedField(
        source="profile", read_only=True
    )  # Needs a related name on the Profile model
    studio_name = serializers.CharField(
        source="studio.name", read_only=True
    )  # Assumes one studio per teacher for now

    class Meta:
        model = User
        fields = ["id", "username", "profile", "studio_name"]
