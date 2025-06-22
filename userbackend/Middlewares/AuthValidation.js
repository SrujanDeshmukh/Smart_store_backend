const Joi = require('joi');

// Signup validation
const signupValidation = (req, res, next) => {
    const schema = Joi.object({
        fullName: Joi.string().min(2).max(50).required().messages({
            'string.base': `"Full Name" should be a type of 'text'`,
            'string.empty': `"Full Name" cannot be an empty field`,
            'string.min': `"Full Name" should have a minimum length of 2`,
            'string.max': `"Full Name" should have a maximum length of 50`,
            'any.required': `"Full Name" is a required field`,
        }),
        email: Joi.string().email().required().messages({
            'string.email': `"Email" must be a valid email address`,
            'any.required': `"Email" is a required field`,
        }),
        mobileNumber: Joi.string().length(10).pattern(/^\d+$/).required().messages({
            'string.pattern.base': `"Mobile Number" should only contain numbers`,
            'string.length': `"Mobile Number" must be exactly 10 digits`,
            'any.required': `"Mobile Number" is a required field`,
        }),
        confirmmobileNumber: Joi.string().valid(Joi.ref('mobileNumber')).required().messages({
            'any.only': `"Confirm Mobile Number" must match "Mobile Number"`,
            'any.required': `"Confirm Mobile Number" is a required field`,
        }),
        password: Joi.string().min(6).max(100).required().messages({
            'string.min': `"Password" should have a minimum length of 6`,
            'string.max': `"Password" should have a maximum length of 100`,
            'any.required': `"Password" is a required field`,
        }),
        confirmpassword: Joi.string().valid(Joi.ref('password')).required().messages({
            'any.only': `"Confirm Password" must match "Password"`,
            'any.required': `"Confirm Password" is a required field`,
        }),
    });

    const { error } = schema.validate(req.body);
    if (error) {
        return res.status(400).json({ message: "Bad Request", error });
    }
    next();
};

// Login validation
const loginValidation = (req, res, next) => {
    const Schema = Joi.object({
        username: Joi.string()
            .required()
            .custom((value, helper) => {
                const isMobile = Joi.string().length(10).pattern(/^\d+$/).validate(value).error === undefined;

                if (!isMobile) {
                    return helper.message(`"Username" must be a valid mobile number`);
                }
                return value;
            })
            .messages({
                'any.required': `"Username" is a required field`,
            }),
        password: Joi.string()
            .min(6)
            .required()
            .messages({
                'string.min': `"Password" should have a minimum length of 6`,
                'any.required': `"Password" is a required field`,
            }),
    });

    const { error } = Schema.validate(req.body, { abortEarly: false });

    if (error) {
        return res.status(400).json({ errors: error.details.map(err => err.message) });
    }

    next();
};

module.exports = {
    signupValidation,
    loginValidation
};
