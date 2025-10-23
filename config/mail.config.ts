import nodemailer from 'nodemailer';
import envConfig from './env.config';

export interface MailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

export const mailConfig: MailConfig = {
  host: envConfig.SMTP_HOST as string,
  port: Number(envConfig.SMTP_PORT),
  secure: envConfig.SMTP_SECURE as boolean,
  auth: {
    user: envConfig.SMTP_USER as string,
    pass: envConfig.SMTP_PASS as string,
  },
};

// Create reusable transporter object using the default SMTP transport
export const createTransporter = () => {
  if (!mailConfig.host || !mailConfig.auth.user || !mailConfig.auth.pass) {
    throw new Error('Email configuration is incomplete. Please check your environment variables.');
  }

  return nodemailer.createTransport(mailConfig);
};

// Default email options
export const defaultMailOptions = {
  from: `${envConfig.FROM_NAME} <${envConfig.FROM_EMAIL}>`,
};

// Email templates configuration
export const emailTemplatesConfig = {
  templatesDir: 'templates/emails',
  defaultLayout: 'main',
  partialsDir: 'templates/partials',
};

export default {
  mailConfig,
  createTransporter,
  defaultMailOptions,
  emailTemplatesConfig,
};