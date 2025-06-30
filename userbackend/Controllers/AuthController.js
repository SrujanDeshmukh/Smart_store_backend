// Controllers/AuthController.js - DEBUG VERSION
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const UserModel = require("../Models/user");
const connectToDatabase = require("../Models/db");

const signup = async (req, res) => {
    console.log("=== SIGNUP DEBUG START ===");
    
    try {
        // Step 1: Log incoming request
        console.log("1. Request body:", JSON.stringify(req.body, null, 2));
        console.log("2. Request headers:", JSON.stringify(req.headers, null, 2));
        
        // Step 2: Check environment variables
        console.log("3. Environment check:");
        console.log("   - NODE_ENV:", process.env.NODE_ENV);
        console.log("   - JWT_SECRET exists:", !!process.env.JWT_SECRET);
        console.log("   - MongoDB URI exists:", !!process.env.MONGODB_URI || !!process.env.DB_URI || !!process.env.DATABASE_URL);
        
        // Step 3: Connect to database
        console.log("4. Attempting database connection...");
        await connectToDatabase();
        console.log("5. Database connected successfully");
        
        // Step 4: Extract and validate data
        const { fullName, email, mobileNumber, password } = req.body;
        console.log("6. Extracted data:");
        console.log("   - fullName:", fullName);
        console.log("   - email:", email);
        console.log("   - mobileNumber:", mobileNumber);
        console.log("   - password length:", password ? password.length : 'undefined');
        
        // Step 5: Check existing user
        console.log("7. Checking for existing user...");
        const existingUser = await UserModel.findOne({ mobileNumber });
        console.log("8. Existing user found:", !!existingUser);
        
        if (existingUser) {
            console.log("9. User already exists, returning 409");
            return res.status(409).json({ 
                message: 'User already exists, you can login', 
                success: false 
            });
        }
        
        // Step 6: Hash password
        console.log("10. Hashing password...");
        const hashedPassword = await bcrypt.hash(password, 10);
        console.log("11. Password hashed successfully");
        
        // Step 7: Create user model
        console.log("12. Creating user model...");
        const userModel = new UserModel({ 
            fullName, 
            email, 
            mobileNumber, 
            password: hashedPassword 
        });
        console.log("13. User model created");
        
        // Step 8: Save to database
        console.log("14. Saving to database...");
        const savedUser = await userModel.save();
        console.log("15. User saved successfully, ID:", savedUser._id);
        
        console.log("16. Sending success response");
        res.status(201).json({
            message: "Signup successful",
            success: true,
        });
        
        console.log("=== SIGNUP DEBUG SUCCESS ===");
        
    } catch (err) {
        console.log("=== SIGNUP DEBUG ERROR ===");
        console.error("Error details:");
        console.error("- Message:", err.message);
        console.error("- Stack:", err.stack);
        console.error("- Code:", err.code);
        console.error("- Name:", err.name);
        
        // Check for specific error types
        if (err.name === 'ValidationError') {
            console.error("- Validation errors:", err.errors);
        }
        
        if (err.code === 11000) {
            console.error("- Duplicate key error:", err.keyPattern);
        }
        
        console.log("=== SIGNUP DEBUG ERROR END ===");
        
        res.status(500).json({
            message: "Internal Server error",
            success: false,
            error: err.message,
            debug: {
                name: err.name,
                code: err.code,
                stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
            }
        });
    }
};

const login = async (req, res) => {
    console.log("=== LOGIN DEBUG START ===");
    
    try {
        console.log("1. Request body:", JSON.stringify(req.body, null, 2));
        
        // Connect to database first
        console.log("2. Attempting database connection...");
        await connectToDatabase();
        console.log("3. Database connected successfully");
        
        const { username, password } = req.body;
        const errorMsg = "Auth Failed: Mobile number or password is incorrect";
        
        console.log("4. Looking for user with mobile:", username);
        const user = await UserModel.findOne({ mobileNumber: username });
        console.log("5. User found:", !!user);
        
        if (!user) {
            console.log("6. User not found, returning 401");
            return res.status(401).json({ message: errorMsg, success: false });
        }
        
        console.log("7. Comparing passwords...");
        const isPassEqual = await bcrypt.compare(password, user.password);
        console.log("8. Password match:", isPassEqual);
        
        if (!isPassEqual) {
            console.log("9. Password mismatch, returning 401");
            return res.status(401).json({ message: errorMsg, success: false });
        }
        
        console.log("10. Generating JWT token...");
        if (!process.env.JWT_SECRET) {
            console.error("JWT_SECRET not found!");
            return res.status(500).json({
                message: "Server configuration error",
                success: false
            });
        }
        
        const jwtToken = jwt.sign(
            { _id: user._id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '30d' }
        );
        console.log("11. JWT token generated successfully");
        
        console.log("12. Sending success response");
        res.status(201).json({
            message: "Login successful",
            success: true,
            jwtToken,
            name: user.fullName,
            email: user.email,
        });
        
        console.log("=== LOGIN DEBUG SUCCESS ===");
        
    } catch (err) {
        console.log("=== LOGIN DEBUG ERROR ===");
        console.error("Error details:");
        console.error("- Message:", err.message);
        console.error("- Stack:", err.stack);
        console.error("- Code:", err.code);
        console.error("- Name:", err.name);
        console.log("=== LOGIN DEBUG ERROR END ===");
        
        res.status(500).json({
            message: "Internal Server Error",
            success: false,
            error: err.message,
            debug: {
                name: err.name,
                code: err.code
            }
        });
    }
};

module.exports = {
    signup,
    login
};