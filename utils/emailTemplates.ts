export const emailTemplates = {
  welcome: (firstName: string, lastName: string) => ({
    subject: 'Welcome to ELM AI Task!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">Welcome to ELM AI Task!</h1>
        </div>
        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #333;">Hello ${firstName} ${lastName}!</h2>
          <p style="color: #666; font-size: 16px; line-height: 1.6;">
            Thank you for signing up. We're excited to have you on board!
          </p>
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">What you can do now:</h3>
            <ul style="color: #666; line-height: 1.8;">
              <li>Create and share posts with images and videos</li>
              <li>Interact with other users through likes and comments</li>
              <li>Manage and customize your profile</li>
              <li>Explore content from the community</li>
            </ul>
          </div>
          <p style="color: #666; font-size: 14px;">
            If you have any questions, feel free to reach out to our support team.
          </p>
          <div style="text-align: center; margin-top: 30px;">
            <a href="#" style="background-color: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Get Started
            </a>
          </div>
        </div>
        <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
          <p>This is an automated message. Please do not reply to this email.</p>
        </div>
      </div>
    `,
    text: `Welcome to ELM AI Task, ${firstName} ${lastName}! Thank you for signing up. We're excited to have you on board.`,
  }),

  passwordReset: (resetLink: string) => ({
    subject: 'Password Reset Request',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #f44336; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">Password Reset Request</h1>
        </div>
        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
          <p style="color: #666; font-size: 16px; line-height: 1.6;">
            We received a request to reset your password. Click the button below to create a new password:
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" style="background-color: #4CAF50; color: white; padding: 15px 40px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
              Reset Password
            </a>
          </div>
          <div style="background: white; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="color: #666; font-size: 14px; margin: 0;">
              Or copy and paste this link into your browser:
            </p>
            <p style="color: #667eea; word-break: break-all; font-size: 14px;">
              ${resetLink}
            </p>
          </div>
          <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; border-radius: 4px; margin-top: 20px;">
            <p style="color: #856404; margin: 0; font-size: 14px;">
              <strong>Security Notice:</strong> If you didn't request a password reset, please ignore this email. This link will expire in 1 hour.
            </p>
          </div>
        </div>
        <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
          <p>This is an automated security message. Please do not reply to this email.</p>
        </div>
      </div>
    `,
    text: `Password Reset Request\n\nWe received a request to reset your password. Visit the following link to create a new password:\n\n${resetLink}\n\nIf you didn't request a password reset, please ignore this email. This link will expire in 1 hour.`,
  }),

  passwordChanged: (fullName: string) => ({
    subject: 'Password Changed Successfully',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #4CAF50; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">Password Changed</h1>
        </div>
        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
          <p style="color: #666; font-size: 16px; line-height: 1.6;">
            Hi ${fullName},
          </p>
          <div style="background: #d4edda; border-left: 4px solid #28a745; padding: 15px; border-radius: 4px; margin: 20px 0;">
            <p style="color: #155724; margin: 0; font-size: 14px;">
              <strong>✓ Success:</strong> Your password has been changed successfully.
            </p>
          </div>
          <p style="color: #666; font-size: 14px; line-height: 1.6;">
            Your account security is important to us. If you didn't make this change, please contact our support team immediately.
          </p>
          <div style="text-align: center; margin-top: 30px;">
            <a href="#" style="background-color: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Go to Dashboard
            </a>
          </div>
        </div>
        <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
          <p>This is an automated message. Please do not reply to this email.</p>
        </div>
      </div>
    `,
    text: `Hi ${fullName},\n\nYour password has been changed successfully.\n\nIf you didn't make this change, please contact our support team immediately.`,
  }),

  postLiked: (postOwnerName: string, likerName: string, postCaption: string) => ({
    subject: 'Someone liked your post!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">💙 New Like!</h1>
        </div>
        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
          <p style="color: #666; font-size: 16px; line-height: 1.6;">
            Hi ${postOwnerName},
          </p>
          <p style="color: #666; font-size: 16px; line-height: 1.6;">
            <strong>${likerName}</strong> liked your post!
          </p>
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
            <p style="color: #333; font-style: italic; margin: 0;">
              "${postCaption}"
            </p>
          </div>
          <div style="text-align: center; margin-top: 30px;">
            <a href="#" style="background-color: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              View Post
            </a>
          </div>
        </div>
        <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
          <p>This is an automated notification. Please do not reply to this email.</p>
        </div>
      </div>
    `,
    text: `Hi ${postOwnerName},\n\n${likerName} liked your post!\n\n"${postCaption}"`,
  }),

  newComment: (postOwnerName: string, commenterName: string, commentText: string, postCaption: string) => ({
    subject: 'New comment on your post',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">💬 New Comment!</h1>
        </div>
        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
          <p style="color: #666; font-size: 16px; line-height: 1.6;">
            Hi ${postOwnerName},
          </p>
          <p style="color: #666; font-size: 16px; line-height: 1.6;">
            <strong>${commenterName}</strong> commented on your post:
          </p>
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="color: #333; margin: 0 0 10px 0; font-size: 14px; color: #999;">
              Your post:
            </p>
            <p style="color: #333; font-style: italic; margin: 0 0 15px 0; padding-bottom: 15px; border-bottom: 1px solid #eee;">
              "${postCaption}"
            </p>
            <p style="color: #333; margin: 0 0 10px 0; font-size: 14px; color: #999;">
              Comment:
            </p>
            <p style="color: #333; margin: 0; background: #f0f0f0; padding: 15px; border-radius: 5px;">
              "${commentText}"
            </p>
          </div>
          <div style="text-align: center; margin-top: 30px;">
            <a href="#" style="background-color: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Reply to Comment
            </a>
          </div>
        </div>
        <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
          <p>This is an automated notification. Please do not reply to this email.</p>
        </div>
      </div>
    `,
    text: `Hi ${postOwnerName},\n\n${commenterName} commented on your post:\n\nYour post: "${postCaption}"\n\nComment: "${commentText}"`,
  }),
};

export default emailTemplates;
