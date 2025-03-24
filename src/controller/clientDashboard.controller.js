const { default: mongoose } = require("mongoose");
const { MilestoneTask } = require("../models/milestoneTask.models");
const { Payment } = require("../models/payment.models");
const { Project } = require("../models/project.models");
const { ProjectMilestone } = require("../models/projectMilestone.models");
const { User } = require("../models/user.models");
const { Client } = require("../models/client.models");
const { Complaint } = require("../models/complaint.models");
class ClientDashboardController {
  static async getTaskDetails(req, res) {
    try {
      const currentDate = new Date();
      const activeTask = await MilestoneTask.countDocuments({
        taskStartDate: { $lte: currentDate },
        taskDueDate: { $gte: currentDate },
        taskStatus: { $ne: "completed" },
      });

      //calculate overdue task
      const overdueTask = await MilestoneTask.countDocuments({
        taskDueDate: { $lte: currentDate },
        taskStatus: { $ne: "completed" },
      });

      //calculate completed task

      const completedTask = await MilestoneTask.countDocuments({
        taskStatus: "completed",
      });

      //calculate total amount paid
      const totalAmountPaidResult = await Payment.aggregate([
        {
          $match: { paymentStatus: "completed" },
        },
        {
          $group: {
            _id: null,
            totalAmountPaid: { $sum: "$amount" },
          },
        },
      ]);

      const totalAmountPaid =
        totalAmountPaidResult.length > 0
          ? totalAmountPaidResult[0].totalAmountPaid
          : 0;

      //calculate the total pending amount
      const pendingAmountResult = await Payment.aggregate([
        {
          $match: { paymentStatus: "pending" },
        },
        {
          $group: {
            _id: null,
            totalAmount: { $sum: "$amount" },
          },
        },
      ]);

      const totalPendingAmount =
        pendingAmountResult.length > 0 ? pendingAmountResult[0].totalAmount : 0;

      return res.status(200).json({
        activeTask,
        overdueTask,
        completedTask,
        totalAmountPaid,
        totalPendingAmount,
        message: "data fetched successfully",
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  static async getProjectMilestoneChart(req, res) {
    try {
      //calculate the inprogress project milestone
      const inprogressMilestone = await ProjectMilestone.countDocuments({
        milestoneStatus: "in-progress",
      });

      //calculate the completed project milestone
      const completedProjectMilestone = await ProjectMilestone.countDocuments({
        milestoneStatus: "completed",
      });

      //calculate the not started project milestone
      const notStartedProjectMilestone = await ProjectMilestone.countDocuments({
        milestoneStatus: "not-started",
      });

      return res.status(200).json({
        inprogressMilestone,
        completedProjectMilestone,
        notStartedProjectMilestone,
        message: "milestone chart data fetched successfully",
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  static async getRecentProjectsData(req, res) {
    try {
      // const currentDate = new Date();
      const userid = req.user?._id;

      const userData = await Client.findOne({
        user: new mongoose.Types.ObjectId(userid),
      });
      console.log(userData);
      if (!userData) {
        return res.status(404).json({
          success: false,
          message: "data not found",
        });
      }

      //find the project of the respective logged in client
      const projects = await Project.find({ customerName: userData._id });

      if (!projects || projects.length === 0) {
        return res.status(404).json({
          success: false,
          message: "project data not found",
        });
      }

      return res.status(200).json({
        success: true,
        projects,
        message: "projects data fetched successfully",
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  static async getUpcommingMilestone(req, res) {
    try {
      const currentDate = new Date();
      const upcommingMilestones = await ProjectMilestone.aggregate([
        {
          $match: {
            milestoneDueDate: { $gte: currentDate },
          },
        },
        {
          $lookup: {
            from: "projects",
            localField: "projectId",
            foreignField: "_id",
            as: "projectDetails",
          },
        },
        {
          $unwind: "$projectDetails",
        },
        {
          $project: {
            milestoneTitle: 1,
            milestoneDescription: 1,
            mileStoneObjectives: 1,
            milestoneDueDate: 1,
            milestoneStatus: 1,
            milestonePriority: 1,
            projectTitle: "$projectDetails.projectTitle",
            projectDueDate: "$projectDetails.projectDueDates",
          },
        },
      ]);

      // console.log(upcommingMilestones);
      if (!upcommingMilestones || upcommingMilestones.length === 0) {
        return res.status(404).json({
          success: false,
          message: "milestone data not found",
        });
      }
      return res.status(200).json({
        success: true,
        upcommingMilestones,
        message: "milestone data fetched successfully",
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  static async getComplaintData(req, res) {
    try {
      const userid = req.user?._id;
      const complaintData = await Complaint.find({
        client: new mongoose.Types.ObjectId(userid),
      });

      if (!complaintData || complaintData.length === 0) {
        return res.status(404).json({
          success: false,
          message: "complaint data not found",
        });
      }

      return res.status(200).json({
        success: false,
        complaintData,
        message: "complaint data fetched successfully",
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
}

module.exports = {
  ClientDashboardController,
};
