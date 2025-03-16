const mongoose = require("mongoose");
const { projectPriority, projectStatus } = require("../global");

const complaintSchema = new mongoose.Schema(
  {
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
    },
    complaint: {
      type: String,
      required: true,
    },
    complaintDescription: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: [
        "payment",
        "service-related",
        "technical",
        "customer-support",
        "security",
      ],
    },
    priority: {
      type: String,
      enum: [projectPriority.high, projectPriority.medium, projectPriority.low],
      default: projectPriority.high,
    },
    status: {
      type: String,
      enum: [
        projectStatus.not_started,
        projectStatus.in_progress,
        projectStatus.completed,
      ],
    },
  },
  { timestamps: true }
);

const Complaint = mongoose.model("Complaint", complaintSchema);
module.exports = {
  Complaint,
};
