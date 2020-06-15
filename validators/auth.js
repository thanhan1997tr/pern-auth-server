const { check } = require("express-validator");

exports.userSignUpValidator = [
    check("username").not().isEmpty().withMessage("Name is required"),
    check("email").isEmail().withMessage("Must be a valid email address"),
    check("password")
        .isLength({ min: 6 })
        .withMessage("Password must be at least 6 characters long"),
];

exports.userSignInValidator = [
    check("email").isEmail().withMessage("Must be a valid email address"),
    check("password")
        .isLength({ min: 6 })
        .withMessage("Password must be at least 6 characters long"),
];

exports.forgotPasswordValidator = [
    check("email")
        .notEmpty()
        .isEmail()
        .withMessage("Must be a valid email address"),
];

exports.resetPasswordValidator = [
    check("newPassword")
        .notEmpty()
        .isLength({ min: 6 })
        .withMessage("Password must be at least 6 characters long"),
];
