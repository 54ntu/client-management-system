const mongoose = require("mongoose");
const { envConfig } = require("../config/config");

const connectdb = async () => {
  try {
    await mongoose.connect(`${envConfig.mongodburl}`);
    console.log("database connected");
  } catch (error) {
    console.log(`error connecting to database: ${error}`);
    process.exit(1);
  }
};

module.exports = {
  connectdb,
};
