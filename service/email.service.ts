import nodemailer, { Transporter } from 'nodemailer';
import envConfig from '../config/env.config';

interface EmailOptions {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  from?: string;
  cc?: string | string[];
  bcc?: string | string[];
  attachments?: Array<{
    filename: string;
    content?: string | Buffer;
    path?: string;
  }>;
}

interface EmailServiceResponse {
  success: boolean;
  messageId?: string;
  message: string;
}

class EmailService {
  private transporter: Transporter | null = null;
  private isConfigured: boolean = false;

  constructor() {
    this.initializeTransporter();
  }

  private initializeTransporter(): void {
    try {
      if (!envConfig.EMAIL_HOST || !envConfig.EMAIL_PORT || !envConfig.EMAIL_USER || !envConfig.EMAIL_PASSWORD) {
        console.warn('Email service not configured. Please set EMAIL_HOST, EMAIL_PORT, EMAIL_USER, and EMAIL_PASSWORD in environment variables.');
        this.isConfigured = false;
        return;
      }

      this.transporter = nodemailer.createTransport({
        host: envConfig.EMAIL_HOST,
        port: parseInt(envConfig.EMAIL_PORT as string),
        secure: envConfig.EMAIL_SECURE === 'true', // true for 465, false for other ports
        auth: {
          user: envConfig.EMAIL_USER,
          pass: envConfig.EMAIL_PASSWORD,
        },
      });

      this.isConfigured = true;
      console.log('Email service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize email service:', error);
      this.isConfigured = false;
    }
  }

  async sendEmail(options: EmailOptions): Promise<EmailServiceResponse> {
    if (!this.isConfigured || !this.transporter) {
      return {
        success: false,
        message: 'Email service is not configured. Please check your environment variables.',
      };
    }

    try {
      const mailOptions = {
        from: options.from || envConfig.EMAIL_FROM || envConfig.EMAIL_USER,
        to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
        cc: options.cc ? (Array.isArray(options.cc) ? options.cc.join(', ') : options.cc) : undefined,
        bcc: options.bcc ? (Array.isArray(options.bcc) ? options.bcc.join(', ') : options.bcc) : undefined,
        attachments: options.attachments,
      };

      const info = await this.transporter.sendMail(mailOptions);

      return {
        success: true,
        messageId: info.messageId,
        message: 'Email sent successfully',
      };
    } catch (error) {
      console.error('Error sending email:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to send email',
      };
    }
  }

  async sendWelcomeEmail(email: string, firstName: string, lastName: string): Promise<EmailServiceResponse> {
    const fullName = `${firstName} ${lastName}`;

    return this.sendEmail({
      to: email,
      subject: 'Welcome to ELM AI Task!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Welcome to ELM AI Task, ${fullName}!</h2>
          <p>Thank you for signing up. We're excited to have you on board.</p>
          <p>You can now:</p>
          <ul>
            <li>Create and share posts</li>
            <li>Interact with other users</li>
            <li>Manage your profile</li>
          </ul>
          <p>If you have any questions, feel free to reach out to our support team.</p>
          <p style="color: #666; font-size: 12px; margin-top: 30px;">
            This is an automated message. Please do not reply to this email.
          </p>
        </div>
      `,
      text: `Welcome to ELM AI Task, ${fullName}! Thank you for signing up. We're excited to have you on board.`,
    });
  }

  async sendPasswordResetEmail(email: string, resetToken: string): Promise<EmailServiceResponse> {
    const resetLink = `${envConfig.DOMAIN}/reset-password?token=${resetToken}`;

    return this.sendEmail({
      to: email,
      subject: 'Password Reset Request',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Password Reset Request</h2>
          <p>We received a request to reset your password. Click the button below to create a new password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" style="background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
              Reset Password
            </a>
          </div>
          <p>Or copy and paste this link into your browser:</p>
          <p style="color: #666; word-break: break-all;">${resetLink}</p>
          <p style="color: #999; font-size: 12px; margin-top: 30px;">
            If you didn't request a password reset, please ignore this email. This link will expire in 1 hour.
          </p>
        </div>
      `,
      text: `Password Reset Request\n\nWe received a request to reset your password. Visit the following link to create a new password:\n\n${resetLink}\n\nIf you didn't request a password reset, please ignore this email. This link will expire in 1 hour.`,
    });
  }

  async sendPasswordChangedEmail(email: string, fullName: string): Promise<EmailServiceResponse> {
    return this.sendEmail({
      to: email,
      subject: 'Password Changed Successfully',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Password Changed</h2>
          <p>Hi ${fullName},</p>
          <p>Your password has been changed successfully.</p>
          <p>If you didn't make this change, please contact our support team immediately.</p>
          <p style="color: #666; font-size: 12px; margin-top: 30px;">
            This is an automated message. Please do not reply to this email.
          </p>
        </div>
      `,
      text: `Hi ${fullName},\n\nYour password has been changed successfully.\n\nIf you didn't make this change, please contact our support team immediately.`,
    });
  }

  async verifyConnection(): Promise<boolean> {
    if (!this.isConfigured || !this.transporter) {
      return false;
    }

    try {
      await this.transporter.verify();
      return true;
    } catch (error) {
      console.error('Email service verification failed:', error);
      return false;
    }
  }
}

export default new EmailService();
