const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

//sendgrid
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

exports.signUp = (req, res) => {
    const { username, email, password } = req.body;
    User.query()
        .where("email", email)
        .then((data) => {
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

            sgMail
                .send(emailData)
                .then(() => {
                    return res.json({
                        message: `Email has been sent to ${email}. Follow the instruction to activate your account.`,
                    });
                })
                .catch((err) => {
                    return res.json({
                        message: err.response.body,
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
                .then((data) => {
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
                        .catch((err) => {
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
            .then((user) => {
                if (user.length === 0) {
                    return res.status(400).json({
                        error:
                            "User with that email does not exist. Please sign up.",
                    });
                }

                bcrypt.compare(password, user[0].password).then((result) => {
                    if (!result) {
                        return res.status(401).json({
                            error: "Invalid Credential"
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
