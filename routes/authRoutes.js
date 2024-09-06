const router = require("express").Router();
const { register, login, forgetPassword, verifyResetCode, resetPassword } = require("../controllers/authController");
const { registerValidator, loginValidator } = require("../utils/validation/authValidator");

router.post('/register', registerValidator, register)
router.post('/login', loginValidator, login)
router.post('/forgetPassword', forgetPassword)
router.post('/verifyResetCode', verifyResetCode)
router.put('/resetPassword', resetPassword)

module.exports = router