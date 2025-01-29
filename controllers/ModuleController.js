// Import required modules
const mongoose = require('mongoose');
const SubModule = require('../models/CourseSubModuleSchema');
const CourseModule = require('../models/CourseModule');
const QuizSchema = require('../models/QuizSchema');
const cloudinary = require('../utils/cloudinary');
const multer = require('multer');
const fs = require('fs');
const upload = require('../config/multer');

// Create a new CourseModule
const createCourseModule = async (req, res) => {
    try {

        if (!req.body.title) {
            return res.status(400).json({
                status: "error",
                message: "Title is required."
            });
        }

        // Upload image to Cloudinary if file exists
        let imageUrl = null;
        if (req.file) {
            const cloudinaryResult = await cloudinary.uploader.upload(req.file.path);
            imageUrl = cloudinaryResult.secure_url;
        }

        const courseModule = new CourseModule({
            title: req.body.title,
            image: imageUrl || req.body.image,
            description: req.body.description,
            submodules: req.body.submodules || [],
            quiz: req.body.quiz || null
        });

        const savedCourseModule = await courseModule.save();
        res.status(201).json({
            status: "success",
            message: "CourseModule created successfully",
            data: savedCourseModule
        });
    } catch (err) {
        res.status(500).json({
            status: "error",
            message: "Failed to create CourseModule",
            error: err.message
        });
    }
};


// Get all CourseModules
const getAllCourseModules = async (req, res) => {
    try {
        const courseModules = await CourseModule.find().populate('submodules');
        res.status(200).json({
            status: 'success',
            message: 'CourseModules retrieved successfully',
            data: courseModules
        });
    } catch (err) {
        res.status(500).json({
            status: 'error',
            message: 'Failed to retrieve CourseModules',
            error: err.message
        });
    }
};

// Get a single CourseModule by ID
const getCourseModuleById = async (req, res) => {
    try {
        const { id } = req.params;
        const courseModule = await CourseModule.findById(id).populate('submodules');
        if (!courseModule) {
            return res.status(404).json({
                status: 'error',
                message: 'CourseModule not found'
            });
        }
        res.status(200).json({
            status: 'success',
            message: 'CourseModule retrieved successfully',
            data: courseModule
        });
    } catch (err) {
        res.status(500).json({
            status: 'error',
            message: 'Failed to retrieve CourseModule',
            error: err.message
        });
    }
};

// Update a CourseModule by ID
const updateCourseModule = async (req, res) => {
    try {
        const { id } = req.params;
        let imageUrl = req.body.image;

        // Upload new image if file exists
        if (req.file) {
            const cloudinaryResult = await cloudinary.uploader.upload(req.file.path);
            imageUrl = cloudinaryResult.secure_url;
        }

        const updatedCourseModule = await CourseModule.findByIdAndUpdate(
            id,
            { ...req.body, image: imageUrl },
            { new: true }
        ).populate('submodules');

        if (!updatedCourseModule) {
            return res.status(404).json({
                status: 'error',
                message: 'CourseModule not found'
            });
        }
        res.status(200).json({
            status: 'success',
            message: 'CourseModule updated successfully',
            data: updatedCourseModule
        });
    } catch (err) {
        res.status(500).json({
            status: 'error',
            message: 'Failed to update CourseModule',
            error: err.message
        });
    }
};

// Delete a CourseModule by ID
const deleteCourseModule = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedCourseModule = await CourseModule.findByIdAndDelete(id);
        if (!deletedCourseModule) {
            return res.status(404).json({
                status: 'error',
                message: 'CourseModule not found'
            });
        }
        res.status(200).json({
            status: 'success',
            message: 'CourseModule deleted successfully'
        });
    } catch (err) {
        res.status(500).json({
            status: 'error',
            message: 'Failed to delete CourseModule',
            error: err.message
        });
    }
};

// Export the controllers
module.exports = {
    createCourseModule,
    getAllCourseModules,
    getCourseModuleById,
    updateCourseModule,
    deleteCourseModule
};
