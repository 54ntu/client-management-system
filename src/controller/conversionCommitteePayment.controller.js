const { default: mongoose } = require("mongoose");
const { Project } = require("../models/project.models");
const { Invoice } = require("../models/invoice.models");

class ConversionCommitteePaymentController {
  static async projectOverviewDetails(req, res) {
    try {
      const userid = req.user?._id;
      if (!userid) {
        return res.status(401).json({
          success: false,
          message: "user id is required",
        });
      }

      const totalPayment = await Project.countDocuments({
        projectManager: new mongoose.Types.ObjectId(userid),
      });

      const completedPayment = await Project.countDocuments({
        projectManager: new mongoose.Types.ObjectId(userid),
        paymentStatus: "completed",
      });

      const remainingPayment = await Project.countDocuments({
        projectManager: new mongoose.Types.ObjectId(userid),
        paymentStatus: "pending",
      });

      const totalAmount = await Project.aggregate([
        {
          $match: {
            projectManager: new mongoose.Types.ObjectId(userid),
            paymentStatus: "completed",
          },
        },
        {
          $group: {
            _id: null,
            totalAmount: { $sum: "$totalAmount" },
          },
        },
      ]);

      return res.status(200).json({
        success: true,
        message: "Project overview details",
        data: {
          totalPayment,
          completedPayment,
          remainingPayment,
          totalAmount: totalAmount.length > 0 ? totalAmount[0].totalAmount : 0,
        },
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  static async invoiceProjectDetails(req, res) {
    try {
      const userid = req.user?._id;

      if (!userid) {
        return res.status(401).json({
          success: false,
          message: "user id is required",
        });
      }

      const invoiceDetails = await Invoice.aggregate([
        {
          $match: {
            createdBy: new mongoose.Types.ObjectId(userid),
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "clientId",
            foreignField: "_id",
            as: "clientDetails",
          },
        },
        {
          $unwind: "$clientDetails",
        },

        {
          $project: {
            _id: 1,
            clientId: 1,
            projectName: 1,
            createdAt: 1,
            status: 1,
            price: 1,
            due_date: 1,
            clientName: "$clientDetails.name",
          },
        },
      ]);

      if (!invoiceDetails || invoiceDetails.length === 0) {
        return res.status(404).json({
          success: false,
          message: "No invoice details found",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Invoice details",
        data: invoiceDetails,
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
  ConversionCommitteePaymentController,
};
