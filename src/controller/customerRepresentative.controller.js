const { User } = require("../models/user.models");
const { hashPassword } = require("../services/authcontroller");
const { CR } = require("../models/customerRepresentative.models");
const { default: mongoose, isValidObjectId } = require("mongoose");
const { response } = require("express");
const { uploadOnCloudinary } = require("../services/cloudinary.services");
const { ApiResponse } = require("../services/Apiresponse");

class CustomerRepresentativeController {
  static async addCustomerRepresentative(req, res) {
    //get the admin or conversion committee id from req.usre
    const userId = req.user?._id;
    const userRole = req.user?.role;
    if (!userId) {
      return res.status(400).json({
        message: "user id is required",
      });
    }
    // get the details from the req.body
    try {
      const { name, email, password, phone, address, role } = req.body;
      const profileImagelocalfilePath = req.file?.path;
      //   console.log(profileImagelocalfilePath);

      if (!name || !email || !password || !phone || !address || !role) {
        return res.status(400).json({
          success: false,
          message: "all fields are required",
        });
      }

      //validate email and phone
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: "Invalid email format." });
      }

      if (phone.length !== 10) {
        return res
          .status(400)
          .json({ error: "Phone number must be exactly 10 digits." });
      }

      //upload image into the cloudinary

      //check whether the client already exist or not
      const CRExist = await User.findOne({ email: email });
      if (CRExist) {
        return res
          .status(400)
          .json({ error: "customer representative already exist." });
      }

      const CustomerRepProfile = await uploadOnCloudinary(
        profileImagelocalfilePath
      );
      //hash the password
      const hashedPassword = await hashPassword(password);

      //create user document
      const user = await User.create({
        name,
        email,
        password: hashedPassword,
        phone,
        address,
        profileImage: CustomerRepProfile.url,
        role,
      });

      //create client document
      let newCR;
      if (userRole === "admin") {
        newCR = await CR.create({
          user: user._id,
          admin: new mongoose.Types.ObjectId(userId),
        });
      } else if (userRole === "conversion_committee") {
        newCR = await CR.create({
          user: user._id,
          conversion: new mongoose.Types.ObjectId(userId),
        });
      }
      if (!newCR || !user) {
        return res.status(400).json({
          message: "error creating CR or user",
        });
      }

      return res.status(201).json(
        new ApiResponse(201, {
          name: user.name,
          email: user.email,
          profile: user.profileImage,
          role: user.role,
          phone: user.phone,
          address: user.address,
          addedBy: userRole === "admin" ? newCR.admin : newCR.conversion,
          addedBy: userRole === "admin" ? userRole : userRole,
        })
      );
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  static async viewCRData(req, res) {
    //get the admin or conversion id
    try {
      const userId = req.user?._id;
      const userRole = req.user?.role;
      let conversionCommitteeExist;
      if (userRole === "conversion_committee") {
        conversionCommitteeExist = await Conversion.findOne({
          _id: new mongoose.Types.ObjectId(userId),
        });
      }

      // console.log(conversionCommitteeExist);

      const crDatas = await CR.aggregate([
        {
          $match: {
            $or: [
              {
                $expr: { $eq: ["$admin", new mongoose.Types.ObjectId(userId)] },
              },
              conversionCommitteeExist
                ? {
                    $expr: {
                      $eq: [
                        "$admin",
                        new mongoose.Types.ObjectId(
                          conversionCommitteeExist.admin
                        ),
                      ],
                    },
                  }
                : null,
            ].filter(Boolean), //this will remove the null values
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "user",
            foreignField: "_id",
            as: "crDetails",
          },
        },
        {
          $unwind: "$crDetails",
        },

        {
          $project: {
            lastInteraction: "$lastInteractionDate",
            ID: "$crDetails._id",
            fullname: "$crDetails.name",
            email: "$crDetails.email",
            contact: "$crDetails.phone",
            address: "$crDetails.address",
            status: "$lastInteractionDate.status",
            profile: "$crDetails.profileImage",
          },
        },
      ]);

      // console.log(crDatas);

      if (!crDatas || crDatas.length === 0) {
        return res.status(404).json({
          success: false,
          message: "data not found",
        });
      }

      return res
        .status(200)
        .json(new ApiResponse(200, crDatas, "data fetched successfully"));
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  static async updateCrData(req, res) {
    try {
      console.log("hit vaye hoiii");
      const userid = req.user?._id;
      const { id } = req.params;
      console.log(typeof id);
      if (!isValidObjectId(id)) {
        return res.status(400).json({
          success: false,
          message: "provide valid id",
        });
      }

      const profilePicLocalPath = req.file?.path;

      const { name, email, password, phone, address } = req.body;

      const crDataExist = await CR.findOne({
        _id: new mongoose.Types.ObjectId(id),
        admin: new mongoose.Types.ObjectId(userid),
      });

      if (!crDataExist) {
        return res
          .status(404)
          .json({ success: false, message: "cr data not found" });
      }
      //hash the password
      const hashedPassword = await hashPassword(password);

      //if found upload the image into the cloudinary
      const profileImages = await uploadOnCloudinary(profilePicLocalPath);

      if (!profileImages) {
        return res.status(500).json({
          message: "profile image url is required",
        });
      }

      const updatedCR = await User.findOneAndUpdate(
        { _id: crDataExist.user },
        {
          name,
          email,
          password: hashedPassword,
          phone,
          address,
          profileImage: profileImages.url,
        },
        {
          new: true,
        }
      ).select(" -password");

      if (!updatedCR) {
        return res
          .status(500)
          .json({ success: false, message: "data updation failed" });
      }

      return res.status(500).json({
        success: false,
        message: "data updated successfully",
        updatedCR,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  static async deleteCrData(req, res) {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const userid = req.user?._id;
      const { id } = req.params;

      const findCRdata = await CR.findOne({
        _id: id,
        admin: new mongoose.Types.ObjectId(userid),
      });

      if (!findCRdata) {
        await session.abortTransaction();
        return res.status(404).json({
          success: false,
          message: "CR data not found",
        });
      }

      const associatedUserId = findCRdata.user;

      //delete cr data
      await CR.findByIdAndDelete(id).session(session);

      //delete associated user data
      if (associatedUserId) {
        await User.findByIdAndDelete(associatedUserId).session(session);
      }

      await session.commitTransaction();
      return res.status(200).json({
        success: true,
        message: "CR and associated user deleted successfully",
      });
    } catch (error) {
      await session.abortTransaction();
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    } finally {
      session.endSession();
    }
  }
}

module.exports = {
  CustomerRepresentativeController,
};
