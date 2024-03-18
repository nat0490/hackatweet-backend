const mongoose = require('mongoose');

// const userSchema = mongoose.Schema({
// firstname: String,
// username: String,
// password: String,
// token: String,
  
// });

//AJOUTER NVX SCHEMA USER AVEC THEME & THINGS LIKE POUR CORRESPONDRE AVEC MOBILE
//+ RESTE DU PROFIL: PHOTO, PERSONNE SUIVI, etc?

const userSchema = mongoose.Schema(
    {
        firstname: {
            type: String,
            required: true,
            trim: true,
            message: ({ value }) => `Username ${value} is not valid.`,
        },
        username: {
            type: String,
            unique: true,
            index: true,
            required: true,
            trim: true,
            message: ({ value }) => `Username ${value} already exist.`,
        },
        password: {
            type:String,
            select: false,
            required: true
        },
        token: String,
        type: {
            type: String,
            enum: ["admin", "user", "moderator"],
            default: "user",
        },
        dateCreated: Date,
    }, 
    { timestamps: true, toJSON: { virtuals: true} }
);


const User = mongoose.model('users', userSchema);

module.exports = User;


