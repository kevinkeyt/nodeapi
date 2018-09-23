var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
    name: String,
    email: String,
    password: String,
    salt: String,
    createdOn: { type: Date, default: Date.now },
    lastLogin: Date,
    lockedUntil: Date,
    failedLoginAttempts: { type: Number, default: 0 }
});

const User = mongoose.model('User', userSchema);
module.exports = User;