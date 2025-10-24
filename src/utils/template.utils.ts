import * as fs from 'fs';
import * as path from 'path';
import * as Handlebars from 'handlebars';
import { EmailTemplate } from '../types/email.types';

export class TemplateUtils {
  private static templateCache = new Map<string, HandlebarsTemplateDelegate>();
  private static templateDir = path.join(__dirname, '../templates');

  /**
   * Load and compile a Handlebars template
   */
  static async loadTemplate(templateName: string): Promise<HandlebarsTemplateDelegate> {
    // Check cache first
    if (this.templateCache.has(templateName)) {
      return this.templateCache.get(templateName)!;
    }

    const templatePath = path.join(this.templateDir, `${templateName}.hbs`);
    
    if (!fs.existsSync(templatePath)) {
      throw new Error(`Template not found: ${templateName}.hbs`);
    }

    const templateContent = fs.readFileSync(templatePath, 'utf8');
    const compiledTemplate = Handlebars.compile(templateContent);
    
    // Cache the compiled template
    this.templateCache.set(templateName, compiledTemplate);
    
    return compiledTemplate;
  }

  /**
   * Render template with data
   */
  static async renderTemplate(templateName: string, data: Record<string, any>): Promise<EmailTemplate> {
    const template = await this.loadTemplate(templateName);
    const html = template(data);
    
    // Extract subject from template if it exists (look for {{subject}} helper or data)
    const subject = data.subject || this.extractSubjectFromTemplate(templateName, data);
    
    // Generate plain text version (simple HTML to text conversion)
    const text = this.htmlToText(html);
    
    return {
      subject,
      html,
      text
    };
  }

  /**
   * Simple HTML to text conversion
   */
  private static htmlToText(html: string): string {
    return html
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Extract subject from template metadata or data
   */
  private static extractSubjectFromTemplate(templateName: string, data: Record<string, any>): string {
    // Default subjects for common templates
    const defaultSubjects: Record<string, string> = {
      'welcome': 'Welcome to {{appName}}!',
      'reset-password': 'Reset Your Password',
      'notification': 'Notification from {{appName}}',
      'verification': 'Verify Your Email Address'
    };

    const subjectTemplate = defaultSubjects[templateName] || 'Email from {{appName}}';
    return Handlebars.compile(subjectTemplate)(data);
  }

  /**
   * Register custom Handlebars helpers
   */
  static registerHelpers(): void {
    // Date formatting helper
    Handlebars.registerHelper('formatDate', (date: Date, format?: string) => {
      if (!date) return '';
      const d = new Date(date);
      if (format === 'short') {
        return d.toLocaleDateString();
      }
      return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    });

    // Currency formatting helper
    Handlebars.registerHelper('currency', (amount: number, currency = 'USD') => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency
      }).format(amount);
    });

    // Conditional helper
    Handlebars.registerHelper('ifEquals', function(arg1: any, arg2: any, options: any) {
      return (arg1 === arg2) ? options.fn(this) : options.inverse(this);
    });

    // Loop with index helper
    Handlebars.registerHelper('eachWithIndex', function(array: any[], options: any) {
      let result = '';
      for (let i = 0; i < array.length; i++) {
        result += options.fn({
          ...array[i],
          index: i,
          isFirst: i === 0,
          isLast: i === array.length - 1
        });
      }
      return result;
    });
  }

  /**
   * Clear template cache
   */
  static clearCache(): void {
    this.templateCache.clear();
  }
}

// Register helpers on module load
TemplateUtils.registerHelpers();
