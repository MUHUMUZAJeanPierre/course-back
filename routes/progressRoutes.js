const express = require('express');
const ProgressRouter = express.Router();
const { completeLesson, completeModule, updateQuizScore } = require('../controllers/ProgressController');

ProgressRouter.post('/api/progress/complete-lesson', completeLesson);

// Route to mark a module as completed if quiz score is 80+
ProgressRouter.post('/api/progress/complete-module', completeModule);

// Route to update quiz score with retry limit and cooldown
ProgressRouter.post('/api/progress/update-quiz-score', updateQuizScore);

module.exports = ProgressRouter;
