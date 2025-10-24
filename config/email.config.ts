import nodemailer from 'nodemailer';
import env from './env.config';

// Email transporter configuration
export const createEmailTransporter = () => {
  return nodemailer.createTransporter({
    host: env.EMAIL_HOST,
    port: env.EMAIL_PORT,
    secure: env.EMAIL_SECURE, // true for 465, false for other ports
    auth: {
      user: env.EMAIL_USER,
      pass: env.EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false
    }
  });
};

// Email configuration object
export const emailConfig = {
  from: env.EMAIL_FROM || 'noreply@example.com',
  transporter: createEmailTransporter(),
};

export default emailConfig;
