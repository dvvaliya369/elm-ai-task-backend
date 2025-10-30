import nodemailer from 'nodemailer';
import envConfig from './env.config';

export interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
  from: {
    name: string;
    address: string;
  };
}

const emailConfig: EmailConfig = {
  host: envConfig.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(envConfig.SMTP_PORT || '587'),
  secure: envConfig.SMTP_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: envConfig.SMTP_USER || '',
    pass: envConfig.SMTP_PASS || '',
  },
  from: {
    name: envConfig.EMAIL_FROM_NAME || 'ELM AI Task',
    address: envConfig.EMAIL_FROM || envConfig.SMTP_USER || '',
  },
};

// Create reusable transporter object using the default SMTP transport
export const createTransporter = () => {
  return nodemailer.createTransport({
    host: emailConfig.host,
    port: emailConfig.port,
    secure: emailConfig.secure,
    auth: emailConfig.auth,
  });
};

export default emailConfig;