const express = require('express');
const mongoose = require('mongoose');
const Course = require('../models/Course');
const User = require('../models/User');
const multer = require("multer");

const enrollStudent = async (req, res) => {
    try {
        const { userId, courseId } = req.body;

        console.log(req.body)
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (!course && !user) {
            return res.status(404).json({ message: 'Course and User not found' });
        }

        // Prevent duplicate enrollment
        if (!course.enrolledStudents.includes(userId)) {
            course.enrolledStudents.push(userId);
            await course.save();
        }

        if (!user.courses.some(c => c.courseId.toString() === courseId)) {
            user.courses.push({ courseId });
            await user.save();
        }

        res.status(200).json({ message: 'Enrollment successful' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

const unenrollStudent = async (req, res) => {
    try {
        const { userId, courseId } = req.body;

        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (!course && !user) {
            return res.status(404).json({ message: 'Course and User not found' });
        }

        // Remove student from course enrolledStudents array
        course.enrolledStudents = course.enrolledStudents.filter(id => id.toString() !== userId);
        await course.save();

        // Remove course from user's courses array
        user.courses = user.courses.filter(c => c.courseId.toString() !== courseId);
        await user.save();

        res.status(200).json({ message: 'Unenrollment successful' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

module.exports = { enrollStudent, unenrollStudent };
