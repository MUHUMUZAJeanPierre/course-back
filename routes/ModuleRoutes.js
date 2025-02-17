const express = require('express');
const ModuleRouter = express.Router();

// Import module controllers
const { createCourseModule, getAllCourseModules, getCourseModuleById, updateCourseModule, deleteCourseModule } = require('../controllers/ModuleController');

// Import quiz controllers
const { addQuizToModule, updateModuleQuiz, deleteModuleQuiz } = require('../controllers/quizController');

const upload = require('../config/multer');


/**
 * @swagger
 * /api/modules/{id}:
 *   put:
 *     summary: Update a course module
 *     tags: [Modules]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: CourseModule updated successfully
 */

/**
 * @swagger
 * /api/modules/{id}:
 *   delete:
 *     summary: Delete a course module
 *     tags: [Modules]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: CourseModule deleted successfully
 */

/**
 * @swagger
 * /api/modules/{moduleId}/quiz:
 *   post:
 *     summary: Add a quiz to a course module
 *     tags: [Modules]
 *     parameters:
 *       - name: moduleId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, questions]
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Basic Programming Quiz"
 *               questions:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required: [question, options, correctAnswer]
 *                   properties:
 *                     question:
 *                       type: string
 *                       example: "What is a variable?"
 *                     options:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["A function", "A loop", "A storage for data"]
 *                     correctAnswer:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["A storage for data"]
 *     responses:
 *       200:
 *         description: Quiz added successfully
 */

// Module routes
ModuleRouter.post('/api/modules', upload.none(), createCourseModule);
ModuleRouter.get('/api/modules', getAllCourseModules);
ModuleRouter.get('/api/modules/:id', getCourseModuleById);
ModuleRouter.put('/api/modules/:id',upload.none(), updateCourseModule);
ModuleRouter.delete('/api/modules/:id', deleteCourseModule);

// Quiz routes
ModuleRouter.post('/api/modules/:moduleId/quiz',upload.none(), addQuizToModule);
ModuleRouter.put('/api/modules/:moduleId/quiz',upload.none(),  updateModuleQuiz);
ModuleRouter.delete('/api/modules/:moduleId/quiz', deleteModuleQuiz);

module.exports = ModuleRouter;