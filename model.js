const mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ProfileSchema = new Schema({
    discordId: { type: String, required: true, unique: true },
    username: { type: String, required: true },
    avatar: { type: String, required: true },
    refresh_token: { type: String },
    access_token: { type: String},
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Profile', ProfileSchema );
