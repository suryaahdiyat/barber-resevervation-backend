// import multer from "multer";
import { createUploader } from "../middleware/upload.js";
import express from "express";
import {
  getAllServices,
  createService,
  getServiceById,
  searchService,
  updateService,
  deleteService,
} from "../controllers/serviceController.js";

import { protect } from "../middleware/authMiddleware.js";
const router = express.Router();

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "uploads/");
//   },
//   filename: (req, file, cb) => {
//     const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
//     cb(null, uniqueSuffix + "-" + file.originalname);
//   },
// });
// const uploads = multer({ storage });

const upload = createUploader("services");

router.get("/", getAllServices);
router.post("/", upload.single("picture"), createService);
router.get("/search", searchService);
router.get("/:id", getServiceById);
router.put("/:id", upload.single("picture"), updateService);
router.delete("/:id", deleteService);

export default router;
