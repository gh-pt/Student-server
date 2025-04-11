import { Router } from "express";
import {
	getStudentsData,
	syncStudentData,
} from "../../controllers/students/student.controller.js";

const studentRouter = Router();

studentRouter.post("/byENR", getStudentsData);
studentRouter.get("/getUpdatedData", syncStudentData);

export default studentRouter;
