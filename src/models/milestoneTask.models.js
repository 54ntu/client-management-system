const mongoose = require("mongoose");
const { projectStatus, projectPriority } = require("../global");

const milestoneTaskSchema = new mongoose.Schema(
  {
    milestone: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProjectMilestone",
    },
    taskTitle: {
      type: String,
      required: true,
    },
    taskDescription: {
      type: String,
      required: true,
    },
    taskObjectives: {
      type: String,
      required: true,
    },
    taskStartDate: {
      type: Date,
      required: true,
    },
    taskDueDate: {
      type: Date,
      required: true,
    },
    taskStatus: {
      type: String,
      enum: [
        projectStatus.completed,
        projectStatus.in_progress,
        projectStatus.not_started,
      ],
    },
    taskPriority: {
      type: String,
      enum: [projectPriority.high, projectPriority.medium, projectPriority.low],
    },
    employee: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Employee",
      },
    ],
  },
  { timestamps: true }
);

const MilestoneTask = mongoose.model("MilestoneTask", milestoneTaskSchema);
module.exports = {
  MilestoneTask,
};
