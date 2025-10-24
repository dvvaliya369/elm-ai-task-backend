# GitHub OAuth Setup for Express.js App

This application now supports GitHub OAuth authentication using Passport.js.

## Required Environment Variables

Add these variables to your `.env` file:

```env
# GitHub OAuth Configuration
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_CALLBACK_URL=http://localhost:8000/api/auth/github/callback
SESSION_SECRET=your_session_secret_key

# Existing environment variables
JWT_SECRET_AUTH=your_jwt_secret
JWT_EXPIRY=7d
JWT_REFRESH_SECRET=your_refresh_secret
JWT_REFRESH_EXPIRY=30d
DB_URL=your_mongodb_url
# ... other existing variables
```

## GitHub OAuth App Setup

1. Go to GitHub Settings > Developer settings > OAuth Apps
2. Click "New OAuth App"
3. Fill in the details:
   - **Application name**: Your app name
   - **Homepage URL**: `http://localhost:8000` (or your domain)
   - **Authorization callback URL**: `http://localhost:8000/api/auth/github/callback`
4. Click "Register application"
5. Copy the **Client ID** and **Client Secret** to your `.env` file

## Authentication Flow

### GitHub OAuth Routes

- **`GET /api/auth/github`** - Initiates GitHub OAuth flow
- **`GET /api/auth/github/callback`** - GitHub callback route
- **`GET /api/auth/github/failure`** - Handles authentication failures

### How it works

1. User visits `/api/auth/github` to start OAuth flow
2. User is redirected to GitHub for authorization
3. GitHub redirects back to `/api/auth/github/callback`
4. App creates or updates user account
5. Returns JWT tokens for API access

### User Data Handling

The system will:
- Create new users from GitHub profile data
- Link GitHub accounts to existing users with matching emails
- Store GitHub ID, username, and profile photo
- Support both local (email/password) and GitHub authentication

## API Usage

### Start GitHub Authentication
```
GET /api/auth/github
```

### Successful Authentication Response
```json
{
  "success": true,
  "message": "GitHub authentication successful",
  "data": {
    "user": {
      "_id": "user_id",
      "fullName": "John Doe",
      "email": "john@example.com",
      "profilePhoto": {
        "photo_url": "github_avatar_url"
      },
      "githubUsername": "johndoe",
      "authProvider": "github"
    },
    "accessToken": "jwt_access_token",
    "refreshToken": "jwt_refresh_token"
  }
}
```

## Database Schema Updates

The User model now includes:
- `githubId` - GitHub user ID
- `githubUsername` - GitHub username
- `authProvider` - 'local' or 'github'
- `password` - Optional (not required for GitHub users)

## Security Features

- Session-based OAuth flow
- JWT token generation after successful authentication
- Automatic user account linking by email
- Support for multiple authentication providers
- Secure password handling (only for local accounts)

## Development Notes

- Sessions are configured for development (secure: false)
- Set `secure: true` for production with HTTPS
- Consider using Redis for session storage in production
- The callback URL must match exactly in GitHub OAuth app settings
