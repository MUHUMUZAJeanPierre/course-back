const express = require('express');

const EnrollmentRouter = express.Router();
const EnrollmentController = require('../controllers/EnrollmentController');


EnrollmentRouter.post('/courses/:courseId/enroll', EnrollmentController.enrollStudent);
EnrollmentRouter.delete('/courses/:courseId/enroll/:studentId', EnrollmentController.removeStudent);
EnrollmentRouter.get('/courses/:courseId/enrolled-students', EnrollmentController.getEnrolledStudents);

module.exports = EnrollmentRouter;
 