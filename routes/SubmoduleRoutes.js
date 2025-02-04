const express = require('express');
const SubModuleRouter = express.Router();
const upload = require('../config/multer');
const SubModuleR = require('../controllers/SubmoduleMainControler');
const uploadSubModuleRouter = require('../controllers/SubmoduleController'); // Import the upload route

SubModuleRouter.get('/api/submodules', SubModuleR.getAllSubModules);
SubModuleRouter.get('/api/submodules/:id', SubModuleR.getSubModuleById);
SubModuleRouter.delete('/api/submodules/:id', SubModuleR.deleteSubModule);

//post and put and get, for everything to do with resources
SubModuleRouter.use('/api/v1/submodules', uploadSubModuleRouter); // Mount the upload route

module.exports = SubModuleRouter;
