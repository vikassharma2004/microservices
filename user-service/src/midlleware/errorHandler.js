    import logger from "../utils/logger.js";


    // errorHandler.js

const errorHandler = (err, req, res, next) => {
    // Log the error for debugging (you can also use a logging library like Winston or Morgan)
    logger.error(err.stack || "No stack trace available");
  
    // Determine the status code and error message
    const statusCode = err.statusCode || 500; 
    const message = err.message || 'Internal Server Error';
  
    // Send the error response to the client
    res.status(statusCode).json({
      success: false,
      message,
     
    });
  };
  
 export default errorHandler;
  