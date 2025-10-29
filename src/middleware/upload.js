import fs from "fs";
import path from "path";
import multer from "multer";

const makeUploadDir = (subfolder) => {
  const dir = path.join(process.cwd(), "uploads", subfolder);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`📁 Folder uploads/${subfolder} dibuat otomatis!`);
  }
  return dir;
};

export const createUploader = (subfolder = "") => {
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadPath = makeUploadDir(subfolder);
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, `${uniqueSuffix}-${file.originalname}`);
    },
  });

  return multer({ storage });
};
