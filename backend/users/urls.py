# backend/users/urls.py
from django.urls import path
from .views import (
    comment_create_view,
    comment_like_toggle_view,
    explore_view,
    logout_view,
    my_posts_view,
    post_detail_view,
    post_like_toggle_view,
    post_list_create_view,
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
    post_delete_view,
    comment_delete_view,
    meeting_create_view,
    get_my_invitations_view,
    update_invitation_status_view,
    user_search_view,
    account_delete_view,
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
    # 🔽🔽 NEW: SquadHub URLs 🔽🔽
    # A single endpoint for listing all posts (GET) and creating a new post (POST)
    path("posts/", post_list_create_view, name="post-list-create"),
    # An endpoint to get only the posts for the logged-in user
    path("posts/mine/", my_posts_view, name="my-posts"),
    # An endpoint for a single post's details (GET)
    path("posts/<int:pk>/", post_detail_view, name="post-detail"),
    # An endpoint to toggle a like on a post (POST)
    path("posts/<int:pk>/like/", post_like_toggle_view, name="post-like-toggle"),
    # An endpoint to create a comment on a specific post (POST)
    path("posts/<int:post_pk>/comments/", comment_create_view, name="comment-create"),
    # An endpoint to toggle a like on a comment (POST)
    path(
        "comments/<int:pk>/like/", comment_like_toggle_view, name="comment-like-toggle"
    ),
    path("posts/<int:pk>/delete/", post_delete_view, name="post-delete"),
    path("comments/<int:pk>/delete/", comment_delete_view, name="comment-delete"),
    # --- Jitsi Meet URLs ---
    # A single endpoint for creating a new meeting (POST)
    path("meetings/create/", meeting_create_view, name="meeting-create"),
    # An endpoint to get all pending invitations for the logged-in user (GET)
    path("invitations/", get_my_invitations_view, name="my-invitations"),
    # An endpoint to update an invitation's status (accept/decline) (POST)
    path(
        "invitations/<int:pk>/update/",
        update_invitation_status_view,
        name="invitation-update",
    ),
    # NEW URL for searching users
    path("users/search/", user_search_view, name="user-search"),
    
    # 🗑️ URL for deleting a user account
    path("users/delete/", account_delete_view, name="user-delete"),
]
