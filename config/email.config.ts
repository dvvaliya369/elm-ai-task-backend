import { EmailProvider, EmailConfig } from '../types/email.types';

export class EmailConfigBuilder {
  private config: Partial<EmailConfig> = {};

  /**
   * Set up Gmail configuration
   */
  public static gmail(email: string, appPassword: string): EmailConfigBuilder {
    const builder = new EmailConfigBuilder();
    return builder
      .setHost('smtp.gmail.com')
      .setPort(587)
      .setSecure(false)
      .setAuth(email, appPassword)
      .setService('gmail')
      .setFrom(email);
  }

  /**
   * Set up Outlook/Hotmail configuration
   */
  public static outlook(email: string, password: string): EmailConfigBuilder {
    const builder = new EmailConfigBuilder();
    return builder
      .setHost('smtp-mail.outlook.com')
      .setPort(587)
      .setSecure(false)
      .setAuth(email, password)
      .setService('outlook')
      .setFrom(email);
  }

  /**
   * Set up Yahoo configuration
   */
  public static yahoo(email: string, appPassword: string): EmailConfigBuilder {
    const builder = new EmailConfigBuilder();
    return builder
      .setHost('smtp.mail.yahoo.com')
      .setPort(587)
      .setSecure(false)
      .setAuth(email, appPassword)
      .setService('yahoo')
      .setFrom(email);
  }

  /**
   * Set up custom SMTP configuration
   */
  public static smtp(host: string, port: number = 587): EmailConfigBuilder {
    const builder = new EmailConfigBuilder();
    return builder
      .setHost(host)
      .setPort(port)
      .setSecure(port === 465);
  }

  /**
   * Set SMTP host
   */
  public setHost(host: string): EmailConfigBuilder {
    this.config.host = host;
    return this;
  }

  /**
   * Set SMTP port
   */
  public setPort(port: number): EmailConfigBuilder {
    this.config.port = port;
    return this;
  }

  /**
   * Set secure connection
   */
  public setSecure(secure: boolean): EmailConfigBuilder {
    this.config.secure = secure;
    return this;
  }

  /**
   * Set authentication credentials
   */
  public setAuth(user: string, pass: string): EmailConfigBuilder {
    this.config.auth = { user, pass };
    return this;
  }

  /**
   * Set email service
   */
  public setService(service: string): EmailConfigBuilder {
    this.config.service = service;
    return this;
  }

  /**
   * Set default from address
   */
  public setFrom(from: string): EmailConfigBuilder {
    this.config.from = from;
    return this;
  }

  /**
   * Build the configuration
   */
  public build(): EmailConfig {
    if (!this.config.host || !this.config.port || !this.config.auth) {
      throw new Error('Host, port, and authentication are required');
    }

    return {
      host: this.config.host,
      port: this.config.port,
      secure: this.config.secure ?? false,
      auth: this.config.auth,
      service: this.config.service,
      from: this.config.from
    };
  }
}

/**
 * Get email configuration from environment variables
 */
export function getEmailConfigFromEnv(): EmailConfig {
  const {
    EMAIL_HOST,
    EMAIL_PORT,
    EMAIL_SECURE,
    EMAIL_USER,
    EMAIL_PASS,
    EMAIL_SERVICE,
    EMAIL_FROM
  } = process.env;

  if (!EMAIL_HOST || !EMAIL_PORT || !EMAIL_USER || !EMAIL_PASS) {
    throw new Error('Missing required email environment variables: EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS');
  }

  return {
    host: EMAIL_HOST,
    port: parseInt(EMAIL_PORT, 10),
    secure: EMAIL_SECURE === 'true',
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASS
    },
    service: EMAIL_SERVICE,
    from: EMAIL_FROM
  };
}
