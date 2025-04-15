import express from "express";
import cors from "cors";
import "dotenv/config";
import os from "os";
import connectDB from "./db/index.js";
import studentRouter from "./routes/student/student.routes.js";
import fileRoutes from "./routes/files/file.route.js";
import session from "express-session";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
	session({
		secret: "123445",
		resave: false,
		saveUninitialized: true, // Important for initializing empty sessions
		cookie: { maxAge: 24 * 60 * 60 * 1000 }, // 1 day
	})
);

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

// Function to get the local IP address
const getLocalIp = () => {
	const interfaces = os.networkInterfaces();
	for (const interfaceName in interfaces) {
		for (const iface of interfaces[interfaceName]) {
			if (iface.family === "IPv4" && !iface.internal) {
				return iface.address;
			}
		}
	}
	return "0.0.0.0"; // Default to all network interfaces
};

app.use("/student", studentRouter);
app.use("/file", fileRoutes);

// Connect MongoDB and Start Server
connectDB()
	.then(() => {
		const ipAddress = getLocalIp();
		app.listen(PORT, () => {
			console.log(`Server is running on ${PORT}`);
		});
	})
	.catch((error) => {
		console.log("MongoDB Connection Failed !!!", error);
	});
