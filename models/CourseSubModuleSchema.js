const mongoose = require('mongoose');

const SubModuleSchema = new mongoose.Schema({
    title: { 
        type: String, 
        required: true 
    },
    image: {
        type: String,
        required: false
    },
    lessons: [
        {
            title: { 
                type: String, 
                required: true 
            },
            description: { 
                type: String, 
                required: true 
            },
            videoUrl: { 
                type: String 
            },
            resources: [{ 
                type: String 
            }]
        }
    ]
});

// Create and export the model
const SubModule = mongoose.model('SubModule', SubModuleSchema);
module.exports = SubModule;
