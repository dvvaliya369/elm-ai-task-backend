import { Response } from "express";
import asyncHandler, { AppError } from "../service/asyncHandler";
import emailService from "../service/email.service";
import User from "../models/userSchema/user.schema";
import tokenService from "../service/token.service";
import { 
  ISendEmailRequest, 
  IPasswordResetRequest, 
  IResetPasswordRequest,
  IEmailVerificationRequest,
  IVerifyEmailRequest,
  ITestEmailConfigRequest
} from "./interface";

/**
 * Send custom email
 */
export const sendEmail = asyncHandler<ISendEmailRequest, Response>(
  async (req, res) => {
    const { to, subject, message, html } = req.body;

    if (!to || !subject || (!message && !html)) {
      throw new AppError("To, subject, and message/html are required", 400);
    }

    // Validate email addresses
    const emails = Array.isArray(to) ? to : [to];
    for (const email of emails) {
      if (!emailService.validateEmail(email)) {
        throw new AppError(`Invalid email address: ${email}`, 400);
      }
    }

    await emailService.sendEmail({
      to,
      subject,
      text: message,
      html: html || message,
    });

    res.status(200).json({
      success: true,
      message: "Email sent successfully",
    });
  }
);

/**
 * Request password reset
 */
export const requestPasswordReset = asyncHandler<IPasswordResetRequest, Response>(
  async (req, res) => {
    const { email } = req.body;

    if (!email) {
      throw new AppError("Email is required", 400);
    }

    if (!emailService.validateEmail(email)) {
      throw new AppError("Invalid email address", 400);
    }

    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal if user exists or not for security
      return res.status(200).json({
        success: true,
        message: "If an account with that email exists, a password reset link has been sent.",
      });
    }

    // Generate password reset token (expires in 1 hour)
    const resetToken = tokenService.generatePasswordResetToken({
      _id: user._id.toString(),
      email: user.email,
    });

    // Save reset token to user
    user.passwordResetToken = resetToken;
    user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    // Send password reset email
    await emailService.sendPasswordResetEmail(email, user.firstName || 'User', resetToken);

    res.status(200).json({
      success: true,
      message: "If an account with that email exists, a password reset link has been sent.",
    });
  }
);

/**
 * Reset password using token
 */
export const resetPassword = asyncHandler<IResetPasswordRequest, Response>(
  async (req, res) => {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      throw new AppError("Token and new password are required", 400);
    }

    if (newPassword.length < 4) {
      throw new AppError("Password must be at least 4 characters long", 400);
    }

    try {
      const decoded = tokenService.verifyPasswordResetToken(token);
      
      const user = await User.findOne({
        _id: decoded._id,
        passwordResetToken: token,
        passwordResetExpires: { $gt: new Date() },
      });

      if (!user) {
        throw new AppError("Invalid or expired reset token", 400);
      }

      // Update password and clear reset token
      user.password = newPassword;
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save();

      res.status(200).json({
        success: true,
        message: "Password reset successfully",
      });
    } catch (error) {
      throw new AppError("Invalid or expired reset token", 400);
    }
  }
);

/**
 * Send email verification
 */
export const sendEmailVerification = asyncHandler<IEmailVerificationRequest, Response>(
  async (req, res) => {
    const { email } = req.body;

    if (!email) {
      throw new AppError("Email is required", 400);
    }

    if (!emailService.validateEmail(email)) {
      throw new AppError("Invalid email address", 400);
    }

    const user = await User.findOne({ email });
    if (!user) {
      throw new AppError("User not found", 404);
    }

    if (user.emailVerified) {
      throw new AppError("Email is already verified", 400);
    }

    // Generate email verification token (expires in 24 hours)
    const verificationToken = tokenService.generateEmailVerificationToken({
      _id: user._id.toString(),
      email: user.email,
    });

    // Save verification token to user
    user.emailVerificationToken = verificationToken;
    user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    await user.save();

    // Send verification email
    await emailService.sendEmailVerificationEmail(email, user.firstName || 'User', verificationToken);

    res.status(200).json({
      success: true,
      message: "Verification email sent successfully",
    });
  }
);

/**
 * Verify email using token
 */
export const verifyEmail = asyncHandler<IVerifyEmailRequest, Response>(
  async (req, res) => {
    const { token } = req.body;

    if (!token) {
      throw new AppError("Verification token is required", 400);
    }

    try {
      const decoded = tokenService.verifyEmailVerificationToken(token);
      
      const user = await User.findOne({
        _id: decoded._id,
        emailVerificationToken: token,
        emailVerificationExpires: { $gt: new Date() },
      });

      if (!user) {
        throw new AppError("Invalid or expired verification token", 400);
      }

      // Mark email as verified and clear verification token
      user.emailVerified = true;
      user.emailVerificationToken = undefined;
      user.emailVerificationExpires = undefined;
      await user.save();

      res.status(200).json({
        success: true,
        message: "Email verified successfully",
      });
    } catch (error) {
      throw new AppError("Invalid or expired verification token", 400);
    }
  }
);

/**
 * Test email configuration
 */
export const testEmailConfig = asyncHandler<ITestEmailConfigRequest, Response>(
  async (req, res) => {
    const isConfigValid = await emailService.testEmailConfiguration();

    if (!isConfigValid) {
      throw new AppError("Email configuration is invalid", 500);
    }

    res.status(200).json({
      success: true,
      message: "Email configuration is valid",
    });
  }
);