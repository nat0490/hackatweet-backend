require("dotenv").config();
var express = require("express");
var cors = require("cors");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");


require("./models/connection");

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users.route");
var tweetsRouter = require("./routes/tweets.route");
var notificationRouter = require("./routes/notification.route");
var usersInfoRouter = require("./routes/usersInfo.route");

var app = express();

const corsOptions = {
  origin: ['http://localhost:3001','http://localhost:3000', 'https://natflowst.vercel.app'], // Remplacez par votre origine autorisée
  methods: ['GET', 'POST', 'UPDATE', 'DELETE'], // Méthodes HTTP autorisées
  allowedHeaders: ['Content-Type', 'Authorization'], // En-têtes autorisés
};
app.use(cors(corsOptions));


// app.use(function(req, res, next) {
//   const allowedOrigins = ['http://localhost:3000', 'https://natflowst.vercel.app'];
//   const origin = req.headers.origin;
//   if (allowedOrigins.includes(origin)) {
//     res.header("Access-Control-Allow-Origin", origin);
//   }
//   res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//   next();
// });
// // Middleware pour activer CORS
// app.use(cors({
//   origin: 'https://natflowst.vercel.app' // Remplacez par votre origine autorisée
// }));

// var fileUpload = require('express-fileupload');
// app.use(fileUpload());

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

//Vraiment utile?
var bodyParser = require('body-parser');
app.use(
    bodyParser.urlencoded({
      extended: false,
    })
  );

app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/tweets", tweetsRouter);
app.use("/notification", notificationRouter);
app.use("/usersInfo", usersInfoRouter);

module.exports = app;
