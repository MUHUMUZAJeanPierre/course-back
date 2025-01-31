const express = require('express');
const SubModuleRouter = express.Router();
// const { getAllSubModules, getSubModuleById, updateSubModule, deleteSubModule } = require('../controllers/SubmoduleController');
const upload = require('../config/multer');
const SubModuleR = require('../controllers/SubmoduleMainControler');
const uploadSubModuleRouter = require('../controllers/SubmoduleController'); // Import the upload route

// Existing routes
SubModuleRouter.get('/api/submodules', SubModuleR.getAllSubModules);
SubModuleRouter.get('/api/submodules/:id', SubModuleR.getSubModuleById);
SubModuleRouter.put('/api/submodules/:id', SubModuleR.updateSubModule);
SubModuleRouter.delete('/api/submodules/:id', SubModuleR.deleteSubModule);

// New upload route
SubModuleRouter.use('/api/submodules', uploadSubModuleRouter); // Mount the upload route

module.exports = SubModuleRouter;
