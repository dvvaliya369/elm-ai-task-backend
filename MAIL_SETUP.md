# Mail Service Setup Guide

## Overview
This mail service provides comprehensive email functionality for the ELM AI Task backend, including template-based emails, bulk sending, and various email types like welcome emails, password resets, and notifications.

## Features
- ✅ SMTP configuration with multiple provider support
- ✅ HTML email templates with Handlebars
- ✅ Bulk email sending with rate limiting
- ✅ Email validation and error handling
- ✅ Template caching for performance
- ✅ Attachment support
- ✅ Pre-built email templates (welcome, password reset, verification, notifications)

## Environment Variables

Add the following environment variables to your `.env` file:

```env
# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FROM_EMAIL=your-email@gmail.com
FROM_NAME=ELM AI Task
```

### SMTP Provider Examples

#### Gmail
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password  # Use App Password, not regular password
```

#### SendGrid
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
```

#### Outlook/Hotmail
```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@outlook.com
SMTP_PASS=your-password
```

## API Endpoints

### 1. Send Basic Email
```http
POST /api/mail/send
Content-Type: application/json

{
  "to": "recipient@example.com",
  "subject": "Test Email",
  "text": "Plain text content",
  "html": "<h1>HTML content</h1>"
}
```

### 2. Send Template Email
```http
POST /api/mail/send-template
Content-Type: application/json

{
  "to": "recipient@example.com",
  "subject": "Welcome!",
  "template": "welcome",
  "data": {
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

### 3. Send Welcome Email
```http
POST /api/mail/send-welcome
Content-Type: application/json

{
  "to": "newuser@example.com",
  "userData": {
    "name": "John Doe",
    "email": "newuser@example.com",
    "dashboardUrl": "https://app.elmaitask.com/dashboard",
    "helpUrl": "https://app.elmaitask.com/help",
    "communityUrl": "https://community.elmaitask.com"
  }
}
```

### 4. Send Password Reset Email
```http
POST /api/mail/send-password-reset
Content-Type: application/json

{
  "to": "user@example.com",
  "resetData": {
    "name": "John Doe",
    "resetLink": "https://app.elmaitask.com/reset-password?token=abc123",
    "expiresIn": "24 hours"
  }
}
```

### 5. Send Email Verification
```http
POST /api/mail/send-email-verification
Content-Type: application/json

{
  "to": "user@example.com",
  "verificationData": {
    "name": "John Doe",
    "verificationLink": "https://app.elmaitask.com/verify-email?token=abc123"
  }
}
```

### 6. Send Notification Email
```http
POST /api/mail/send-notification
Content-Type: application/json

{
  "to": "user@example.com",
  "notificationData": {
    "title": "Task Completed",
    "message": "Your AI task has been completed successfully!",
    "actionUrl": "https://app.elmaitask.com/tasks/123",
    "actionText": "View Task"
  }
}
```

### 7. Send Bulk Emails
```http
POST /api/mail/send-bulk
Content-Type: application/json

{
  "emails": [
    {
      "to": "user1@example.com",
      "subject": "Bulk Email 1",
      "text": "Content for user 1"
    },
    {
      "to": "user2@example.com",
      "subject": "Bulk Email 2",
      "text": "Content for user 2"
    }
  ],
  "batchSize": 5,
  "delay": 1000
}
```

### 8. Verify SMTP Connection
```http
GET /api/mail/verify-connection
```

### 9. Get Service Status
```http
GET /api/mail/status
```

### 10. Clear Template Cache
```http
POST /api/mail/clear-cache
```

## Email Templates

The service includes pre-built templates located in `templates/emails/`:

- `welcome.hbs` - Welcome email for new users
- `password-reset.hbs` - Password reset email
- `email-verification.hbs` - Email verification
- `notification.hbs` - General notifications

### Template Structure
Templates use Handlebars syntax and include:
- Header partial (`templates/partials/header.hbs`)
- Footer partial (`templates/partials/footer.hbs`)
- Responsive CSS styling
- Dynamic content placeholders

### Creating Custom Templates

1. Create a new `.hbs` file in `templates/emails/`
2. Use Handlebars syntax for dynamic content
3. Include header and footer partials:
   ```handlebars
   {{> header title="Your Title"}}
   
   <div class="content">
     <!-- Your content here -->
   </div>
   
   {{> footer currentDate=(new Date) unsubscribeUrl=unsubscribeUrl}}
   ```

## Usage Examples

### Basic Email Service Usage
```typescript
import mailService from '../service/mail.service';

// Send simple email
const result = await mailService.sendEmail({
  to: 'user@example.com',
  subject: 'Hello',
  text: 'Hello World!'
});

// Send template email
const templateResult = await mailService.sendTemplateEmail({
  to: 'user@example.com',
  subject: 'Welcome',
  template: 'welcome',
  data: { name: 'John', email: 'john@example.com' }
});
```

### Integration with Authentication
```typescript
// In your auth controller
import mailService from '../service/mail.service';

// After user registration
await mailService.sendWelcomeEmail(user.email, {
  name: user.name,
  email: user.email
});

// For password reset
await mailService.sendPasswordResetEmail(user.email, {
  name: user.name,
  resetLink: `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`,
  expiresIn: '24 hours'
});
```

## Error Handling

The service includes comprehensive error handling:

- Email validation
- SMTP connection verification
- Template loading errors
- Sending failures with detailed error messages

All methods return a consistent response format:
```typescript
{
  success: boolean;
  messageId?: string;  // On success
  error?: string;      // On failure
}
```

## Security Considerations

1. **Environment Variables**: Never commit SMTP credentials to version control
2. **Email Validation**: All email addresses are validated before sending
3. **Rate Limiting**: Bulk emails include configurable rate limiting
4. **Input Sanitization**: Template data is properly escaped
5. **App Passwords**: Use app-specific passwords for Gmail, not regular passwords

## Testing

### Test SMTP Configuration
```bash
curl -X GET http://localhost:8000/api/mail/verify-connection
```

### Test Basic Email
```bash
curl -X POST http://localhost:8000/api/mail/send \
  -H "Content-Type: application/json" \
  -d '{
    "to": "test@example.com",
    "subject": "Test Email",
    "text": "This is a test email"
  }'
```

## Troubleshooting

### Common Issues

1. **SMTP Authentication Failed**
   - Check credentials in environment variables
   - For Gmail, ensure 2FA is enabled and use App Password
   - Verify SMTP host and port settings

2. **Template Not Found**
   - Ensure template file exists in `templates/emails/`
   - Check file permissions
   - Verify template name matches exactly

3. **Connection Timeout**
   - Check firewall settings
   - Verify SMTP port is not blocked
   - Try different SMTP ports (25, 465, 587)

4. **Email Not Delivered**
   - Check spam folder
   - Verify recipient email address
   - Check SMTP provider logs

### Debug Mode
Enable debug logging by setting:
```env
NODE_ENV=development
```

## Performance Optimization

- Templates are cached after first load
- Bulk emails are processed in configurable batches
- Connection pooling is handled by nodemailer
- Rate limiting prevents overwhelming SMTP servers

## Dependencies

- `nodemailer`: SMTP client for Node.js
- `handlebars`: Template engine for dynamic emails
- `@types/nodemailer`: TypeScript definitions

## Support

For issues or questions:
1. Check the troubleshooting section
2. Verify environment configuration
3. Test SMTP connection
4. Review server logs for detailed error messages