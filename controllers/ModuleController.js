// Import required modules
const mongoose = require('mongoose');
const SubModule =  require('../models/CourseSubModuleSchema');
const CourseModule =  require('../models/CourseModule');
const QuizSchema = require('../models/QuizSchema')


// Create a new CourseModule
const createCourseModule = async (req, res) => {
  try {
      // Check if a CourseModule with the same title already exists
      const existingCourseModule = await CourseModule.findOne({ title: req.body.title });
      if (existingCourseModule) {
          return res.status(400).json({
              status: 'error',
              message: 'A CourseModule with this title already exists'
          });
      }

      // Handle image upload
      const imagePath = req.file ? req.file.path : null;

      // Create a new CourseModule
      const courseModule = new CourseModule({
          title: req.body.title,
          image: req.body.image || imagePath, // Fixed re.body to req.body
          description: req.body.description,
          submodules: req.body.submodules || [],
          quiz: req.body.quiz || null
      });

      // Save the CourseModule to the database
      const savedCourseModule = await courseModule.save();
      res.status(201).json({
          status: 'success',
          message: 'CourseModule created successfully',
          data: savedCourseModule
      });
  } catch (err) {
      res.status(500).json({
          status: 'error',
          message: 'Failed to create CourseModule',
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
        const imagePath = req.file ? req.file.path : req.body.image; // Use uploaded image or existing one

        const updatedCourseModule = await CourseModule.findByIdAndUpdate(
            id,
            {
                ...req.body,
                image: imagePath
            },
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
