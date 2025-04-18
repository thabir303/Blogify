# Blogify

## Overview

**Blogify** is a modern blogging platform designed for users to create, view, and interact with blog posts. The platform supports user authentication, blog creation, commenting, and replying to comments. Additionally, it includes an email verification process for account activation and a password reset functionality. Users can manage their accounts, create blog posts, and engage with others via comments and replies.

This project consists of two main parts:
- **Backend** built using **Django** (with Django REST Framework for APIs).
- **Frontend** built using **React** (with **Vite** for fast development).

The backend handles authentication, blog CRUD operations, comment replies, and user management, while the frontend interacts with these APIs to provide a smooth and intuitive user experience.

## Table of Contents

1. [Technologies Used](#technologies-used)
2. [API Endpoints](#api-endpoints)
    1. [Authentication APIs](#authentication-apis)
    2. [Blog APIs](#blog-apis)
    3. [Comment APIs](#comment-apis)
    4. [Comment Reply APIs](#comment-reply-apis)
3. [Project Setup](#project-setup)
    1. [Docker Setup](#docker-setup) 
    2. [Backend Setup](#backend-setup)
    3. [Frontend Setup](#frontend-setup)
4. [Environment Variables](#environment-variables)
5. [License](#license)

## Technologies Used

- **Django**: Backend framework for building APIs.
- **Django REST Framework (DRF)**: For building RESTful APIs.
- **Django Simple JWT**: For implementing JWT authentication.
- **Celery**: For handling background tasks such as email notifications.
- **Redis**: Message broker for Celery.
- **PostgreSQL**: Database for storing user and blog data.
- **React**: Frontend framework.
- **Vite**: Fast development server for React.
- **Flaticon**: Provides icons in the frontend.
- **JWT**: For secure authentication.
- **Axios**: For making HTTP requests from the frontend.
- **Docker**: For containerization and easy deployment. 

## API Endpoints

### Authentication APIs

#### 1. **User Registration**
- **POST** `http://localhost:8000/api/auth/register/`
  - Registers a new user with **username**, **email**, and **password**.
  - Sends an activation email with a PIN code.
  - **Request**:
    ```json
    { 
      "username": "user", 
      "email": "email@example.com", 
      "password": "password" 
    }
    ```
  - **Response**:
    ```json
    { 
      "success": true, 
      "message": "Registration successful! Check your email to activate your account." 
    }
    ```

#### 2. **Account Activation**
- **POST** `http://localhost:8000/api/auth/activate/`
  - Activates the user's account using the **email** and **PIN** sent during registration.
  - **Request**:
    ```json
    { 
      "email": "email@example.com", 
      "pin": "123456" 
    }
    ```
  - **Response**:
    ```json
    { 
      "success": true, 
      "message": "Account activated successfully. You can login now." 
    }
    ```

#### 3. **User Login**
- **POST** `http://localhost:8000/api/auth/login/`
  - Authenticates a user with **email** and **password**. Returns JWT tokens.
  - **Request**:
    ```json
    { 
      "email": "email@example.com", 
      "password": "password" 
    }
    ```
  - **Response**:
    ```json
    { 
      "success": true, 
      "access": "access_token", 
      "refresh": "refresh_token", 
      "username": "user", 
      "email": "email@example.com" 
    }
    ```

#### 4. **Password Reset Request**
- **POST** `http://localhost:8000/api/auth/reset-password/`
  - Requests a password reset PIN to be sent to the user's email.
  - **Request**:
    ```json
    { 
      "email": "email@example.com" 
    }
    ```
  - **Response**:
    ```json
    { 
      "message": "Password reset PIN sent to your email." 
    }
    ```

#### 5. **Password Reset Confirmation**
- **POST** `http://localhost:8000/api/auth/reset-password/confirm/`
  - Confirms password reset using **PIN** and **new password**.
  - **Request**:
    ```json
    { 
      "email": "email@example.com", 
      "pin": "123456", 
      "new_password": "new_password" 
    }
    ```
  - **Response**:
    ```json
    { 
      "message": "Password successfully reset." 
    }
    ```

### Blog APIs

#### 1. **Create Blog**
- **POST** `http://localhost:8000/api/blogs/`
  - Allows an authenticated user to create a new blog.
  - **Request**:
    ```json
    { 
      "title": "Blog Title", 
      "content": "Blog content" 
    }
    ```
  - **Response**:
    ```json
    { 
      "success": true, 
      "message": "Blog created successfully.", 
      "blog": { 
        "id": 1, 
        "title": "Blog Title", 
        "content": "Blog content" 
      } 
    }
    ```

#### 2. **Get All Blogs**
- **GET** `http://localhost:8000/api/blogs/`
  - Returns all published blogs.
  - **Response**:
    ```json
    [ 
      { 
        "id": 1, 
        "title": "Blog Title", 
        "content": "Blog content", 
        "created_at": "2025-04-10T00:00:00" 
      }
    ]
    ```

#### 3. **Get Single Blog**
- **GET** `http://localhost:8000/api/blogs/{id}/`
  - Fetches the details of a specific blog by `id`.
  - **Response**:
    ```json
    { 
      "id": 1, 
      "title": "Blog Title", 
      "content": "Full content of the blog", 
      "created_at": "2025-04-10T00:00:00" 
    }
    ```

#### 4. **Update Blog**
- **PUT** `http://localhost:8000/api/blogs/{id}/`
  - Allows an authenticated user to update an existing blog.
  - **Request**:
    ```json
    { 
      "title": "Updated Blog Title", 
      "content": "Updated blog content" 
    }
    ```
  - **Response**:
    ```json
    { 
      "success": true, 
      "message": "Blog updated successfully.", 
      "blog": { 
        "id": 1, 
        "title": "Updated Blog Title", 
        "content": "Updated blog content" 
      } 
    }
    ```

#### 5. **Delete Blog**
- **DELETE** `http://localhost:8000/api/blogs/{id}/`
  - Allows an author to delete an existing blog.
  - Deletes a specific blog by `id`. 
  - **Response**:
    ```json
    { 
      "success": true, 
      "message": "Blog deleted successfully." 
    }
    ```

### Comment APIs

#### 1. **Add Comment to Blog**
- **POST** `http://localhost:8000/api/blogs/{id}/comments/`
  - Allows an authenticated user to add a comment to a blog post.
  - **Request**:
    ```json
    { 
      "content": "This is a comment" 
    }
    ```
  - **Response**:
    ```json
    { 
      "success": true, 
      "message": "Comment added successfully.", 
      "comment": { 
        "user": "user", 
        "content": "This is a comment" 
      } 
    }
    ```

#### 2. **Get Comments of a Blog**
- **GET** `http://localhost:8000/api/blogs/{id}/comments/`
  - Fetches all comments of a specific blog.
  - **Response**:
    ```json
    [ 
      { 
        "id": 1, 
        "user": "user", 
        "content": "This is a comment" 
      } 
    ]
    ```

### Comment Reply APIs

#### 1. **Add Reply to Comment**
- **POST** `http://localhost:8000/api/comments/{comment_id}/reply/`
  - Allows an authenticated user to reply to a comment.
  - **Request**:
    ```json
    { 
      "content": "This is a reply" 
    }
    ```
  - **Response**:
  ```json
  { 
    "success": true, 
    "message": "Reply added successfully.", 
    "reply": { 
      "id": 1, 
      "user": "user", 
      "username": "username", 
      "content": "This is a reply", 
      "created_at": "2025-04-10T00:00:00" 
    } 
  }
  ```

## Project Setup

### Docker Setup

The fastest way to get Blogify up and running is using Docker, which handles all dependencies and services with minimal configuration.

#### Prerequisites

- Docker and Docker Compose installed on your system
- Git installed on your system

#### Quick Start

1. **Clone the repository**:
   ```bash
   git clone https://github.com/thabir303/Blogify.git
   cd Blogify
   ```

2. **Environment Configuration**:
   Create a `.env` file in the `backend` directory with the following content:

   ```
   # Django Settings
   DEBUG=True
   SECRET_KEY=asecretKEY

   # Email Settings
   EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USE_TLS=True
   EMAIL_HOST_USER=your_email@gmail.com
   EMAIL_HOST_PASSWORD=your_email_app_password

   # Redis and Celery Settings
   CELERY_BROKER_URL=redis://redis:6379/0
   CELERY_RESULT_BACKEND=redis://redis:6379/0
   ```

3. **Launch the Application**:
   ```bash
   docker-compose up -d
   ```

4. **Run Initial Setup**:
   ```bash
   # Run migrations
   docker-compose exec backend python3 blogify/manage.py migrate

   # Create a superuser (optional)
   docker-compose exec backend python3 blogify/manage.py createsuperuser
   ```

5. **Access the Application**:
   - Backend API: http://localhost:8000
   - Frontend Application: http://localhost:5173
   - Django Admin Panel: http://localhost:8000/admin

#### Docker Services

The Docker setup includes the following services:

- **backend**: Django REST API
- **frontend**: React with Vite
- **db**: PostgreSQL database
- **redis**: Redis for Celery message broker
- **celery**: Celery worker for background tasks
- **celery-beat**: Celery beat scheduler for periodic tasks

#### Useful Docker Commands

```bash
# View running containers
docker-compose ps

# View service logs
docker-compose logs backend
docker-compose logs frontend

# Stop all services
docker-compose down

# Restart services with rebuilt containers
docker-compose up --build -d

# Access shell in containers
docker-compose exec backend bash
docker-compose exec frontend sh
```

#### Troubleshooting

- **Database Connection Issues**: Ensure the database service is running and check logs
- **Redis Connection Issues**: Verify Redis is running and the connection URL is correct
- **Frontend Build Errors**: Check frontend logs for build or runtime errors

### Backend Setup

If you prefer to run the project without Docker, follow these steps:

1. **Clone the repository**:
   ```bash
   git clone https://github.com/thabir303/Blogify.git
   cd Blogify
   ```

2. **Navigate to the backend directory**:
   ```bash
   cd backend
   ```

3. **Create and activate a virtual environment**:
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   ```

4. **Install dependencies**:
   ```bash
   pip3 install -r requirements.txt
   ```

5. **Set up PostgreSQL** (or another database):
   - Configure the database in `settings.py`.

6. **Run Migrations**:
   ```bash
   python3 manage.py migrate
   ```

7. **Set up Celery and Redis**:
    1. Install and start Redis:
    ```bash
    sudo apt-get update
    sudo apt-get install redis-server
    sudo systemctl start redis-server
    sudo systemctl enable redis-server
    redis-cli ping
    ```

    2. Make the Celery script executable:
    ```bash
    chmod +x run_celery.sh
    ```

    3. Run Celery:
    ```bash
    ./run_celery.sh
    ```

    3. In another terminal, start Celery beat:

    ```bash
    ./run_celery.sh beat
    ```

8. **Start the Django Development Server**:
   ```bash
   python3 manage.py runserver
   ```

9. The backend should now be running at `http://127.0.0.1:8000/`.

### Frontend Setup

1. **Navigate to the frontend directory**:
   ```bash
   cd frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Run the Frontend**:
   ```bash
   npm run dev
   ```

4. The frontend should now be running at `http://localhost:5173/`.

## Environment Variables

Check out the `.env.sample` file for environment variable setup.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.