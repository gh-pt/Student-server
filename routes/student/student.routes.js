import { Router } from "express";
import { getStudentsData, syncStudentData } from "../../controllers/students/student.controller.js";

const studentRouter = Router();

studentRouter.post("/byENR", getStudentsData);
studentRouter.post("/getUpdatedData", syncStudentData);

export default studentRouter;