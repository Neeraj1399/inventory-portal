/**
 * Wraps asynchronous functions to catch errors and pass them to the global error handler.
 * This eliminates the need for repetitive try/catch blocks in controllers.
 */
// const catchAsync = (fn) => {
//   return (req, res, next) => {
//     fn(req, res, next).catch(next);
//   };
// };

// export default catchAsync;
/**
 * Wraps asynchronous functions to catch errors and pass them to the global error handler.
 * Added a console.error to help debug the 500 error currently affecting the app.
 */
const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch((err) => {
      // LOG THE ERROR HERE so you can see it in your VS Code / Terminal
      console.error("❌ ASYNC ERROR CAUGHT:");
      console.error({
        message: err.message,
        stack: err.stack,
        path: req.originalUrl
      });
      
      next(err);
    });
  };
};

export default catchAsync;