# Security Features Documentation

This document outlines the security features implemented in the AIBeautyLens backend application.

## Authentication and Authorization

### JWT Authentication

The application uses JSON Web Tokens (JWT) for authentication with the following security measures:

- **Access Token**: Short-lived token (default: 1 hour) for API access
- **Refresh Token**: Long-lived token (default: 7 days) stored securely for token renewal
- **Token Rotation**: Refresh tokens are rotated on each use for enhanced security
- **Expiration Verification**: Both tokens have expiration dates verified on each request

### Role-Based Access Control (RBAC)

- User roles (Clinician, Admin) are used to control access to resources
- Role information is encoded in JWT tokens
- Guards verify role requirements for protected endpoints

## Password Security

- **Hashing**: Passwords are hashed using bcrypt with a secure work factor
- **Salting**: Each password is individually salted
- **Minimum Requirements**: Passwords require at least 8 characters
- **Reset Flow**: Secure password reset using time-limited tokens

## Email Verification

- New accounts require email verification
- Verification tokens expire after 24 hours
- Option to resend verification emails
- Verification status is checked for sensitive operations

## Token Security

### Password Reset Tokens

- Random 32-byte tokens generated using the crypto module
- Time-limited (1-hour expiration)
- Single-use (invalidated after use)
- Stored as hashed values in the database

### Refresh Tokens

- Random 40-byte tokens generated using the crypto module
- Time-limited (7-day expiration by default)
- Rotated on each use
- Invalidated on password change/reset or logout
- Stored securely in the database

## API Security

- **CORS**: Configured to restrict access to trusted origins
- **Rate Limiting**: Protects against brute force attacks
- **HTTP Headers**: Security headers set for all responses
- **Input Validation**: All inputs validated using class-validator

## Environment Security

- Sensitive configuration stored in environment variables
- Sample .env.example provided without actual secrets
- Different environments (development, production) have appropriate security settings

## API Endpoints

### Authentication Endpoints

- `POST /api/auth/register`: Register a new clinician account
- `POST /api/auth/login`: Authenticate and receive tokens
- `POST /api/auth/refresh-token`: Refresh an expired access token
- `POST /api/auth/logout`: Invalidate refresh token
- `GET /api/auth/profile`: Get authenticated user profile

### Email Verification Endpoints

- `POST /api/auth/verify-email`: Verify email using token
- `POST /api/auth/resend-verification`: Resend verification email

### Password Reset Endpoints

- `POST /api/auth/request-password-reset`: Request a password reset
- `POST /api/auth/reset-password`: Reset password using token

## Security Best Practices

1. **Token Storage**:
   - Store access tokens in memory for web applications
   - For mobile apps, use secure storage mechanisms

2. **API Requests**:
   - Always use HTTPS
   - Include tokens in Authorization header

3. **Error Handling**:
   - Generic error messages for security-related failures
   - Detailed logging for administrative visibility

4. **Account Protection**:
   - Consider implementing account lockout after failed attempts
   - Notify users of suspicious activities

## Future Enhancements

- Two-factor authentication (2FA)
- Device fingerprinting
- IP-based restrictions
- OAuth integration for third-party authentication 