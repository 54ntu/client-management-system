const { default: mongoose, isValidObjectId } = require("mongoose");
const { ProjectMilestone } = require("../models/projectMilestone.models");
const { ApiResponse } = require("../services/Apiresponse");
class ProjectMileStoneController {
  static async addMilestone(req, res) {
    try {
      //get the data from the req.body
      const {
        projectId,
        milestoneTitle,
        milestoneDescription,
        mileStoneObjectives,
        milestoneStartDate,
        milestoneDueDate,
        milestoneStatus,
        milestonePriority,
      } = req.body;

      if (
        !projectId ||
        !milestoneTitle ||
        !milestoneDescription ||
        !mileStoneObjectives ||
        !milestoneStartDate ||
        !milestoneDueDate ||
        !milestoneStatus ||
        !milestonePriority
      ) {
        return res.status(400).json({
          message: "all fields are required",
        });
      }

      //create milestone

      const createdMilestone = await ProjectMilestone.create({
        projectId: new mongoose.Types.ObjectId(projectId),
        milestoneTitle,
        milestoneDescription,
        mileStoneObjectives,
        milestonePriority,
        milestoneStartDate,
        milestoneDueDate,
        milestoneStatus,
      });

      if (!createdMilestone) {
        return res.status(500).json({
          message: "milestone creation failed",
        });
      }

      return res
        .status(201)
        .json(
          new ApiResponse(201, createdMilestone, "milestone added successfully")
        );
    } catch (error) {
      return res.status(500).json({
        message: error.message,
      });
    }
  }

  static async viewMilestone(req, res) {
    try {
      const projectMilestone = await ProjectMilestone.find();

      if (!projectMilestone || projectMilestone.length === 0) {
        return res.status(404).json({
          message: "project milestone not found",
        });
      }

      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            projectMilestone,
            "project milestone fetched successfully"
          )
        );
    } catch (error) {
      return res.status(500).json({
        message: error.message,
      });
    }
  }

  //here we will fetch the project milestone data by using project id
  static async viewProjectMileStoneById(req, res) {
    try {
      //get the projectid from the req.params
      const { id } = req.params;
      if (!isValidObjectId(id)) {
        return res.status(400).json({
          message: "invalid project id ",
        });
      }

      const projectMilestoneDetails = await ProjectMilestone.find({
        projectId: new mongoose.Types.ObjectId(id),
      });
      // console.log(projectMilestoneDetails);
      if (!projectMilestoneDetails || projectMilestoneDetails.length === 0) {
        return res.status(404).json({
          message: `milestone for the project with id ${id} not found`,
        });
      }
      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            projectMilestoneDetails,
            "milestone data fetched successfully"
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
  ProjectMileStoneController,
};
