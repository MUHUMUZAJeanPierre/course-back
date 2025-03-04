const mongoose = require("mongoose");

const FileSchema = new mongoose.Schema({
    originalName: { type: String, required: true },
    storedName: { type: String, required: true },
    pdfUrls: [{ type: String, required: true }], // Array to store multiple page URLs
    path: { type: String, required: true }, // Cloudinary folder path
});

const SubModuleSchema = new mongoose.Schema({
    title: { 
        type: String, 
        required: true 
    },
    isCompleted: {
        type: Boolean,
        default: false,
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
                type: mongoose.Schema.Types.ObjectId,
                ref: "File"
            }]
        }
    ]
});

// Create and export the models
const File = mongoose.model("File", FileSchema);
const SubModule = mongoose.model("SubModule", SubModuleSchema);

module.exports = { File, SubModule };
