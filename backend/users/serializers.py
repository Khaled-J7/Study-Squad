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


# A simple serializer to include basic studio info with the user
class UserStudioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Studio
        fields = ["id", "name", "job_title", "experience", "degrees"]


# --- Serializers for Search Results (Our Custom Cards) ---


# --- NEW SERIALIZER ---
# A simple serializer to nest studio info inside the CourseCard
class CourseStudioSerializer(serializers.ModelSerializer):
    owner = UserSerializer(read_only=True)

    class Meta:
        model = Studio
        fields = ["id", "name", "owner"]


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
            "job_title",
            "description",
            "cover_image",
            "owner",
            "tags",
            "social_links",
            "created_at",
            # "subscribers_count",
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
    """
    A serializer for the "Teacher Card" on the Explore page.
    """

    profile = ProfileSerializer(read_only=True)
    # --- NEW: Use SerializerMethodFields to get data from the related Studio ---
    job_title = serializers.SerializerMethodField()
    experience = serializers.SerializerMethodField()
    degrees = serializers.SerializerMethodField()
    social_links = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "profile",
            "job_title",
            "experience",
            "degrees",
            "social_links",
        ]

    def get_job_title(self, obj):
        # 'obj' is the User instance. We find their studio and get the job title.
        studio = Studio.objects.filter(owner=obj).first()
        return studio.job_title if studio else ""

    def get_experience(self, obj):
        studio = Studio.objects.filter(owner=obj).first()
        return studio.experience if studio else []

    def get_degrees(self, obj):
        studio = Studio.objects.filter(owner=obj).first()
        return studio.degrees if studio else []

    def get_social_links(self, obj):
        studio = Studio.objects.filter(owner=obj).first()
        return studio.social_links if studio else {}


class UserRegisterSerializer(serializers.ModelSerializer):
    """
    Serializer for user registration.
    Includes a second password field for validation and creates a Profile on success.
    """

    # An extra field for password confirmation that is only used for writing (input).
    password2 = serializers.CharField(style={"input_type": "password"}, write_only=True)

    class Meta:
        model = User
        fields = ["username", "email", "password", "password2"]
        extra_kwargs = {
            # Ensure the password is not sent back in the API response.
            "password": {"write_only": True}
        }

    def validate(self, attrs):
        """
        Check that the two password fields match.
        """
        # attrs (short for attributes) means the data coming in
        if attrs["password"] != attrs["password2"]:
            raise serializers.ValidationError({"password": "Passwords must match."})
        return attrs

    def create(self, validated_data):
        """
        Create a new user with a hashed password and a corresponding profile.
        """
        user = User.objects.create_user(
            username=validated_data["username"],
            email=validated_data["email"],
            password=validated_data["password"],
        )
        # Automatically create a blank Profile when a new User is created.
        Profile.objects.create(user=user)
        return user


class CurrentUserSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer(read_only=True)
    # Finds the first studio owned by the user, if any
    studio = UserStudioSerializer(read_only=True, source="studio_set.first")

    class Meta:
        model = User
        fields = ["id", "username", "email", "profile", "studio"]