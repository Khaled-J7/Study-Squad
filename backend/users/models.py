# backend/users/models.py

from django.db import models
from django.contrib.auth.models import User

# We import the validator to check file extensions
from django.core.validators import FileExtensionValidator


# Model 1: The Unified Profile for all users
class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="profile")
    profile_picture = models.ImageField(
        upload_to="profile_pics/",
        default="profile_pics/default.jpg",
        null=True,
        blank=True,
    )
    # ✅ RENAMED: from about_me to headline
    headline = models.CharField(max_length=250, blank=True)
    contact_email = models.EmailField(max_length=255, blank=True)
    username_last_changed = models.DateTimeField(null=True, blank=True)

    # UPDATED: We've added the validator to restrict file types
    cv_file = models.FileField(
        upload_to="cv_files/",
        blank=True,
        null=True,
        validators=[FileExtensionValidator(allowed_extensions=["pdf", "txt"])],
    )

    # NEW: The 'degrees' field is now a JSONField, storing a list of strings.
    degrees = models.JSONField(
        default=list,
        blank=True,
        help_text="List of degrees or certifications as a JSON list.",
    )

    def __str__(self):
        return f"{self.user.username} Profile"


# Model 2: The Tag model for subjects and skills
class Tag(models.Model):
    name = models.CharField(max_length=50, unique=True)

    def __str__(self):
        return self.name


# --- REMOVED ---
# The Degree model has been completely removed as per our new plan.


# Model 3: The Studio model for teachers
# --- ✅ REFACTORED STUDIO MODEL ---
class Studio(models.Model):
    owner = models.ForeignKey(User, on_delete=models.CASCADE)
    name = models.CharField(max_length=200)

    cover_image = models.ImageField(upload_to="studio_covers/", null=True, blank=True)
    description = models.TextField()
    tags = models.ManyToManyField(Tag, blank=True)

    # ✅ NEW: Subscribers Field
    # We will use a ManyToManyField to link Users as subscribers.
    subscribers = models.ManyToManyField(
        User, related_name="subscribed_studios", blank=True
    )

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


# --- ✅ NEW: StudioRating MODEL ---
# This new model will handle the ratings for each studio.
class StudioRating(models.Model):
    studio = models.ForeignKey(Studio, related_name="ratings", on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    rating = models.IntegerField(default=0)  # e.g., 1 to 5 stars
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        # Ensures a user can only rate a studio once
        unique_together = ("studio", "user")

    def __str__(self):
        return f"{self.user.username} rated {self.studio.name} {self.rating} stars"


# Model 4: The Lesson model for content inside a Studio
# This is our main "container" model for any type of course content.
class Lesson(models.Model):
    """
    Represents a single course or piece of content within a Studio.
    This model is designed to be a flexible container for various types of educational content.
    """

    # We define the different types of content a Lesson can be.
    # This is the core of the new architecture.
    LESSON_CHOICES = (
        ("markdown", "Markdown Text"),
        ("file", "Downloadable File"),
        ("video", "Single Video"),
    )
    # This field tells our application what kind of lesson this is.
    lesson_type = models.CharField(
        max_length=10, choices=LESSON_CHOICES, default="markdown"
    )

    # --- Standard Lesson Details (applies to all types) ---
    # These are the fields for: the name, cover, and description of the overall lesson.
    studio = models.ForeignKey(Studio, related_name="lessons", on_delete=models.CASCADE)
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    cover_image = models.ImageField(upload_to="lesson_covers/", null=True, blank=True)
    tags = models.ManyToManyField(Tag, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, null=True, blank=True)

    # --- Content-Specific Fields ---
    # Only ONE of these will be used for any given lesson, depending on the 'lesson_type'.
    # This keeps our data clean and explicit.

    # For 'markdown' lessons
    markdown_content = models.TextField(
        blank=True, null=True, help_text="Content for markdown-based lessons."
    )

    # For 'file' lessons (PDF, Word, etc.)
    lesson_file = models.FileField(
        upload_to="lesson_files/",
        blank=True,
        null=True,
        help_text="A downloadable file for the lesson.",
    )

    # For 'video' lessons (a single video upload)
    lesson_video = models.FileField(
        upload_to="lesson_videos/",
        blank=True,
        null=True,
        help_text="A single video file for the lesson.",
    )

    def __str__(self):
        return self.title


# Model 5 & 6: Post and Comment for the Squad Hub
class Post(models.Model):
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    title = models.CharField(max_length=255, default="Untitled Post")
    # This will store the main body of the post, written in Markdown.
    content = models.TextField()
    # Reusing the existing Tag model to categorize posts.
    tags = models.ManyToManyField(Tag, blank=True)
    # Allows users to attach a single, relevant file to their post.
    file_attachment = models.FileField(
        upload_to="post_attachments/",
        blank=True,
        null=True,
    )
    timestamp = models.DateTimeField(auto_now_add=True)
    likes = models.ManyToManyField(User, related_name="liked_posts", blank=True)

    def __str__(self):
        return f'"{self.title}" by {self.author.username}'


class Comment(models.Model):
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name="comments")
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    likes = models.ManyToManyField(User, related_name="liked_comments", blank=True)

    def __str__(self):
        return f"Comment by {self.author.username} on {self.post}"
