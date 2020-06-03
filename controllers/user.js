const User = require("../models/user");
const bcrypt = require("bcrypt");

exports.read = (req, res) => {
    const id = req.params.id;
    User.query()
        .findById(id)
        .then((user) => {
            if (!user) {
                return res.status(400).json({ error: "User not found." });
            }
            user.password = undefined;
            return res.json(user);
        })
        .catch((err) => {
            res.json({
                err,
            });
        });
};

exports.update = (req, res) => {
    const { username, password } = req.body;
    const id = req.user._id;
    User.query()
        .findById(id)
        .then((user) => {
            if (!user) {
                return res.status(400).json({ error: "User not found." });
            }
            if (!username) {
                return res.status(400).json({ error: "Name is required." });
            }
            if (password) {
                if (password.length < 6) {
                    return res.status(400).json({
                        error: "Password should be min 6 characters long.",
                    });
                }
                
            }
            
            User.query()
                .findById(id)
                .patch({
                    username,
                    password: (password !== "" ? bcrypt.hashSync(password, 10) : user.password),
                })
                .returning('*') 
                .then((data) => {
                    if (data < 0) {
                        return res.status(400).json({
                            error: "User update failed.",
                        });
                    }
                    data.password = undefined;
                    return res.json(data);
                });
        });
};

exports.delete = (req, res) => {
    const id = req.params.id;
    User.query()
        .deleteById(id)
        .then((data) => {
            if (data > 0) {
                return res.json({
                    message: "Delete Success!",
                });
            } else {
                return res.json({
                    message: "Delete Fail!",
                });
            }
        });
};
