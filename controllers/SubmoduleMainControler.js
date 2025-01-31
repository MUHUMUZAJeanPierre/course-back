const express = require("express");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");
const { SubModule, File } = require("../models/CourseSubModuleSchema");

const dotenv = require("dotenv");
dotenv.config();

const upload = multer({ storage: multer.memoryStorage() });

// Get all SubModules
const getAllSubModules = async (req, res) => {
    try {
        const subModules = await SubModule.find();
        res.status(200).json({
            status: 'success',
            message: 'SubModules retrieved successfully',
            data: subModules
        });
    } catch (err) {
        res.status(500).json({
            status: 'error',
            message: 'Failed to retrieve SubModules',
            error: err.message
        });
    }
};

// Get a single SubModule by ID
const getSubModuleById = async (req, res) => {
    try {
        const { id } = req.params;
        const subModule = await SubModule.findById(id);
        if (!subModule) {
            return res.status(404).json({
                status: 'error',
                message: 'SubModule not found'
            });
        }
        res.status(200).json({
            status: 'success',
            message: 'SubModule retrieved successfully',
            data: subModule
        });
    } catch (err) {
        res.status(500).json({
            status: 'error',
            message: 'Failed to retrieve SubModule',
            error: err.message
        });
    }
};

// Update a SubModule by ID
const updateSubModule = async (req, res) => {
    try {
        const { id } = req.params;
        const imagePath = req.file ? req.file.path : req.body.image; // Use uploaded image or existing one

        const updatedSubModule = await SubModule.findByIdAndUpdate(
            id,
            {
                ...req.body,
                image: imagePath
            },
            { new: true }
        );

        if (!updatedSubModule) {
            return res.status(404).json({
                status: 'error',
                message: 'SubModule not found'
            });
        }
        res.status(200).json({
            status: 'success',
            message: 'SubModule updated successfully',
            data: updatedSubModule
        });
    } catch (err) {
        res.status(500).json({
            status: 'error',
            message: 'Failed to update SubModule',
            error: err.message
        });
    }
};

// Delete a SubModule by ID
const deleteSubModule = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedSubModule = await SubModule.findByIdAndDelete(id);
        if (!deletedSubModule) {
            return res.status(404).json({
                status: 'error',
                message: 'SubModule not found'
            });
        }
        res.status(200).json({
            status: 'success',
            message: 'SubModule deleted successfully'
        });
    } catch (err) {
        res.status(500).json({
            status: 'error',
            message: 'Failed to delete SubModule',
            error: err.message
        });
    }
};

// Add a lesson to a SubModule
const addLessonToSubModule = async (req, res) => {
    try {
        const { id } = req.params;
        const lesson = req.body;
        const subModule = await SubModule.findById(id);
        if (!subModule) {
            return res.status(404).json({
                status: 'error',
                message: 'SubModule not found'
            });
        }
        subModule.lessons.push(lesson);
        const updatedSubModule = await subModule.save();
        res.status(201).json({
            status: 'success',
            message: 'Lesson added successfully',
            data: updatedSubModule
        });
    } catch (err) {
        res.status(500).json({
            status: 'error',
            message: 'Failed to add lesson',
            error: err.message
        });
    }
};

// Remove a lesson from a SubModule
const removeLessonFromSubModule = async (req, res) => {
    try {
        const { subModuleId, lessonId } = req.params;
        const subModule = await SubModule.findById(subModuleId);
        if (!subModule) {
            return res.status(404).json({
                status: 'error',
                message: 'SubModule not found'
            });
        }
        subModule.lessons = subModule.lessons.filter(lesson => lesson._id.toString() !== lessonId);
        const updatedSubModule = await subModule.save();
        res.status(200).json({
            status: 'success',
            message: 'Lesson removed successfully',
            data: updatedSubModule
        });
    } catch (err) {
        res.status(500).json({
            status: 'error',
            message: 'Failed to remove lesson',
            error: err.message
        });
    }
};

// Export the controllers
module.exports = {
    getAllSubModules,
    getSubModuleById,
    updateSubModule,
    deleteSubModule,
    addLessonToSubModule,
    removeLessonFromSubModule
};