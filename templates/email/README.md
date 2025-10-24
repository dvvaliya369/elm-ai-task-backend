# Email Templates

This directory contains Handlebars (HBS) templates for sending emails through the email service.

## Available Templates

### 1. welcome.hbs
Sent when a new user registers on the platform.

**Variables:**
- `userName` - The user's name
- `appName` - Application name (auto-injected)
- `year` - Current year (auto-injected)

### 2. password-reset.hbs
Sent when a user requests a password reset.

**Variables:**
- `userName` - The user's name
- `resetUrl` - The password reset URL
- `resetToken` - The reset token
- `expiryTime` - Token expiry time
- `appName` - Application name (auto-injected)
- `year` - Current year (auto-injected)

### 3. password-change-confirmation.hbs
Sent after a user successfully changes their password.

**Variables:**
- `userName` - The user's name
- `changeDate` - Date and time of password change
- `appName` - Application name (auto-injected)
- `year` - Current year (auto-injected)

### 4. email-verification.hbs
Sent to verify a user's email address.

**Variables:**
- `userName` - The user's name
- `verificationUrl` - The verification URL
- `appName` - Application name (auto-injected)
- `year` - Current year (auto-injected)

## Creating Custom Templates

To create a new email template:

1. Create a new `.hbs` file in this directory
2. Use HTML and Handlebars syntax for variables: `{{variableName}}`
3. Use the email service to send emails with your template

Example:
```typescript
import emailService from '../service/email.service';

await emailService.sendCustomEmail(
  'user@example.com',
  'Your Subject',
  'your-template-name',  // filename without .hbs extension
  {
    customVariable: 'value',
    anotherVariable: 'another value'
  }
);
```

## Template Best Practices

- Keep templates responsive and mobile-friendly
- Use inline CSS for better email client compatibility
- Test templates across different email clients
- Keep file sizes small for faster loading
- Include plain text alternatives when possible
- Use semantic HTML structure
