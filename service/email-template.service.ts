import { EmailTemplate, TemplateVariables } from '../types/email.types';

export class EmailTemplateManager {
  private templates: Map<string, EmailTemplate> = new Map();

  /**
   * Register a new email template
   */
  public registerTemplate(template: EmailTemplate): void {
    this.templates.set(template.name, template);
  }

  /**
   * Get a template by name
   */
  public getTemplate(name: string): EmailTemplate | undefined {
    return this.templates.get(name);
  }

  /**
   * Render a template with variables
   */
  public renderTemplate(
    templateName: string, 
    variables: TemplateVariables = {}
  ): { subject: string; html: string; text?: string } {
    const template = this.getTemplate(templateName);
    if (!template) {
      throw new Error(`Template '${templateName}' not found`);
    }

    return {
      subject: this.replaceVariables(template.subject, variables),
      html: this.replaceVariables(template.html, variables),
      text: template.text ? this.replaceVariables(template.text, variables) : undefined
    };
  }

  /**
   * Replace template variables in text
   */
  private replaceVariables(text: string, variables: TemplateVariables): string {
    let result = text;
    
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
      result = result.replace(regex, String(value));
    });

    return result;
  }

  /**
   * Get all registered templates
   */
  public getAllTemplates(): EmailTemplate[] {
    return Array.from(this.templates.values());
  }

  /**
   * Remove a template
   */
  public removeTemplate(name: string): boolean {
    return this.templates.delete(name);
  }

  /**
   * Clear all templates
   */
  public clearTemplates(): void {
    this.templates.clear();
  }
}

// Default templates
export const defaultTemplates: EmailTemplate[] = [
  {
    name: 'welcome',
    subject: 'Welcome to {{ appName }}!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Welcome to {{ appName }}!</h1>
        <p>Hello {{ userName }},</p>
        <p>Thank you for joining {{ appName }}. We're excited to have you on board!</p>
        <p>If you have any questions, feel free to reach out to our support team.</p>
        <p>Best regards,<br>The {{ appName }} Team</p>
      </div>
    `,
    text: `
      Welcome to {{ appName }}!
      
      Hello {{ userName }},
      
      Thank you for joining {{ appName }}. We're excited to have you on board!
      
      If you have any questions, feel free to reach out to our support team.
      
      Best regards,
      The {{ appName }} Team
    `,
    variables: ['appName', 'userName']
  },
  {
    name: 'passwordReset',
    subject: 'Password Reset Request',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Password Reset Request</h1>
        <p>Hello {{ userName }},</p>
        <p>You requested a password reset for your account. Click the button below to reset your password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="{{ resetUrl }}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Reset Password</a>
        </div>
        <p>If you didn't request this reset, please ignore this email.</p>
        <p>This link will expire in {{ expirationTime }} minutes.</p>
        <p>Best regards,<br>The {{ appName }} Team</p>
      </div>
    `,
    text: `
      Password Reset Request
      
      Hello {{ userName }},
      
      You requested a password reset for your account. 
      Click the link below to reset your password:
      
      {{ resetUrl }}
      
      If you didn't request this reset, please ignore this email.
      This link will expire in {{ expirationTime }} minutes.
      
      Best regards,
      The {{ appName }} Team
    `,
    variables: ['userName', 'resetUrl', 'expirationTime', 'appName']
  },
  {
    name: 'verification',
    subject: 'Verify Your Email Address',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Verify Your Email Address</h1>
        <p>Hello {{ userName }},</p>
        <p>Please verify your email address by clicking the button below:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="{{ verificationUrl }}" style="background-color: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Verify Email</a>
        </div>
        <p>If you didn't create an account, please ignore this email.</p>
        <p>Best regards,<br>The {{ appName }} Team</p>
      </div>
    `,
    text: `
      Verify Your Email Address
      
      Hello {{ userName }},
      
      Please verify your email address by clicking the link below:
      
      {{ verificationUrl }}
      
      If you didn't create an account, please ignore this email.
      
      Best regards,
      The {{ appName }} Team
    `,
    variables: ['userName', 'verificationUrl', 'appName']
  },
  {
    name: 'notification',
    subject: '{{ subject }}',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">{{ title }}</h1>
        <p>Hello {{ userName }},</p>
        <div style="margin: 20px 0;">
          {{ message }}
        </div>
        <p>Best regards,<br>The {{ appName }} Team</p>
      </div>
    `,
    text: `
      {{ title }}
      
      Hello {{ userName }},
      
      {{ message }}
      
      Best regards,
      The {{ appName }} Team
    `,
    variables: ['subject', 'title', 'userName', 'message', 'appName']
  }
];
