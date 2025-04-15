import fs from "fs-extra";
import path from "path";
import XLSX from "xlsx";
import { fileURLToPath } from "url";

// Directory for uploads
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Updated path to match your structure
const uploadsDir = path.join(__dirname, "..", "..", "uploads");
const uploadsJsonDir = path.join(uploadsDir, "json");
const uploadsExcelDir = path.join(uploadsDir, "excel");
const sessionFile = path.join(
	__dirname,
	"..",
	"..",
	"data",
	"sessionFiles.json"
);

// Create directories if they don't exist
fs.ensureDirSync(uploadsDir);
fs.ensureDirSync(uploadsJsonDir);
fs.ensureDirSync(uploadsExcelDir);
fs.ensureDirSync(path.join(__dirname, "..", "..", "data"));
fs.ensureFileSync(sessionFile);

// Initialize session file if empty
if (fs.statSync(sessionFile).size === 0) {
	fs.writeJsonSync(sessionFile, { json: null, excel: null }, { spaces: 2 });
}

// Read selected files from session
const getSessionFiles = () => {
	try {
		return JSON.parse(fs.readFileSync(sessionFile, "utf-8"));
	} catch {
		return { json: null, excel: null };
	}
};

// Save selected files to session
const setSessionFiles = (json, excel) => {
	const current = getSessionFiles();
	fs.writeFileSync(
		sessionFile,
		JSON.stringify({
			json: json || current.json,
			excel: excel || current.excel,
		})
	);
};

// Upload a file
export function uploadFile(req, res) {
	const { file } = req;
	if (!file) {
		return res.status(400).json({ error: "No file uploaded" });
	}

	const type = file.mimetype.includes("json") ? "json" : "excel";
	const filePath = path.join(uploadsDir, type, file.filename);

	// If JSON, ensure it has valid structure
	if (type === "json") {
		try {
			// Try to read the file
			const data = fs.readJsonSync(filePath);

			// If file doesn't contain an array, initialize it
			if (!Array.isArray(data)) {
				fs.writeJsonSync(filePath, [], { spaces: 2 });
			}
		} catch (error) {
			// If reading fails, initialize with empty array
			fs.writeJsonSync(filePath, [], { spaces: 2 });
		}
	} else if (type === "excel") {
		// Ensure Excel file is valid
		try {
			XLSX.readFile(filePath);
		} catch (error) {
			// If reading fails, create a new Excel file
			const workbook = XLSX.utils.book_new();
			const worksheet = XLSX.utils.json_to_sheet([]);
			XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
			XLSX.writeFile(workbook, filePath);
		}
	}

	setSessionFiles(
		type === "json" ? file.filename : null,
		type === "excel" ? file.filename : null
	);

	res.json({
		message: "File uploaded successfully",
		fileName: file.filename,
		type,
	});
}

// Get selected files
export function getSelectedFiles(req, res) {
	const session = getSessionFiles();
	res.json(session);
}

// Update JSON file with better error handling
export function updateJson(req, res) {
	const { newData } = req.body;
	if (!newData || !Array.isArray(newData)) {
		return res
			.status(400)
			.json({ error: "Invalid data format. Expected array." });
	}

	const { json } = getSessionFiles();
	const filePath = path.join(uploadsDir, "json", json);

	if (!json || !fs.existsSync(filePath)) {
		return res.status(400).json({ error: "JSON file not found." });
	}

	try {
		// Check if file is empty
		const fileStats = fs.statSync(filePath);
		let currentData = [];

		if (fileStats.size > 0) {
			try {
				currentData = fs.readJsonSync(filePath);
				if (!Array.isArray(currentData)) {
					currentData = []; // Reset if not an array
				}
			} catch (parseError) {
				// If parsing fails, start with empty array
				console.error("Error parsing JSON file:", parseError);
				currentData = [];
			}
		}

		// Add new data to array
		currentData.push(...newData);

		// Write to file
		fs.writeJsonSync(filePath, currentData, { spaces: 2 });
		res.json({ message: "JSON updated successfully" });
	} catch (error) {
		console.error("Error updating JSON:", error);
		res.status(500).json({ error: "Failed to update JSON file" });
	}
}

// Update Excel file with better error handling
export function updateExcel(req, res) {
	const { newData } = req.body;
	if (!newData || !Array.isArray(newData)) {
		return res
			.status(400)
			.json({ error: "Invalid data format. Expected array." });
	}

	const { excel } = getSessionFiles();
	const filePath = path.join(uploadsDir, "excel", excel);

	if (!excel || !fs.existsSync(filePath)) {
		return res.status(400).json({ error: "Excel file not found." });
	}

	try {
		const workbook = XLSX.readFile(filePath);
		const sheetName = workbook.SheetNames[0] || "Sheet1";

		let sheet = [];
		if (workbook.Sheets[sheetName]) {
			sheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
		}

		const updatedSheet = [...sheet, ...newData];
		const newWS = XLSX.utils.json_to_sheet(updatedSheet);
		workbook.Sheets[sheetName] = newWS;

		XLSX.writeFile(workbook, filePath);

		res.json({ message: "Excel updated successfully" });
	} catch (error) {
		console.error("Error updating Excel:", error);
		res.status(500).json({ error: "Failed to update Excel file" });
	}
}

// Download file with better error handling
export function downloadFile(req, res) {
	const { type } = req.params;
	if (type !== "json" && type !== "excel") {
		return res.status(400).json({ error: "Invalid file type" });
	}

	const session = getSessionFiles();

	if (!session[type]) {
		return res.status(404).json({ error: "File not found in session" });
	}

	const filePath = path.join(uploadsDir, type, session[type]);

	if (!fs.existsSync(filePath)) {
		return res.status(404).json({ error: "File not found on disk" });
	}

	res.download(filePath);
}

// Create new empty file
export function createNewFile(req, res) {
	const { type, filename } = req.body;

	if (!type || !filename || !["json", "excel"].includes(type)) {
		return res.status(400).json({ error: "Invalid file type or name" });
	}

	try {
		const filePath = path.join(uploadsDir, type, filename);

		// Check if file already exists
		if (fs.existsSync(filePath)) {
			return res.status(400).json({ error: "File already exists" });
		}

		if (type === "json") {
			fs.writeJsonSync(filePath, [], { spaces: 2 });
		} else {
			// Create empty Excel file
			const workbook = XLSX.utils.book_new();
			const worksheet = XLSX.utils.json_to_sheet([]);
			XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
			XLSX.writeFile(workbook, filePath);
		}

		setSessionFiles(
			type === "json" ? filename : null,
			type === "excel" ? filename : null
		);

		res.json({
			message: "File created successfully",
			fileName: filename,
			type,
		});
	} catch (error) {
		console.error("Error creating file:", error);
		res.status(500).json({ error: "Failed to create file" });
	}
}

// List all available files
export function listFiles(req, res) {
	try {
		const jsonFiles = fs.readdirSync(uploadsJsonDir);
		const excelFiles = fs.readdirSync(uploadsExcelDir);

		res.json({
			json: jsonFiles,
			excel: excelFiles,
		});
	} catch (error) {
		console.error("Error listing files:", error);
		res.status(500).json({ error: "Failed to list files" });
	}
}

export const deselectFile = (req, res) => {
	const { type } = req.body;

	if (!["json", "excel"].includes(type)) {
		return res.status(400).json({ message: "Invalid file type." });
	}

	// Initialize session and selectedFiles if not present
	if (!req.session) req.session = {};
	if (!req.session.selectedFiles) req.session.selectedFiles = {};

	const fileName = req.session.selectedFiles[type];

	if (fileName) {
		const filePath = path.join("uploads", fileName);

		// Remove the reference from session
		req.session.selectedFiles[type] = null;

		// Try to delete the file from disk
		fs.unlink(filePath, (err) => {
			if (err && err.code !== "ENOENT") {
				console.error("File deletion error:", err);
				return res.status(500).json({ message: "Failed to delete file." });
			}
			return res.json({ message: `${type.toUpperCase()} file deselected.` });
		});
	} else {
		return res.json({ message: `No ${type.toUpperCase()} file selected.` });
	}
};
