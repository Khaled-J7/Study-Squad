# backend/users/models.py

from django.db import models
from django.contrib.auth.models import User


# Model 1: The Unified Profile for all users
class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="profile")
    bio = models.TextField(blank=True)
    profile_picture = models.ImageField(
        upload_to="profile_pics/", default="profile_pics/default.jpg"
    )

    def __str__(self):
        return f"{self.user.username} Profile"


# Model 2: The Tag model for subjects and skills
class Tag(models.Model):
    name = models.CharField(max_length=50, unique=True)

    def __str__(self):
        return self.name


# Model 3: The Studio model for teachers
class Studio(models.Model):
    owner = models.ForeignKey(User, on_delete=models.CASCADE)
    name = models.CharField(max_length=200)
    # -- NEW --
    job_title = models.CharField(
        max_length=200, blank=True, help_text="e.g., Professor of Computer Science"
    )
    cover_image = models.ImageField(
        upload_to="studio_covers/", default="studio_covers/default.jpg"
    )
    description = models.TextField()
    degrees_text = models.TextField(
        blank=True, help_text="Describe your qualifications."
    )
    cv_file = models.FileField(
        upload_to="cv_files/",
        blank=True,
        null=True,
        help_text="Upload your CV or diplomas.",
    )
    experience = models.TextField(
        blank=True, help_text="Describe your work experience."
    )
    tags = models.ManyToManyField(Tag, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    # We will use studio.subscribers.count() to get the number of subscribers
    # We will define 'subscribers' using the Subscription model later if needed, or a simple ManyToManyField on Profile.

    def __str__(self):
        return self.name


# Model 4: The Lesson model for content inside a Studio
class Lesson(models.Model):
    studio = models.ForeignKey(Studio, on_delete=models.CASCADE, related_name="lessons")
    title = models.CharField(max_length=200)
    tags = models.ManyToManyField(Tag, blank=True)
    # -- New --
    cover_image = models.ImageField(
        upload_to="lesson_covers/",
        blank=True,
        null=True,
        help_text="Upload a cover image for this course.",
    )
    content = models.TextField(help_text="Use Markdown for formatting.")
    video_upload = models.FileField(
        upload_to="lesson_videos/", blank=True, null=True
    )  # For direct video upload
    video_url = models.URLField(
        blank=True, help_text="Or provide a YouTube/Vimeo URL."
    )  # For video embedding
    file_upload = models.FileField(
        upload_to="lesson_files/", blank=True, null=True
    )  # For attachments like PDFs
    order = models.PositiveIntegerField(
        default=0, help_text="Order of the lesson in the course."
    )

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
