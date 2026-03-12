
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