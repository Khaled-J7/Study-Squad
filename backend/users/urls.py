# backend/users/urls.py
from django.urls import path
from .views import (
    explore_view,
    logout_view,
    register_view,
    current_user_view,
    profile_update_view,
    studio_create_view
)

urlpatterns = [
    # This one URL will now handle all our explore page requests
    path("explore/", explore_view, name="explore"),
    path("auth/register/", register_view, name="register"),
    path("auth/logout/", logout_view, name="logout"),
    path("auth/user/", current_user_view, name="current-user"),
    # The endpoint for updating the user's profile information.
    path("profile/update/", profile_update_view, name="profile-update"),
    # --- NEW URL FOR CREATING A STUDIO ---
    path("studios/create/", studio_create_view, name="studio-create"),
]
