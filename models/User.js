const mongoose = require('mongoose');
const Course = require('./Course');  
const CourseModule = require('./CourseModule');  
const CourseSubModule = require('./CourseSubModuleSchema');  

const UserSchema = new mongoose.Schema({
    googleId: {
        type: String,
    },
    username: {
        type: String,
        required: function () {
            return !this.googleId; // Only required if not a Google OAuth user
        },
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: function () {
            return !this.googleId; // Only required if not a Google OAuth user
        },
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    verificationToken: {
        type: String,
    },
    role: {
        type: String,
        enum: ['student', 'instructor', 'admin'],
        default: 'student',
    },
    courses: [
        {
            courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
            completedModules: [
                {
                    moduleId: { type: mongoose.Schema.Types.ObjectId, ref: 'CourseModule' },
                    completedLessons: [
                        {
                            lessonId: { type: mongoose.Schema.Types.ObjectId, ref: 'CourseSubModule' },
                            completedAt: { type: Date },
                        },
                    ],
                },
            ],
            quizScores: [
                {
                    moduleId: { type: mongoose.Schema.Types.ObjectId, ref: 'CourseModule' },
                    score: { type: Number },
                },
            ],
        },
    ],
    googleProfile: {
        name: String,
        profileImage: String,
        googleAccessToken: String,
        googleRefreshToken: String,
    },
});


// Assuming User is being exported as a model
module.exports = mongoose.model('User', UserSchema);
