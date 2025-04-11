import axios from "axios";
import { Student } from "../../models/student.model.js";

export async function getStudentsData(req, res) {
	try {
		const { result } = req.body;

		let query = {};

		if (result?.enNumber) {
			query = { studentNewEnr: { $in: [...result.enNumber] } };
		} else if (result?.appno) {
			query = { eduLearnApplicationNo: { $in: [...result.appno] } };
		} else if (result?.enrno) {
			query = { studentEduLearnEnr: { $in: [...result.enrno] } };
		} else if (result?.email) {
			query = { guardiansEmail: { $in: [...result.email] } };
		} else if (result?.phone) {
			query = {
				guardiansMobile: {
					$in: result.phone.map((num) => String(num)),
				},
			};
		} else if (result?.name) {
			query = {
				$or: result.name.map((name) => ({
					studentFirstName: { $regex: new RegExp(`^${name}$`, "i") },
				})),
			};
		} else if (result?.studentId) {
			query = {
				studentId: {
					$in: result.studentId.map((id) => parseInt(id, 10)),
				},
			};
		} else if (result?.guardianGlobalNo) {
			query = { guardiansGlobalNo: { $in: [...result.guardianGlobalNo] } };
		} else if (result?.guardianID) {
			query = {
				guardianId: {
					$in: result.guardianID.map((id) => parseInt(id, 10)),
				},
			};
		}

		const data = await Student.find(query);

		if (data.length > 0) {
			const transformedData = transformStudentData(data);
			res.json(transformedData); // or transform if needed
		} else {
			res.status(404).json({ message: "Student not found" });
		}
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
}

function transformStudentData(apiResponses) {
	const studentMap = new Map();

	apiResponses.forEach((entry) => {
		const studentId = entry.studentId;

		if (!studentMap.has(studentId)) {
			studentMap.set(studentId, {
				_id: entry._id,
				"AY YR": entry.ayYear,
				"Student ID": entry.studentId,
				"Student Type": entry.studentType,
				"School Name": entry.schoolName,
				"Brand Name": entry.brandName,
				"Board Name": entry.boardName,
				"Course Name": entry.courseName,
				"Stream Name": entry.streamName,
				"Shift Name": entry.shiftName,
				"Grade Name": entry.gradeName,
				Division: entry.division || "N/A",
				House: entry.house || "N/A",
				"Student Type": entry.studentType,
				"Student EduLearn ENR": entry.studentEduLearnEnr || null,
				"EduLearn Application No": entry.eduLearnApplicationNo || "N/A",
				"Student New ENR": entry.studentNewEnr || null,
				"Student First Name": entry.studentFirstName,
				"Student Middle Name": entry.studentMiddleName || null,
				"Student Last Name": entry.studentLastName || null,
				"Student DOB": entry.studentDOB,
				"Lc Type": entry.lcType || null,
				Guardians: [],
			});
		}

		studentMap.get(studentId).Guardians.push({
			"Guardian ID": entry.guardianId,
			Relationship: entry.guardiansRelationship,
			"Global No": entry.guardiansGlobalNo,
			"First Name": entry.guardiansFirstName?.trim() || "N/A",
			"Middle Name": entry.guardiansMiddleName?.trim() || null,
			"Last Name": entry.guardiansLastName?.trim() || "N/A",
			Mobile: String(entry.guardiansMobile),
			Email: entry.guardiansEmail,
			Password: entry.oneTimePassword,
		});
	});

	return Array.from(studentMap.values());
}

// function transformStudentSchemaData(raw) {
// 	return {
// 		ayYear: raw["AY YR"],
// 		guardianId: raw["Guardian ID"],
// 		stId: raw["St ID"],
// 		studentId: raw["Student ID"],
// 		studentType: raw["Student Type"],
// 		schoolName: raw["School Name"],
// 		brandName: raw["Brand Name"],
// 		boardName: raw["Board Name"],
// 		courseName: raw["Course Name"],
// 		streamName: raw["Stream Name"],
// 		shiftName: raw["Shift Name"],
// 		gradeName: raw["Grade Name"],
// 		division: raw["Division"],
// 		house: raw["House"],
// 		studentEduLearnEnr: raw["Student EduLearn ENR"],
// 		studentNewEnr: raw["Student New ENR"],
// 		eduLearnApplicationNo: raw["EduLearn Application No."],
// 		studentFirstName: raw["Student First Name"],
// 		studentMiddleName: raw["Student Middle Name"],
// 		studentLastName: raw["Student Last Name"],
// 		studentDOB: raw["Student DOB"] ? new Date(raw["Student DOB"]) : null,
// 		guardiansRelationship: raw["Guardians Relationship"],
// 		guardiansGlobalNo: raw["Guardians Global No"],
// 		guardiansFirstName: raw["Guardians first_name"],
// 		guardiansMiddleName: raw["Guardians middle_name"],
// 		guardiansLastName: raw["Guardians last_name"],
// 		guardiansMobile: String(raw["Guardians Mobile"]),
// 		guardiansEmail: raw["Guardians Email"],
// 		oneTimePassword: raw["One Time password"],
// 		undertakingStatus: raw["Undertaking status"],
// 	};
// }

export async function syncStudentData(req, res) {
	try {
		const response = await axios.request(process.env.METABASE_SITE_URL, {
			method: "post",
			maxBodyLength: Infinity,
			headers: {
				"Content-Type": "application/x-www-form-urlencoded",
				"x-api-key": process.env.X_API_KEY,
			},
		});

		if (!Array.isArray(response.data)) {
			return res.status(404).json({ message: "No data received from API" });
		}

		// Delete existing records
		await Student.deleteMany({});
		console.log("🧹 Cleared existing student records.");

		// Insert new data
		const inserted = await Student.insertMany(response.data);
		console.log(`✅ Inserted ${inserted.length} new student records.`);

		res.json({
			message: `Student data Sync completed successfully,Inserted ${inserted.length} new student records.`,
		});
	} catch (error) {
		console.error("❌ Error during upsert:", error.message);
		res.status(500).json({ message: "Failed to sync data" });
	}
}
