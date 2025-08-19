import { v4 as uuidv4 } from "uuid";
import path from "path";

export const generateUniqueFileName = (originalName: string): string => {
  const extension = path.extname(originalName);
  const uniqueId = uuidv4();
  const timestamp = Date.now();
  return `${uniqueId}_${timestamp}${extension}`;
};

export const uploadToCloud = async (
  file: Express.Multer.File
): Promise<string> => {
  // TODO:
  const uniqueFileName = generateUniqueFileName(file.originalname);
  return `https://dummy-storage.com/uploads/${uniqueFileName}`;
};

export const validateMediaFile = (file: Express.Multer.File): boolean => {
  const allowedImageTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
  ];
  const allowedVideoTypes = [
    "video/mp4",
    "video/mpeg",
    "video/quicktime",
    "video/x-msvideo",
  ];

  const maxImageSize = 5 * 1024 * 1024;
  const maxVideoSize = 50 * 1024 * 1024;

  const isImage = allowedImageTypes.includes(file.mimetype);
  const isVideo = allowedVideoTypes.includes(file.mimetype);

  if (!file.size) {
    return true;
  }

  if (isImage) {
    return file.size <= maxImageSize;
  } else if (isVideo) {
    return file.size <= maxVideoSize;
  }

  return false;
};

export const getMediaType = (file: Express.Multer.File): "image" | "video" => {
  const imageTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
  ];
  return imageTypes.includes(file.mimetype) ? "image" : "video";
};
