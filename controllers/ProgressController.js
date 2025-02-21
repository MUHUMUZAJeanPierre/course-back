const User = require('../models/User');
const Course = require('../models/Course');
const CourseModule = require('../models/CourseModule');
const CourseSubModule = require('../models/CourseSubModuleSchema');

// Mark lesson as completed
const completeLesson = async (req, res) => {
    try {
        const { userId, courseId, moduleId, lessonId } = req.body;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found', status: false });
        }

        const courseProgress = user.courses.find(course => course.courseId.toString() === courseId);
        if (!courseProgress) {
            user.courses.push({ courseId, completedModules: [], quizScores: [] });
        }

        const updatedCourse = user.courses.find(course => course.courseId.toString() === courseId);
        let moduleProgress = updatedCourse.completedModules.find(module => module.moduleId.toString() === moduleId);

        if (!moduleProgress) {
            updatedCourse.completedModules.push({ moduleId, completedLessons: [] });
        }

        moduleProgress = updatedCourse.completedModules.find(module => module.moduleId.toString() === moduleId);
        const lessonCompleted = moduleProgress.completedLessons.some(lesson => lesson.lessonId.toString() === lessonId);

        if (!lessonCompleted) {
            moduleProgress.completedLessons.push({ lessonId, completedAt: new Date() });
        }

        await user.save();
        res.status(200).json({ message: 'Lesson marked as completed', status: true });
    } catch (error) {
        res.status(500).json({ message: error.message, status: false });
    }
};

// Mark module as completed if quiz score is 80 and above
const completeModule = async (req, res) => {
    try {
        const { userId, courseId, moduleId } = req.body;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found', status: false });
        }

        const courseProgress = user.courses.find(course => course.courseId.toString() === courseId);
        if (!courseProgress) {
            return res.status(400).json({ message: 'Course not found in user progress', status: false });
        }

        // Check if quiz score meets minimum requirement
        const moduleQuizScore = courseProgress.quizScores.find(quiz => quiz.moduleId.toString() === moduleId);
        if (!moduleQuizScore || moduleQuizScore.score < 80) {
            return res.status(400).json({ message: 'Module not completed: Quiz score below 80', status: false });
        }

        // Find the module progress object
        const moduleProgress = courseProgress.completedModules.find(
            module => module.moduleId.toString() === moduleId
        );
        console.log(moduleProgress)

        if (moduleProgress) {
            // Module already exists in completedModules, so just update it if needed
            moduleProgress.completedAt = new Date();
        } else {
            // Add the module to completedModules array
            courseProgress.completedModules.push({
                moduleId,
                completedAt: new Date(),
                completedLessons: [] // Initialize with empty lessons array
            });
        }

        // Save the updated user document
        await user.save();
        
        res.status(200).json({ message: 'Module completed successfully', status: true });
    } catch (error) {
        res.status(500).json({ message: error.message, status: false });
    }
};

const updateQuizScore = async (req, res) => {
    try {
        const { userId, courseId, moduleId, score } = req.body;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found', status: false });
        }

        const courseProgress = user.courses.find(course => course.courseId.toString() === courseId);
        if (!courseProgress) {
            return res.status(400).json({ message: 'Course not found in user progress', status: false });
        }

        const existingQuizScore = courseProgress.quizScores.find(quiz => quiz.moduleId.toString() === moduleId);
        const now = Date.now();

        if (existingQuizScore) {
            // Ensure attempts exist
            existingQuizScore.attempts = existingQuizScore.attempts || 0;

            // Enforce attempt limit and cooldown
            if (
                existingQuizScore.attempts >= 2 && 
                existingQuizScore.lastAttempt &&
                (now - new Date(existingQuizScore.lastAttempt).getTime()) < 10 * 60 * 1000
            ) {
                return res.status(403).json({ message: 'Maximum attempts reached. Try again after 10 minutes.', status: false });
            }

            // Update score, attempts, and lastAttempt timestamp
            existingQuizScore.score = score;
            existingQuizScore.attempts += 1;
            existingQuizScore.lastAttempt = new Date();
        } else {
            // If no previous attempt, create new quiz score entry
            courseProgress.quizScores.push({
                moduleId,
                score,
                attempts: 1,
                lastAttempt: new Date()
            });
        }

        await user.save();
        res.status(200).json({ message: 'Quiz score updated', status: true });
    } catch (error) {
        res.status(500).json({ message: error.message, status: false });
    }
};


module.exports = { completeLesson, completeModule, updateQuizScore };
