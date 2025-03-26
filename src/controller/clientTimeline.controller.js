const { default: mongoose, isValidObjectId } = require("mongoose");
const { Project } = require("../models/project.models");
const { User } = require("../models/user.models");
const { Client } = require("../models/client.models");
const { ProjectMilestone } = require("../models/projectMilestone.models");
const { MilestoneTask } = require("../models/milestoneTask.models");
const { ApiResponse } = require("../services/Apiresponse");
class ClientTimelineController {
  static async timelineData(req, res) {
    try {
      const userid = req.user?._id;
      const inprogressProject = await Project.countDocuments({
        projectStatus: "in-progress",
      });

      // console.log(inprogressProject);

      const completedProjects = await Project.countDocuments({
        projectStatus: "completed",
      });

      // console.log(completedProjects);

      const notstartedProjects = await Project.countDocuments({
        projectStatus: "not-started",
      });

      // console.log(notstartedProjects);
      //find the client fromt the client models

      const clientDetail = await Client.findOne({
        user: new mongoose.Types.ObjectId(userid),
      });

      // console.log("clientDetail : ", clientDetail);

      const totalAmountPaid = await Project.aggregate([
        {
          $match: {
            $and: [
              { customerName: clientDetail._id },
              { paymentStatus: "completed" },
            ],
          },
        },
        {
          $group: {
            _id: null,
            amountPaid: { $sum: "$totalAmount" },
          },
        },
      ]);

      console.log(totalAmountPaid[0]?.amountPaid);
      const totalPaidAmount =
        totalAmountPaid[0]?.amountPaid > 0 ? totalAmountPaid[0]?.amountPaid : 0;

      // console.log(totalPaidAmount);

      //get the remaining amount
      const totalPendingAmount = await Project.aggregate([
        {
          $match: {
            $and: [
              { customerName: clientDetail._id },
              { paymentStatus: "completed" },
            ],
          },
        },
        {
          $group: {
            _id: null,
            pendingAmount: { $sum: "$remainingAmount" },
          },
        },
      ]);

      const pendingAmount =
        totalPendingAmount[0]?.pendingAmount > 0
          ? totalPendingAmount[0]?.pendingAmount
          : 0;

      return res.status(200).json({
        success: true,
        inprogressProject,
        completedProjects,
        notstartedProjects,
        totalPaidAmount,
        pendingAmount,
        message: "data fetched successfully",
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  static async projectDetails(req, res) {
    try {
      const userid = req.user?._id;
      const clientExist = await Client.findOne({
        user: new mongoose.Types.ObjectId(userid),
      });

      // console.log(clientExist);

      const projectDatas = await Project.find({
        customerName: new mongoose.Types.ObjectId(clientExist._id),
      });

      // console.log(projectDatas);
      if (!projectDatas || projectDatas.length === 0) {
        return res.status(404).json({
          success: false,
          message: "project data not found",
        });
      }

      return res.status(200).json({
        success: true,
        projectDatas,
        message: "project data fetched successfully",
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  static async getProjectTimelineByProjectById(req, res) {
    try {
      //get the project id from the req.params
      const { id } = req.params;

      if (!isValidObjectId(id)) {
        return res.status(400).json({
          success: false,
          message: "invalid project id ",
        });
      }

      //find the project timeline
      const projectTimelines = await ProjectMilestone.find({ projectId: id });
      // console.log(projectTimelines);
      if (!projectTimelines || projectTimelines.length === 0) {
        return res.status(404).json({
          success: false,
          message: "project timelines fetched successfully",
        });
      }

      return res.status(200).json({
        success: true,
        projectTimelines,
        message: "project milestone data fetched successfully",
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  static async getMilestoneTaskByProjectMilestoneId(req, res) {
    try {
      //get the milestone id from the req.params
      const { id } = req.params;
      if (!isValidObjectId(id)) {
        return res.status(400).json({
          success: false,
          message: "invalid object id ",
        });
      }

      const milestoneTask = await MilestoneTask.find({ milestone: id });

      if (!milestoneTask || milestoneTask.length === 0) {
        return res.status(404).json({
          success: false,
          message: "milestone related task not found",
        });
      }

      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            milestoneTask,
            "task related to milestone fetched successfully"
          )
        );
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
}

module.exports = {
  ClientTimelineController,
};
