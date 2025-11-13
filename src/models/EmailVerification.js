const mongoose = require("mongoose");

const emailVerificationSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
    },
    code: {
        type: String,
        required: true,
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 180, // 3분 후 만료
    },
});

module.exports = mongoose.model("EmailVerification", emailVerificationSchema);
