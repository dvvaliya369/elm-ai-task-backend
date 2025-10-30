# Email Functionality Setup Guide

## Overview
This project now includes comprehensive email sending functionality with support for welcome emails, password reset, email verification, and custom email sending.

## Environment Variables
Add the following environment variables to your `.env` file:

```env
# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=your-email@gmail.com
EMAIL_FROM_NAME=ELM AI Task
FRONTEND_URL=http://localhost:3000
```

### Gmail Setup
1. Enable 2-factor authentication on your Gmail account
2. Generate an App Password: Google Account → Security → App passwords
3. Use the generated app password as `SMTP_PASS`

### Other Email Providers
- **SendGrid**: Use `smtp.sendgrid.net` with port `587`
- **Mailgun**: Use `smtp.mailgun.org` with port `587`
- **Custom SMTP**: Configure according to your provider's settings

## API Endpoints

### Email Routes (`/api/email`)

#### Test Email Configuration
```http
GET /api/email/test-config
Authorization: Bearer <access_token>
```

#### Send Custom Email
```http
POST /api/email/send
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "to": "recipient@example.com",
  "subject": "Test Email",
  "message": "Plain text message",
  "html": "<h1>HTML message</h1>"
}
```

#### Request Password Reset
```http
POST /api/email/password-reset/request
Content-Type: application/json

{
  "email": "user@example.com"
}
```

#### Confirm Password Reset
```http
POST /api/email/password-reset/confirm
Content-Type: application/json

{
  "token": "reset-token-from-email",
  "newPassword": "newpassword123"
}
```

#### Send Email Verification
```http
POST /api/email/verification/send
Content-Type: application/json

{
  "email": "user@example.com"
}
```

#### Verify Email
```http
POST /api/email/verification/verify
Content-Type: application/json

{
  "token": "verification-token-from-email"
}
```

## Features

### 1. Welcome Email
- Automatically sent after successful user registration
- Beautiful HTML template with company branding
- Includes getting started guide and dashboard link

### 2. Password Reset
- Secure token-based password reset flow
- Tokens expire after 1 hour
- Email includes direct reset link to frontend

### 3. Email Verification
- Optional email verification system
- Tokens expire after 24 hours
- Tracks verification status in user profile

### 4. Custom Email Sending
- Send custom emails to single or multiple recipients
- Support for both HTML and plain text
- Protected endpoint requiring authentication

### 5. Email Templates
- Professional HTML email templates
- Responsive design for all devices
- Consistent branding across all emails

## Database Schema Updates

The user schema has been extended with the following fields:

```typescript
{
  emailVerified: Boolean (default: false),
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  passwordResetToken: String,
  passwordResetExpires: Date
}
```

## Security Features

- Email address validation
- Token expiration for security
- Rate limiting ready (implement as needed)
- Secure password reset flow
- Non-revealing error messages

## Error Handling

- Graceful email sending failures
- Detailed logging for debugging
- User-friendly error messages
- Fallback mechanisms

## Testing

### Manual Testing
1. Set up email configuration
2. Test email config endpoint
3. Register a new user (should receive welcome email)
4. Test password reset flow
5. Test email verification flow

### Email Testing Services
- Use [Mailtrap](https://mailtrap.io/) for development testing
- Use [MailHog](https://github.com/mailhog/MailHog) for local testing

## Troubleshooting

### Common Issues

1. **Gmail Authentication Error**
   - Ensure 2FA is enabled
   - Use App Password, not regular password
   - Check "Less secure app access" if using regular password

2. **Email Not Sending**
   - Check SMTP configuration
   - Verify network connectivity
   - Check email provider limits

3. **HTML Not Rendering**
   - Ensure HTML is properly formatted
   - Test with different email clients
   - Use inline CSS for better compatibility

### Debug Mode
Enable detailed logging by setting `NODE_ENV=development` in your environment variables.

## Production Considerations

1. **Email Service Provider**: Consider using dedicated email services like SendGrid, Mailgun, or AWS SES for production
2. **Rate Limiting**: Implement rate limiting for email endpoints
3. **Queue System**: Use Redis or similar for email queuing in high-volume scenarios
4. **Monitoring**: Set up email delivery monitoring and alerts
5. **Templates**: Store email templates in a database for easy updates

## Next Steps

1. Implement email queue system for better performance
2. Add email analytics and tracking
3. Create admin panel for email template management
4. Add support for email attachments
5. Implement email preferences for users