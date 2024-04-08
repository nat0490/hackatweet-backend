const mongoose = require('mongoose');

const profilPictureSchema = mongoose.Schema({
    url: String,
    cloudId: String,
})

const userInfoSchema = mongoose.Schema(
    {
        profilPicture: [profilPictureSchema],
        dateOfBirth: Date,
        email: {
            type: String,
            unique: true,
            trim: true,
            select: false,
            index: true,
            validate: {
                validator: val => /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/?.test(val),
                message: ({value}) => `${value} is not a valid email`
            }
        },
        genre: {
            type: String,
            enum: ["homme", "femme", "non binaire"],
        },
        //FB, Insta, Autre...
        link: [String],
        theme: {
            type: String,
            enum: ["dark", "light"],
            default: "light",
        },
        tweetILike : [ { type: mongoose.Schema.Types.ObjectId, ref: 'tweets'}],
        commentILike : [ { type: mongoose.Schema.Types.ObjectId, ref: 'comment'}],
        whoIFollow: [ { type: mongoose.Schema.Types.ObjectId, ref: 'users'} ],
        user : { type: mongoose.Schema.Types.ObjectId, ref: 'users'},
    },
    { timestamps: true, toJSON: { virtuals: true }}

);

const UserInfo = mongoose.model('usersInfo', userInfoSchema);
module.exports = UserInfo;