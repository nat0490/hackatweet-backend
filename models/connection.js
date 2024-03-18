const mongoose = require("mongoose");

mongoose
  .connect(process.env.CONNECTION_STRING, { connectTimeoutMS: 2000 })
  .then(() => console.log("Let's go!"))
  .catch((err) => console.error(err));
