const { User } = require("../models/user.models");
const { hashPassword } = require("../services/authcontroller");
const { Employee } = require("../models/employee.models");
const { ApiResponse } = require("../services/Apiresponse");
const { default: mongoose, isValidObjectId } = require("mongoose");
const { uploadOnCloudinary } = require("../services/cloudinary.services");
const { MilestoneTask } = require("../models/milestoneTask.models");

class EmployeeController {
  static async addEmployee(req, res) {
    const admin = req.user._id;
    //get the employee details from the req.body
    const profileImageFilePath = req.file?.path;
    const {
      name,
      email,
      password,
      role,
      phone,
      address,
      position,
      department,
      job_title,
      workLocation,
      employeementType,
      contract_id,
      date_joined,
      contract_start_date,
      contract_end_date,
    } = req.body;

    if (
      !name ||
      !email ||
      !password ||
      !role ||
      !phone ||
      !address ||
      !position ||
      !department ||
      !job_title ||
      !workLocation ||
      !employeementType ||
      !contract_id ||
      !contract_start_date ||
      !contract_end_date
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    //validate email and phone
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email format." });
    }

    // if (phone.length !== 10) {
    //   return res
    //     .status(400)
    //     .json({ error: "Phone number must be exactly 10 digits." });
    // }

    //check whether the employee already exist or not
    const employeeExist = await User.findOne({
      email,
    });

    if (employeeExist) {
      return res.status(400).json({
        success: false,
        message: "Employee already exist",
      });
    }

    //hash the password
    const hashedPassword = await hashPassword(password);
    if (!hashedPassword) {
      return res.status(500).json({ message: "Error hashing password" });
    }

    //upload image on cloudinary
    const profileImage = await uploadOnCloudinary(profileImageFilePath);
    if (!profileImage) {
      return res.status(500).json({
        message: "profile image uploadation on cloudinary failed",
      });
    }

    //create user document first
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      phone,
      address,
      role,
      profileImage: profileImage.url,
    });

    if (!user) {
      return res.status(500).json({
        message: "Error creating employee",
      });
    }

    //create employee document
    const employee = await Employee.create({
      user: user._id,
      admin: admin,
      position,
      department,
      job_title,
      workLocation,
      employeementType,
      contract_id,
      date_joined,
      contract_start_date,
      contract_end_date,
    });

    if (!employee) {
      return res.status(500).json({
        message: "Error creating employee",
      });
    }

    return res.status(201).json(
      new ApiResponse(
        201,
        {
          name: user.name,
          email: user.email,
          phone: user.phone,
          address: user.address,
          profile: user.profileImage,
          role: user.role,
          position: employee.position,
          department: employee.department,
          contract_id: employee.contract_id,
          date_joined: employee.date_joined,
          contract_start_date: employee.contract_start_date,
          contract_end_date: employee.contract_end_date,
        },
        "Employee created successfully"
      )
    );
  }

  static async getEmployee(req, res) {
    try {
      //only admin can fetch the employee data
      const adminId = req.user._id;

      console.log("hit vaye hoiii");

      const employeedata = await Employee.aggregate([
        {
          $match: {
            admin: new mongoose.Types.ObjectId(adminId),
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "user",
            foreignField: "_id",
            as: "employeeDetails",
          },
        },
        {
          $unwind: "$employeeDetails",
        },
        {
          $project: {
            job_title: 1,
            workLocation: 1,
            employeementType: 1,
            position: 1,
            department: 1,
            date_joined: 1,
            contract_id: 1,
            contract_start_date: 1,
            contract_end_date: 1,
            name: "$employeeDetails.name",
            email: "$employeeDetails.email",
            role: "$employeeDetails.role",
            phone: "$employeeDetails.phone",
            status: "$employeeDetails.status",
            profile: "$employeeDetails.profileImage",
            address: "$employeeDetails.address",
          },
        },
      ]);

      if (!employeedata || employeedata.length === 0) {
        return res.status(404).json({
          message: "employee data not found",
        });
      }

      return res
        .status(200)
        .json(
          new ApiResponse(200, employeedata, "employ data fetched successfully")
        );
    } catch (error) {
      return res.status(500).json({
        message: error.message,
      });
    }
  }

  static async updateEmployeeData(req, res) {
    try {
      //get the employee id and admin or conversion committe id
      const userid = req.user?._id;
      const userRole = req.user?.role;

      const { id } = req.params;

      if (!isValidObjectId(id)) {
        return res.status(400).json({
          message: "invalid id",
        });
      }

      const {
        name,
        email,
        phone,
        address,
        job_title,
        department,
        workLocation,
        employeementType,
      } = req.body;

      let employeeExist;
      if (userRole === "admin") {
        employeeExist = await Employee.findOne({
          _id: id,
          admin: new mongoose.Types.ObjectId(userid),
        });
      } else if (userRole === "conversion_committee") {
        employeeExist = await Employee.findOne({
          _id: id,
          conversion: new mongoose.Types.ObjectId(userid),
        });
      }

      // console.log(`employeeExist : ${employeeExist}`);
      if (!employeeExist) {
        return res.status(404).json({
          message: "employee data not found",
        });
      }

      //find employee data from users table too.
      const employeeInUser = await User.findOne({
        _id: new mongoose.Types.ObjectId(employeeExist.user),
      });

      // console.log(employeeInUser);

      console.log(`name: ${name}`);
      //update profile data
      if (name) employeeInUser.name = name;
      if (email) employeeInUser.email = email;
      if (phone) employeeInUser.phone = phone;
      if (address) employeeInUser.address = address;
      await employeeInUser.save();

      if (job_title) employeeExist.job_title = job_title;
      if (department) employeeExist.department = department;
      if (workLocation) employeeExist.workLocation = workLocation;
      if (employeementType) employeeExist.employeementType = employeementType;
      await employeeExist.save();

      return res.status(200).json({
        success: true,
        data: {
          employeeExist,
          employeeInUser,
        },
        message: "updated successfully",
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  //this will be for conversion committe or admin
  static async getProjectOfEmployeeMent(req, res) {
    try {
      //get the employeement id from the req.params
      const { id } = req.params;
      if (!isValidObjectId(id)) {
        return res.status(400).json({
          message: "invalid id ",
        });
      }

      //find the employee into the milestoneTask models

      const assignedProjects = await MilestoneTask.aggregate([
        {
          $match: {
            employee: new mongoose.Types.ObjectId(id),
          },
        },
        {
          $lookup: {
            from: "projectmilestones",
            localField: "milestone",
            foreignField: "_id",
            as: "projectMilestones",
          },
        },
        {
          $unwind: "$projectMilestones",
        },
        {
          $lookup: {
            from: "projects",
            localField: "projectMilestones.projectId",
            foreignField: "_id",
            as: "projectDetails",
          },
        },
        {
          $unwind: "$projectDetails",
        },

        {
          $project: {
            projectName: "$projectDetails.projectTitle",
            startDate: "$projectDetails.projectStartDate",
            duedate: "$projectDetails.projectDueDate",
            status: "$projectDetails.projectStatus",
          },
        },
      ]);

      if (!assignedProjects || assignedProjects.length === 0) {
        return res.status(404).json({
          message: "project assigned to this employee not found",
        });
      }
      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            assignedProjects,
            "projects data fetched successfully"
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
  EmployeeController,
};
