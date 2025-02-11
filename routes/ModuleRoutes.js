const express = require('express');
const ModuleRouter = express.Router();

// Import module controllers
const { createCourseModule, getAllCourseModules, getCourseModuleById, updateCourseModule, deleteCourseModule } = require('../controllers/ModuleController');

// Import quiz controllers
const { addQuizToModule, updateModuleQuiz, deleteModuleQuiz } = require('../controllers/quizController');

const upload = require('../config/multer');

// Module routes
ModuleRouter.post('/api/modules', upload.single('image'), createCourseModule);
ModuleRouter.get('/api/modules', getAllCourseModules);
ModuleRouter.get('/api/modules/:id', getCourseModuleById);
ModuleRouter.put('/api/modules/:id', updateCourseModule);
ModuleRouter.delete('/api/modules/:id', deleteCourseModule);

// Quiz routes
ModuleRouter.post('/api/modules/:moduleId/quiz', addQuizToModule);
ModuleRouter.put('/api/modules/:moduleId/quiz', updateModuleQuiz);
ModuleRouter.delete('/api/modules/:moduleId/quiz', deleteModuleQuiz);

module.exports = ModuleRouter;