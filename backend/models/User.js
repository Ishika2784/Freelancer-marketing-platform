const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['client', 'freelancer','admin'],
        default: 'client',
        required: true
    },
    plan: {
        type: String,
        enum: ["free","pro"],
        default: "free",
        required: true
    },
    skills: [
        {
            type: String
        }
    ],
    hourlyRate: {
        type: Number
    },
    bio: {
        type: String,
        default: ""
    },
    location: {
        type: String,
        default: ""
    },
    yearsOfExperience: {
        type: Number,
        default: 0
    }
});

const User = mongoose.model('User', userSchema);

module.exports = User;