const { default: mongoose } = require("mongoose");
const { Project } = require("../models/project.models");
const { ProjectMilestone } = require("../models/projectMilestone.models");
const { MilestoneTask } = require("../models/milestoneTask.models");
const { Employee } = require("../models/employee.models");

class ConversionCommitteController {
  static async dashboardOverview(req, res) {
    try {
      //get the id from the logged in user
      const userid = req.user?._id;

      const userRole = req.user?.role;

      //find all the project ids managed by the logged in user
      const projects = await Project.find(
        {
          projectManager: new mongoose.Types.ObjectId(userid),
        },
        { _id: 1 }
      );

      //   console.log("project ids  : ", projects);
      const projectIds = projects.map((project) => project._id);

      const totalProjects = await Project.countDocuments({
        projectManager: new mongoose.Types.ObjectId(userid),
      });

      // console.log(totalProjects);

      const totalMilestones = await ProjectMilestone.countDocuments({
        projectId: { $in: projectIds },
      });
      //   console.log(totalMilestones);

      //filter milestone task by milestone ids that belongs to the logged in user's projects
      const milestoneIds = await ProjectMilestone.find(
        {
          projectId: { $in: projectIds },
        },
        {
          _id: 1,
        }
      );

      //   console.log("milestoneIds :", milestoneIds);

      const milestoneTaskIds = milestoneIds.map((milestone) => milestone._id);

      //calculate total milestone task
      const totalTasks = await MilestoneTask.countDocuments({
        milestone: { $in: milestoneTaskIds },
      });
      // console.log(totalTasks);

      //calcuale the in progress task, completed task and not started task
      const inprogressTasks = await MilestoneTask.countDocuments({
        milestone: { $in: milestoneTaskIds },
        status: "in-progress",
      });

      const completedTasks = await MilestoneTask.countDocuments({
        milestone: { $in: milestoneTaskIds },
        status: "completed",
      });

      const notStartedTasks = await MilestoneTask.countDocuments({
        milestone: { $in: milestoneTaskIds },
        status: "not-started",
      });

      let totalEmployees;
      // console.log(userRole);

      if (userRole === "admin") {
        totalEmployees = await Employee.countDocuments();
      } else if (userRole === "conversion_committee") {
        totalEmployees = await Employee.countDocuments({
          conversion: new mongoose.Types.ObjectId(userid),
        });
      }
      //   console.log(totalEmployees);

      return res.status(200).json({
        success: true,
        totalProjects,
        totalMilestones,
        totalTasks,
        totalEmployees,
        inprogressTasks,
        completedTasks,
        notStartedTasks,
        message: "data fetched successfully",
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  static async projects(req, res) {
    try {
      //get the id from the logged in user
      const userid = req.user?._id;

      if (!userid) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized access",
        });
      }

      const projects = await Project.find({
        projectManager: new mongoose.Types.ObjectId(userid),
      });

      if (!projects || projects.length === 0) {
        return res.status(404).json({
          success: false,
          message: "No projects found",
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

  static async getUpcomingMilestones(req, res) {
    try {
      //get the id from the logged in user
      const userid = req.user?._id;

      if (!userid) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized access",
        });
      }

      const projects = await Project.find({
        projectManager: new mongoose.Types.ObjectId(userid),
      });

      if (!projects || projects.length === 0) {
        return res.status(404).json({
          success: false,
          message: "No projects found",
        });
      }

      const projectIds = projects.map((project) => project._id);

      const milestones = await ProjectMilestone.find({
        projectId: { $in: projectIds },
        startDate: { $gte: new Date() },
      });

      if (!milestones || milestones.length === 0) {
        return res.status(404).json({
          success: false,
          message: "No upcoming milestones found",
        });
      }

      return res.status(200).json({
        success: true,
        milestones,
        message: "upcoming milestones data fetched successfully",
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
}

module.exports = { ConversionCommitteController };
