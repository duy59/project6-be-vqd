const express = require("express");
const router = express.Router();

const User = require("../db/userModel");

// Login route
router.post("/login", async (req, res) => {
    const { login_name, password } = req.body;
    try {
        const user = await User.findOne({ login_name });
        if (!user || user.password !== password) {
            return res.status(400).json({ message: "Email or password is incorrect." });
        }

        req.session.user = user; // Store user in session
        return res.json({ user_id: user._id, first_name: user.first_name, last_name: user.last_name }); // Returning user details
    } catch (error) {
        console.error("Error logging in:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// Logout route (same as before)
router.post("/logout", (req, res) => {
    req.session.destroy(error => {
        if (error) {
            console.error("Error logging out:", error);
            res.status(500).json({ message: "Internal Server Error" });
        } else {
            res.sendStatus(200);
        }
    });
});

module.exports = router;

// Logout route
router.post("/logout", (req, res) => {
    req.session.destroy(error => {
        if (error) {
            console.error("Error logging out:", error);
            res.status(500).json({ message: "Internal Server Error" });
        } else {
            res.sendStatus(200);
        }
    });
});

router.post("/register", async (req, res) => {
    const { login_name, password, first_name, last_name, location, description, occupation } = req.body;

    try {
        const existingUser = await User.findOne({ login_name });
        if (existingUser) {
            return res.status(400).json({ error: 'Login name already exists' });
        }
        console.log(login_name, password, first_name, last_name, location, description, occupation);
        const newUser = new User({
            login_name,
            password,
            first_name,
            last_name,
            location,
            description,
            occupation
        });

        await newUser.save();

        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
