const { check } = require("express-validator")
const validationMiddleware = require("../../middleware/validationMiddleware")

exports.addAppointmentValidation = [
    check('patientName')
        .notEmpty()
        .withMessage('Patient Name is required')
        .isLength({ min: 3 })
        .withMessage('Patient Name is too short'),
    check('description')
        .notEmpty()
        .withMessage('Description is required')
        .isLength({ min: 3 })
        .withMessage('Description is too short'),
    validationMiddleware
]

exports.getOneAppointmentValidation = [
    check('id')
        .isMongoId()
        .withMessage('Invalid Appointment Id'),
    validationMiddleware
]

exports.updateAppointmentValidation = [
    check('id')
        .isMongoId()
        .withMessage('Invalid Appointment Id'),
    check('patientName')
        .optional()
        .isLength({ min: 3 })
        .withMessage('Patient Name is too short'),
    check('description')
        .optional()
        .isLength({ min: 3 })
        .withMessage('Description is too short'),
    validationMiddleware
]

exports.deleteAppointmentValidation = [
    check('id')
        .isMongoId()
        .withMessage('Invalid Appointment Id'),
    validationMiddleware
]
