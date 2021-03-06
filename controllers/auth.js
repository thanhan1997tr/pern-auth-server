const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const expressJwt = require("express-jwt");

//Mailgun
const mailgun = require("mailgun-js")({
    apiKey: process.env.MAILGUN_API_KEY,
    domain: process.env.MAILGUN_DOMAIN,
});

exports.signUp = (req, res) => {
    const { username, email, password } = req.body;
    User.query()
        .where("email", email)
        .then(data => {
            if (data.length > 0) {
                return res.status(400).json({
                    error: "Email is taken",
                });
            }

            const token = jwt.sign(
                { username, email, password },
                process.env.JWT_ACCOUNT_ACTIVATION,
                { expiresIn: "10m" }
            );

            const emailData = {
                to: email,
                from: process.env.EMAIL_FROM,
                subject: "Account activation link",
                html: `
                    <h1>Please use the following link to activate your account</h1>
                    <p>${process.env.CLIENT_URL}/auth/activate/${token}</p>
                    <p>This email may contain sensitive information</p>
                    <p>${process.env.CLIENT_URL}</p>
                `,
            };
            mailgun.messages().send(emailData, (error, body) => {
                if (error) {
                    return res.status(400).json({
                        error: "Send mail error",
                    });
                }
                return res.json({
                    message: `Email has been sent to ${email}. Follow the instruction to reset your password.`,
                });
            });
        });
};

exports.accountActivation = (req, res) => {
    const { token } = req.body;

    if (token) {
        jwt.verify(token, process.env.JWT_ACCOUNT_ACTIVATION, function (
            err,
            decoded
        ) {
            if (err) {
                console.log("JWT VERIFY IN ACCOUNT ACTIVATION ERROR", err);
                return res.status(401).json({
                    error: "Expired link. Signup again",
                });
            }

            const { username, email, password } = jwt.decode(token);

            User.query()
                .where("email", email)
                .then(data => {
                    if (data.length > 0) {
                        return res.status(400).json({
                            error: "Email is taken",
                        });
                    }

                    User.query()
                        .insert({
                            username,
                            email,
                            password: bcrypt.hashSync(password, 10),
                        })
                        .then(() => {
                            return res.json({
                                message: "Signup success! Please sign in.",
                            });
                        })
                        .catch(err => {
                            return res.json(err);
                        });
                });
        });
    }
};

exports.signIn = (req, res) => {
    try {
        const { email, password } = req.body;
        User.query()
            .where("email", email)
            .then(user => {
                if (user.length === 0) {
                    return res.status(400).json({
                        error:
                            "User with that email does not exist. Please sign up.",
                    });
                }

                bcrypt.compare(password, user[0].password).then(result => {
                    if (!result) {
                        return res.status(401).json({
                            error: "Invalid Credential",
                        });
                    }

                    const token = jwt.sign(
                        { _id: user[0].id },
                        process.env.JWT_SECRET,
                        { expiresIn: "7d" }
                    );
                    const { id, username, email, role } = user[0];
                    return res.json({
                        token,
                        user: { id, username, email, role },
                    });
                });
            });
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Server error");
    }
};

exports.requireSignIn = expressJwt({
    secret: process.env.JWT_SECRET, //req,user
});

exports.adminMiddleware = (req, res, next) => {
    User.query()
        .findById(req.user._id)
        .then(user => {
            if (!user) {
                return res.status(400).json({
                    error: "User not found.",
                });
            }

            if (user.role !== "admin") {
                return res.status(400).json({
                    error: "Admin resource. Access denied",
                });
            }

            req.profile = user;
            next();
        });
};

exports.forgotPassword = (req, res) => {
    const { email } = req.body;
    User.query()
        .where("email", email)
        .then(user => {
            if (user.length === 0) {
                return res.status(400).json({
                    error: "User with that email does not exist.",
                });
            }

            const token = jwt.sign(
                { _id: user[0].id, username: user[0].username },
                process.env.JWT_RESET_PASSWORD,
                { expiresIn: "10m" }
            );

            const emailData = {
                to: email,
                from: process.env.EMAIL_FROM,
                subject: "Password reset link",
                html: `
                    <h1>Please use the following link to reset your password.</h1>
                    <p>${process.env.CLIENT_URL}/auth/password/reset/${token}</p>
                    <p>This email may contain sensitive information</p>
                    <p>${process.env.CLIENT_URL}</p>
                `,
            };
            User.query()
                .where("email", email)
                .patch({ reset_password_link: token })
                .then(data => {
                    mailgun.messages().send(emailData, (error, body) => {
                        if (error) {
                            return res.status(400).json({
                                error: "Send mail error",
                            });
                        }
                        return res.json({
                            message: `Email has been sent to ${email}. Follow the instruction to reset your password.`,
                        });
                    });
                })
                .catch(err => {
                    return res.status(400).json({
                        error:
                            "Database connection error on user password forget request.",
                    });
                });
        })
        .catch(err => {
            return res.status(400).json({
                error: err,
            });
        });
};

exports.resetPassword = (req, res) => {
    const { resetPasswordLink, newPassword } = req.body;
    if (resetPasswordLink) {
        jwt.verify(
            resetPasswordLink,
            process.env.JWT_RESET_PASSWORD,
            (err, decoded) => {
                if (err) {
                    return res.status(400).json({
                        error: "Expired link. Try again",
                    });
                }
                const updatedFields = {
                    password: bcrypt.hashSync(newPassword, 10),
                    reset_password_link: "",
                };
                
                User.query()
                    .where("reset_password_link", resetPasswordLink)
                    .patch(updatedFields)
                    .returning("*")
                    .then(user => {
                        if (user.length == 0) {
                            return res.status(400).json({
                                error: 'Error resetting user password.'
                            })
                        }
                        return res.json({
                            message: `Great! Now you can login with your new password.`
                        })
                    }).catch(err => {
                        return res.status(400).json({
                            error:
                            err.name
                        });
                    });
            }
        );
    }
};
