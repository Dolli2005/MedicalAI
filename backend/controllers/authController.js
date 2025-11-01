const User = require('../models/user');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Register a new user
exports.register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        // Check if user already exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ error: 'User already exists' });
        }

        // Create new user
        user = new User({
            name,
            email,
            password,
            role
        });

        // Generate auth token
        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRE }
        );

        // Save user with token
        user.tokens = [{ token }];
        await user.save();

        res.status(201).json({
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            },
            token
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Login user
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Generate token
        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRE }
        );

        // Add token to user's tokens array
        user.tokens = user.tokens.concat({ token });
        await user.save();

        res.json({
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            },
            token
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Logout user
exports.logout = async (req, res) => {
    try {
        // Remove current token from tokens array
        req.user.tokens = req.user.tokens.filter(
            tokenObj => tokenObj.token !== req.token
        );
        await req.user.save();
        res.json({ message: 'Logged out successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Logout all devices
exports.logoutAll = async (req, res) => {
    try {
        // Remove all tokens
        req.user.tokens = [];
        await req.user.save();
        res.json({ message: 'Logged out from all devices' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};