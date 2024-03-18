require("dotenv").config();
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var cors = require("cors");

require("./models/connection");

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users.route");
var tweetsRouter = require("./routes/tweets.route");
var notificationRouter = require("./routes/notification.route");

var app = express();

app.use(cors());

var fileUpload = require('express-fileupload');
app.use(fileUpload());

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/tweets", tweetsRouter);
app.use("/notification", notificationRouter);

module.exports = app;
