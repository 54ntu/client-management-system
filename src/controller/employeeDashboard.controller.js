const { projectStatus } = require("../global");
const { MilestoneTask } = require("../models/milestoneTask.models");
const { ProjectMilestone } = require("../models/projectMilestone.models");
const { ApiResponse } = require("../services/Apiresponse");
class EmployeeDashboard {
  static async getUpcommingDeadlineMilestone(req, res) {
    try {
      const upcommingMilestoneDeadline = await ProjectMilestone.aggregate([
        {
          $match: {
            milestoneDueDate: { $gte: new Date() }, //due date is greater or equal to todays date gives upcomming milestone deadline
          },
        },
        {
          $sort: {
            milestoneDueDate: 1,
          },
        },
      ]);
      // console.log(upcommingMilestoneDeadline);

      if (!upcommingMilestoneDeadline) {
        return res.status(404).json({
          message: "no data to display",
        });
      }
      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            upcommingMilestoneDeadline,
            "data fetched successfully"
          )
        );
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  static async getUpcommingTaskDeadline(req, res) {
    try {
      const upcommingTaskDeadline = await MilestoneTask.aggregate([
        {
          $match: {
            taskDueDate: { $gte: new Date() },
          },
        },
        {
          $sort: {
            taskDueDate: 1,
          },
        },
        {
          $lookup: {
            from: "projectmilestones",
            localField: "milestone",
            foreignField: "_id",
            as: "projectMilestoneDetails",
          },
        },
        {
          $unwind: "$projectMilestoneDetails",
        },
        {
          $lookup: {
            from: "projects",
            localField: "projectMilestoneDetails.projectId",
            foreignField: "_id",
            as: "projectDetails",
          },
        },
        {
          $unwind: "$projectDetails",
        },
        {
          $project: {
            taskName: "taskTitle",
            projectName: "$projectDetails.projectTitle",
            due_date: "taskDueDate",
            status: "taskStatus",
            priority: "taskPriority",
          },
        },
      ]);

      // console.log(upcommingTaskDeadline);
      if (!upcommingTaskDeadline || upcommingTaskDeadline === 0) {
        return res.status(404).json({
          message: "upcomming task deadline not found",
        });
      }
      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            upcommingTaskDeadline,
            "upcomming task data fetched successfully"
          )
        );
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  static async employeeDashboardSummary(req, res) {
    try {
      const taskSummary = await MilestoneTask.aggregate([
        {
          $group: {
            _id: null,
            totalTasks: { $sum: 1 },
          },
        },
      ]);

      // console.log(taskSummary);

      const inProgressTask = await MilestoneTask.aggregate([
        {
          $match: { taskStatus: "in_progress" },
        },
        {
          $group: {
            _id: null,
            inprogessTask: { $sum: 1 },
          },
        },
      ]);

      // console.log(inProgressTask);

      const completedTask = await MilestoneTask.aggregate([
        {
          $match: { taskStatus: "completed" },
        },
        {
          $group: {
            _id: null,
            completedTask: { $sum: 1 },
          },
        },
      ]);

      // console.log(completedTask);

      const notStartedTask = await MilestoneTask.aggregate([
        {
          $match: { taskStatus: "not-started" },
        },
        {
          $group: {
            _id: null,
            notStartedTask: { $sum: 1 },
          },
        },
      ]);

      // console.log(notStartedTask);

      return res.status(200).json(
        new ApiResponse(
          200,
          {
            totalTask: taskSummary[0]?.totalTasks || 0,
            inprogessTask: inProgressTask[0]?.inprogessTask || 0,
            completedTask: completedTask[0]?.completedTask || 0,
            notstartedTask: notStartedTask[0]?.notStartedTask || 0,
          },
          "milestone task data fetched successfully"
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
  EmployeeDashboard,
};
