const mongoose = require("mongoose");
const socketio = require("./socket");
const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });
const app = require("./app");
const DB = process.env.DATABASE;

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then((database) => {
    console.log("db connection successfull");
  });
const port = process.env.PORT;
const server = app.listen(port, () => {
  console.log(`App running on port ${port}`);
});