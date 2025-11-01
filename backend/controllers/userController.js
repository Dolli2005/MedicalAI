const User = require('../models/user');
const bcrypt = require('bcryptjs');

// Get user profile
exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password -tokens');
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update user profile
exports.updateProfile = async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['name', 'email', 'password'];
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));

    if (!isValidOperation) {
        return res.status(400).json({ error: 'Invalid updates' });
    }

    try {
        // If updating password, hash it
        if (req.body.password) {
            req.body.password = await bcrypt.hash(req.body.password, 10);
        }

        // Update user
        Object.assign(req.user, req.body);
        await req.user.save();

        // Remove sensitive data
        const userToReturn = req.user.toObject();
        delete userToReturn.password;
        delete userToReturn.tokens;

        res.json(userToReturn);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Delete user account
exports.deleteAccount = async (req, res) => {
    try {
        await req.user.remove();
        res.json({ message: 'Account deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Admin only: Get all users
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find({}).select('-password -tokens');
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Admin only: Get single user
exports.getUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password -tokens');
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Admin only: Update user
exports.updateUser = async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['name', 'email', 'password', 'role', 'active'];
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));

    if (!isValidOperation) {
        return res.status(400).json({ error: 'Invalid updates' });
    }

    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // If updating password, hash it
        if (req.body.password) {
            req.body.password = await bcrypt.hash(req.body.password, 10);
        }

        Object.assign(user, req.body);
        await user.save();

        // Remove sensitive data
        const userToReturn = user.toObject();
        delete userToReturn.password;
        delete userToReturn.tokens;

        res.json(userToReturn);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Admin only: Delete user
exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        await user.remove();
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};