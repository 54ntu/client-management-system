const mongoose = require("mongoose");
const { projectStatus, projectPriority } = require("../global");

const projectMilestoneSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
    },
    milestoneTitle: {
      type: String,
      required: true,
    },
    milestoneDescription: {
      type: String,
      required: true,
    },
    mileStoneObjectives: {
      type: String,
      required: true,
    },
    milestoneStartDate: {
      type: Date,
      required: true,
    },
    milestoneDueDate: {
      type: Date,
      required: true,
    },
    milestoneStatus: {
      type: String,
      enum: [
        projectStatus.completed,
        projectStatus.in_progress,
        projectStatus.not_started,
      ],
      default: projectStatus.not_started,
    },
    milestonePriority: {
      type: String,
      enum: [projectPriority.high, projectPriority.medium, projectPriority.low],
    },
  },
  { timestamps: true }
);

const ProjectMilestone = mongoose.model(
  "ProjectMilestone",
  projectMilestoneSchema
);
module.exports = { ProjectMilestone };
