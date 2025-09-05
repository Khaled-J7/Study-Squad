# backend/users/tests/test_profile.py
from rest_framework.test import APITestCase
from rest_framework import status
from django.contrib.auth.models import User
from users.models import Profile
from django.utils import timezone
from datetime import timedelta

class ProfileUpdateAPITest(APITestCase):
    """
    Test suite for the Profile Update API endpoint.
    """

    def setUp(self):
        """
        This method runs before every single test in this class.
        We use it to set up our initial database state.
        """
        self.user = User.objects.create_user(
            username="testuser",
            password="testpassword123",
            first_name="Test",
            last_name="User",
        )
        # --- THE FIX ---
        # We now manually create the Profile for our test user,
        # just like our registration serializer would in the real application.
        self.profile = Profile.objects.create(user=self.user)

    def test_authenticated_user_can_update_profile(self):
        """
        Ensures that a user who is logged in can successfully update their profile.
        """
        # --- ARRANGE ---
        updated_data = {
            "about_me": "This is my new bio.",
            "contact_email": "new.email@example.com",
        }

        # --- ACT ---
        self.client.force_authenticate(user=self.user)  # type: ignore
        response = self.client.put("/api/profile/update/", updated_data, format="json")

        # --- ASSERT ---
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.profile.refresh_from_db()
        self.assertEqual(self.profile.about_me, "This is my new bio.")
        self.assertEqual(self.profile.contact_email, "new.email@example.com")

    # --- NEW TEST 1: Username Already Taken ---
    def test_user_cannot_update_to_existing_username(self):
        """
        Ensures the API correctly rejects an attempt to change to a username that already exists.
        """
        # --- ARRANGE ---
        # 1. We create a second user, so their username is already in the database.
        User.objects.create_user(username="existinguser", password="password123")

        # 2. We define the data for the update attempt.
        updated_data = {"username": "existinguser"}

        # --- ACT ---
        # 1. We log in as our main test user.
        self.client.force_authenticate(user=self.user)  # type: ignore

        # 2. We try to update their username to one that's already taken.
        response = self.client.put("/api/profile/update/", updated_data, format="json")

        # --- ASSERT ---
        # We expect the API to reject this with a 400 Bad Request error.
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        # We also check that the error message is what we expect.
        self.assertIn("username", response.data) # type: ignore

    # --- NEW TEST 2: 30-Day Cooldown ---
    def test_username_change_cooldown_is_enforced(self):
        """
        Ensures the API rejects a username change if it's within the 30-day cooldown period.
        """
        # --- ARRANGE ---
        # 1. We "fake" the timestamp by setting it to a time in the past, but less than 30 days ago.
        self.profile.username_last_changed = timezone.now() - timedelta(days=15)
        self.profile.save()

        # 2. We define the new username data.
        updated_data = {"username": "newusername"}

        # --- ACT ---
        self.client.force_authenticate(user=self.user)  # type: ignore
        response = self.client.put("/api/profile/update/", updated_data, format="json")

        # --- ASSERT ---
        # We expect the API to reject this because it's too soon.
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("username", response.data) # type: ignore
        self.assertEqual(
            str(response.data["username"][0]), # type: ignore
            "You can only change your username once every 30 days.",
        )
