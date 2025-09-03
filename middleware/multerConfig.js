const multer = require('multer');
const storage = multer.diskStorage
    ({
        destination: (req, file, cb) => {
            const allowedFileTypes = ['image/jpg', 'image/png', 'image/jpeg']
            if (!allowedFileTypes.includes(file.mimetype)) {
                cb(new Error('File types not allowed'));
                return
            }
            cb(null, './Storage');
        },
        filename: (req, file, cb) => {
            cb(null, Date.now() + "-" + file.originalname);
        }
    });

module.exports = {
    multer,
    storage,
}