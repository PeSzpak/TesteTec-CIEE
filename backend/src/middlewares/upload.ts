import multer from "multer";
import { AppError } from "../errors/app-error";

export const MAX_FILE_SIZE = 5 * 1024 * 1024;

export const uploadPdf = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE, files: 1 },
  fileFilter: (_req, file, callback) => {
    if (file.mimetype !== "application/pdf") {
      callback(new AppError(400, "Apenas arquivos PDF são aceitos"));
      return;
    }
    callback(null, true);
  },
}).single("file");
