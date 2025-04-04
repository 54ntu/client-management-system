const { default: mongoose, mongo } = require("mongoose");
const { Project } = require("../models/project.models");
const { ApiResponse } = require("../services/Apiresponse");
const { uploadOnCloudinary } = require("../services/cloudinary.services");
const { MilestoneTask } = require("../models/milestoneTask.models");
const { Employee } = require("../models/employee.models");
const { Client } = require("../models/client.models");
const { ProjectMilestone } = require("../models/projectMilestone.models");

class ProjectController {
  static async addproject(req, res) {
    try {
      console.log("hit vaye hoii");
      //get the details from the req.body
      const admin = req.user._id;
      // console.log(admin);
      // console.log(typeof admin);

      const projectImageFilePath = req.file?.path;

      const {
        projectTitle,
        projectDescription,
        projectPriority,
        projectObjectives,
        totalAmount,
        customerName,
        remainingAmount,
        projectStartDate,
        projectDueDate,
        projectStatus,
      } = req.body;

      if (
        !projectTitle ||
        !projectDescription ||
        !projectPriority ||
        !projectObjectives ||
        !totalAmount ||
        !customerName ||
        !remainingAmount ||
        !projectStartDate ||
        !projectDueDate ||
        !projectStatus
      ) {
        return res.status(400).json({
          message: "all fields are required",
        });
      }

      const projectImage = await uploadOnCloudinary(projectImageFilePath);
      if (!projectImage) {
        return res.status(500).json({
          success: false,
          message: "error uploading image into the cloudinary",
        });
      }

      const createProject = await Project.create({
        projectTitle,
        projectDescription,
        projectManager: new mongoose.Types.ObjectId(admin),
        customerName,
        projectObjectives,
        projectPriority,
        totalAmount,
        remainingAmount,
        projectDocument: projectImage.url,
        projectStartDate,
        projectDueDate,
        projectStatus,
      });

      if (!createProject) {
        return res.status(500).json({
          message: "project addition failed",
        });
      }

      return res
        .status(201)
        .json(
          new ApiResponse(201, createProject, "project added successfully")
        );
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  static async viewProject(req, res) {
    //get the project data
    try {
      const userid = req.user._id;
      const userRole = req.user?.role;

      let projectData;

      if (userRole === "admin" || userRole === "conversion_committee") {
        projectData = await Project.find({
          projectManager: new mongoose.Types.ObjectId(userid),
        });
      } else if (userRole === "client") {
        const clientExist = await Client.findOne({
          user: new mongoose.Types.ObjectId(userid),
        });

        if (!clientExist) {
          return res.status(404).json({
            message: "client not found",
          });
        }
        projectData = await Project.find({
          customerName: clientExist._id,
        });
      } else if (userRole === "employee") {
        const employeeExist = await Employee.findOne({
          user: new mongoose.Types.ObjectId(userid),
        });
        if (!employeeExist) {
          return res.status(404).json({
            message: "employee not found",
          });
        }

        projectData = await MilestoneTask.aggregate([
          {
            $match: {
              employee: new mongoose.Types.ObjectId(employeeExist._id),
            },
          },
          {
            $lookup: {
              from: "projectmilestones",
              localField: "milestone",
              foreignField: "_id",
              as: "milestonesDetails",
            },
          },
          {
            $unwind: "$milestonesDetails",
          },
          {
            $lookup: {
              from: "projects",
              localField: "milestonesDetails.projectId",
              foreignField: "_id",
              as: "projectDetails",
            },
          },
          {
            $unwind: "$projectDetails",
          },
          {
            $lookup: {
              from: "users",
              localField: "projectDetails.projectManager",
              foreignField: "_id",
              as: "projectManagerDetails",
            },
          },
          {
            $unwind: "$projectManagerDetails",
          },
          {
            $lookup: {
              from: "clients",
              localField: "projectDetails.customerName",
              foreignField: "_id",
              as: "clientDetails",
            },
          },
          {
            $unwind: "$clientDetails",
          },
          {
            $lookup: {
              from: "users",
              localField: "clientDetails.user",
              foreignField: "_id",
              as: "clientPersonalDetails",
            },
          },
          {
            $unwind: "$clientPersonalDetails",
          },
          {
            $project: {
              _id: 0,
              projectId: "$projectDetails._id",
              projectName: "$projectDetails.projectTitle",
              projectDescription: "$projectDetails.projectDescription",
              projectManager: "$projectManagerDetails.name",
              projectPriority: "$projectDetails.projectPriority",
              projectObjectives: "$projectDetails.projectObjectives",
              totalAmount: "$projectDetails.totalAmount",
              clientName: "$clientPersonalDetails.name",
              remainingAmount: "$projectDetails.remainingAmount",
              projectStartDate: "$projectDetails.projectStartDate",
              projectDueDate: "$projectDetails.projectDueDate",
              projectDocument: "$projectDetails.projectDocument",
              projectStatus: "$projectDetails.projectStatus",

              milestoneTitle: "$milestonesDetails.milestoneTitle",
              milestoneDescription: "$milestonesDetails.milestoneDescription",
              mileStoneObjectives: "$milestonesDetails.mileStoneObjectives",
              milestoneStartDate: "$milestonesDetails.milestoneStartDate",
              milestoneDueDate: "$milestonesDetails.milestoneDueDate",
              milestoneStatus: "$milestonesDetails.milestoneStatus",
              milestonePriority: "$milestonesDetails.milestonePriority",
              milestoneTitle: "$milestonesDetails.milestoneTitle",

              taskTitle: 1,
              taskDescription: 1,
              taskObjectives: 1,
              taskStartDate: 1,
              taskDueDate: 1,
              taskStatus: 1,
              taskPriority: 1,
            },
          },
        ]);
      }
      if (!projectData || projectData.length === 0) {
        return res.status(404).json({
          message: "project data not found ",
        });
      }
      return res
        .status(200)
        .json(
          new ApiResponse(200, projectData, "project data fetched successfully")
        );
    } catch (error) {
      return res.status(500).json({
        message: error.message,
      });
    }
  }

  static async updateProject(req, res) {
    try {
      const projectImageFilepath = req.file?.path;

      //get the adminid and projectid
      const adminid = req.user._id;
      if (!adminid) {
        return res.status(400).json({
          message: "admin id is required",
        });
      }

      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          message: "project id is required",
        });
      }

      const {
        projectTitle,
        projectDescription,
        projectPriority,
        projectObjectives,
        totalAmount,
        remainingAmount,
        projectStartDate,
        projectDueDate,
        projectStatus,
      } = req.body;

      //upload image into the cloudinary
      const projectImage = await uploadOnCloudinary(projectImageFilepath);
      if (!projectImage) {
        return res.status(500).json({
          message: "image uploading failed",
        });
      }

      //find the project and update it
      const updateProject = await Project.findOneAndUpdate(
        {
          _id: id,
          projectManager: new mongoose.Types.ObjectId(adminid),
        },
        {
          projectTitle,
          projectDescription,
          projectPriority,
          projectObjectives,
          totalAmount,
          remainingAmount,
          projectStartDate,
          projectDueDate,
          projectStatus,
          projectDocument: projectImage.url,
        },
        {
          new: true,
        }
      );

      if (!updateProject) {
        return res.status(500).json({
          message: "project updation failed",
        });
      }

      return res
        .status(200)
        .json(
          new ApiResponse(200, updateProject, "project updated successfully")
        );
    } catch (error) {
      return res.status(500).json({
        message: error.message,
      });
    }
  }

  static async deleteProject(req, res) {
    const session = await mongoose.startSession();
    session.startTransaction();
    //get the adminid and project id to delete
    try {
      const adminid = req.user._id;
      if (!adminid) {
        return res.status(400).json({
          message: "admin id is required",
        });
      }

      const { id } = req.params;
      if (!id) {
        return res.status(400).json({
          message: "project id is required",
        });
      }

      //delete the project data
      const deletedProject = await Project.findOneAndDelete(
        {
          _id: id,
          projectManager: new mongoose.Types.ObjectId(adminid),
        },
        {
          session,
        }
      );

      // console.log(deletedProject);
      if (!deletedProject) {
        await session.abortTransaction();
        return res.status(500).json({
          message: "error deleting project",
        });
      }

      //now delete the project associated data for the deleted project
      const milestones = await ProjectMilestone.find({
        projectId: new mongoose.Types.ObjectId(id),
      });

      //for each milestone, delete the associated tasks
      for (const milestone of milestones) {
        await MilestoneTask.deleteMany(
          { milestone: milestone._id },
          { session }
        );
      }

      //delete the milestones associated with the project
      await ProjectMilestone.deleteMany({ projectId: id }, { session });

      //commit the transaction if everything went fine
      await session.commitTransaction();

      return res
        .status(200)
        .json(new ApiResponse(200, {}, "project deleted successsfully"));
    } catch (error) {
      await session.abortTransaction();
      return res.status(500).json({
        message: error.message,
      });
    } finally {
      //end the session
      session.endSession();
    }
  }
}

module.exports = {
  ProjectController,
};
