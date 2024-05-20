const express = require("express");
const User = require("../db/userModel");
const router = express.Router();

router.post("/", async (request, response) => {

});

router.get("/list", async (req, res) => {
    try {
        const users = await User.find({}, '_id first_name last_name');
        res.json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

router.get("/:id", async (req, res) => {
    const userId = req.params.id;

    if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({ message: 'Invalid user ID' });
    }

    try {
        const user = await User.findById(userId, '_id first_name last_name location description occupation');
        if (!user) {
        return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;