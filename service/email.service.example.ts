/**
 * Email Service Usage Examples
 *
 * This file demonstrates how to use the email service in your application.
 * DO NOT import this file in your application - it's for reference only.
 */

import emailService from './email.service';

// ============================================
// Example 1: Send Welcome Email
// ============================================
async function exampleSendWelcomeEmail() {
  try {
    await emailService.sendWelcomeEmail(
      'user@example.com',
      'John Doe'
    );
    console.log('Welcome email sent successfully');
  } catch (error) {
    console.error('Failed to send welcome email:', error);
  }
}

// ============================================
// Example 2: Send Password Reset Email
// ============================================
async function exampleSendPasswordResetEmail() {
  try {
    const resetToken = 'abc123def456'; // Generated token
    const resetUrl = `${process.env.DOMAIN}/reset-password?token=${resetToken}`;

    await emailService.sendPasswordResetEmail(
      'user@example.com',
      'John Doe',
      resetToken,
      resetUrl
    );
    console.log('Password reset email sent successfully');
  } catch (error) {
    console.error('Failed to send password reset email:', error);
  }
}

// ============================================
// Example 3: Send Password Change Confirmation
// ============================================
async function exampleSendPasswordChangeConfirmation() {
  try {
    await emailService.sendPasswordChangeConfirmation(
      'user@example.com',
      'John Doe'
    );
    console.log('Password change confirmation sent successfully');
  } catch (error) {
    console.error('Failed to send confirmation email:', error);
  }
}

// ============================================
// Example 4: Send Email Verification
// ============================================
async function exampleSendVerificationEmail() {
  try {
    const verificationToken = 'verify123abc456';
    const verificationUrl = `${process.env.DOMAIN}/verify-email?token=${verificationToken}`;

    await emailService.sendVerificationEmail(
      'user@example.com',
      'John Doe',
      verificationUrl
    );
    console.log('Verification email sent successfully');
  } catch (error) {
    console.error('Failed to send verification email:', error);
  }
}

// ============================================
// Example 5: Send Custom Email with Template
// ============================================
async function exampleSendCustomEmail() {
  try {
    await emailService.sendCustomEmail(
      'user@example.com',
      'Your Custom Subject',
      'your-custom-template', // Template name without .hbs extension
      {
        customVariable: 'Custom Value',
        anotherVariable: 'Another Value',
        items: ['Item 1', 'Item 2', 'Item 3']
      }
    );
    console.log('Custom email sent successfully');
  } catch (error) {
    console.error('Failed to send custom email:', error);
  }
}

// ============================================
// Example 6: Send Plain HTML Email (No Template)
// ============================================
async function exampleSendPlainEmail() {
  try {
    const htmlContent = `
      <h1>Hello from Email Service</h1>
      <p>This is a plain HTML email without using templates.</p>
    `;

    await emailService.sendPlainEmail(
      'user@example.com',
      'Plain Email Subject',
      htmlContent,
      'This is the plain text version'
    );
    console.log('Plain email sent successfully');
  } catch (error) {
    console.error('Failed to send plain email:', error);
  }
}

// ============================================
// Example 7: Send Email to Multiple Recipients
// ============================================
async function exampleSendToMultipleRecipients() {
  try {
    const recipients = ['user1@example.com', 'user2@example.com', 'user3@example.com'];

    await emailService.sendPlainEmail(
      recipients,
      'Bulk Email Subject',
      '<h1>Hello Everyone!</h1><p>This email was sent to multiple recipients.</p>'
    );
    console.log('Bulk email sent successfully');
  } catch (error) {
    console.error('Failed to send bulk email:', error);
  }
}

// ============================================
// Example 8: Verify Email Connection
// ============================================
async function exampleVerifyEmailConnection() {
  try {
    const isConnected = await emailService.verifyConnection();
    if (isConnected) {
      console.log('Email service is connected and ready');
    } else {
      console.log('Email service connection failed');
    }
  } catch (error) {
    console.error('Failed to verify email connection:', error);
  }
}

// ============================================
// Example 9: Integration with Auth Controller
// ============================================
// In your auth.controller.ts:

/*
import emailService from '../service/email.service';

// In signup handler
export const signup = asyncHandler(async (req: Request, res: Response) => {
  const { email, password, username } = req.body;

  // ... user creation logic ...

  // Send welcome email
  try {
    await emailService.sendWelcomeEmail(email, username);
  } catch (error) {
    // Log error but don't fail the signup
    console.error('Failed to send welcome email:', error);
  }

  res.status(201).json({ message: 'User created successfully' });
});

// In password change handler
export const changePassword = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.user;

  // ... password change logic ...

  // Send confirmation email
  try {
    const user = await User.findById(userId);
    await emailService.sendPasswordChangeConfirmation(user.email, user.username);
  } catch (error) {
    console.error('Failed to send password change confirmation:', error);
  }

  res.status(200).json({ message: 'Password changed successfully' });
});
*/

// ============================================
// Example 10: Error Handling Best Practices
// ============================================
async function exampleWithProperErrorHandling() {
  try {
    // Verify connection first (optional, but recommended)
    const isConnected = await emailService.verifyConnection();

    if (!isConnected) {
      throw new Error('Email service is not available');
    }

    // Send email
    await emailService.sendWelcomeEmail('user@example.com', 'John Doe');

    return { success: true, message: 'Email sent successfully' };
  } catch (error) {
    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes('template')) {
        console.error('Template error:', error.message);
        return { success: false, error: 'Email template not found' };
      }

      if (error.message.includes('SMTP')) {
        console.error('SMTP error:', error.message);
        return { success: false, error: 'Email server configuration error' };
      }
    }

    // Generic error
    console.error('Unexpected error:', error);
    return { success: false, error: 'Failed to send email' };
  }
}

export {
  exampleSendWelcomeEmail,
  exampleSendPasswordResetEmail,
  exampleSendPasswordChangeConfirmation,
  exampleSendVerificationEmail,
  exampleSendCustomEmail,
  exampleSendPlainEmail,
  exampleSendToMultipleRecipients,
  exampleVerifyEmailConnection,
  exampleWithProperErrorHandling,
};
