# backend/users/serializers.py
from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Profile, Tag, Studio, Lesson, Post, Comment, Degree
from django.utils import timezone
from datetime import timedelta

# --- Serializers for Core Models ---


# --- NEW SERIALIZER ---
# This serializer will handle our new Degree model.
class DegreeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Degree
        fields = ["id", "name", "file"]


# NEW serializer to handle profile-specific data
class ProfileSerializer(serializers.ModelSerializer):
    # We are nesting the new DegreeSerializer here.
    # `many=True` because a profile can have multiple degrees.
    # `read_only=True` because degrees will be created/managed separately.
    degrees = DegreeSerializer(many=True, read_only=True)

    class Meta:
        model = Profile
        fields = [
            "profile_picture",
            "about_me",
            "contact_email",
            "cv_file",
            "degrees",
        ]


class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag  # Corrected the typo here
        fields = ["id", "name"]


class UserSerializer(serializers.ModelSerializer):
    # UPDATE: We are nesting the profile data within the user to get the updated ProfileSerializer data
    profile = ProfileSerializer(read_only=True)

    class Meta:
        model = User
        # UPDATE: Added 'profile' to the fields list
        fields = ["id", "username", "first_name", "last_name", "profile"]


# A simple serializer to include basic studio info with the user
class UserStudioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Studio
        # --- NOTE: The 'degrees' field here will now be empty. ---
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
    # --- CHANGE: This field will now get data from the Profile ---
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

    # --- UPDATED METHOD ---
    def get_degrees(self, obj):
        # 'obj' is the User instance. We now get degrees from the user's profile.
        # We'll just return a list of the names for the card.
        if hasattr(obj, 'profile') and obj.profile.degrees.exists():
            return [degree.name for degree in obj.profile.degrees.all()]
        return []

    def get_social_links(self, obj):
        studio = Studio.objects.filter(owner=obj).first()
        return studio.social_links if studio else {}


# --- Authentication and User Management Serializers ---


class UserRegisterSerializer(serializers.ModelSerializer):
    """
    Serializer for user registration.
    Includes a second password field for validation and creates a Profile on success.
    """

    # An extra field for password confirmation that is only used for writing (input).
    password2 = serializers.CharField(style={"input_type": "password"}, write_only=True)

    class Meta:
        model = User
        #  NOTE: We've added first_name and last_name to the fields list.
        fields = [
            "username",
            "email",
            "first_name",
            "last_name",
            "password",
            "password2",
        ]
        extra_kwargs = {
            # Ensure the password is not sent back in the API response.
            "password": {"write_only": True},
            # Make first_name & last_name required for our registration form
            "first_name": {"required": True},
            "last_name": {"required": True},
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
        # NOTE: We now create the user with their first and last names.
        user = User.objects.create_user(
            username=validated_data["username"],
            email=validated_data["email"],
            first_name=validated_data["first_name"],
            last_name=validated_data["last_name"],
            password=validated_data["password"],
        )
        # Automatically create a blank Profile when a new User is created.
        Profile.objects.create(user=user)
        return user


class CurrentUserSerializer(serializers.ModelSerializer):
    # This will automatically use our updated ProfileSerializer, so it will now
    # include the 'cv_file' and the nested 'degrees' list.
    profile = ProfileSerializer(read_only=True)
    # Finds the first studio owned by the user, if any
    studio = UserStudioSerializer(read_only=True, source="studios.first")

    class Meta:
        model = User
        # NOTE: We've added first_name and last_name here so the frontend
        # receives this data when it asks for the current user.
        fields = [
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "profile",
            "studio",
        ]


# --- NEW SERIALIZER FOR THE "EDIT PROFILE" FORM ---
class ProfileUpdateSerializer(serializers.ModelSerializer):
    # We define the 'username' field, getting its data from the related User model.
    username = serializers.CharField(source="user.username", required=False)

    class Meta:
        model = Profile
        # These are the fields the frontend form will be able to update.
        fields = [
            "username",
            "about_me",
            "contact_email",
            "profile_picture",
        ]

    def validate_username(self, value):
        """
        This special method, 'validate_<field_name>', runs automatically
        for the username field to enforce our custom rules.
        """
        # We get the user from the 'context' that our view will provide.
        user = self.context["request"].user

        # Rule 1: We only run these checks if the username is actually being changed.
        if value == user.username:
            return value  # If there's no change, we don't need to do anything else.

        # Rule 2: Check if the new username is already taken by another user.
        if User.objects.exclude(pk=user.pk).filter(username=value).exists():
            raise serializers.ValidationError(
                "This username is already taken by another user."
            )

        # Rule 3: Enforce the 30-day cooldown period.
        if user.profile.username_last_changed:
            # We check if the current time is still within the 30-day cooldown period.
            if timezone.now() < user.profile.username_last_changed + timedelta(days=30):
                raise serializers.ValidationError(
                    "You can only change your username once every 30 days."
                )

        # If all checks pass, we return the new username.
        return value

    def update(self, instance, validated_data):
        """
        * 'instance' is the Profile object we are updating.
        * 'validated_data' is the clean data from the form.
        """
        # This update method is the key. It handles saving data to both the User and Profile models.

        # Step 1: We handle the User model data if it exists.
        # We get the nested 'user' data that we defined in the serializer.
        user_data = validated_data.pop("user", {})
        user = instance.user  # Get the actual User object from the profile.

        # Update the user's fields and save them.
        user.first_name = user_data.get("first_name", user.first_name)
        user.last_name = user_data.get("last_name", user.last_name)
        user.save()

        # Step 2: Handle the Profile data.
        # Then, we let the parent class handle updating the Profile model fields.
        # This will automatically update about_me, contact_email, and profile_picture.
        super().update(instance, validated_data)
        return instance


# --- NEW SERIALIZER FOR THE "CREATE STUDIO" FORM ---
class StudioCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating a new Studio.
    Handles all the fields from the multi-step form.
    """

    # We will accept tags as a list of strings from the frontend.
    tags = serializers.ListField(
        child=serializers.CharField(max_length=50), write_only=True, required=False
    )

    class Meta:
        model = Studio
        # These are all the fields the user will fill out in the form.
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
        # We pop the list of tag names from the validated data.
        tag_names = validated_data.pop("tags", [])

        # We create the Studio instance with the rest of the data.
        studio = Studio.objects.create(**validated_data)

        # Now, we loop through the tag names.
        for tag_name in tag_names:
            # For each name, we either get the existing Tag object from the database
            # or create a new one if it doesn't exist.
            tag, _ = Tag.objects.get_or_create(name=tag_name.strip())
            # Then, we add this tag to our new studio.
            studio.tags.add(tag)

        return studio
