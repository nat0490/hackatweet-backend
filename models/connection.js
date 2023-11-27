const mongoose = require("mongoose");

mongoose
  .connect(process.env.CONNECTION_STRING, { connectTimeoutMS: 2000 })
  .then(() => console.log("DB connected"))
  .catch((err) => console.error(err));
