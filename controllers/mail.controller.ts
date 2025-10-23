import { Request, Response } from 'express';
import mailService, { EmailOptions, TemplateEmailOptions, BulkEmailOptions } from '../service/mail.service';

export interface SendEmailRequest extends Request {
  body: EmailOptions;
}

export interface SendTemplateEmailRequest extends Request {
  body: TemplateEmailOptions;
}

export interface SendBulkEmailRequest extends Request {
  body: BulkEmailOptions;
}

export interface SendWelcomeEmailRequest extends Request {
  body: {
    to: string;
    userData: {
      name: string;
      email: string;
      dashboardUrl?: string;
      helpUrl?: string;
      communityUrl?: string;
      unsubscribeUrl?: string;
    };
  };
}

export interface SendPasswordResetEmailRequest extends Request {
  body: {
    to: string;
    resetData: {
      name: string;
      resetLink: string;
      expiresIn: string;
      unsubscribeUrl?: string;
    };
  };
}

export interface SendEmailVerificationRequest extends Request {
  body: {
    to: string;
    verificationData: {
      name: string;
      verificationLink: string;
      unsubscribeUrl?: string;
    };
  };
}

export interface SendNotificationEmailRequest extends Request {
  body: {
    to: string;
    notificationData: {
      title: string;
      message: string;
      actionUrl?: string;
      actionText?: string;
      unsubscribeUrl?: string;
    };
  };
}

class MailController {
  /**
   * Send a single email
   */
  async sendEmail(req: SendEmailRequest, res: Response): Promise<void> {
    try {
      const result = await mailService.sendEmail(req.body);
      
      if (result.success) {
        res.status(200).json({
          success: true,
          message: 'Email sent successfully',
          messageId: result.messageId,
        });
      } else {
        res.status(400).json({
          success: false,
          message: 'Failed to send email',
          error: result.error,
        });
      }
    } catch (error) {
      console.error('Send email error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Send email using template
   */
  async sendTemplateEmail(req: SendTemplateEmailRequest, res: Response): Promise<void> {
    try {
      const result = await mailService.sendTemplateEmail(req.body);
      
      if (result.success) {
        res.status(200).json({
          success: true,
          message: 'Template email sent successfully',
          messageId: result.messageId,
        });
      } else {
        res.status(400).json({
          success: false,
          message: 'Failed to send template email',
          error: result.error,
        });
      }
    } catch (error) {
      console.error('Send template email error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Send bulk emails
   */
  async sendBulkEmails(req: SendBulkEmailRequest, res: Response): Promise<void> {
    try {
      const result = await mailService.sendBulkEmails(req.body);
      
      res.status(200).json({
        success: result.success,
        message: `Bulk email operation completed. Sent: ${result.totalSent}, Failed: ${result.totalFailed}`,
        results: result.results,
        totalSent: result.totalSent,
        totalFailed: result.totalFailed,
      });
    } catch (error) {
      console.error('Send bulk emails error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Send welcome email
   */
  async sendWelcomeEmail(req: SendWelcomeEmailRequest, res: Response): Promise<void> {
    try {
      const { to, userData } = req.body;
      const result = await mailService.sendWelcomeEmail(to, userData);
      
      if (result.success) {
        res.status(200).json({
          success: true,
          message: 'Welcome email sent successfully',
          messageId: result.messageId,
        });
      } else {
        res.status(400).json({
          success: false,
          message: 'Failed to send welcome email',
          error: result.error,
        });
      }
    } catch (error) {
      console.error('Send welcome email error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(req: SendPasswordResetEmailRequest, res: Response): Promise<void> {
    try {
      const { to, resetData } = req.body;
      const result = await mailService.sendPasswordResetEmail(to, resetData);
      
      if (result.success) {
        res.status(200).json({
          success: true,
          message: 'Password reset email sent successfully',
          messageId: result.messageId,
        });
      } else {
        res.status(400).json({
          success: false,
          message: 'Failed to send password reset email',
          error: result.error,
        });
      }
    } catch (error) {
      console.error('Send password reset email error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Send email verification
   */
  async sendEmailVerification(req: SendEmailVerificationRequest, res: Response): Promise<void> {
    try {
      const { to, verificationData } = req.body;
      const result = await mailService.sendEmailVerification(to, verificationData);
      
      if (result.success) {
        res.status(200).json({
          success: true,
          message: 'Email verification sent successfully',
          messageId: result.messageId,
        });
      } else {
        res.status(400).json({
          success: false,
          message: 'Failed to send email verification',
          error: result.error,
        });
      }
    } catch (error) {
      console.error('Send email verification error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Send notification email
   */
  async sendNotificationEmail(req: SendNotificationEmailRequest, res: Response): Promise<void> {
    try {
      const { to, notificationData } = req.body;
      const result = await mailService.sendNotificationEmail(to, notificationData);
      
      if (result.success) {
        res.status(200).json({
          success: true,
          message: 'Notification email sent successfully',
          messageId: result.messageId,
        });
      } else {
        res.status(400).json({
          success: false,
          message: 'Failed to send notification email',
          error: result.error,
        });
      }
    } catch (error) {
      console.error('Send notification email error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Verify SMTP connection
   */
  async verifyConnection(req: Request, res: Response): Promise<void> {
    try {
      const isConnected = await mailService.verifyConnection();
      
      res.status(200).json({
        success: true,
        connected: isConnected,
        message: isConnected ? 'SMTP connection verified successfully' : 'SMTP connection failed',
      });
    } catch (error) {
      console.error('Verify connection error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to verify SMTP connection',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Get mail service status
   */
  async getStatus(req: Request, res: Response): Promise<void> {
    try {
      const status = await mailService.getStatus();
      
      res.status(200).json({
        success: true,
        status,
      });
    } catch (error) {
      console.error('Get status error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get mail service status',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Clear template cache
   */
  async clearTemplateCache(req: Request, res: Response): Promise<void> {
    try {
      mailService.clearTemplateCache();
      
      res.status(200).json({
        success: true,
        message: 'Template cache cleared successfully',
      });
    } catch (error) {
      console.error('Clear template cache error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to clear template cache',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}

export default new MailController();