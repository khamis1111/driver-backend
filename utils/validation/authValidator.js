const slugify = require("slugify");
const { check } = require("express-validator");
const validationMiddleware = require("../../middleware/validationMiddleware")
const userModel = require("../../models/userModel");

exports.registerValidator = [
    check("name")
        .notEmpty()
        .withMessage("User Name is required")
        .isLength({ min: 3 })
        .withMessage("User Name is Too Short")
        .isLength({ max: 32 })
        .withMessage("User Name is Too Long")
        .custom((name, { req }) => {
            req.body.slug = slugify(name)
            return true
        }),
    check('email')
        .isEmail()
        .withMessage('Email Is Invalid')
        .custom(async (email) => {
            const model = await userModel.findOne({ email })
            if (model) {
                throw new Error(`Email is Already exist`)
            }
            return true
        }),
    check('password')
        .notEmpty()
        .withMessage("Password Is Required")
        .custom((pass, { req }) => {
            if (pass !== req.body.passwordConfirm) {
                throw new Error(`Confirm Password not match with password`)
            }
            return true
        }),
    check('passwordConfirm')
        .notEmpty()
        .withMessage('Password Confirm is Required'),
    check('phone')
        .optional()
        .isNumeric()
        .withMessage('Phone Must Be a Number')
        .isMobilePhone('ar-EG')
        .withMessage("Phone Number Must Be EG-Egypt Number"),
    check('imgProfile').optional(),
    check('role').optional(),
    validationMiddleware
]

exports.loginValidator = [
    check('email')
        .isEmail()
        .withMessage('Email Is Invalid'),
    check('password')
        .notEmpty()
        .withMessage("Password Is Required")
        .isLength({ min: 3 })
        .withMessage("Password is Too Short"),
    validationMiddleware
]