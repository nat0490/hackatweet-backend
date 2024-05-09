var express = require("express");
var router = express.Router();
const Notification = require("../models/notifications.model");
const User = require("../models/users.model");


//GET ALL NOTIFICATION

//GET NOTIFICATION FOR ONE USER
router.get("/findNotification/:userToken", async(req,res)=> {
    const { userToken } = req.params;
    try {
        const userFrom = await User.findOne({token : userToken}).lean();
        if(userFrom) {
            const userNotif = await Notification.find({ toUserId: userFrom._id }).lean();
            res.status(200).json({result: true, userNotif});
        } else {
            res.status(500).json({result: false, message: "noUser"});
    }} catch (error) {
        // console.error("Error in /notification/findNotification route:", error);
        res.status(500).json({ result: false, comment: "Internal server error" });
    }
});


//UPDATE READ
router.put("/updateRead/:notificationId", (req,res)=> {
    const { notificationId } = req.params;
    Notification.updateOne(
        {_id: notificationId},
        { $set : {isRead: true}}
    )
    .then(data=> {
        if (data.modifiedCount === 0) {
            res.json({ result: false, error: "is Read not change"})
        } else {
            res.json({ result: true, message: "isRead passed true"})
        }
    })
    .catch((error)=> {
        res.json({result:false, error: error.message});
    })
});






module.exports = router;