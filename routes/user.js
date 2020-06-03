const express = require("express");
const router = express.Router();

//import controller
const { updateUser, deleteUser, getUser } = require("../controllers/user");

//import validators
const { userSignUpValidator, userSignInValidator } = require("../validators/auth");
const { runValidation } = require("../validators/index");

// router.post("/signup", signup);
router.get("/get-user/:id", getUser);
router.put("/update-user/:id", userSignUpValidator, runValidation, updateUser);
router.delete("/delete-user/:id", runValidation, deleteUser);

module.exports = router;
