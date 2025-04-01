const { default: mongoose } = require("mongoose");
const { Project } = require("../models/project.models");
const { Client } = require("../models/client.models");
class ChatbotService {
  constructor() {
    this.intents = {
      projectStatusCheck: {
        keywords: [
          "project",
          "project status",
          "project update",
          "project progress",
        ],
        response: async (userid) => {
          try {
            const clientExist = await Client.findOne({
              user: new mongoose.Types.ObjectId(userid),
            });

            const projects = await Project.aggregate([
              {
                $match: {
                  $or: [
                    { projectManager: new mongoose.Types.ObjectId(userid) },
                    { customerName: clientExist._id },
                  ],
                  projectStatus: { $ne: "completed" },
                },
              },
              {
                $project: {
                  projectTitle: 1,
                  projectStatus: 1,
                },
              },
            ]);

            // console.log(projects);
            if (projects.length === 0) return "no project data found for you";

            return projects.map(
              (project) =>
                `Project : ${project.projectTitle} , status : ${project.projectStatus}`
            );
          } catch (error) {
            return "error fetching project status";
          }
        },
      },

      paymentStatusCheck: {
        keywords: ["payment", "status", "payment update", "payment progress"],
        response: async (userid) => {
          try {
            const clientExist = await Client.findOne({
              user: new mongoose.Types.ObjectId(userid),
            });

            const projects = await Project.aggregate([
              {
                $match: {
                  $or: [
                    { projectManager: new mongoose.Types.ObjectId(userid) },
                    { customerName: clientExist._id },
                  ],
                },
              },
              {
                $project: {
                  projectTitle: 1,
                  paymentStatus: 1,
                },
              },
            ]);

            // console.log(projects);
            if (projects.length === 0) return "no project data found for you";

            return projects.map(
              (project) =>
                `Project : ${project.projectTitle} , paymentstatus : ${project.paymentStatus}`
            );
          } catch (error) {
            return "error fetching project status";
          }
        },
      },
    };
  }

  //function to process the incomming message
  async processMessage(message, userid) {
    const normalizedMessage = message.toLowerCase();
    // console.log("message : ", normalizedMessage);
    const matchedIntent = this.matchIntent(normalizedMessage);

    // // if a matching intent is found, return the associated response

    if (matchedIntent) {
      // console.log(`matchedIntent.keywords  ${matchedIntent.keywords}`);
      return await matchedIntent.response(userid);
    }
  }

  matchIntent(message) {
    for (let intentKey in this.intents) {
      const intent = this.intents[intentKey];
      const keywordMatches = intent.keywords.filter((keyword) =>
        message.includes(keyword)
      );

      if (keywordMatches.length > 0) {
        return intent;
      }
    }
    return null; //no intent matched
  }
}

module.exports = new ChatbotService();
