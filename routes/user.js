const express = require("express");
const router = express.Router();

//import controller
const { read, update } = require("../controllers/user");
const { requireSignIn, adminMiddleware } = require("../controllers/auth");

//import validators
const { userSignUpValidator, userSignInValidator } = require("../validators/auth");
const { runValidation } = require("../validators/index");

// router.post("/signup", signup);
router.get("/user/:id", requireSignIn, read);
router.put("/user/update", requireSignIn, update);
router.put("/admin/user/update", requireSignIn, adminMiddleware, update);
// router.delete("/user/delete/:id", runValidation, delete);

module.exports = router;
