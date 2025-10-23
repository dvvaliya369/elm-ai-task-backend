import { Router } from 'express';
import mailController from '../controllers/mail.controller';

const router = Router();

/**
 * @route   POST /api/mail/send
 * @desc    Send a single email
 * @access  Private
 * @body    {
 *   to: string | string[],
 *   subject: string,
 *   text?: string,
 *   html?: string,
 *   cc?: string | string[],
 *   bcc?: string | string[],
 *   attachments?: EmailAttachment[],
 *   replyTo?: string
 * }
 */
router.post('/send', mailController.sendEmail);

/**
 * @route   POST /api/mail/send-template
 * @desc    Send email using template
 * @access  Private
 * @body    {
 *   to: string | string[],
 *   subject: string,
 *   template: string,
 *   data?: Record<string, any>,
 *   cc?: string | string[],
 *   bcc?: string | string[],
 *   attachments?: EmailAttachment[],
 *   replyTo?: string
 * }
 */
router.post('/send-template', mailController.sendTemplateEmail);

/**
 * @route   POST /api/mail/send-bulk
 * @desc    Send bulk emails
 * @access  Private
 * @body    {
 *   emails: EmailOptions[],
 *   batchSize?: number,
 *   delay?: number
 * }
 */
router.post('/send-bulk', mailController.sendBulkEmails);

/**
 * @route   POST /api/mail/send-welcome
 * @desc    Send welcome email
 * @access  Private
 * @body    {
 *   to: string,
 *   userData: {
 *     name: string,
 *     email: string,
 *     dashboardUrl?: string,
 *     helpUrl?: string,
 *     communityUrl?: string,
 *     unsubscribeUrl?: string
 *   }
 * }
 */
router.post('/send-welcome', mailController.sendWelcomeEmail);

/**
 * @route   POST /api/mail/send-password-reset
 * @desc    Send password reset email
 * @access  Private
 * @body    {
 *   to: string,
 *   resetData: {
 *     name: string,
 *     resetLink: string,
 *     expiresIn: string,
 *     unsubscribeUrl?: string
 *   }
 * }
 */
router.post('/send-password-reset', mailController.sendPasswordResetEmail);

/**
 * @route   POST /api/mail/send-email-verification
 * @desc    Send email verification
 * @access  Private
 * @body    {
 *   to: string,
 *   verificationData: {
 *     name: string,
 *     verificationLink: string,
 *     unsubscribeUrl?: string
 *   }
 * }
 */
router.post('/send-email-verification', mailController.sendEmailVerification);

/**
 * @route   POST /api/mail/send-notification
 * @desc    Send notification email
 * @access  Private
 * @body    {
 *   to: string,
 *   notificationData: {
 *     title: string,
 *     message: string,
 *     actionUrl?: string,
 *     actionText?: string,
 *     unsubscribeUrl?: string
 *   }
 * }
 */
router.post('/send-notification', mailController.sendNotificationEmail);

/**
 * @route   GET /api/mail/verify-connection
 * @desc    Verify SMTP connection
 * @access  Private
 */
router.get('/verify-connection', mailController.verifyConnection);

/**
 * @route   GET /api/mail/status
 * @desc    Get mail service status
 * @access  Private
 */
router.get('/status', mailController.getStatus);

/**
 * @route   POST /api/mail/clear-cache
 * @desc    Clear template cache
 * @access  Private
 */
router.post('/clear-cache', mailController.clearTemplateCache);

export default router;