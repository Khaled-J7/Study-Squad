# backend/users/urls.py
from django.urls import path
from .views import studio_list_view

urlpatterns = [
    path("studios/", studio_list_view, name="studio-list"),
]
