const mongoose = require('mongoose');
const schema = mongoose.Schema;

const AdminSchema = new schema({
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
    shopName: {
        type: String,
        required: true,
    },
    licenseNumber: {
        type: String,
        required: true,
        unique: true,
    },
    Bussiness: {
        type: String,
        required: true,
    },
});

const AdminModel = mongoose.model('admins', AdminSchema);
module.exports = AdminModel;