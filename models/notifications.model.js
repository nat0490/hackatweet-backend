const mongoose = require('mongoose');
//notification de like
//notification de commentaire


const notificationSchema = mongoose.Schema({
    fromUserName: String, //Ecrire juste sont nom utilisateur
    fromUserId: String,
    toUserId: String, //mettre un ID
    type: String, //Like ou comment
    tweetId: String, 
    tweetDescription: String, 
    time: Date, //new Date();
    isRead: Boolean, //false et true une fois lu
});

const Notification = mongoose.model('notifications', notificationSchema);

module.exports = Notification;