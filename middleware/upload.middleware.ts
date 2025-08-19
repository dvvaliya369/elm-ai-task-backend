import multer from "multer";
import { validateMediaFile } from "../utils/fileUpload";
import { AppError } from "../service/asyncHandler";

const storage = multer.memoryStorage();

const fileFilter = (
  _req: any,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  if (validateMediaFile(file)) {
    cb(null, true);
  } else {
    cb(
      new AppError(
        "Invalid file type or size. Images under 5MB and videos under 50MB are allowed.",
        400
      )
    );
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB max (for videos)
  },
});
