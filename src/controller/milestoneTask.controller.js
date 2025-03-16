const { default: mongoose, isValidObjectId } = require("mongoose");
const { MilestoneTask } = require("../models/milestoneTask.models");
const { ApiResponse } = require("../services/Apiresponse");

class MilestoneTaskController {
  static async addMileStoneTask(req, res) {
    try {
      //get the data from the req.body
      const {
        milestoneId,
        taskTitle,
        taskDescription,
        taskObjectives,
        taskStartDate,
        taskDueDate,
        taskStatus,
        taskPriority,
        employee,
      } = req.body;

      if (
        !milestoneId ||
        !taskTitle ||
        !taskDescription ||
        !taskObjectives ||
        !taskStartDate ||
        !taskDueDate ||
        !taskStatus ||
        !taskPriority ||
        !employee
      ) {
        return res.status(400).json({
          message: "all fields are required",
        });
      }

      //create milestonetask
      const createTask = await MilestoneTask.create({
        taskTitle,
        taskDescription,
        milestone: new mongoose.Types.ObjectId(milestoneId),
        taskPriority,
        employee,
        taskObjectives,
        taskStartDate,
        taskDueDate,
        taskStatus,
      });

      if (!createTask) {
        return res.status(500).json({
          message: "milestone task creation failed",
        });
      }

      return res
        .status(201)
        .json(new ApiResponse(201, createTask, "milestone added successfully"));
    } catch (error) {
      return res.status(500).json({
        message: error.message,
      });
    }
  }

  static async viewMileStoneTask(req, res) {
    try {
      const milestoneTask = await MilestoneTask.find();
      if (!milestoneTask || milestoneTask.length === 0) {
        return res.status(404).json({
          message: "milestone task data not found",
        });
      }
      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            milestoneTask,
            "milestone task fetched successfully"
          )
        );
    } catch (error) {
      return res.status(500).json({
        message: error.message,
      });
    }
  }

  //here we will fetch the task of the  each milestone
  //under 1 milestone there will be multiple task
  static async viewTaskByMilestoneId(req, res) {
    try {
      //get the id of the milestone
      const { id } = req.params;
      if (!isValidObjectId(id)) {
        return res.status(400).json({
          message: "invalid milestone id",
        });
      }

      const taskOfMilestone = await MilestoneTask.aggregate([
        {
          $match: {
            milestone: new mongoose.Types.ObjectId(id),
          },
        },
        {
          $lookup: {
            from: "employees",
            localField: "employee",
            foreignField: "_id",
            as: "employeeDetails",
          },
        },
        {
          $unwind: "$employeeDetails",
        },
        {
          $lookup: {
            from: "users",
            localField: "employeeDetails.user",
            foreignField: "_id",
            as: "employeeUserDetails",
          },
        },
        {
          $unwind: "$employeeUserDetails",
        },
        {
          $project: {
            taskTitle: 1,
            taskDescription: 1,
            taskObjectives: 1,
            taskDueDate: 1,
            taskStatus: 1,
            taskPriority: 1,
            assignedTo: "$employeeUserDetails.name",
          },
        },
      ]);

      // console.log(taskOfMilestone);
      if (!taskOfMilestone || taskOfMilestone.length === 0) {
        return res.status(404).json({
          success: false,
          message: `task for the given milestone with id ${id} not found`,
        });
      }
      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            taskOfMilestone,
            "milestone task fetched successfuly"
          )
        );
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  //update the status of the task of each milestone done by the employee only
  static async updateMilestoneTask(req, res) {
    try {
      const userRole = req.user?.role;

      //get the task id from the req.params

      const { id } = req.params;
      if (!isValidObjectId(id)) {
        return res.status(400).json({
          message: "invalid task id",
        });
      }

      const { status } = req.body;
      let updatedMilestonTask;
      if (
        userRole === "admin" ||
        userRole === "conversion_committee" ||
        userRole === "employee"
      ) {
        updatedMilestonTask = await MilestoneTask.findByIdAndUpdate(
          id,
          {
            taskStatus: status,
          },
          {
            new: true,
          }
        );
      }
      if (!updatedMilestonTask) {
        return res.status(500).json({
          message: "task status updation failed",
        });
      }
      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            updatedMilestonTask,
            "task status updated successfully"
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
  MilestoneTaskController,
};
