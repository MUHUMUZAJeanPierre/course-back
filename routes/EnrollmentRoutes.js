const express = require('express');
const upload = require('../config/multer');

const EnrollmentRouter = express.Router();
const { enrollStudent, unenrollStudent } = require('../controllers/EnrollmentController');


EnrollmentRouter.post('/api/enroll',upload.none(), enrollStudent);
EnrollmentRouter.post('/api/unenroll',upload.none(), unenrollStudent);

module.exports = EnrollmentRouter;
 