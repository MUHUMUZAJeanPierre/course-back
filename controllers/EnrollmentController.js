// Enroll a student in a course
const Course = require('../models/Course');

exports.enrollStudent = async (req, res) => {
    try {
      const course = await Course.findById(req.params.courseId);
      if (!course) return res.status(404).json({ message: 'Course not found' });
  
      if (course.enrolledStudents.includes(req.body.studentId)) {
        return res.status(400).json({ message: 'Student already enrolled' });
      }
  
      course.enrolledStudents.push(req.body.studentId);
      await course.save();
      res.status(200).json(course);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
  
  // Remove a student from a course
  exports.removeStudent = async (req, res) => {
    try {
      const course = await Course.findById(req.params.courseId);
      if (!course) return res.status(404).json({ message: 'Course not found' });
  
      course.enrolledStudents = course.enrolledStudents.filter(
        (id) => id.toString() !== req.params.studentId
      );
  
      await course.save();
      res.status(200).json(course);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
  
  // Get all enrolled students for a course
  exports.getEnrolledStudents = async (req, res) => {
    try {
      const course = await Course.findById(req.params.courseId).populate('enrolledStudents');
      if (!course) return res.status(404).json({ message: 'Course not found' });
  
      res.status(200).json(course.enrolledStudents);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
  