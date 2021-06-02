const express = require("express");
const morgan = require("morgan");
const helmet = require("helmet");

const app = express();
app.use(helmet());

if (process.env.NODE_ENV === "development") {
    app.use(morgan("dev"));
  }

  app.use(
    express.json({
      limit: "10kb",
    })
  );

  const authRouter = require("./routes/authRoutes");

  app.use("/api/v1/account",authRouter);

  app.use((err,req,res,next) =>{
  const status = err.statusCode || 500;
  const message = err.message;
  const data = err.data;
  res.status(status).json({status:status,message:message});
});
module.exports = app;