const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const UserModel = require("../Models/user");

const signup = async (req, res) => {
    try {
        const { fullName, email, mobileNumber, password } = req.body;

        const existingUser = await UserModel.findOne({ mobileNumber });
        if (existingUser) {
            return res.status(409).json({ message: 'User already exists, you can login', success: false });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const userModel = new UserModel({ fullName, email, mobileNumber, password: hashedPassword });
        await userModel.save();

        res.status(201).json({
            message: "Signup successful",
            success: true,
        });
    } catch (err) {
        console.error("Signup Error:", err.message);
        res.status(500).json({
            message: "Internal Server error",
            success: false,
            error: err.message
        });
    }
};

const login = async (req, res) => {
    try {
        const { username, password } = req.body;
        const errorMsg = "Auth Failed: Mobile number or password is incorrect";

        const user = await UserModel.findOne({ mobileNumber: username });
        if (!user) {
            return res.status(403).json({ message: errorMsg, success: false });
        }

        const isPassEqual = await bcrypt.compare(password, user.password);
        if (!isPassEqual) {
            return res.status(403).json({ message: errorMsg, success: false });
        }

        const jwtToken = jwt.sign(
            { _id: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(201).json({
            message: "Login successful",
            success: true,
            jwtToken,
            name: user.fullName,
            email: user.email,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: "Internal Server Error",
            success: false,
        });
    }
};

module.exports = {
    signup,
    login
};
