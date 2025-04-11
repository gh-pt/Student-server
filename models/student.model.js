import mongoose from "mongoose";
const { Schema } = mongoose;

// Define student schema to match API structure
const studentSchema = new Schema({
  ayYear: Number,
  guardianId: Number,
  stId: Number,
  studentId: Number,
  studentType: String,
  schoolName: String,
  brandName: String,
  boardName: String,
  courseName: String,
  streamName: String,
  shiftName: String,
  gradeName: String,
  division: String,
  house: String,

  studentEduLearnEnr: String,
  studentNewEnr: String,
  eduLearnApplicationNo: Schema.Types.Mixed, // Can be string or null
  studentFirstName: String,
  studentMiddleName: String,
  studentLastName: String,
  studentDOB: Date,

  guardiansRelationship: String,
  guardiansGlobalNo: String,
  guardiansFirstName: String,
  guardiansMiddleName: String,
  guardiansLastName: String,
  guardiansMobile: String,
  guardiansEmail: String,
  oneTimePassword: String,
  undertakingStatus: Boolean,
  lcType: String || null
}, { timestamps: true }); // Auto adds createdAt and updatedAt

export const Student = mongoose.model('StudentData', studentSchema);
