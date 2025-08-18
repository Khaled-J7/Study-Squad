# backend/users/urls.py
from django.urls import path
from .views import explore_view

urlpatterns = [
    # This one URL will now handle all our explore page requests
    path("explore/", explore_view, name="explore"),
]
