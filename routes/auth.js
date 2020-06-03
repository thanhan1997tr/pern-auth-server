const express = require("express");
const router = express.Router();

//import controller
const { signUp, accountActivation, signIn } = require("../controllers/auth");

//import validators
const { userSignUpValidator, userSignInValidator } = require("../validators/auth");
const { runValidation } = require("../validators/index");

// router.post("/signup", signup);
router.post("/sign-up", userSignUpValidator, runValidation, signUp);
router.post("/sign-in", userSignInValidator, runValidation, signIn);
router.post("/account-activation", accountActivation);

module.exports = router;
