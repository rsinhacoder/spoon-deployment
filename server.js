import express from "express";
import cors from "cors";
import * as routers from "./routes.js";
import { database } from "./databaseConnection.js";
import config from "./config.js";
import { errHandler } from "./helperFunctions/imageUploader.js";
import errorHandler from "./middleware/errorHandler.js";
import { socketConnection } from "./helperFunctions/socket.js";

const app = express();
app.use(cors());
app.use(express.json());

app.use(routers.app);

app.use((request, response, next) => {
  next(new Error("Page not found"));
});

app.use(errorHandler);
app.use(errHandler);

export const server = app.listen(config.port, () => {
  console.log(`Server is running at port ${config.port}`);
});

socketConnection()