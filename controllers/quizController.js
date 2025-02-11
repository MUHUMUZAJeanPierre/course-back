// controllers/QuizController.js
const CourseModule = require('../models/CourseModule');

exports.addQuizToModule = async (req, res) => {
    try {
        const { moduleId } = req.params;
        const { title, questions } = req.body;

        // Validate request body
        if (!title || !questions || !Array.isArray(questions) || questions.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Please provide quiz title and at least one question'
            });
        }

        // Validate each question has required fields
        const isValidQuestions = questions.every(q => 
            q.question && 
            Array.isArray(q.options) && 
            q.options.length > 0 && 
            q.correctAnswer &&
            q.options.includes(q.correctAnswer)
        );

        if (!isValidQuestions) {
            return res.status(400).json({
                success: false,
                message: 'Each question must have question text, options array, and a valid correct answer'
            });
        }

        // Find and update the module
        const updatedModule = await CourseModule.findByIdAndUpdate(
            moduleId,
            {
                $set: {
                    quiz: { title, questions }
                }
            },
            { new: true, runValidators: true }
        );

        if (!updatedModule) {
            return res.status(404).json({
                success: false,
                message: 'Course module not found'
            });
        }

        res.status(200).json({
            success: true,
            data: updatedModule
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error adding quiz to module',
            error: error.message
        });
    }
};

exports.updateModuleQuiz = async (req, res) => {
    try {
        const { moduleId } = req.params;
        const { title, questions } = req.body;

        // Validate request body
        if (!title || !questions || !Array.isArray(questions) || questions.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Please provide quiz title and at least one question'
            });
        }

        // Validate each question
        const isValidQuestions = questions.every(q => 
            q.question && 
            Array.isArray(q.options) && 
            q.options.length > 0 && 
            q.correctAnswer &&
            q.options.includes(q.correctAnswer)
        );

        if (!isValidQuestions) {
            return res.status(400).json({
                success: false,
                message: 'Each question must have question text, options array, and a valid correct answer'
            });
        }

        // Find and update the module
        const updatedModule = await CourseModule.findByIdAndUpdate(
            moduleId,
            {
                $set: {
                    'quiz.title': title,
                    'quiz.questions': questions
                }
            },
            { new: true, runValidators: true }
        );

        if (!updatedModule) {
            return res.status(404).json({
                success: false,
                message: 'Course module not found'
            });
        }

        res.status(200).json({
            success: true,
            data: updatedModule
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating module quiz',
            error: error.message
        });
    }
};

exports.deleteModuleQuiz = async (req, res) => {
    try {
        const { moduleId } = req.params;

        const updatedModule = await CourseModule.findByIdAndUpdate(
            moduleId,
            {
                $unset: { quiz: "" }
            },
            { new: true }
        );

        if (!updatedModule) {
            return res.status(404).json({
                success: false,
                message: 'Course module not found'
            });
        }

        res.status(200).json({
            success: true,
            data: updatedModule
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting module quiz',
            error: error.message
        });
    }
};