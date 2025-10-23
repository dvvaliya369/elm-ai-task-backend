import { EmailService } from '../service/email.service';
import { EmailConfigBuilder } from '../config/email.config';
import { isValidEmail } from '../utils/email.utils';

// Example 1: Basic email sending
async function basicEmailExample() {
  console.log('\n=== Basic Email Example ===');
  
  // Create email service with Gmail configuration
  const config = EmailConfigBuilder
    .gmail('your-email@gmail.com', 'your-app-password')
    .build();
    
  const emailService = new EmailService(config);
  
  // Test connection
  const isConnected = await emailService.testConnection();
  console.log('Connection test:', isConnected ? 'Success' : 'Failed');
  
  if (!isConnected) {
    console.log('Please check your email configuration');
    return;
  }
  
  // Send basic email
  const result = await emailService.sendEmail({
    to: 'recipient@example.com',
    subject: 'Test Email',
    text: 'This is a test email sent using the EmailService!',
    html: '<h1>Test Email</h1><p>This is a <strong>test email</strong> sent using the EmailService!</p>'
  });
  
  console.log('Email result:', result);
  
  emailService.close();
}

// Example 2: Template email
async function templateEmailExample() {
  console.log('\n=== Template Email Example ===');
  
  const config = EmailConfigBuilder
    .gmail('your-email@gmail.com', 'your-app-password')
    .build();
    
  const emailService = new EmailService(config);
  
  // Send welcome email using built-in template
  const result = await emailService.sendWelcomeEmail(
    'user@example.com',
    'John Doe',
    'My Awesome App'
  );
  
  console.log('Welcome email result:', result);
  
  // Send password reset email
  const resetResult = await emailService.sendPasswordResetEmail(
    'user@example.com',
    'John Doe',
    'https://myapp.com/reset-password?token=abc123',
    15, // expires in 15 minutes
    'My Awesome App'
  );
  
  console.log('Password reset email result:', resetResult);
  
  emailService.close();
}

// Example 3: Custom template
async function customTemplateExample() {
  console.log('\n=== Custom Template Example ===');
  
  const config = EmailConfigBuilder
    .gmail('your-email@gmail.com', 'your-app-password')
    .build();
    
  const emailService = new EmailService(config);
  
  // Register custom template
  const templateManager = emailService.getTemplateManager();
  const orderTemplate = {
    name: 'orderConfirmation',
    subject: 'Order Confirmation - {{ orderNumber }}',
    html: [
      '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">',
      '  <h1>Order Confirmation</h1>',
      '  <p>Hello {{ customerName }},</p>',
      '  <p>Thank you for your order!</p>',
      '  ',
      '  <div style="background: #f5f5f5; padding: 20px; margin: 20px 0; border-radius: 5px;">',
      '    <h3>Order Details:</h3>',
      '    <p><strong>Order Number:</strong> {{ orderNumber }}</p>',
      '    <p><strong>Total Amount:</strong> ${{ totalAmount }}</p>',
      '    <p><strong>Order Date:</strong> {{ orderDate }}</p>',
      '  </div>',
      '  ',
      '  <p>Your order will be processed within 2-3 business days.</p>',
      '  <p>Thank you for shopping with us!</p>',
      '  ',
      '  <p>Best regards,<br>{{ companyName }}</p>',
      '</div>'
    ].join('\n'),
    variables: ['customerName', 'orderNumber', 'totalAmount', 'orderDate', 'companyName']
  };
  templateManager.registerTemplate(orderTemplate);
  
  // Send email using custom template
  const templateVars = {
    customerName: 'Jane Smith',
    orderNumber: 'ORD-12345',
    totalAmount: '99.99',
    orderDate: new Date().toLocaleDateString(),
    companyName: 'My Store'
  };
  
  const result = await emailService.sendTemplateEmail(
    'orderConfirmation',
    'customer@example.com',
    templateVars
  );
  
  console.log('Custom template email result:', result);
  
  emailService.close();
}

// Example 4: Bulk emails
async function bulkEmailExample() {
  console.log('\n=== Bulk Email Example ===');
  
  const config = EmailConfigBuilder
    .gmail('your-email@gmail.com', 'your-app-password')
    .build();
    
  const emailService = new EmailService(config);
  
  const recipients = [
    'user1@example.com',
    'user2@example.com',
    'user3@example.com'
  ];
  
  // Send bulk notification emails
  const results = await emailService.sendBulkEmails({
    recipients,
    subject: 'Important Announcement',
    template: 'notification',
    templateVariables: {
      title: 'System Maintenance Notice',
      message: `
        <p>We will be performing scheduled maintenance on our system.</p>
        <p><strong>Date:</strong> Tomorrow at 2:00 AM EST</p>
        <p><strong>Duration:</strong> Approximately 2 hours</p>
        <p>During this time, our services may be temporarily unavailable.</p>
        <p>We apologize for any inconvenience this may cause.</p>
      `,
      appName: 'My Service'
    },
    batchSize: 5,
    delayBetweenBatches: 2000
  });
  
  console.log('Bulk email results:');
  results.forEach((result, index) => {
    console.log(`${recipients[index]}: ${result.success ? 'Success' : 'Failed'}`);
  });
  
  emailService.close();
}

// Example 5: Different providers
async function differentProvidersExample() {
  console.log('\n=== Different Email Providers Example ===');
  
  // Gmail
  const gmailConfig = EmailConfigBuilder
    .gmail('your-email@gmail.com', 'your-app-password')
    .build();
  
  // Outlook
  const outlookConfig = EmailConfigBuilder
    .outlook('your-email@outlook.com', 'your-password')
    .build();
  
  // Yahoo
  const yahooConfig = EmailConfigBuilder
    .yahoo('your-email@yahoo.com', 'your-app-password')
    .build();
  
  // Custom SMTP
  const customConfig = EmailConfigBuilder
    .smtp('mail.example.com', 587)
    .setAuth('your-email@example.com', 'your-password')
    .setFrom('Your App <noreply@example.com>')
    .build();
  
  console.log('Configurations created for different providers');
  console.log('Gmail config:', { host: gmailConfig.host, port: gmailConfig.port });
  console.log('Outlook config:', { host: outlookConfig.host, port: outlookConfig.port });
  console.log('Yahoo config:', { host: yahooConfig.host, port: yahooConfig.port });
  console.log('Custom config:', { host: customConfig.host, port: customConfig.port });
}

// Example 6: Email validation utilities
function emailValidationExample() {
  console.log('\n=== Email Validation Example ===');
  
  const emails = [
    'valid@example.com',
    'invalid-email',
    'another.valid@domain.co.uk',
    'test@10minutemail.com', // disposable
    '@invalid.com',
    'user@valid-domain.org'
  ];
  
  emails.forEach(email => {
    console.log(`${email}: ${isValidEmail(email) ? 'Valid' : 'Invalid'}`);
  });
}

// Main function to run examples
async function runExamples() {
  console.log('🚀 Email Service Examples');
  console.log('Note: Update the email credentials before running these examples');
  
  try {
    // Uncomment the examples you want to run:
    
    // await basicEmailExample();
    // await templateEmailExample();
    // await customTemplateExample();
    // await bulkEmailExample();
    await differentProvidersExample();
    emailValidationExample();
    
    console.log('\n✅ Examples completed successfully!');
  } catch (error) {
    console.error('❌ Error running examples:', error);
  }
}

// Run examples if this file is executed directly
if (require.main === module) {
  runExamples();
}

export {
  basicEmailExample,
  templateEmailExample,
  customTemplateExample,
  bulkEmailExample,
  differentProvidersExample,
  emailValidationExample
};
