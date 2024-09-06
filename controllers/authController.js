const crypto = require("crypto");
const expressAsyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const jwt = require('jsonwebtoken');
const userModel = require("../models/userModel");
const ApiError = require('../utils/apiError');
const { sendEmail } = require('../utils/sendEmail');
const { createToken } = require('../utils/createToken');

module.exports = {
    // @desc   Register
    // Route   POST /api/v1/auth/register
    // Access  Public
    register: expressAsyncHandler(async (req, res, next) => {
        const user = await userModel.create({
            name: req.body.name,
            email: req.body.email,
            password: req.body.password,
            phone: req.body.phone,
        })
        // Create Token
        const token = createToken(user._id)

        res.status(200).json({ data: user, token })
    }),
    // @desc   Login
    // Route   POST /api/v1/auth/login
    // Access  Public
    login: expressAsyncHandler(async (req, res, next) => {
        const user = await userModel.findOne({ email: req.body.email })
        if (!user || !(await bcrypt.compare(req.body.password, user.password))) {
            return next(new ApiError(`Invalid email or password`, 401))
        }
        // Create Token
        const token = createToken(user._id)

        res.status(200).json({ data: user, token })
    }),
    protectAuth: (activate = false) => expressAsyncHandler(async (req, res, next) => {
        // Check If Token Exist
        let token = ""
        if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
            token = req.headers.authorization.split(" ")[1]
        }

        if (!token) {
            return next(new ApiError(`Please Login First To Access This Route`, 401))
        }

        // Verify Token
        const decode = jwt.verify(token, process.env.JWT_SECRET_KEY)

        // Check If User Exist In Token
        const user = await userModel.findById(decode.userId)
        if (!user) {
            return next(new ApiError(`Invalid User Id in this Token`, 401))
        }

        // Check If User Change Password
        if (user.changePasswordAt) {
            const timeStamp = parseInt(user.changePasswordAt.getTime() / 1000, 10)
            if (decode.iat < timeStamp) {
                return next(new ApiError(`Password User Changed, Please Login Again`, 401))
            }
        }

        // Check If User Active
        if (!activate && !user.active) {
            return next(new ApiError(`You are not Active User, Reactive your self to access`, 401))
        }

        req.user = user
        next()
    }),
    allowedTo: (...roles) => expressAsyncHandler(async (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(new ApiError(`You are not allowed to access this route`, 403))
        }
        next();
    }),
    // @desc   Forget Password
    // Route   POST /api/v1/auth/forgetPassword
    // Access  Public
    forgetPassword: expressAsyncHandler(async (req, res, next) => {
        // If User Exist with Email
        const user = await userModel.findOne({ email: req.body.email })
        if (!user) {
            return next(new ApiError(`This Email Address is not Exist`, 403))
        }

        // Genereate Hash reset Code & Save in DB
        const resetCode = Math.floor(100000 + Math.random() * 900000).toString()
        const hashResetCode = crypto.createHash('SHA256').update(resetCode).digest('hex')
        const expiredHashResetCode = Date.now() + 10 * 60 * 1000
        user.passwordHashResetCode = hashResetCode
        user.passwordExpiredHashResetCode = expiredHashResetCode
        user.passwordResetCodeVerify = false
        await user.save()

        // Send ResetCode To Email
        const message = `Forgot your password? Submit this reset password code : ${resetCode}\nIf you didn't forgot your password, please ignore this email!`
        sendEmail({
            email: user.email,
            subject: 'Your Password Reset Code (valid for 10 min)',
            message,
        }).then(_ => {
            res.status(201).json({ status: "Success", message: `Password Reset Code Send Successfully To Your Email` })
        }).catch(async (err) => {
            user.passwordHashResetCode = undefined
            user.passwordExpiredHashResetCode = undefined
            user.passwordResetCodeVerify = undefined
            await user.save()
            next(new ApiError(`There a problem, Please Try Agian`, 500))
        })
    }),
    verifyResetCode: expressAsyncHandler(async (req, res, next) => {
        const hashResetCode = crypto.createHash('SHA256').update(req.body.resetCode).digest('hex')
        const user = await userModel.findOne({
            passwordHashResetCode: hashResetCode,
            passwordExpiredHashResetCode: { $gt: Date.now() }
        })

        if (!user) {
            return next(new ApiError(`Reset Code is Invalid OR Expired`, 404))
        }
        user.passwordResetCodeVerify = true
        await user.save()
        res.status(200).json({ status: "Success", msg: "Reset Code is Correct" })
    }),
    resetPassword: expressAsyncHandler(async (req, res, next) => {
        // Check If user Exist
        const user = await userModel.findOne({ email: req.body.email })
        if (!user) {
            return next(new ApiError(`This Email Address is not Exist`, 404))
        }
        if (!user.passwordResetCodeVerify) {
            return next(new ApiError(`Reset Code Not Verified`, 403))
        }

        // Update Password
        user.password = req.body.newPassword
        user.passwordHashResetCode = undefined
        user.passwordExpiredHashResetCode = undefined
        user.passwordResetCodeVerify = undefined
        await user.save()

        // Create Token
        const token = createToken(user._id)
        res.status(200).json({ message: 'Password Reseted Successfully', token })
    })
}