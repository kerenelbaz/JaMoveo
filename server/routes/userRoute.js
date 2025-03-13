const express = require("express");

const { signUp, login, getUsers } = require("../controllers/userController");

const router = express.Router();

router.get( '/', getUsers)
router.post("/sign-up", signUp);
router.post('/login', login)

module.exports = router;