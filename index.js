import express from "express";
import cors from "cors";
import 'dotenv/config'
import os from "os";
import connectDB from "./db/index.js";
import { Student } from "./models/student.model.js";
import { Transaction } from "./models/transaction.model.js";


const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Function to get the local IP address
const getLocalIp = () => {
    const interfaces = os.networkInterfaces();
    for (const interfaceName in interfaces) {
        for (const iface of interfaces[interfaceName]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                return iface.address;
            }
        }
    }
    return '0.0.0.0'; // Default to all network interfaces
};


app.post('/byENR', async (req, res) => {
    try {
        const { result } = req.body;

        let query = {};

        if (result?.enNumber) {
            query = { "Student New ENR": { $in: [...result.enNumber] } };
        }
        else if (result?.appno) {
            query = {
                "EduLearn Application No.": { $in: [...result.appno] }
            };
        }
        else if (result?.enrno) {
            query = { "Student EduLearn ENR": { $in: [...result.enrno] } };
        }
        else if (result?.email) {
            query = { "Guardians Email": { $in: [...result.email] } };
        }
        else if (result?.phone) {
            query = { "Guardians Mobile": { $in: [parseInt(...result.phone)] } };
        }
        else if(result?.name){
            query = { "Student First Name": { $in: [...result.name] } };
        }
        else if(result?.studentId){
            query = { "Student ID": { $in: [parseInt(...result.studentId)] } };
        }
        else if(result?.guardianGlobalNo){
            query = { "Guardians Global No": { $in: [...result.guardianGlobalNo] } };
        }
        else if(result?.guardianID){
            query = { "Guardian ID": { $in: [parseInt(...result.guardianID)] } };
        }

        const data = await Student.find(query);

        if (data.length > 0) {
            const transformData = transformStudentData(data);
            res.json(transformData);
        } else {
            res.status(404).json({ message: "Student not found" });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post("/transactions", async (req, res) => {
    try {
        const transaction = new Transaction(req.body);
        await transaction.save();
        res.status(201).json({ message: "Transaction added successfully", transaction });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});


const transformStudentData = (apiResponses) => {
    const studentMap = new Map();

    const clonedResponses = JSON.parse(JSON.stringify(apiResponses))
    clonedResponses.forEach((entry) => {
        const studentId = entry["Student ID"];

        if (!studentMap.has(studentId)) {
            studentMap.set(studentId, {
                _id: entry["_id"],
                "AY YR": entry["AY YR"],
                "Student ID": entry["Student ID"],
                "Student Type": entry["Student Type"],
                "School Name": entry["School Name"],
                "Brand Name": entry["Brand Name"],
                "Board Name": entry["Board Name"],
                "Course Name": entry["Course Name"],
                "Stream Name": entry["Stream Name"],
                "Shift Name": entry["Shift Name"],
                "Grade Name": entry["Grade Name"],
                "Division": entry["Division"] || entry[" Division"] || "N/A",
                "Student EduLearn ENR": entry["Student EduLearn ENR"],
                "EduLearn Application No": entry["EduLearn Application No"]?.[""] || "N/A",
                "Student New ENR": entry["Student New ENR"],
                "Student First Name": entry["Student First Name"],
                "Student Middle Name": entry["Student Middle Name"],
                "Student Last Name": entry["Student Last Name"],
                "Student DOB": entry["Student DOB"],
                "Guardians": []
            });
        }

        studentMap.get(studentId).Guardians.push({
            "Guardian ID": entry["Guardian ID"],
            "Relationship": entry["Guardians Relationship"],
            "Global No": entry["Guardians Global No"],
            "First Name": entry["Guardians first_name"]?.trim() || "N/A",
            "Middle Name": entry["Guardians middle_name"]?.trim(),
            "Last Name": entry["Guardians last_name"]?.trim() || "N/A",
            "Mobile": entry["Guardians Mobile"],
            "Email": entry["Guardians Email"],
            "Password": entry["One Time password"]
        });
    });

    return Array.from(studentMap.values());
};


// Connect MongoDB and Start Server
connectDB().then(() => {
    const ipAddress = getLocalIp();
    app.listen(PORT, () => {
        console.log(`Server is running on ${PORT}`);
    });
}).catch((error) => {
    console.log("MongoDB Connection Failed !!!", error);
});
