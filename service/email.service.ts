import nodemailer, { Transporter } from 'nodemailer';
import { 
  EmailConfig, 
  EmailOptions, 
  EmailResult, 
  BulkEmailOptions,
  TemplateVariables 
} from '../types/email.types';
import { EmailTemplateManager, defaultTemplates } from './email-template.service';

export class EmailService {
  private transporter: Transporter;
  private config: EmailConfig;
  private templateManager: EmailTemplateManager;

  constructor(config: EmailConfig) {
    this.config = config;
    this.transporter = this.createTransporter();
    this.templateManager = new EmailTemplateManager();
    
    // Load default templates
    defaultTemplates.forEach(template => {
      this.templateManager.registerTemplate(template);
    });
  }

  /**
   * Create nodemailer transporter
   */
  private createTransporter(): Transporter {
    const transportConfig: any = {
      host: this.config.host,
      port: this.config.port,
      secure: this.config.secure,
      auth: this.config.auth
    };

    if (this.config.service) {
      transportConfig.service = this.config.service;
    }

    return nodemailer.createTransport(transportConfig);
  }

  /**
   * Send a single email
   */
  public async sendEmail(options: EmailOptions): Promise<EmailResult> {
    try {
      const mailOptions = {
        from: options.from || this.config.from,
        to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
        cc: Array.isArray(options.cc) ? options.cc.join(', ') : options.cc,
        bcc: Array.isArray(options.bcc) ? options.bcc.join(', ') : options.bcc,
        replyTo: options.replyTo,
        attachments: options.attachments
      };

      const info = await this.transporter.sendMail(mailOptions);

      return {
        success: true,
        messageId: info.messageId,
        response: info.response
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Send email using template
   */
  public async sendTemplateEmail(
    templateName: string,
    to: string | string[],
    variables: TemplateVariables = {},
    options: Partial<EmailOptions> = {}
  ): Promise<EmailResult> {
    try {
      const rendered = this.templateManager.renderTemplate(templateName, variables);
      
      const emailOptions: EmailOptions = {
        to,
        subject: rendered.subject,
        html: rendered.html,
        text: rendered.text,
        ...options
      };

      return await this.sendEmail(emailOptions);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Send bulk emails
   */
  public async sendBulkEmails(options: BulkEmailOptions): Promise<EmailResult[]> {
    const {
      recipients,
      subject,
      template,
      templateVariables = {},
      html,
      text,
      batchSize = 10,
      delayBetweenBatches = 1000
    } = options;

    const results: EmailResult[] = [];
    
    // Split recipients into batches
    for (let i = 0; i < recipients.length; i += batchSize) {
      const batch = recipients.slice(i, i + batchSize);
      
      const batchPromises = batch.map(async (recipient) => {
        if (template) {
          // Add recipient-specific variables
          const recipientVariables = {
            ...templateVariables,
            recipientEmail: recipient
          };
          
          return await this.sendTemplateEmail(
            template,
            recipient,
            recipientVariables
          );
        } else {
          return await this.sendEmail({
            to: recipient,
            subject,
            html,
            text
          });
        }
      });

      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);

      // Delay between batches to avoid rate limiting
      if (i + batchSize < recipients.length && delayBetweenBatches > 0) {
        await new Promise(resolve => setTimeout(resolve, delayBetweenBatches));
      }
    }

    return results;
  }

  /**
   * Test email connection
   */
  public async testConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      return true;
    } catch (error) {
      console.error('Email connection test failed:', error);
      return false;
    }
  }

  /**
   * Get template manager for custom template operations
   */
  public getTemplateManager(): EmailTemplateManager {
    return this.templateManager;
  }

  /**
   * Send welcome email
   */
  public async sendWelcomeEmail(
    to: string,
    userName: string,
    appName: string = 'Our App'
  ): Promise<EmailResult> {
    return await this.sendTemplateEmail('welcome', to, {
      userName,
      appName
    });
  }

  /**
   * Send password reset email
   */
  public async sendPasswordResetEmail(
    to: string,
    userName: string,
    resetUrl: string,
    expirationTime: number = 15,
    appName: string = 'Our App'
  ): Promise<EmailResult> {
    return await this.sendTemplateEmail('passwordReset', to, {
      userName,
      resetUrl,
      expirationTime: expirationTime.toString(),
      appName
    });
  }

  /**
   * Send email verification
   */
  public async sendVerificationEmail(
    to: string,
    userName: string,
    verificationUrl: string,
    appName: string = 'Our App'
  ): Promise<EmailResult> {
    return await this.sendTemplateEmail('verification', to, {
      userName,
      verificationUrl,
      appName
    });
  }

  /**
   * Send notification email
   */
  public async sendNotificationEmail(
    to: string,
    userName: string,
    subject: string,
    title: string,
    message: string,
    appName: string = 'Our App'
  ): Promise<EmailResult> {
    return await this.sendTemplateEmail('notification', to, {
      subject,
      title,
      userName,
      message,
      appName
    });
  }

  /**
   * Close the email service
   */
  public close(): void {
    this.transporter.close();
  }
}
