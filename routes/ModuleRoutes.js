const express = require('express');
const ModuleRouter = express.Router();
const { createCourseModule,getAllCourseModules,getCourseModuleById,updateCourseModule,deleteCourseModule } = require('../controllers/ModuleController');
const upload = require('../config/multer');

ModuleRouter.post('/api/modules', upload.single('image') ,createCourseModule);
ModuleRouter.get('/api/modules', getAllCourseModules);
ModuleRouter.get('/api/modules/:id', getCourseModuleById);
ModuleRouter.put('/api/modules/:id', updateCourseModule);
ModuleRouter.delete('/api/modules/:id', deleteCourseModule);

module.exports = ModuleRouter;