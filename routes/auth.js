const express = require("express");
const router = express.Router();

//import controller
const {
    signUp,
    accountActivation,
    signIn,
    forgotPassword,
    resetPassword,
} = require("../controllers/auth");

//import validators
const {
    userSignUpValidator,
    userSignInValidator,
    forgotPasswordValidator,
    resetPasswordValidator,
} = require("../validators/auth");
const { runValidation } = require("../validators/index");

// router.post("/signup", signup);
router.post("/sign-up", userSignUpValidator, runValidation, signUp);
router.post("/account-activation", accountActivation);
router.post("/sign-in", userSignInValidator, runValidation, signIn);
//forgot reset password
router.put(
    "/forgot-password",
    forgotPasswordValidator,
    runValidation,
    forgotPassword
);
router.put(
    "/reset-password",
    resetPasswordValidator,
    runValidation,
    resetPassword
);

module.exports = router;
