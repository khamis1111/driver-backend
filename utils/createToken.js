const jwt = require('jsonwebtoken');

exports.createToken = (id) =>
    jwt.sign({ userId: id }, process.env.JWT_SECRET_KEY, { expiresIn: process.env.JWT_EXPIRE_TIME })
