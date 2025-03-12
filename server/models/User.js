const mongoose = require("mongoose")

const UserSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    username:
    {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    instrument:
    {
        type: String,
        required: true
    }
})

const User = mongoose.model("User", UserSchema);
module.exports = User;