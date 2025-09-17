# backend/users/models.py

from django.db import models
from django.contrib.auth.models import User

# NEW: We import the validator to check file extensions
from django.core.validators import FileExtensionValidator


# Model 1: The Unified Profile for all users
class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="profile")
    profile_picture = models.ImageField(
        upload_to="profile_pics/", default="profile_pics/default.jpg"
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
    cover_image = models.ImageField(
        upload_to="studio_covers/", default="studio_covers/default_cover.jpg"
    )
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
class Lesson(models.Model):
    studio = models.ForeignKey(Studio, on_delete=models.CASCADE, related_name="lessons")
    title = models.CharField(max_length=200)
    tags = models.ManyToManyField(Tag, blank=True)
    description = models.TextField(
        blank=True, help_text="A short description of the course."
    )
    cover_image = models.ImageField(
        upload_to="lesson_covers/",
        blank=True,
        null=True,
        help_text="Upload a cover image for this course.",
    )
    content = models.TextField(help_text="Use Markdown for formatting.")
    video_upload = models.FileField(upload_to="lesson_videos/", blank=True, null=True)
    video_url = models.URLField(blank=True, help_text="Or provide a YouTube/Vimeo URL.")
    file_upload = models.FileField(upload_to="lesson_files/", blank=True, null=True)
    order = models.PositiveIntegerField(
        default=0, help_text="Order of the lesson in the course."
    )
    created_at = models.DateTimeField(auto_now_add=True, null=True, blank=True)

    def __str__(self):
        return self.title


# Model 5 & 6: Post and Comment for the Squad Hub
class Post(models.Model):
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    likes = models.ManyToManyField(User, related_name="liked_posts", blank=True)

    def __str__(self):
        return (
            f'Post by {self.author.username} at {self.timestamp.strftime("%Y-%m-%d")}'
        )


class Comment(models.Model):
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name="comments")
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    likes = models.ManyToManyField(User, related_name="liked_comments", blank=True)

    def __str__(self):
        return f"Comment by {self.author.username} on {self.post}"
