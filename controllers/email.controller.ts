import { Response } from "express";
import asyncHandler, { AppError } from "../service/asyncHandler";
import emailService from "../service/email.service";
import {
  SendEmailRequest,
  SendWelcomeEmailRequest,
  SendPasswordResetEmailRequest,
} from "./interface";

export const sendEmail = asyncHandler<SendEmailRequest, Response>(
  async (req, res) => {
    const { to, subject, text, html, cc, bcc } = req.body;

    if (!to || !subject) {
      throw new AppError("Recipient email and subject are required", 400);
    }

    if (!text && !html) {
      throw new AppError("Either text or html content is required", 400);
    }

    const result = await emailService.sendEmail({
      to,
      subject,
      text,
      html,
      cc,
      bcc,
    });

    if (!result.success) {
      throw new AppError(result.message, 500);
    }

    return res.status(200).json({
      success: true,
      message: result.message,
      messageId: result.messageId,
    });
  }
);

export const sendWelcomeEmail = asyncHandler<SendWelcomeEmailRequest, Response>(
  async (req, res) => {
    const { email, firstName, lastName } = req.body;

    if (!email || !firstName || !lastName) {
      throw new AppError("Email, firstName, and lastName are required", 400);
    }

    const result = await emailService.sendWelcomeEmail(
      email,
      firstName,
      lastName
    );

    if (!result.success) {
      throw new AppError(result.message, 500);
    }

    return res.status(200).json({
      success: true,
      message: result.message,
      messageId: result.messageId,
    });
  }
);

export const sendPasswordResetEmail = asyncHandler<
  SendPasswordResetEmailRequest,
  Response
>(async (req, res) => {
  const { email, resetToken } = req.body;

  if (!email || !resetToken) {
    throw new AppError("Email and resetToken are required", 400);
  }

  const result = await emailService.sendPasswordResetEmail(email, resetToken);

  if (!result.success) {
    throw new AppError(result.message, 500);
  }

  return res.status(200).json({
    success: true,
    message: result.message,
    messageId: result.messageId,
  });
});

export const verifyEmailService = asyncHandler<any, Response>(
  async (req, res) => {
    const isConnected = await emailService.verifyConnection();

    if (!isConnected) {
      return res.status(503).json({
        success: false,
        message: "Email service is not configured or connection failed",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Email service is working properly",
    });
  }
);
