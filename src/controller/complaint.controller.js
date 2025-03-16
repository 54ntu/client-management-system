const { default: mongoose, isValidObjectId } = require("mongoose");
const { Complaint } = require("../models/complaint.models");
const { ApiResponse } = require("../services/Apiresponse");
const { Client } = require("../models/client.models");
class ComplaintController {
  static async createComplaint(req, res) {
    try {
      //client id is required
      const userid = req.user?._id;

      const { complaint, complaintDescription, category, priority, status } =
        req.body;

      if (
        !complaint ||
        !complaintDescription ||
        !category ||
        !priority ||
        !status
      ) {
        return res.status(400).json({
          message: "all fields are required",
        });
      }

      const complaintCreated = await Complaint.create({
        client: new mongoose.Types.ObjectId(userid),
        complaint,
        complaintDescription,
        category,
        priority,
        status,
      });

      if (!complaintCreated) {
        return res
          .status(500)
          .json({ success: false, message: "error creating complaint" });
      }

      return res
        .status(201)
        .json(
          new ApiResponse(
            201,
            complaintCreated,
            "complaint created successfully"
          )
        );
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  static async viewComplaint(req, res) {
    try {
      const complaintData = await Complaint.aggregate([
        {
          $lookup: {
            from: "users",
            localField: "client",
            foreignField: "_id",
            as: "clientDetails",
          },
        },
        {
          $unwind: "$clientDetails",
        },
        {
          $project: {
            complaint: 1,
            complaintDescription: 1,
            category: 1,
            priority: 1,
            status: 1,
            clientName: "$clientDetails.name",
            email: "$clientDetails.email",
            role: "$clientDetails.role",
            phone: "$clientDetails.phone",
            complaintStatus: "$clientDetails.status",
            profileImage: "$clientDetails.profileImage",
            address: "$clientDetails.address",
          },
        },
      ]);
      if (complaintData.length === 0) {
        return res.status(404).json({
          success: false,
          message: "complaint data not found",
        });
      }

      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            complaintData,
            "complaint data fetched successfully"
          )
        );
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  static async updateComplaint(req, res) {
    //get the complaint id from the req.params
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "invalid complaint id",
      });
    }

    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "status is required",
      });
    }

    const updatedComplaint = await Complaint.findByIdAndUpdate(
      id,
      {
        status: status,
      },
      {
        new: true,
      }
    );

    if (!updatedComplaint) {
      return res.status(500).json({
        success: false,
        message: "data updation failed",
      });
    }
    return res
      .status(200)
      .json(
        new ApiResponse(200, updatedComplaint, "complaint updated successfully")
      );
  }

  //done by the admin or conversion committee
  static async deleteComplaint(req, res) {
    try {
      const userid = req.user?._id;
      console.log(typeof userid);
      const { id } = req.params;
      if (!isValidObjectId(id)) {
        return res.status(400).json({ success: false, message: "invalid id" });
      }

      const complaintExist = await Complaint.findOne({
        _id: new mongoose.Types.ObjectId(id),
      });
      // console.log(complaintExist);
      if (!complaintExist) {
        return res.status(404).json({
          success: false,
          message: "complaint data not found",
        });
      }

      //find the client from the client model
      const clientExist = await Client.findOne({
        user: new mongoose.Types.ObjectId(complaintExist.client),
      });

      // console.log(clientExist);
      if (!clientExist) {
        return res.status(404).json({
          success: false,
          message: "client doesnot exists",
        });
      }

      if (clientExist.admin.toString() !== userid) {
        return res.status(403).json({
          message: "you are not the right person to delete this complaint",
        });
      }

      const deletedComplaint = await Complaint.findByIdAndDelete(id);

      if (!deletedComplaint) {
        return res.status(500).json({
          message: "complaint deletion failed",
        });
      }

      return res.status(200).json({
        success: true,
        message: "complaint deleted successfully",
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
  ComplaintController,
};
