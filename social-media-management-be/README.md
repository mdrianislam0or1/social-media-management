# Mini Social Feed App — Backend API

A production-ready Node.js + Express REST API for a social feed application with JWT authentication, text-only posts, likes, comments, Firebase Cloud Messaging (FCM) notifications, and pagination.

## Tech Stack

- **Runtime:** Node.js + TypeScript
- **Framework:** Express.js
- **Database:** MongoDB (Mongoose ODM)
- **Authentication:** JWT (jsonwebtoken)
- **Validation:** Zod
- **Notifications:** Firebase Cloud Messaging (FCM)
- **Security:** Helmet, CORS, express-rate-limit, bcryptjs

## Project Structure

```
src/
├── app/
│   └── modules/
│       ├── Auth/          # Authentication (signup/login)
│       ├── Post/          # Posts, likes, comments
│       ├── Like/          # Like model
│       ├── Comment/       # Comment model
│       └── User/          # FCM token management
├── config/                # App config + Firebase setup
├── constants/             # Error codes, HTTP status
├── db/                    # Database connection
├── errors/                # Custom error classes + global handler
├── middleware/            # Auth middleware, validation middleware
├── routes/                # Route registration
└── utils/                 # Helpers (catchAsync, logger, pagination, notification)
```

## Setup Instructions

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- Firebase project (optional, for notifications)

### 1. Clone & Install

```bash
cd social-media-management-be
npm install
```

### 2. Configure Environment Variables

```bash
cp .env.example .env
```

Edit `.env` with your values:

| Variable | Description | Default |
|---|---|---|
| `NODE_ENV` | Environment | `development` |
| `PORT` | Server port | `5000` |
| `DATABASE_URL` | MongoDB connection string | `mongodb://localhost:27017/social-feed` |
| `JWT_SECRET` | Secret key for JWT signing | *(required - change this!)* |
| `JWT_EXPIRES_IN` | Token expiration | `7d` |
| `BCRYPT_SALT_ROUNDS` | Password hashing rounds | `10` |
| `FIREBASE_SERVICE_ACCOUNT_PATH` | Path to Firebase JSON key | *(optional)* |
| `CORS_ORIGIN` | Allowed CORS origins (comma-separated) | `http://localhost:5173,http://localhost:3000` |

### 3. Firebase Setup (Optional)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a project (or select existing)
3. Go to **Project Settings → Service Accounts**
4. Click **Generate New Private Key**
5. Save the JSON file in the project root (e.g., `firebase-service-account.json`)
6. Set in `.env`:
   ```
   FIREBASE_SERVICE_ACCOUNT_PATH=./firebase-service-account.json
   ```

> **Note:** If Firebase is not configured, the app works normally — push notifications are simply skipped.

### 4. Run

```bash
# Development (with auto-reload)
npm run dev

# Production build
npm run build
npm start
```

## API Documentation

Base URL: `http://localhost:5000/api`

### Authentication

#### POST `/auth/signup`

Register a new user.

**Request:**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "mypassword123"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "userId": "60d5ec9af682fbd12a899876",
      "email": "john@example.com",
      "username": "johndoe",
      "createdAt": "2025-01-15T10:30:00.000Z"
    }
  }
}
```

#### POST `/auth/login`

Login and receive JWT token.

**Request:**
```json
{
  "email": "john@example.com",
  "password": "mypassword123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "userId": "60d5ec9af682fbd12a899876",
      "email": "john@example.com",
      "username": "johndoe",
      "createdAt": "2025-01-15T10:30:00.000Z"
    },
    "token": "eyJhbGciOiJIUz...",
    "expiresIn": "7d"
  }
}
```

### Users

#### PUT `/users/fcm-token` 🔒

Update FCM token for push notifications.

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "fcmToken": "your-firebase-cloud-messaging-token"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "FCM token updated successfully"
}
```

### Posts

#### POST `/posts` 🔒

Create a new text-only post.

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "content": "Hello world! This is my first post."
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Post created successfully",
  "data": {
    "postId": "60d5ec9af682fbd12a899877",
    "content": "Hello world! This is my first post.",
    "author": "johndoe",
    "createdAt": "2025-01-15T10:35:00.000Z",
    "likeCount": 0,
    "commentCount": 0,
    "likedByCurrentUser": false
  }
}
```

#### GET `/posts` 🔒

Get paginated posts (newest first).

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
| Param | Type | Default | Description |
|---|---|---|---|
| `page` | number | 1 | Page number |
| `limit` | number | 10 | Posts per page (max 100) |
| `username` | string | — | Filter by username |

**Example:** `GET /posts?page=1&limit=10&username=johndoe`

**Response (200):**
```json
{
  "success": true,
  "page": 1,
  "totalPages": 3,
  "totalPosts": 25,
  "data": [
    {
      "postId": "60d5ec9af682fbd12a899877",
      "content": "Hello world!",
      "author": "johndoe",
      "createdAt": "2025-01-15T10:35:00.000Z",
      "likeCount": 5,
      "commentCount": 2,
      "likedByCurrentUser": true
    }
  ]
}
```

#### POST `/posts/:id/like` 🔒

Toggle like on a post (like if not liked, unlike if already liked).

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "message": "Post liked",
  "data": {
    "liked": true,
    "likeCount": 6
  }
}
```

#### POST `/posts/:id/comment` 🔒

Add a comment to a post.

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "content": "Great post!"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Comment added successfully",
  "data": {
    "comment": {
      "commentId": "60d5ec9af682fbd12a899878",
      "content": "Great post!",
      "author": "janedoe",
      "createdAt": "2025-01-15T11:00:00.000Z"
    },
    "commentCount": 3
  }
}
```

### Health Check

#### GET `/health`

```json
{
  "success": true,
  "message": "Server is healthy",
  "timestamp": "2025-01-15T10:30:00.000Z",
  "environment": "development"
}
```

## Notification Behavior

| Event | Notification Sent? | Condition |
|---|---|---|
| User A likes User B's post | ✅ Yes | A ≠ B and B has FCM token |
| User A likes own post | ❌ No | Self-interaction |
| User A comments on User B's post | ✅ Yes | A ≠ B and B has FCM token |
| Firebase not configured | ❌ Skipped | Logged, no error thrown |

**Notification payload:**
```json
{
  "type": "like",
  "postId": "60d5ec9af682fbd12a899877",
  "senderUsername": "johndoe"
}
```

## Error Response Format

All errors follow a consistent format:

```json
{
  "success": false,
  "message": "Error description",
  "errorMessages": [
    {
      "path": "body.email",
      "message": "Please provide a valid email address"
    }
  ]
}
```

## Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start dev server with hot reload |
| `npm run build` | Build TypeScript to JavaScript |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run format` | Format code with Prettier |

## License

MIT
