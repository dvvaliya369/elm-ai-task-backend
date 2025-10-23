export interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
  service?: string;
  from?: string;
}

export interface EmailAttachment {
  filename: string;
  content?: string | Buffer;
  path?: string;
  contentType?: string;
  encoding?: string;
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
  from?: string;
}

export interface EmailTemplate {
  name: string;
  subject: string;
  html: string;
  text?: string;
  variables?: string[];
}

export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
  response?: string;
}

export interface TemplateVariables {
  [key: string]: string | number | boolean;
}

export enum EmailProvider {
  GMAIL = 'gmail',
  OUTLOOK = 'outlook',
  YAHOO = 'yahoo',
  SENDGRID = 'sendgrid',
  SMTP = 'smtp',
  SES = 'ses'
}

export interface BulkEmailOptions {
  recipients: string[];
  subject: string;
  template?: string;
  templateVariables?: TemplateVariables;
  html?: string;
  text?: string;
  batchSize?: number;
  delayBetweenBatches?: number;
}
