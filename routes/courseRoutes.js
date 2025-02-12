const express = require('express');
const CourseRouter = express.Router();
const {   createCourse,getAllCourses,getCourseById,updateCourse,deleteCourse} = require('../controllers/courseController');
const upload = require('../config/multer');

CourseRouter.post('/api/course', upload.single('image') , createCourse);
CourseRouter.get('/api/course', getAllCourses);
CourseRouter.get('/api/course/:id', getCourseById);
CourseRouter.put('/api/course/:id',upload.single('image'), updateCourse);
CourseRouter.delete('/api/course/:id', deleteCourse);

module.exports = CourseRouter;