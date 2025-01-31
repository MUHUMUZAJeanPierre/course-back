const mongoose = require("mongoose");

const FileSchema = new mongoose.Schema({
  originalName: { type: String, required: true },
  storedName: { type: String, required: true },
  slides: { type: [String], required: true }, // Array of slide URLs
  totalSlides: { type: Number, required: true }, // Number of slides
  path: { type: String, required: true }, // Cloudinary folder path
});

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
