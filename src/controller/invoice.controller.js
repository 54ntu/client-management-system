const { Invoice } = require("../models/invoice.models");
const { userRole } = require("../global");
const { default: mongoose } = require("mongoose");
const { ApiResponse } = require("../services/Apiresponse");

class InvoiceController {
  static async createInvoice(req, res) {
    try {
      const adminId = req.user._id;
      const { clientId, projectName, due_date, status, price } = req.body;
      if (!adminId) {
        return res.status(400).json({
          success: false,
          message: "admin id is required",
        });
      }
      if (!clientId || !projectName || !due_date || !status || !price) {
        return res.status(400).json({
          success: false,
          message: "all fields are required",
        });
      }

      const createdInvoice = await Invoice.create({
        clientId,
        projectName,
        due_date,
        status,
        price,
        createdBy: adminId,
      });

      if (!createdInvoice) {
        return res.status(500).json({
          success: false,
          message: "invoice creation failed",
        });
      }

      return res.status(201).json({
        success: true,
        createdInvoice,
        message: "invoice created successfully",
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  //this can be used for both client and admin
  static async viewInvoice(req, res) {
    try {
      const userid = req.user?._id;
      const role = req.user?.role;
      //   console.log("role : ", role);

      if (!userid) {
        return res.status(400).json({
          success: false,
          message: "user id is required",
        });
      }

      let invoicesdata;
      if (role === userRole.admin) {
        invoicesdata = await Invoice.find({
          createdBy: new mongoose.Types.ObjectId(userid),
        });
      } else if (role === userRole.client) {
        invoicesdata = await Invoice.find({
          clientId: new mongoose.Types.ObjectId(userid),
        });
      }

      // console.log(invoicesdata);
      if (!invoicesdata || invoicesdata.length === 0) {
        return res.status(404).json({
          success: false,
          invoicesdata,
          message: "invoice data not found",
        });
      }

      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            invoicesdata,
            "invoice data fetched successfully"
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
  InvoiceController,
};
