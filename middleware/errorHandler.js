import { constant } from "./constants.js";

const errorHandler = (error, request, response, next) => {
  const statusCode = response.statusCode ? response.statusCode : 500;
  switch (statusCode) {
    case constant.BAD_REQUEST:
      response.json({
        data: null,
        title: "Bad request",
        message: error.message,
        success: false,
      });
      break;
    case constant.UNATHORIZED:
      response.json({
        data: null,
        title: "Unauthorized",
        message: error.message,
        success: false,
      });
      break;
    case constant.FORBIDDEN:
      response.json({
        data: null,
        title: "Forbidden",
        message: error.message,
        success: false,
      });
      break;
    case constant.CONFLICT_ERROR:
      response.json({
        data: null,
        title: "Conflict",
        message: error.message,
        success: false,
      });
      break;
    case constant.SERVER_ERROR:
      response.json({
        data: null,
        title: "Internal server error",
        message: error.message,
        success: false,
      });
      break;
    case constant.VALIDATION_ERROR:
      response.json({
        data: null,
        title: "Validation Failed",
        message: error.message,
        success: false,
      });
      break;
    default:
      response.json({
        message: error.message,
      });
      break;
  }
};

export default errorHandler;
