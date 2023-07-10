import mongoose from "mongoose";
import config from "./config.js";

mongoose.connect(
  `mongodb+srv://${config.userName}:${config.password}@${config.cluster}.mongodb.net/${config.databaseName}`,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

export const database = mongoose.connection;

database.on("error", (error) => {
  console.log("Error in MongoDb connection: " + error);
});

database.once("open", function () {
  console.log("Connected successfully");
});
