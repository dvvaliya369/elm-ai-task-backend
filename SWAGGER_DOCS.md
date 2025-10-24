# Swagger Documentation Usage Guide

This project now includes comprehensive Swagger/OpenAPI documentation for all API endpoints.

## Accessing the Documentation

Once the server is running, you can access the Swagger documentation at:

- **Swagger UI**: `http://localhost:3000/api-docs`
  - Interactive documentation with the ability to test endpoints
  - Beautiful UI with organized endpoint groups
  - Authentication support for protected endpoints

- **JSON API Specification**: `http://localhost:3000/api-docs.json`
  - Raw OpenAPI 3.0 JSON specification
  - Can be imported into other tools like Postman or Insomnia

## Features

### Authentication
- JWT Bearer token authentication is properly documented
- Use the "Authorize" button in Swagger UI to set your token
- Token format: `Bearer your_jwt_token_here`

### Endpoint Groups
- **Authentication**: User registration, login, token refresh, password change
- **Posts**: CRUD operations, likes, comments, file uploads
- **Profile**: User profile management

### Request/Response Documentation
- Complete request body schemas with examples
- Response schemas for all success and error cases
- File upload support for multipart/form-data endpoints
- Query parameter documentation for pagination

### Error Handling
- Standardized error response schemas
- HTTP status codes properly documented
- Development vs production error details

## API Overview

### Authentication Endpoints
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh-token` - Refresh access token
- `PUT /api/auth/change-password` - Change password (authenticated)

### Post Endpoints
- `POST /api/post/create` - Create post with optional file upload
- `PUT /api/post/update/{id}` - Update post
- `DELETE /api/post/delete/{id}` - Delete post
- `GET /api/post/list` - Get all posts with pagination
- `GET /api/post/{id}` - Get specific post
- `GET /api/post/user/{id}` - Get posts by user
- `PUT /api/post/like/{id}` - Like/unlike post
- `PUT /api/post/comment/{id}` - Add comment
- `DELETE /api/post/comment/{id}` - Delete comment

### Profile Endpoints
- `GET /api/profile/me` - Get current user profile
- `GET /api/profile/{id}` - Get user profile by ID
- `PUT /api/profile/update` - Update profile with optional photo upload

## Testing with Swagger UI

1. Open `http://localhost:3000/api-docs` in your browser
2. For authentication:
   - First register or login to get a token
   - Click the "Authorize" button at the top
   - Enter `Bearer <your_token>` in the value field
   - Click "Authorize"
3. Now you can test protected endpoints
4. Try different endpoints by expanding them and clicking "Try it out"
5. Fill in the required parameters and click "Execute"

## Schema Validation

All endpoints include proper schema validation with:
- Required fields marked clearly
- Data types and formats specified
- Example values provided
- File upload fields properly documented

The documentation is automatically generated and stays in sync with the codebase.
