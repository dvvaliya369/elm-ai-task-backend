import nodemailer, { SendMailOptions, Transporter } from 'nodemailer';
import handlebars from 'handlebars';
import fs from 'fs';
import path from 'path';
import { createTransporter, defaultMailOptions } from '../config/mail.config';

export interface EmailAttachment {
  filename: string;
  content?: Buffer | string;
  path?: string;
  contentType?: string;
}

export interface EmailOptions {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  cc?: string | string[];
  bcc?: string | string[];
  attachments?: EmailAttachment[];
  replyTo?: string;
}

export interface TemplateEmailOptions extends Omit<EmailOptions, 'html' | 'text'> {
  template: string;
  data?: Record<string, any>;
}

export interface BulkEmailOptions {
  emails: EmailOptions[];
  batchSize?: number;
  delay?: number;
}

class MailService {
  private transporter: Transporter;
  private templatesCache: Map<string, HandlebarsTemplateDelegate> = new Map();

  constructor() {
    this.transporter = createTransporter();
    this.registerHandlebarsHelpers();
  }

  /**
   * Register custom Handlebars helpers
   */
  private registerHandlebarsHelpers(): void {
    handlebars.registerHelper('formatDate', (date: Date) => {
      return new Date(date).toLocaleDateString();
    });

    handlebars.registerHelper('uppercase', (str: string) => {
      return str ? str.toUpperCase() : '';
    });

    handlebars.registerHelper('eq', (a: any, b: any) => {
      return a === b;
    });
  }

  /**
   * Verify SMTP connection
   */
  async verifyConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      console.log('SMTP connection verified successfully');
      return true;
    } catch (error) {
      console.error('SMTP connection verification failed:', error);
      return false;
    }
  }

  /**
   * Load and compile email template
   */
  private async loadTemplate(templateName: string): Promise<HandlebarsTemplateDelegate> {
    // Check cache first
    if (this.templatesCache.has(templateName)) {
      return this.templatesCache.get(templateName)!;
    }

    try {
      const templatePath = path.join(process.cwd(), 'templates', 'emails', `${templateName}.hbs`);
      const templateContent = fs.readFileSync(templatePath, 'utf8');
      const compiledTemplate = handlebars.compile(templateContent);
      
      // Cache the compiled template
      this.templatesCache.set(templateName, compiledTemplate);
      
      return compiledTemplate;
    } catch (error) {
      throw new Error(`Failed to load email template '${templateName}': ${error}`);
    }
  }

  /**
   * Render email template with data
   */
  private async renderTemplate(templateName: string, data: Record<string, any> = {}): Promise<string> {
    const template = await this.loadTemplate(templateName);
    return template(data);
  }

  /**
   * Validate email address
   */
  private validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate email options
   */
  private validateEmailOptions(options: EmailOptions): void {
    if (!options.to) {
      throw new Error('Recipient email address is required');
    }

    if (!options.subject) {
      throw new Error('Email subject is required');
    }

    if (!options.text && !options.html) {
      throw new Error('Email content (text or html) is required');
    }

    // Validate email addresses
    const recipients = Array.isArray(options.to) ? options.to : [options.to];
    for (const email of recipients) {
      if (!this.validateEmail(email)) {
        throw new Error(`Invalid email address: ${email}`);
      }
    }

    // Validate CC emails if provided
    if (options.cc) {
      const ccEmails = Array.isArray(options.cc) ? options.cc : [options.cc];
      for (const email of ccEmails) {
        if (!this.validateEmail(email)) {
          throw new Error(`Invalid CC email address: ${email}`);
        }
      }
    }

    // Validate BCC emails if provided
    if (options.bcc) {
      const bccEmails = Array.isArray(options.bcc) ? options.bcc : [options.bcc];
      for (const email of bccEmails) {
        if (!this.validateEmail(email)) {
          throw new Error(`Invalid BCC email address: ${email}`);
        }
      }
    }
  }

  /**
   * Send a single email
   */
  async sendEmail(options: EmailOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      // Validate email options
      this.validateEmailOptions(options);

      const mailOptions: SendMailOptions = {
        ...defaultMailOptions,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
        cc: options.cc,
        bcc: options.bcc,
        attachments: options.attachments,
        replyTo: options.replyTo,
      };

      const result = await this.transporter.sendMail(mailOptions);
      
      console.log('Email sent successfully:', result.messageId);
      
      return {
        success: true,
        messageId: result.messageId,
      };
    } catch (error) {
      console.error('Failed to send email:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * Send email using template
   */
  async sendTemplateEmail(options: TemplateEmailOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const html = await this.renderTemplate(options.template, options.data);
      
      return await this.sendEmail({
        ...options,
        html,
      });
    } catch (error) {
      console.error('Failed to send template email:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * Send bulk emails with rate limiting
   */
  async sendBulkEmails(options: BulkEmailOptions): Promise<{
    success: boolean;
    results: Array<{ success: boolean; messageId?: string; error?: string }>;
    totalSent: number;
    totalFailed: number;
  }> {
    const { emails, batchSize = 10, delay = 1000 } = options;
    const results: Array<{ success: boolean; messageId?: string; error?: string }> = [];
    let totalSent = 0;
    let totalFailed = 0;

    try {
      // Process emails in batches
      for (let i = 0; i < emails.length; i += batchSize) {
        const batch = emails.slice(i, i + batchSize);
        
        // Send batch concurrently
        const batchPromises = batch.map(email => this.sendEmail(email));
        const batchResults = await Promise.all(batchPromises);
        
        results.push(...batchResults);
        
        // Count successes and failures
        batchResults.forEach(result => {
          if (result.success) {
            totalSent++;
          } else {
            totalFailed++;
          }
        });

        // Add delay between batches (except for the last batch)
        if (i + batchSize < emails.length) {
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }

      return {
        success: totalFailed === 0,
        results,
        totalSent,
        totalFailed,
      };
    } catch (error) {
      console.error('Failed to send bulk emails:', error);
      return {
        success: false,
        results,
        totalSent,
        totalFailed: emails.length - totalSent,
      };
    }
  }

  /**
   * Send welcome email
   */
  async sendWelcomeEmail(to: string, userData: { name: string; email: string }): Promise<{ success: boolean; messageId?: string; error?: string }> {
    return await this.sendTemplateEmail({
      to,
      subject: 'Welcome to ELM AI Task!',
      template: 'welcome',
      data: userData,
    });
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(to: string, resetData: { name: string; resetLink: string; expiresIn: string }): Promise<{ success: boolean; messageId?: string; error?: string }> {
    return await this.sendTemplateEmail({
      to,
      subject: 'Password Reset Request',
      template: 'password-reset',
      data: resetData,
    });
  }

  /**
   * Send email verification
   */
  async sendEmailVerification(to: string, verificationData: { name: string; verificationLink: string }): Promise<{ success: boolean; messageId?: string; error?: string }> {
    return await this.sendTemplateEmail({
      to,
      subject: 'Verify Your Email Address',
      template: 'email-verification',
      data: verificationData,
    });
  }

  /**
   * Send notification email
   */
  async sendNotificationEmail(to: string, notificationData: { title: string; message: string; actionUrl?: string; actionText?: string }): Promise<{ success: boolean; messageId?: string; error?: string }> {
    return await this.sendTemplateEmail({
      to,
      subject: notificationData.title,
      template: 'notification',
      data: notificationData,
    });
  }

  /**
   * Clear template cache
   */
  clearTemplateCache(): void {
    this.templatesCache.clear();
    console.log('Email template cache cleared');
  }

  /**
   * Get service status
   */
  async getStatus(): Promise<{
    connected: boolean;
    templatesLoaded: number;
    lastVerified: Date;
  }> {
    const connected = await this.verifyConnection();
    
    return {
      connected,
      templatesLoaded: this.templatesCache.size,
      lastVerified: new Date(),
    };
  }
}

// Export singleton instance
export const mailService = new MailService();
export default mailService;