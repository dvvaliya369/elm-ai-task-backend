import { Request, Response, NextFunction } from "express";
import multer from "multer";

export const handleMulterError = (
  error: any,
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  if (error instanceof multer.MulterError) {
    let message = "File upload error";

    switch (error.code as string) {
      case "UNEXPECTED_FIELD":
        message = "Invalid field name. Use 'media' for file upload";
        break;
      case "LIMIT_FILE_SIZE":
        message = "File too large. Images under 5MB and videos under 50MB are allowed";
        break;
      case "LIMIT_FILE_COUNT":
        message = "Too many files. Only one file is allowed";
        break;
      case "LIMIT_UNEXPECTED_FILE":
        message = "Unexpected file field";
        break;
      default:
        message = error.message;
    }

    return res.status(400).json({
      success: false,
      message,
    });
  }

  next(error);
};
