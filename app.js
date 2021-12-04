const express = require("express");
const morgan = require("morgan");
const helmet = require("helmet");

const app = express();
app.use(helmet());

if (process.env.NODE_ENV === "development") {
    app.use(morgan("dev"));
  }
  app.use('/api/v1',express.static(`${__dirname}/public`));
  app.use(
    express.json({
      limit: "10kb",
    })
  );

  const authRouter = require("./routes/authRoutes");
  const chatRouter = require("./routes/chatRoutes");
  const userRouter = require("./routes/userRoutes");

  app.use("/api/v1/account",authRouter);
  app.use("/api/v1/chat",chatRouter);
  app.use("/api/v1/user",userRouter);

  app.use((err,req,res,next) =>{
  const status = err.statusCode || 500;
  const message = err.message;
  const data = err.data;
  res.status(status).json({status:status,message:message});
});
module.exports = app;