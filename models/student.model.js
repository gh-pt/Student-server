import mongoose from "mongoose";
import { Schema } from "mongoose";

const studentSchema = new Schema({
    "AY YR": Number,
    "Guardian ID": Number,
    "St ID": Number,
    "Student ID": Number,
    "Student Type": String,
    "School Name": String,
    "Brand Name": String,
    "Board Name": String,
    "Course Name": String,
    "Stream Name": String,
    "Shift Name": String,
    "Grade Name": String,
    "House": String,
    "Student EduLearn ENR": String,
    "EduLearn Application No": Object,
    "Student New ENR": String,
    "Student First Name": String,
    "Student Last Name": String,
    "Student DOB": String,
    "Guardians Relationship": String,
    "Guardians Global No": String,
    "Guardians first_name": String,
    "Guardians Mobile": Number,
    "Guardians Email": String,
    "One Time password": String
});

export const Student = mongoose.model('StudentData', studentSchema, 'StudentData');
