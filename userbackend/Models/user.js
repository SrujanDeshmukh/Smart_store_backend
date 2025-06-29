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
    address: {
        street: {
            type: String,
            default: ''
        },
        city: {
            type: String,
            default: ''
        },
        state: {
            type: String,
            default: ''
        },
        pincode: {
            type: String,
            default: ''
        },
        country: {
            type: String,
            default: ''
        },
        latitude: {
            type: Number,
            default: null
        },
        longitude: {
            type: Number,
            default: null
        },
        addressType: {
            type: String,
            enum: ['manual', 'location'],
            default: 'manual'
        }
    }
}, {
    timestamps: true
});

const UserModel = mongoose.model('users', UserSchema);
module.exports = UserModel;
