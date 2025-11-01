const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    role: {
        type: String,
        enum: ['patient', 'doctor', 'admin'],
        default: 'patient'
    },
    active: {
        type: Boolean,
        default: true
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }],
    specialization: {
        type: String,
        required: function() { return this.role === 'doctor'; }
    },
    profileImage: String,
    phoneNumber: String,
    address: String,
    dateOfBirth: Date,
    gender: {
        type: String,
        enum: ['male', 'female', 'other']
    }
}, {
    timestamps: true
});

// Create virtual for id
userSchema.virtual('id').get(function() {
    return this._id.toString();
});

// Hash password before saving
userSchema.pre('save', async function(next) {
    const user = this;
    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 10);
    }
    next();
});

// Remove sensitive info when converting to JSON
userSchema.methods.toJSON = function() {
    const user = this.toObject();
    delete user.password;
    delete user.tokens;
    return user;
};

module.exports = mongoose.model('User', userSchema);
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, required: true, unique: true },
  otp: String,
  userType: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
