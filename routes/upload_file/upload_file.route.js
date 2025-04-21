import express from "express";
import multer from "multer";
import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";

import {
	// uploadFile,
	// getSelectedFiles,
	// updateJson,
	// updateExcel,
	// downloadFile,
	// createNewFile,
	// listFiles,
	// deselectFile,
	generateAndDownload,
} from "../../controllers/upload_file/upload_files.controller.js";

const router = express.Router();

// // Directory for uploads
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// // Directory for uploads
// const uploadsDir = path.join(__dirname, "..", "..", "uploads");

// // Multer storage config
// const storage = multer.diskStorage({
// 	destination: (req, file, cb) => {
// 		const type = file.mimetype.includes("json") ? "json" : "excel";
// 		const folder = path.join(uploadsDir, type);
// 		fs.ensureDirSync(folder);
// 		cb(null, folder);
// 	},
// 	filename: (req, file, cb) => {
// 		cb(null, file.originalname);
// 	},
// });

// // Multer file filter to restrict file types
// const fileFilter = (req, file, cb) => {
// 	// Check if file type is allowed
// 	if (
// 		file.mimetype.includes("json") ||
// 		file.mimetype.includes("spreadsheetml") ||
// 		file.mimetype.includes("excel") ||
// 		file.mimetype.includes("csv")
// 	) {
// 		cb(null, true);
// 	} else {
// 		cb(new Error("Only JSON and Excel files are allowed"), false);
// 	}
// };

// // Multer upload config
// const upload = multer({
// 	storage,
// 	fileFilter,
// 	limits: {
// 		fileSize: 10 * 1024 * 1024, // 10MB size limit
// 	},
// });

// Routes
// router.post("/upload", upload.single("file"), uploadFile);
// router.get("/selected-files", getSelectedFiles);
// router.post("/update-json", updateJson);
// router.post("/update-excel", updateExcel);
// router.get("/download/:type", downloadFile);
// router.post("/create-new", createNewFile);
// router.get("/list", listFiles);
// router.post("/deselect", deselectFile);
// New route for direct download feature
router.post("/generate-download", generateAndDownload);

export default router;
