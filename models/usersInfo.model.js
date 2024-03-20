const mongoose = require('mongoose');

const userInfoSchema = mongoose.Schema(
    {
        profilPicture: String,
        dateOfBirth: Date,
        email: String,
        gender: String,
        //FB, Insta, Autre...
        link: [String],
        theme: String,
        whatILike: [ String ],
        //Utile? ou faire une virtual? via les notifications?
        whoIFollow: [ String ],
        //ObjectID?



    },
    { timestamps: true, toJSON: { virtuals: true }}

);

const UserInfo = mongoose.model('usersInfo', userInfoSchema);
module.exports = UserInfo;