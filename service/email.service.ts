import { createTransporter } from '../config/email.config';
import emailConfig from '../config/email.config';
import envConfig from '../config/env.config';
import { AppError } from './asyncHandler';

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  attachments?: any[];
}

export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

class EmailService {
  private transporter;

  constructor() {
    this.transporter = createTransporter();
  }

  /**
   * Send email using nodemailer
   */
  async sendEmail(options: EmailOptions): Promise<void> {
    try {
      const mailOptions = {
        from: `${emailConfig.from.name} <${emailConfig.from.address}>`,
        to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
        attachments: options.attachments,
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('Email sent successfully:', info.messageId);
    } catch (error) {
      console.error('Email sending failed:', error);
      throw new AppError('Failed to send email', 500);
    }
  }

  /**
   * Generate welcome email template
   */
  generateWelcomeEmail(firstName: string, lastName: string): EmailTemplate {
    const fullName = `${firstName} ${lastName}`.trim();
    
    const subject = `Welcome to ELM AI Task, ${firstName}!`;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to ELM AI Task</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to ELM AI Task!</h1>
          </div>
          <div class="content">
            <h2>Hello ${fullName}!</h2>
            <p>Thank you for joining ELM AI Task. We're excited to have you on board!</p>
            <p>Your account has been successfully created and you can now start exploring our platform.</p>
            <p>Here's what you can do next:</p>
            <ul>
              <li>Complete your profile setup</li>
              <li>Explore the dashboard</li>
              <li>Start creating your first tasks</li>
            </ul>
            <a href="${envConfig.FRONTEND_URL}/dashboard" class="button">Get Started</a>
            <p>If you have any questions, feel free to reach out to our support team.</p>
            <p>Best regards,<br>The ELM AI Task Team</p>
          </div>
          <div class="footer">
            <p>© 2024 ELM AI Task. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
      Welcome to ELM AI Task, ${firstName}!
      
      Hello ${fullName}!
      
      Thank you for joining ELM AI Task. We're excited to have you on board!
      
      Your account has been successfully created and you can now start exploring our platform.
      
      Here's what you can do next:
      - Complete your profile setup
      - Explore the dashboard
      - Start creating your first tasks
      
      Visit: ${envConfig.FRONTEND_URL}/dashboard
      
      If you have any questions, feel free to reach out to our support team.
      
      Best regards,
      The ELM AI Task Team
      
      © 2024 ELM AI Task. All rights reserved.
    `;

    return { subject, html, text };
  }

  /**
   * Generate password reset email template
   */
  generatePasswordResetEmail(firstName: string, resetToken: string): EmailTemplate {
    const resetUrl = `${envConfig.FRONTEND_URL}/reset-password?token=${resetToken}`;
    
    const subject = 'Password Reset Request - ELM AI Task';
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #dc3545; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #dc3545; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Password Reset Request</h1>
          </div>
          <div class="content">
            <h2>Hello ${firstName}!</h2>
            <p>We received a request to reset your password for your ELM AI Task account.</p>
            <p>Click the button below to reset your password:</p>
            <a href="${resetUrl}" class="button">Reset Password</a>
            <div class="warning">
              <strong>Important:</strong> This link will expire in 1 hour for security reasons.
            </div>
            <p>If you didn't request this password reset, please ignore this email. Your password will remain unchanged.</p>
            <p>For security reasons, please don't share this email with anyone.</p>
            <p>Best regards,<br>The ELM AI Task Team</p>
          </div>
          <div class="footer">
            <p>© 2024 ELM AI Task. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
      Password Reset Request - ELM AI Task
      
      Hello ${firstName}!
      
      We received a request to reset your password for your ELM AI Task account.
      
      Click the link below to reset your password:
      ${resetUrl}
      
      Important: This link will expire in 1 hour for security reasons.
      
      If you didn't request this password reset, please ignore this email. Your password will remain unchanged.
      
      For security reasons, please don't share this email with anyone.
      
      Best regards,
      The ELM AI Task Team
      
      © 2024 ELM AI Task. All rights reserved.
    `;

    return { subject, html, text };
  }

  /**
   * Generate email verification template
   */
  generateEmailVerificationEmail(firstName: string, verificationToken: string): EmailTemplate {
    const verificationUrl = `${envConfig.FRONTEND_URL}/verify-email?token=${verificationToken}`;
    
    const subject = 'Verify Your Email - ELM AI Task';
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Email Verification</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #28a745; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #28a745; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Verify Your Email</h1>
          </div>
          <div class="content">
            <h2>Hello ${firstName}!</h2>
            <p>Thank you for signing up with ELM AI Task. To complete your registration, please verify your email address.</p>
            <p>Click the button below to verify your email:</p>
            <a href="${verificationUrl}" class="button">Verify Email</a>
            <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #666;">${verificationUrl}</p>
            <p>This verification link will expire in 24 hours.</p>
            <p>If you didn't create an account with us, please ignore this email.</p>
            <p>Best regards,<br>The ELM AI Task Team</p>
          </div>
          <div class="footer">
            <p>© 2024 ELM AI Task. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
      Verify Your Email - ELM AI Task
      
      Hello ${firstName}!
      
      Thank you for signing up with ELM AI Task. To complete your registration, please verify your email address.
      
      Click the link below to verify your email:
      ${verificationUrl}
      
      This verification link will expire in 24 hours.
      
      If you didn't create an account with us, please ignore this email.
      
      Best regards,
      The ELM AI Task Team
      
      © 2024 ELM AI Task. All rights reserved.
    `;

    return { subject, html, text };
  }

  /**
   * Send welcome email
   */
  async sendWelcomeEmail(email: string, firstName: string, lastName: string): Promise<void> {
    const template = this.generateWelcomeEmail(firstName, lastName);
    await this.sendEmail({
      to: email,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(email: string, firstName: string, resetToken: string): Promise<void> {
    const template = this.generatePasswordResetEmail(firstName, resetToken);
    await this.sendEmail({
      to: email,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
  }

  /**
   * Send email verification email
   */
  async sendEmailVerificationEmail(email: string, firstName: string, verificationToken: string): Promise<void> {
    const template = this.generateEmailVerificationEmail(firstName, verificationToken);
    await this.sendEmail({
      to: email,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
  }

  /**
   * Validate email address
   */
  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Test email configuration
   */
  async testEmailConfiguration(): Promise<boolean> {
    try {
      await this.transporter.verify();
      return true;
    } catch (error) {
      console.error('Email configuration test failed:', error);
      return false;
    }
  }
}

export default new EmailService();