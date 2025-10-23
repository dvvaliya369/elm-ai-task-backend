import express from 'express';
import { EmailService } from '../service/email.service';
import { EmailConfigBuilder, getEmailConfigFromEnv } from '../config/email.config';
import { EmailOptions, BulkEmailOptions, TemplateVariables } from '../types/email.types';
import { isValidEmail, validateEmails, parseEmailList } from '../utils/email.utils';

const router = express.Router();

// Initialize email service (you might want to do this in your main app file)
let emailService: EmailService;

try {
  // Try to get config from environment variables first
  const config = getEmailConfigFromEnv();
  emailService = new EmailService(config);
} catch (error) {
  console.warn('Email service not initialized: Missing environment variables');
  // You can initialize with a default config or handle this differently
}

/**
 * POST /api/email/send
 * Send a single email
 */
router.post('/send', async (req, res) => {
  try {
    if (!emailService) {
      return res.status(500).json({
        success: false,
        message: 'Email service not configured'
      });
    }

    const { to, subject, text, html, cc, bcc, replyTo }: EmailOptions = req.body;

    // Validation
    if (!to || !subject) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: to, subject'
      });
    }

    if (!text && !html) {
      return res.status(400).json({
        success: false,
        message: 'Either text or html content is required'
      });
    }

    // Validate email addresses
    const toEmails = Array.isArray(to) ? to : [to];
    const { valid: validTo, invalid: invalidTo } = validateEmails(toEmails);

    if (invalidTo.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email addresses',
        invalidEmails: invalidTo
      });
    }

    const result = await emailService.sendEmail({
      to: validTo,
      subject,
      text,
      html,
      cc,
      bcc,
      replyTo
    });

    res.json(result);
  } catch (error) {
    console.error('Send email error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * POST /api/email/send-template
 * Send email using a template
 */
router.post('/send-template', async (req, res) => {
  try {
    if (!emailService) {
      return res.status(500).json({
        success: false,
        message: 'Email service not configured'
      });
    }

    const { 
      templateName, 
      to, 
      variables = {}, 
      cc, 
      bcc, 
      replyTo 
    }: {
      templateName: string;
      to: string | string[];
      variables?: TemplateVariables;
      cc?: string | string[];
      bcc?: string | string[];
      replyTo?: string;
    } = req.body;

    if (!templateName || !to) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: templateName, to'
      });
    }

    // Validate email addresses
    const toEmails = Array.isArray(to) ? to : [to];
    const { valid: validTo, invalid: invalidTo } = validateEmails(toEmails);

    if (invalidTo.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email addresses',
        invalidEmails: invalidTo
      });
    }

    const result = await emailService.sendTemplateEmail(
      templateName,
      validTo,
      variables,
      { cc, bcc, replyTo }
    );

    res.json(result);
  } catch (error) {
    console.error('Send template email error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * POST /api/email/send-bulk
 * Send bulk emails
 */
router.post('/send-bulk', async (req, res) => {
  try {
    if (!emailService) {
      return res.status(500).json({
        success: false,
        message: 'Email service not configured'
      });
    }

    const bulkOptions: BulkEmailOptions = req.body;

    if (!bulkOptions.recipients || !Array.isArray(bulkOptions.recipients) || bulkOptions.recipients.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Recipients array is required and must not be empty'
      });
    }

    if (!bulkOptions.subject) {
      return res.status(400).json({
        success: false,
        message: 'Subject is required'
      });
    }

    if (!bulkOptions.template && !bulkOptions.html && !bulkOptions.text) {
      return res.status(400).json({
        success: false,
        message: 'Either template, html, or text content is required'
      });
    }

    // Validate email addresses
    const { valid: validEmails, invalid: invalidEmails } = validateEmails(bulkOptions.recipients);

    if (invalidEmails.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email addresses found',
        invalidEmails,
        validEmails
      });
    }

    const results = await emailService.sendBulkEmails({
      ...bulkOptions,
      recipients: validEmails
    });

    const successCount = results.filter(r => r.success).length;
    const failureCount = results.length - successCount;

    res.json({
      success: true,
      totalSent: results.length,
      successCount,
      failureCount,
      results: results.map((result, index) => ({
        email: validEmails[index],
        ...result
      }))
    });
  } catch (error) {
    console.error('Send bulk email error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * POST /api/email/welcome
 * Send welcome email
 */
router.post('/welcome', async (req, res) => {
  try {
    if (!emailService) {
      return res.status(500).json({
        success: false,
        message: 'Email service not configured'
      });
    }

    const { to, userName, appName }: { to: string; userName: string; appName?: string } = req.body;

    if (!to || !userName) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: to, userName'
      });
    }

    if (!isValidEmail(to)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email address'
      });
    }

    const result = await emailService.sendWelcomeEmail(to, userName, appName);
    res.json(result);
  } catch (error) {
    console.error('Send welcome email error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * POST /api/email/password-reset
 * Send password reset email
 */
router.post('/password-reset', async (req, res) => {
  try {
    if (!emailService) {
      return res.status(500).json({
        success: false,
        message: 'Email service not configured'
      });
    }

    const { 
      to, 
      userName, 
      resetUrl, 
      expirationTime = 15, 
      appName 
    }: { 
      to: string; 
      userName: string; 
      resetUrl: string; 
      expirationTime?: number; 
      appName?: string; 
    } = req.body;

    if (!to || !userName || !resetUrl) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: to, userName, resetUrl'
      });
    }

    if (!isValidEmail(to)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email address'
      });
    }

    const result = await emailService.sendPasswordResetEmail(to, userName, resetUrl, expirationTime, appName);
    res.json(result);
  } catch (error) {
    console.error('Send password reset email error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * GET /api/email/test-connection
 * Test email connection
 */
router.get('/test-connection', async (req, res) => {
  try {
    if (!emailService) {
      return res.status(500).json({
        success: false,
        message: 'Email service not configured'
      });
    }

    const isConnected = await emailService.testConnection();
    
    res.json({
      success: isConnected,
      message: isConnected ? 'Email service is connected' : 'Email service connection failed'
    });
  } catch (error) {
    console.error('Test connection error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * GET /api/email/templates
 * Get all available templates
 */
router.get('/templates', async (req, res) => {
  try {
    if (!emailService) {
      return res.status(500).json({
        success: false,
        message: 'Email service not configured'
      });
    }

    const templates = emailService.getTemplateManager().getAllTemplates();
    
    res.json({
      success: true,
      templates: templates.map(template => ({
        name: template.name,
        subject: template.subject,
        variables: template.variables
      }))
    });
  } catch (error) {
    console.error('Get templates error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export default router;
