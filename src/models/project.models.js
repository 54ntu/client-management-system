const mongoose = require("mongoose");
const { projectPriority, projectStatus } = require("../global");

const projectSchema = new mongoose.Schema(
  {
    projectTitle: {
      type: String,
      required: true,
    },
    projectDescription: {
      type: String,
      required: true,
    },
    projectManager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    projectPriority: {
      type: String,
      enum: [projectPriority.high, projectPriority.medium, projectPriority.low],
    },
    projectObjectives: {
      type: String,
      required: true,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    customerName: {
      type: mongoose.Types.ObjectId,
      ref: "Client",
    },
    remainingAmount: {
      type: Number,
      required: true,
    },
    projectStartDate: {
      type: Date,
      required: true,
    },
    projectDueDate: {
      type: Date,
      required: true,
    },
    projectDocument: {
      type: String, //only the file url from the cloudinary is stored
    },
    projectStatus: {
      type: String,
      enum: [
        projectStatus.completed,
        projectStatus.in_progress,
        projectStatus.not_started,
      ],
      default: projectStatus.not_started,
    },
  },
  { timestamps: true }
);

const Project = mongoose.model("Project", projectSchema);
module.exports = { Project };
