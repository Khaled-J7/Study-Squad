# Study Squad 🎓

[![React Badge](https://img.shields.io/badge/-React-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![Django Badge](https://img.shields.io/badge/-Django-092E20?style=for-the-badge&logo=django&logoColor=white)](https://www.djangoproject.com/)
[![Jitsi Badge](https://img.shields.io/badge/-Jitsi%20Meet-1D76E5?style=for-the-badge&logo=jitsi&logoColor=white)](https://jitsi.org/)

An innovative online learning platform connecting teachers and students through personalized studios, collaborative courses, a vibrant community hub, and real-time video meetings.

---

## 📜 About The Project

Study Squad was born from the vision of creating a more connected and dynamic online educational experience. It's a full-stack web application designed to empower educators and inspire learners. Unlike traditional platforms, Study Squad provides teachers with their own customizable "Studios" where they can build their brand, publish multi-format courses, and foster a community. For students, it's a world of knowledge to explore, with a rich community forum and the ability to connect with teachers directly through real-time video calls.

This project was developed as a final portfolio project for Holberton School, showcasing a wide range of full-stack development skills, from backend architecture to modern frontend user experience.

---

## ✨ Key Features

Our platform is packed with features designed to create a seamless and engaging experience:

* **Teacher & Studio Management:** A complete dashboard for teachers to manage their profile, studio, courses, and subscribers.
* **Public-Facing Studio Pages:** Beautiful, dedicated public pages for each teacher's studio, showcasing their courses and credentials.
* **Multi-Format Course Creation:** Teachers can create rich lessons using a Markdown editor, file uploads, and video content.
* **Student Subscription System:** Students can subscribe to their favorite studios to stay updated on new content.
* **Dynamic Explore Page:** A powerful search and filter page for users to discover new studios, courses, and teachers.
* **SquadHub Community Forum:**
  * Create rich-text posts with file attachments.
  * Comment on and "like" posts to drive engagement.
  * Manage your own content with "My Posts" and delete functionality.
* **Real-Time Video Meetings (Jitsi Meet Integration):**
  * A "Simple & Solid" integration allowing any user to create a private meeting room.
  * Invite users by searching their username.
  * A real-time notification system (using polling) alerts users to new meeting invitations.
* **Secure JWT Authentication:** Modern, secure authentication with an automatic token refresh mechanism to keep users logged in seamlessly.
* **Account Management:** Users can update their profiles and permanently delete their accounts through a secure confirmation process.

---

## 🛠️ Built With

This project leverages a modern and robust technology stack:

* **Backend:**
  * [Django](https://www.djangoproject.com/)
  * [Django REST Framework](https://www.django-rest-framework.org/)
  * [Simple JWT](https://django-rest-framework-simplejwt.readthedocs.io/) for authentication
  * [PostgreSQL](https://www.postgresql.org/) for the database

* **Frontend:**
  * [React](https://reactjs.org/)
  * [Vite](https://vitejs.dev/) as the build tool
  * [React Router](https://reactrouter.com/) for client-side routing
  * [Axios](https://axios-http.com/) for API communication
  * [@jitsi/react-sdk](https://github.com/jitsi/jitsi-meet-react-sdk) for video conferencing

* **Styling:**
  * Pure CSS with a modular, component-based approach.

---

## 🚀 Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

* Python 3.10+
* Node.js and npm
* PostgreSQL

### Backend Setup

1. **Clone the repo**

    ```sh
    git clone [https://github.com/your_username/Study-Squad.git](https://github.com/Khaled-J7/Study-Squad.git)
    cd Study-Squad/backend
    ```

2. **Create a virtual environment and install dependencies**

    ```sh
    python -m venv venv
    source venv/bin/activate  # On Windows, use `venv\Scripts\activate`
    pip install -r requirements.txt
    ```

3. **Set up your environment variables**
    * Create a `.env` file in the `backend` directory.
    * Add your database URL:

        ```env
        DATABASE_URL=postgres://USER:PASSWORD@HOST:PORT/DB_NAME
        ```

4. **Run database migrations**

    ```sh
    python manage.py makemigrations
    python manage.py migrate
    ```

5. **Run the backend server**

    ```sh
    python manage.py runserver
    ```

    The backend API will be running at `http://127.0.0.1:8000`.

### Frontend Setup

1. **Navigate to the frontend directory**

    ```sh
    cd ../frontend
    ```

2. **Install NPM packages**

    ```sh
    npm install
    ```

3. **Run the frontend development server**

    ```sh
    npm run dev
    ```

    The frontend will be running at `http://localhost:5173`.

---

## 📞 Contact

Khaled Jallouli - [khaledjalloulidev@gmail.com](mailto:khaledjalloulidev@gmail.com)

Project Link: [https://github.com/khaled-j7/Study-Squad](https://github.com/Khaled-J7/Study-Squad)
