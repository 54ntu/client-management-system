class ChatbotService {
  constructor() {
    this.intents = {
      projectStatusCheck: {
        keywords: ["project", "status", "project update", "project progress"],
        response: (message) => {
          return "wait for a moment, I will check the project status for you.";
        },
      },
    };
  }

  //function to process the incomming message
  processMessage(message, userid) {
    const normalizedMessage = message.toLowerCase();
    console.log("message : ", normalizedMessage);
    const matchedIntent = this.matchIntent(normalizedMessage);

    // console.log(matchedIntent);
    // if a matching intent is found, return the associated response
    if (matchedIntent) {
      return matchedIntent.response(message);
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
