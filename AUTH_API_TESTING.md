# Postman Testing Guide

This guide details how to test the authentication endpoints for the Sales Agent Backend.

**Base URL**: `http://localhost:4000/api/auth` (Assuming server runs on port 4000)

## 1. Register User

Creates a new user account with email and password.

-   **Method**: `POST`
-   **URL**: `{{baseUrl}}/register`
-   **Body** (`JSON`):
    ```json
    {
    	"email": "test@example.com",
    	"password": "password123",
    	"name": "Test User"
    }
    ```
-   **Expected Response** (201 Created):
    ```json
    {
    	"id": "677c...",
    	"email": "test@example.com"
    }
    ```

## 2. Login

Authenticates a user and returns access/refresh tokens.

-   **Method**: `POST`
-   **URL**: `{{baseUrl}}/login`
-   **Body** (`JSON`):
    ```json
    {
    	"email": "test@example.com",
    	"password": "password123"
    }
    ```
-   **Expected Response** (200 OK):
    ```json
    {
    	"accessToken": "eyJhb...",
    	"refreshToken": "eyJhb..."
    }
    ```

## 3. Refresh Token

Obtains a new access token using a valid refresh token.

-   **Method**: `POST`
-   **URL**: `{{baseUrl}}/refresh`
-   **Body** (`JSON`):
    ```json
    {
    	"refreshToken": "<PASTE_YOUR_REFRESH_TOKEN_HERE>"
    }
    ```
-   **Expected Response** (200 OK):
    ```json
    {
    	"accessToken": "eyJhb..."
    }
    ```

## 4. Google Authentication

Initiates OAuth 2.0 flow with Google.

> [!NOTE]
> This cannot be fully tested inside Postman because it requires a browser to handle the Google Login redirect and consent screen.

**Steps to test:**

1.  Open your **Browser** (Chrome/Safari/etc).
2.  Navigate to `http://localhost:4000/api/auth/google`.
3.  You will be redirected to Google to sign in.
4.  After signing in, you will be redirected back to the `GOOGLE_CALLBACK_URL` (likely configured to redirect to frontend).
5.  If testing with backend only, it will redirect to `http://localhost:3000?accessToken=...&refreshToken=...`. You can copy the tokens from the URL bar.

## 5. Protected Routes (Example)

If you have other routes protected by JWT:

-   **Headers**:
    -   `Authorization`: `Bearer <PASTE_YOUR_ACCESS_TOKEN_HERE>`
