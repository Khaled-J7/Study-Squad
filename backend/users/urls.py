# backend/users/urls.py
from django.urls import path
from .views import (
    explore_view,
    logout_view,
    register_view,
    current_user_view,
    profile_update_view,
    cv_upload_view,
    studio_create_view,
    studio_dashboard_view,
    studio_cover_update_view,
    studio_update_view,
    studio_delete_view,
    my_courses_view,
    studio_subscribers_view,
    block_subscriber_view,
    course_create_view,
    course_delete_view,
    course_detail_view,
    course_update_view,
    public_studio_detail,
    subscribe_studio,
    unsubscribe_studio,
    rate_studio,
)

urlpatterns = [
    # This one URL will now handle all our explore page requests
    path("explore/", explore_view, name="explore"),
    path("auth/register/", register_view, name="register"),
    path("auth/logout/", logout_view, name="logout"),
    path("auth/user/", current_user_view, name="current-user"),
    # The endpoint for updating the user's profile information.
    path("profile/update/", profile_update_view, name="profile-update"),
    # NEW: A dedicated URL for handling only the CV file upload.
    path("profile/upload-cv/", cv_upload_view, name="cv-upload"),
    # Studio URLs
    # The URL for creating a studio
    path("studios/create/", studio_create_view, name="studio-create"),
    # The URL for the teacher's studio dashboard.
    path("studio/dashboard/", studio_dashboard_view, name="studio-dashboard"),
    # A dedicated URL for handling only the studio cover image update.
    path("studio/cover/update/", studio_cover_update_view, name="studio-cover-update"),
    # The URL for fetching and updating studio details.
    path("studio/update/", studio_update_view, name="studio-update"),
    # The URL for deleting a teacher's studio.
    path("studio/delete/", studio_delete_view, name="studio-delete"),
    # The URL for fetching all of a teacher's courses.
    path("studio/my-courses/", my_courses_view, name="my-courses"),
    # URLs for managing subscribers.
    path("studio/subscribers/", studio_subscribers_view, name="studio-subscribers"),
    path(
        "studio/subscribers/<int:user_id>/block/",
        block_subscriber_view,
        name="block-subscriber",
    ),
    # URL for creating courses.
    path("studio/courses/create/", course_create_view, name="course-create"),
    # URL for deleting a specific course
    path(
        "studio/courses/<int:lesson_id>/delete/",
        course_delete_view,
        name="course-delete",
    ),
    # The URL for fetching the full details of a single course.
    path("studio/courses/<int:lesson_id>/", course_detail_view, name="course-detail"),
    # The URL for updating a specific course.
    path(
        "studio/courses/<int:lesson_id>/update/",
        course_update_view,
        name="course-update",
    ),
    # Public Studio URLs
    path("studios/<int:id>/", public_studio_detail, name="public-studio-detail"),
    path("studios/<int:id>/subscribe/", subscribe_studio, name="subscribe-studio"),
    path(
        "studios/<int:id>/unsubscribe/", unsubscribe_studio, name="unsubscribe-studio"
    ),
    # Rating URL
    path("studios/<int:id>/rate/", rate_studio, name="rate-studio"),
]
