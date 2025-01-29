// Import required modules
const mongoose = require('mongoose');
const SubModule = require('../models/CourseSubModuleSchema');
const CourseModule = require('../models/CourseModule');
const Course = require('../models/Course');
const cloudinary = require('../utils/cloudinary');
const multer = require("multer");
const fs = require("fs");


const storage = multer.diskStorage({
    filename: function (req, file, cb) {
      cb(null, file.originalname);
    }
  });
  
  // Init upload
  const upload = multer({
    storage: storage,
    limits: { fileSize: 3000000 } // 3MB
  }).single("image");
  

// Create a new Course

const createCourse = async (req, res) => {
    // Handle the file upload
    upload(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ message: err.message });
        }

        try {
            const { title, description, instructor, modules, enrolledStudents, category, level } = req.body;

            // Check for required fields
            if (!title || !description || !instructor || !req.file) {
                return res.status(400).json({ 
                    status: 'error', 
                    message: 'Title, description, instructor, and image are required.' 
                });
            }

            // Check if the course already exists
            const existingCourse = await Course.findOne({ title });
            if (existingCourse) {
                // Remove the uploaded file if the course exists
                if (req.file && req.file.path) {
                    fs.unlinkSync(req.file.path);
                }
                return res.status(400).json({
                    status: 'error',
                    message: 'A Course with this title already exists'
                });
            }

            // Upload the image to Cloudinary
            const cloudinaryResult = await cloudinary.uploader.upload(req.file.path);

            // Create a new course entry
            const course = new Course({
                title,
                image: cloudinaryResult.secure_url, // Use the Cloudinary URL
                description,
                instructor,
                modules: modules || [],
                enrolledStudents: enrolledStudents || [],
                category: category || '',
                level: level || 'Beginner',
            });

            // Save the course to the database
            const savedCourse = await course.save();

            // Remove the local file after successful upload
            fs.unlinkSync(req.file.path);

            res.status(201).json({
                status: 'success',
                message: 'Course created successfully',
                data: savedCourse,
            });
        } catch (err) {
            console.error('Error creating Course:', err.message);

            // Remove the file if an error occurs
            if (req.file && req.file.path) {
                fs.unlinkSync(req.file.path);
            }

            res.status(500).json({
                status: 'error',
                message: 'Failed to create Course',
                error: err.message,
            });
        }
    });
};

// Get all Courses
const getAllCourses = async (req, res) => {
    try {
        const courses = await Course.find().populate('modules').populate('instructor').populate('enrolledStudents');
        res.status(200).json({
            status: 'success',
            message: 'Courses retrieved successfully',
            data: courses
        });
    } catch (err) {
        res.status(500).json({
            status: 'error',
            message: 'Failed to retrieve Courses',
            error: err.message
        });
    }
};

// Get a single Course by ID
const getCourseById = async (req, res) => {
    try {
        const { id } = req.params;
        const course = await Course.findById(id).populate('modules').populate('instructor').populate('enrolledStudents');
        if (!course) {
            return res.status(404).json({
                status: 'error',
                message: 'Course not found'
            });
        }
        res.status(200).json({
            status: 'success',
            message: 'Course retrieved successfully',
            data: course
        });
    } catch (err) {
        res.status(500).json({
            status: 'error',
            message: 'Failed to retrieve Course',
            error: err.message
        });
    }
};

// Update a Course by ID
const updateCourse = async (req, res) => {
    try {
        const { id } = req.params;
        const imagePath = req.file ? req.file.path : req.body.image; // Use uploaded image or existing one

        const updatedCourse = await Course.findByIdAndUpdate(
            id,
            {
                ...req.body,
                image: imagePath
            },
            { new: true }
        ).populate('modules').populate('instructor').populate('enrolledStudents');

        if (!updatedCourse) {
            return res.status(404).json({
                status: 'error',
                message: 'Course not found'
            });
        }
        res.status(200).json({
            status: 'success',
            message: 'Course updated successfully',
            data: updatedCourse
        });
    } catch (err) {
        res.status(500).json({
            status: 'error',
            message: 'Failed to update Course',
            error: err.message
        });
    }
};

// Delete a Course by ID
const deleteCourse = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedCourse = await Course.findByIdAndDelete(id);
        if (!deletedCourse) {
            return res.status(404).json({
                status: 'error',
                message: 'Course not found'
            });
        }
        res.status(200).json({
            status: 'success',
            message: 'Course deleted successfully'
        });
    } catch (err) {
        res.status(500).json({
            status: 'error',
            message: 'Failed to delete Course',
            error: err.message
        });
    }
};

// Export the controllers
module.exports = {
    createCourse,
    getAllCourses,
    getCourseById,
    updateCourse,
    deleteCourse
};
