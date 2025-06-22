const mongoose = require('mongoose');
const schema = mongoose.Schema;

const UserSchema = new schema({
    fullName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    mobileNumber: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
});

const UserModel = mongoose.model('users', UserSchema);
module.exports = UserModel;
