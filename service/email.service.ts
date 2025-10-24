import nodemailer, { Transporter } from 'nodemailer';
import * as fs from 'fs';
import * as path from 'path';
import Handlebars from 'hbs';
import envConfig from '../config/env.config';

interface EmailOptions {
  to: string | string[];
  subject: string;
  template?: string;
  context?: Record<string, any>;
  html?: string;
  text?: string;
  attachments?: Array<{
    filename: string;
    path?: string;
    content?: Buffer | string;
  }>;
}

interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
  from: {
    name: string;
    email: string;
  };
}

class EmailService {
  private transporter: Transporter | null = null;
  private readonly templatesPath: string;
  private emailConfig: EmailConfig;

  constructor() {
    this.templatesPath = path.join(__dirname, '../templates/email');
    this.emailConfig = {
      host: envConfig.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(envConfig.SMTP_PORT || '587'),
      secure: envConfig.SMTP_PORT === '465',
      auth: {
        user: envConfig.SMTP_USER || '',
        pass: envConfig.SMTP_PASSWORD || '',
      },
      from: {
        name: envConfig.SMTP_FROM_NAME || 'Your App',
        email: envConfig.SMTP_FROM_EMAIL || envConfig.SMTP_USER || '',
      },
    };
    this.initializeTransporter();
  }

  /**
   * Initialize the nodemailer transporter
   */
  private initializeTransporter(): void {
    try {
      this.transporter = nodemailer.createTransport({
        host: this.emailConfig.host,
        port: this.emailConfig.port,
        secure: this.emailConfig.secure,
        auth: {
          user: this.emailConfig.auth.user,
          pass: this.emailConfig.auth.pass,
        },
      });

      console.log('Email service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize email service:', error);
    }
  }

  /**
   * Verify the email transporter connection
   */
  async verifyConnection(): Promise<boolean> {
    if (!this.transporter) {
      console.error('Email transporter not initialized');
      return false;
    }

    try {
      await this.transporter.verify();
      console.log('Email server connection verified');
      return true;
    } catch (error) {
      console.error('Email server connection failed:', error);
      return false;
    }
  }

  /**
   * Load and compile HBS template
   */
  private async loadTemplate(templateName: string, context: Record<string, any>): Promise<string> {
    try {
      const templatePath = path.join(this.templatesPath, `${templateName}.hbs`);

      // Check if template exists
      if (!fs.existsSync(templatePath)) {
        throw new Error(`Email template '${templateName}' not found at ${templatePath}`);
      }

      const templateSource = fs.readFileSync(templatePath, 'utf-8');
      const template = Handlebars.compile(templateSource);
      return template(context);
    } catch (error) {
      console.error(`Error loading template '${templateName}':`, error);
      throw error;
    }
  }

  /**
   * Send email
   */
  async sendEmail(options: EmailOptions): Promise<boolean> {
    if (!this.transporter) {
      throw new Error('Email transporter not initialized. Please check your SMTP configuration.');
    }

    try {
      let htmlContent = options.html;

      // If template is provided, compile it with context
      if (options.template && options.context) {
        htmlContent = await this.loadTemplate(options.template, options.context);
      }

      const mailOptions = {
        from: `"${this.emailConfig.from.name}" <${this.emailConfig.from.email}>`,
        to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
        subject: options.subject,
        text: options.text,
        html: htmlContent,
        attachments: options.attachments,
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('Email sent successfully:', info.messageId);
      return true;
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  }

  /**
   * Send welcome email to new users
   */
  async sendWelcomeEmail(to: string, userName: string): Promise<boolean> {
    return this.sendEmail({
      to,
      subject: 'Welcome to Our Platform!',
      template: 'welcome',
      context: {
        userName,
        year: new Date().getFullYear(),
        appName: this.emailConfig.from.name,
      },
    });
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(to: string, userName: string, resetToken: string, resetUrl: string): Promise<boolean> {
    return this.sendEmail({
      to,
      subject: 'Password Reset Request',
      template: 'password-reset',
      context: {
        userName,
        resetUrl,
        resetToken,
        expiryTime: '1 hour',
        year: new Date().getFullYear(),
        appName: this.emailConfig.from.name,
      },
    });
  }

  /**
   * Send password change confirmation email
   */
  async sendPasswordChangeConfirmation(to: string, userName: string): Promise<boolean> {
    return this.sendEmail({
      to,
      subject: 'Password Changed Successfully',
      template: 'password-change-confirmation',
      context: {
        userName,
        changeDate: new Date().toLocaleString(),
        year: new Date().getFullYear(),
        appName: this.emailConfig.from.name,
      },
    });
  }

  /**
   * Send verification email
   */
  async sendVerificationEmail(to: string, userName: string, verificationUrl: string): Promise<boolean> {
    return this.sendEmail({
      to,
      subject: 'Verify Your Email Address',
      template: 'email-verification',
      context: {
        userName,
        verificationUrl,
        year: new Date().getFullYear(),
        appName: this.emailConfig.from.name,
      },
    });
  }

  /**
   * Send custom email with template
   */
  async sendCustomEmail(
    to: string | string[],
    subject: string,
    template: string,
    context: Record<string, any>
  ): Promise<boolean> {
    return this.sendEmail({
      to,
      subject,
      template,
      context: {
        ...context,
        year: new Date().getFullYear(),
        appName: this.emailConfig.from.name,
      },
    });
  }

  /**
   * Send plain email without template
   */
  async sendPlainEmail(to: string | string[], subject: string, html: string, text?: string): Promise<boolean> {
    return this.sendEmail({
      to,
      subject,
      html,
      text,
    });
  }
}

export default new EmailService();
