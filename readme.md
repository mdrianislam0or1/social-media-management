# Social Media Management System

> [!IMPORTANT]
> **Default Frontend Login Credentials:**
> - **Email:** `rianislamrian@gmail.com`
> - **Password:** `password@123`

A full-stack social media management application consisting of a high-performance Node.js API and a modern React Native mobile application. This system supports user authentication, posting content, liking and commenting on posts, and real-time push notifications using Firebase Cloud Messaging (FCM).

---

## 🏗 System Architecture

The project is divided into two main components:

1.  **Backend (`social-media-management-be`)**: A robust REST API built with TypeScript and Express.
2.  **Frontend (`social_media_app_mb`)**: A cross-platform mobile application built with Expo and React Native.

---

## 🚀 Backend (API) Details

Located in: `social-media-management-be/`

The backend is built following clean architecture principles, ensuring modularity and scalability.

### 🛠 Tech Stack
- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MongoDB (via Mongoose)
- **Security**: JWT Authentication, Bcryptjs, Helmet, Express-rate-limit
- **Cloud Messaging**: Firebase Admin SDK (for FCM notifications)

### 📦 Key Modules
- **Auth**: Secure user registration and login.
- **Post**: Create, read, update, and delete social media posts.
- **Like**: Like/unlike functionality for engagement.
- **Comment**: Threaded discussions on posts.
- **User**: Profile management and FCM token storage.

### ⚙️ Setup & Installation
1. Navigate to the backend directory:
   ```bash
   cd social-media-management-be
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure Environment Variables:
   Create a `.env` file based on `.env.example`.
4. Start the development server:
   ```bash
   npm run dev
   ```

---

## 📱 Frontend (Mobile App) Details

Located in: `social_media_app_mb/`

A sleek, intuitive mobile experience designed for seamless social interaction.

### 🛠 Tech Stack
- **Framework**: Expo / React Native
- **Navigation**: Expo Router (File-based routing)
- **State Management**: React Context / Hooks
- **Styling**: Nativewind / Vanilla Styles
- **Notifications**: Expo Notifications
- **HTTP Client**: Axios

### ✨ Features
- **Modern UI/UX**: Clean layout with tab navigation.
- **Authentication**: Secure login and persistent sessions.
- **Real-time Interaction**: Instant feed updates and engagement buttons.
- **Push Notifications**: Receive alerts for likes, comments, and new posts via FCM.

### ⚙️ Setup & Installation
1. Navigate to the mobile app directory:
   ```bash
   cd social_media_app_mb
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Expo development server:
   ```bash
   npx expo start
   ```

---

## 🔔 Real-time Notifications (FCM)

Both the frontend and backend are integrated with **Firebase Cloud Messaging**.
- The **Backend** stores user FCM tokens and triggers notifications when events occur (e.g., new comment).
- The **Frontend** registers the device token and handles incoming notifications using `expo-notifications`.

---

## 👨‍💻 Author
**Rian Islam**
Project: Social Media Management System (Full Stack)
