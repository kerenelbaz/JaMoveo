const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

exports.signUp = async (req, res) => {
    try {
        const { username, password, instrument } = req.body;

        User.find({ username }).then((users) => {
            if (users.length >= 1) {
                return res.status(409).json({
                    message: 'Username already exist'
                })
            }
            bcrypt.hash(password, 10, (error, hashedPassword) => {
                if (error) {
                    return res.status(500).json({
                        error
                    })
                }
                const newUser = new User({
                    _id: new mongoose.Types.ObjectId,
                    username, password: hashedPassword, instrument
                });
                newUser.save().then((result) => {
                    console.log(result);
                    res.status(200).json({
                        message: "User created successfully"
                    });
                }).catch(error => {
                    res.status(500).json({ error })
                })
            })
        })

    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
};



exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;

        User.find({ username }).then((users) => {
            if (users.length === 0) {
                return res.status(401).json({
                    message: 'Authentication failed'
                });

            }
            const [user] = users;

            bcrypt.compare(password, user.password, (error, result) => {
                if (error) {
                    return res.status(401).json({
                        message: 'Authentication failed'
                    });
                }
                if (result) {
                    const token = jwt.sign({
                        id: user._id, username: user.username
                    },
                        process.env.JWT_SECRET,
                        {
                            expiresIn: process.env.JWT_EXPIRES_IN
                        });

                    return res.status(200).json({
                        message: 'Authentication successfuly!',
                        token, 
                        user:{
                            username: user.username,
                            instrument: user.instrument
                        }
                    })
                }
                res.status(401).json({
                    message: 'username and password are incorrect'
                });
            })
        })


    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
};

exports.getUsers = async (req, res) => {
    try {
        const users = await User.find({}, { password: 0 });
        res.status(200).json(users);
    } catch (err) {
        res.status(500).json({ message: "server error", error: err.message })
    }
}