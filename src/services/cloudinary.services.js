const cloudinary = require("cloudinary").v2;
const fs = require("fs");
const { envConfig } = require("../config/config");

cloudinary.config({
  cloud_name: "dnyy2andg",
  api_key: "178397524964291",
  api_secret: "SI8MfiXYtmY-WJP7TEoLxgytLt4",
});

const uploadOnCloudinary = async (localfilepath) => {
  try {
    if (!localfilepath) return null;

    const response = await cloudinary.uploader.upload(localfilepath, {
      resource_type: "auto",
    });

    fs.unlinkSync(localfilepath);
    return response;
  } catch (error) {
    console.log("error while uploading data into the cloudinary: ", error);
    fs.unlinkSync(localfilepath);
    return null;
  }
};

module.exports = {
  uploadOnCloudinary,
};
