const { User } = require("../models/user.models");
const { Client } = require("../models/client.models");
const {
  hashPassword,
  comparedPassword,
} = require("../services/authcontroller");
const { userRole } = require("../global");
const { ApiResponse } = require("../services/Apiresponse");
const { default: mongoose, isValidObjectId } = require("mongoose");
const { uploadOnCloudinary } = require("../services/cloudinary.services");
const { Conversion } = require("../models/conversionCommittee.models");
class ClientController {
  static async registerClient(req, res) {
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
      console.log(profileImagelocalfilePath);

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
      const clientProfile = await uploadOnCloudinary(profileImagelocalfilePath);

      //check whether the client already exist or not
      const clientExist = await User.findOne({ email: email });
      if (clientExist) {
        return res.status(400).json({ error: "Client already exist." });
      }

      //hash the password
      const hashedPassword = await hashPassword(password);

      //create user document
      const user = await User.create({
        name,
        email,
        password: hashedPassword,
        phone,
        address,
        profileImage: clientProfile.url,
        role,
      });

      //create client document
      let newClient;
      if (userRole === "admin") {
        newClient = await Client.create({
          user: user._id,
          admin: new mongoose.Types.ObjectId(userId),
        });
      } else if (userRole === "conversion_committee") {
        newClient = await Client.create({
          user: user._id,
          conversion: new mongoose.Types.ObjectId(userId),
        });
      }
      if (!newClient || !user) {
        return res.status(400).json({
          message: "error creating client or user",
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
          addedBy:
            userRole === "admin" ? newClient.admin : newClient.conversion,
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

  static async getClientDetails(req, res) {
    try {
      //get the admin id or conversion committee id from req.user
      const userid = req.user?._id;
      const userRole = req.user?.role;
      console.log(userid, userRole);

      let conversionCommitteeExist;
      if (userRole === "conversion_committee") {
        conversionCommitteeExist = await Conversion.findOne({
          user: new mongoose.Types.ObjectId(userid),
        });
      }

      // console.log(conversionCommitteeExist);

      const clients = await Client.aggregate([
        {
          $match: {
            $or: [
              {
                $expr: { $eq: ["$admin", new mongoose.Types.ObjectId(userid)] },
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
            as: "clientDetails",
          },
        },
        {
          $unwind: "$clientDetails",
        },

        {
          $project: {
            lastInteraction: "$lastInteractionDate",
            ID: "$clientDetails._id",
            fullname: "$clientDetails.name",
            email: "$clientDetails.email",
            contact: "$clientDetails.phone",
            address: "$clientDetails.address",
            status: "$lastInteractionDate.status",
            profile: "$clientDetails.profileImage",
          },
        },
      ]);

      if (!clients || clients.length === 0) {
        return res.status(404).json({
          data: clients,
          message: "clients data not found",
        });
      }

      return res
        .status(200)
        .json(
          new ApiResponse(200, clients, "client data fetched successfully")
        );
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  static async getClientDatabyid(req, res) {
    try {
      const { id } = req.params;
      console.log(typeof id);
      if (!isValidObjectId(id)) {
        return res.status(400).json({
          success: false,
          message: "client id is not provided",
        });
      }
      const clientdetails = await Client.aggregate([
        {
          $match: {
            _id: new mongoose.Types.ObjectId(id),
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "user",
            foreignField: "_id",
            as: "clientDetails",
          },
        },
        {
          $unwind: "$clientDetails",
        },
        {
          $project: {
            _id: "$clientDetails._id",
            lastInteractionDate: 1,
            name: "$clientDetails.name",
            email: "$clientDetails.email",
            phone: "$clientDetails.phone",
            status: "$clientDetails.status",
            profile: "$clientDetails.profileImage",
            address: "$profileImage.address",
          },
        },
      ]);

      if (!clientdetails) {
        return res.status(404).json({
          success: false,
          message: "client data not found",
        });
      }
      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            clientdetails,
            "client data fetched successfully"
          )
        );
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  //this one is for client only
  static async getProfile(req, res) {
    try {
      //get the client id from the req.uesr
      const userId = req.user._id;
      console.log(userId);
      const clientdata = await Client.aggregate([
        {
          $match: {
            user: new mongoose.Types.ObjectId(userId),
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "user",
            foreignField: "_id",
            as: "clientDetails",
          },
        },
        {
          $unwind: "$clientDetails",
        },
        {
          $project: {
            name: "$clientDetails.name",
            email: "$clientDetails.email",
            role: "$clientDetails.role,",
            phone: "$clientDetails.phone",
            profile: "$clientDetails.profileImage",
          },
        },
      ]);
      // console.log(clientdata);
      if (!clientdata || clientdata.length === 0) {
        return res.status(404).json({
          success: false,
          message: "client data not found",
        });
      }
      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            clientdata[0],
            "client data fetched successfully"
          )
        );
    } catch (error) {
      return req.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  static async updateProfile(req, res) {
    const clientId = req.user?._id;
    if (!clientId) {
      return res.status(400).json({
        success: false,
        message: "client id is required",
      });
    }

    const { fullName, email, phone } = req.body;

    if (!fullName || !email || !phone) {
      return res.status(400).json({
        message: "fullname , email and phone required",
      });
    }

    const updateProfile = await User.findByIdAndUpdate(
      { _id: new mongoose.Types.ObjectId(clientId) },
      {
        name: fullName,
        email,
        phone,
      },
      {
        new: true,
      }
    ).select(" -password ");

    if (!updateProfile) {
      return res.status(500).json({
        message: "profile updation failed",
      });
    }
    return res.status(200).json({
      success: true,
      updateProfile,
      message: "profile updated successfully",
    });
  }

  static async updatePassword(req, res) {
    try {
      const clientId = req.user._id;
      if (!clientId) {
        return res.status(400).json({
          message: "client id required",
        });
      }

      const { currentPassword, newpassword, confirmPassword } = req.body;
      if (!currentPassword || !newpassword || !confirmPassword) {
        return res.status(400).json({
          message: "all data required",
        });
      }

      //check whether newpassword and confirmpassword matched
      if (newpassword !== confirmPassword) {
        return res.status(401).json({
          message: "new password and confirmpassword doesnot matched",
        });
      }
      const clientExist = await User.findById({
        _id: new mongoose.Types.ObjectId(clientId),
      });

      if (!clientExist) {
        return res.status(404).json({
          message: "client does not exist",
        });
      }
      //compare the current password
      const passwordMatched = await comparedPassword(
        currentPassword,
        clientExist.password
      );

      if (!passwordMatched) {
        return res.status(401).json({
          success: false,
          message: "currentpassword doesnot matched",
        });
      }

      //hash the new password
      const hashedPassword = await hashPassword(newpassword);
      if (!hashedPassword) {
        return res.status(500).json({
          message: "new password hashing failed",
        });
      }

      clientExist.password = hashedPassword;
      await clientExist.save();

      const clientData = clientExist.toObject();
      delete clientData.password;

      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            clientData,
            "client password updated successfully"
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
  ClientController,
};
