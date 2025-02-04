const express = require('express');
const SubModuleRouter = express.Router();
const upload = require('../config/multer');
const SubModuleR = require('../controllers/SubmoduleMainControler');
const uploadSubModuleRouter = require('../controllers/SubmoduleController'); // Import the upload route

SubModuleRouter.get('/api/submodules', SubModuleR.getAllSubModules);
SubModuleRouter.get('/api/submodules/:id', SubModuleR.getSubModuleById);
SubModuleRouter.put('/api/submodules/:id', SubModuleR.updateSubModule);
SubModuleRouter.delete('/api/submodules/:id', SubModuleR.deleteSubModule);

// New upload route
SubModuleRouter.use('/api/submodules', uploadSubModuleRouter); // Mount the upload route

module.exports = SubModuleRouter;
