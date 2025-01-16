const express = require('express');
const SubModuleRouter = express.Router();
const {createSubModule, getAllSubModules, getSubModuleById, updateSubModule,deleteSubModule} = require('../controllers/SubmoduleController');
const upload = require('../config/multer');

SubModuleRouter.post('/api/submodules', upload.single('image'), createSubModule);
SubModuleRouter.get('/api/submodules', getAllSubModules);
SubModuleRouter.get('/api/submodules/:id', getSubModuleById);
SubModuleRouter.put('/api/submodules/:id', updateSubModule);
SubModuleRouter.delete('/api/submodules/:id', deleteSubModule);

module.exports = SubModuleRouter;