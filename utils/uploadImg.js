const multer = require('multer')
const ApiError = require('./apiError')

const uploadImg = () => {
    // Upload Multi or Single Img
    const multerStorage = multer.memoryStorage()
    const multerFilter = (req, file, cb) => {
        if (file.mimetype.startsWith("image")) {
            cb(null, true)
        } else {
            cb(new ApiError('Allow Img only'), false)
        }
    }
    const upload = multer({ storage: multerStorage, fileFilter: multerFilter })
    return upload
}

module.exports = {
    singleImg: (img) => uploadImg().single(img),
    multiImg: (fields) => uploadImg().fields(fields)
}