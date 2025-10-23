/**
 * Validate email address format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate multiple email addresses
 */
export function validateEmails(emails: string[]): { valid: string[]; invalid: string[] } {
  const valid: string[] = [];
  const invalid: string[] = [];

  emails.forEach(email => {
    if (isValidEmail(email.trim())) {
      valid.push(email.trim());
    } else {
      invalid.push(email.trim());
    }
  });

  return { valid, invalid };
}

/**
 * Parse email addresses from a string (comma or semicolon separated)
 */
export function parseEmailList(emailString: string): string[] {
  if (!emailString || emailString.trim() === '') {
    return [];
  }

  return emailString
    .split(/[,;]/)
    .map(email => email.trim())
    .filter(email => email.length > 0);
}

/**
 * Extract domain from email address
 */
export function extractDomain(email: string): string | null {
  if (!isValidEmail(email)) {
    return null;
  }

  const parts = email.split('@');
  return parts[1].toLowerCase();
}

/**
 * Check if email is from a specific domain
 */
export function isFromDomain(email: string, domain: string): boolean {
  const emailDomain = extractDomain(email);
  return emailDomain === domain.toLowerCase();
}

/**
 * Sanitize email address
 */
export function sanitizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * Generate a random email for testing purposes
 */
export function generateTestEmail(prefix: string = 'test', domain: string = 'example.com'): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `${prefix}_${timestamp}_${random}@${domain}`;
}

/**
 * Mask email address for privacy (e.g., j***@example.com)
 */
export function maskEmail(email: string): string {
  if (!isValidEmail(email)) {
    return email;
  }

  const [username, domain] = email.split('@');
  
  if (username.length <= 2) {
    return `${username[0]}***@${domain}`;
  }
  
  const maskedUsername = username[0] + '*'.repeat(username.length - 2) + username[username.length - 1];
  return `${maskedUsername}@${domain}`;
}

/**
 * Check if email is a disposable/temporary email
 */
export function isDisposableEmail(email: string): boolean {
  const disposableDomains = [
    '10minutemail.com',
    'tempmail.org',
    'guerrillamail.com',
    'mailinator.com',
    'yopmail.com',
    'temp-mail.org',
    'throwaway.email',
    'getnada.com',
    'maildrop.cc',
    'discard.email'
  ];

  const domain = extractDomain(email);
  return domain ? disposableDomains.includes(domain) : false;
}

/**
 * Validate email list and return detailed results
 */
export interface EmailValidationResult {
  email: string;
  isValid: boolean;
  isDisposable: boolean;
  domain: string | null;
  masked: string;
}

export function validateEmailList(emails: string[]): EmailValidationResult[] {
  return emails.map(email => {
    const sanitized = sanitizeEmail(email);
    const isValid = isValidEmail(sanitized);
    const domain = extractDomain(sanitized);
    
    return {
      email: sanitized,
      isValid,
      isDisposable: isValid ? isDisposableEmail(sanitized) : false,
      domain,
      masked: isValid ? maskEmail(sanitized) : sanitized
    };
  });
}

/**
 * Format email for display with name
 */
export function formatEmailWithName(email: string, name?: string): string {
  if (!name) {
    return email;
  }
  
  return `"${name}" <${email}>`;
}
