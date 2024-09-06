const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        minLength: 3,
        maxLength: 32,
    },
    slug: {
        type: String,
        lowercase: true
    },
    imgProfile: String,
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    changePasswordAt: {
        type: Date,
    },
    passwordHashResetCode: String,
    passwordExpiredHashResetCode: Date,
    passwordResetCodeVerify: Boolean,
    phone: {
        type: Number,
    },
    role: {
        type: String,
        enum: ['user', 'admin', 'manager'],
        default: 'user'
    },
    active: {
        type: Boolean,
        default: true
    },
    addresses: [{
        id: mongoose.Schema.Types.ObjectId,
        title: String,
        details: String,
        phone: String,
    }]
}, { timestamps: true })

userSchema.pre("save", async function (next) {
    if (!this.isModified('password')) return next() /* IF password not edited */

    this.password = await bcrypt.hash(this.password, 12)
    next()
})


const userModel = mongoose.model('Users', userSchema)

module.exports = userModel