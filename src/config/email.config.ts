import { EmailConfig } from '../types/email.types';

export const emailConfig: EmailConfig = {
  smtp: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER || '',
      pass: process.env.SMTP_PASS || ''
    }
  },
  from: {
    name: process.env.FROM_NAME || 'Your App',
    email: process.env.FROM_EMAIL || 'noreply@yourapp.com'
  }
};

export default emailConfig;
