const User = require("../models/user");
const bcrypt = require("bcrypt");

exports.getUser = (req, res) => {
    const id = req.params.id;
    User.query()
        .findById(id)
        .then((user) => {
            if (user) {
                user.password = undefined
                return res.json(user);
            }
            return res.status(400).json({error: "User not found."})
        }).catch(err => {
            res.json({
                err
            })
        })
};

exports.updateUser = (req, res) => {
    const { username, email, password, role } = req.body;
    console.log(req.body);
    const id = req.params.id;
    User.query()
        .findById(id)
        .patch({
            username,
            email,
            password: bcrypt.hashSync(password, 10),
            role,
        })
        .then((data) => {
            if (data > 0) {
                return res.json({
                    message: "Update Success!",
                });
            } else {
                return res.json({
                    message: "Update Fail!",
                });
            }
        });
};

exports.deleteUser = (req, res) => {
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
