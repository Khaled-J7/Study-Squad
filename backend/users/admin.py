# backend/users/admin.py

from django.contrib import admin
from .models import Profile, Tag, Studio, Lesson, Post, Comment

# Register the models here so they appear in the admin site
admin.site.register(Profile)
admin.site.register(Tag)
# admin.site.register(Studio)
admin.site.register(Lesson)
admin.site.register(Post)
admin.site.register(Comment)

