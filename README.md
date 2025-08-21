# ELM AI Task Backend

A comprehensive social media backend API built with Node.js, Express, TypeScript, and MongoDB. Features include user authentication, post management, file uploads to Google Cloud Storage, and social interactions.

## 🚀 Features

- **User Authentication** - JWT-based access and refresh tokens
- **Post Management** - Create, read, update, delete posts with media
- **File Uploads** - Google Cloud Storage integration for images/videos
- **Social Features** - Like, comment, and delete interactions
- **Profile Management** - User profile updates with photo uploads
- **Redis Caching** - Fast data retrieval for posts and profiles
- **Advanced Filtering** - Search, pagination, and sorting capabilities
- **Type Safety** - Full TypeScript implementation

## 📁 Project Structure

```
elm-ai-task-backend/
├── config/
│   ├── db.config.ts          # MongoDB connection configuration
│   ├── redis.config.ts       # Redis connection configuration
│   └── env.config.ts         # Environment variables configuration
├── controllers/
│   ├── auth.controller.ts    # Authentication endpoints
│   ├── post.controller.ts    # Post management endpoints
│   ├── profile.controller.ts # User profile endpoints
│   └── interface.d.ts        # TypeScript interfaces
├── middleware/
│   ├── auth.middleware.ts    # JWT authentication middleware
│   ├── upload.middleware.ts  # File upload middleware (multer)
│   └── multerError.middleware.ts # File upload error handling
├── models/
│   ├── postSchema/
│   │   ├── post.schema.ts    # Post MongoDB schema
│   │   └── type.postSchema.ts # Post TypeScript types
│   └── userSchema/
│       ├── user.schema.ts    # User MongoDB schema
│       └── type.userSchema.ts # User TypeScript types
├── routes/
│   ├── auth.route.ts         # Authentication routes
│   ├── post.route.ts         # Post management routes
│   └── profile.route.ts      # Profile management routes
├── service/
│   ├── asyncHandler.ts       # Async error handling utility
│   ├── cache.service.ts      # Redis caching service
│   ├── gcs.service.ts        # Google Cloud Storage service
│   └── token.service.ts      # JWT token utilities
├── utils/
│   └── fileUpload.ts         # File upload utilities
├── app.ts                    # Express app configuration
├── server.ts                 # Server entry point
└── elm-ai-469623-08f39025610f.json # GCS service account key
```

## 🛠️ Installation

### Prerequisites
- Node.js (v16 or higher)
- MongoDB
- Redis
- Google Cloud Storage account

### Setup

1. **Clone the repository**
```bash
git clone git@github.com:dvvaliya369/elm-ai-task-backend.git
cd elm-ai-task-backend
```

2. **Install dependencies**
```bash
yarn install
```

3. **Environment Configuration**
Create a `.env` file in the root directory:
```env
API_URL=http://localhost:8000
PORT=8000
JWT_SECRET_AUTH=your-jwt-secret
JWT_EXPIRY=15m
JWT_REFRESH_SECRET=your-refresh-secret
JWT_REFRESH_EXPIRY=7d
DB_URL=mongodb://localhost:27017/elm-ai-task
REDIS_URL=redis://localhost:6379
DOMAIN=http://localhost:8000

GCS_PROJECT_ID=elm-ai-469623
GCS_BUCKET_NAME=user_post
```

4. **Google Cloud Storage Setup**
- Place your GCS service account key file in the root directory
- Ensure the filename matches: `elm-ai-469623-08f39025610f.json`

5. **Start the server**
```bash
# Development
yarn run dev

# Production
yarn run build
yarn start
```

## 📚 API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/auth/signup
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

#### Login User
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Refresh Token
```http
POST /api/auth/refresh-token
Content-Type: application/json

{
  "refreshToken": "your-refresh-token"
}
```

### Post Management

#### Create Post
```http
POST /api/post/create
Authorization: Bearer <access-token>
Content-Type: multipart/form-data

Form Data:
- caption: "Your post caption" (optional)
- file: [image/video file] (optional)
```

#### Get All Posts (with filtering)
```http
GET /api/post/list?page=1&limit=10&search=vacation&sortBy=popular&minLikes=5
```

#### Get Post by ID
```http
GET /api/post/:id
```

#### Get Posts by User ID
```http
GET /api/post/user/:id
```

#### Update Post
```http
PUT /api/post/update/:id
Authorization: Bearer <access-token>
Content-Type: multipart/form-data

Form Data:
- caption: "Updated caption" (optional)
- file: [new media file] (optional)
- isRemoveMedia: true (optional, to remove existing media)
```

#### Delete Post
```http
DELETE /api/post/delete/:id
Authorization: Bearer <access-token>
```

#### Like/Unlike Post
```http
PUT /api/post/like/:id
Authorization: Bearer <access-token>
```

#### Add Comment
```http
PUT /api/post/comment/:id
Authorization: Bearer <access-token>
Content-Type: application/json

{
  "text": "Your comment text"
}
```

#### Delete Comment
```http
DELETE /api/post/comment/:id
Authorization: Bearer <access-token>
Content-Type: application/json

{
  "commentId": "comment-object-id"
}
```

### Profile Management

#### Get Current User Profile
```http
GET /api/profile/me
Authorization: Bearer <access-token>
```

#### Get User Profile by ID
```http
GET /api/profile/:id
```

#### Update Profile
```http
PUT /api/profile/update
Authorization: Bearer <access-token>
Content-Type: multipart/form-data

Form Data:
- firstName: "John" (optional)
- lastName: "Doe" (optional)
- file: [profile photo] (optional)
```

## 🔧 Technologies Used

- **Backend Framework**: Express.js with TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Caching**: Redis for fast data retrieval
- **Authentication**: JWT (JSON Web Tokens)
- **File Upload**: Multer + Google Cloud Storage
- **Validation**: Custom middleware and schema validation
- **Error Handling**: Centralized async error handling

## 📝 Key Features Details

### File Upload System
- Supports images (JPEG, PNG, GIF, WebP) up to 5MB
- Supports videos (MP4, MPEG, QuickTime, AVI) up to 50MB
- Automatic file type detection and validation
- Google Cloud Storage integration with public URLs
- Organized folder structure (posts/, profiles/)

### Authentication System
- JWT-based authentication with access and refresh tokens
- Access tokens expire in 15 minutes
- Refresh tokens expire in 7 days
- Automatic token refresh mechanism
- Protected routes with middleware

### Post System
- Flexible post creation (caption only, media only, or both)
- Advanced filtering and search capabilities
- Pagination support
- Like and comment functionality
- Soft delete implementation
- User interaction tracking (isLikedByUser, isCommentedByUser)

### 🚀 Redis Caching System
- **Fast Data Access**: Cached data loads instantly without database queries
- **Smart Caching**: Profiles cached for 1 hour, posts cached for 30 minutes
- **Auto Refresh**: Cache updates automatically when data changes
- **Memory Efficient**: Only frequently accessed data is cached

#### 📦 What Gets Cached:
- **User Profiles**: Individual user profile data
- **Individual Posts**: Single post details with likes and comments
- **User Posts**: All posts by a specific user

#### 🔑 Cache Keys:
- `profile:userId` - User profile data
- `post:postId` - Individual post data
- `user_posts:userId` - All posts by a user

#### 🔄 Cache Updates:
- **Profile Changes**: Cache clears when profile is updated
- **Post Changes**: Cache clears when posts are created, updated, or deleted
- **Interactions**: Cache clears when posts are liked or commented on
- **Automatic**: Old cache expires automatically after set time

