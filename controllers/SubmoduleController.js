const express = require("express");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");
const { SubModule, File } = require("../models/CourseSubModuleSchema");
const CourseModule = require('../models/CourseModule');
const router = express.Router();
const dotenv = require("dotenv");
dotenv.config();

// Multer configuration for file uploads (memory storage)
const upload = multer({ storage: multer.memoryStorage() });

const uploadPdfToCloudinary = (buffer, folder, fileName) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: folder,
        public_id: fileName,
        resource_type: "raw",
        format: 'pdf',  // Specify the format as PDF
        flags: "attachment",  // This tells Cloudinary to serve it inline rather than as attachment
      },
      (err, result) => {
        if (err) reject(err);
        else {
          const pdfUrl = result.secure_url.replace('/raw/', '/raw/');
          resolve(pdfUrl);
        }
      }
    );
    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
};

router.post(
  "/",
  upload.fields([{ name: "file" }]),
  async (req, res) => {
    const { file } = req.files;
    const { title, lessons, moduleId } = req.body;
    console.log(req.files)

    if (!file || !file[0]) {
      return res.status(400).json({ error: "No file uploaded" });
  }
  
  if (file[0].mimetype !== 'application/pdf') {
      return res.status(400).json({ error: "Please upload a valid PDF file" });
  }

    if (!title || !moduleId) {
      return res.status(400).json({
        status: "error",
        message: "Title and module ID are required."
      });
    }

    const pdfFile = file[0];
    const cloudinaryFolder = `pdf_app/${pdfFile.originalname.split(".")[0]}`;

    try {
      // Upload PDF directly
      const pdfUrl = await uploadPdfToCloudinary(
        pdfFile.buffer,
        cloudinaryFolder,
        pdfFile.originalname.split(".")[0]
      );

      // Save file metadata to database
      const newFile = new File({
        originalName: pdfFile.originalname,
        storedName: `${Date.now()}-${pdfFile.originalname}`,
        pdfUrl: pdfUrl,
        path: cloudinaryFolder,
      });

      await newFile.save();

      // Check if SubModule with the same title exists
      const existingSubModule = await SubModule.findOne({ title });
      if (existingSubModule) {
        return res.status(400).json({
          status: "error",
          message: "A SubModule with this title already exists",
        });
      }

      // Parse lessons and attach file as a resource
      const parsedLessons = JSON.parse(lessons).map((lesson) => ({
        title: lesson.title,
        description: lesson.description,
        videoUrl: lesson.videoUrl || null,
        resources: [newFile._id],
      }));

      // Create and save the new SubModule
      const newSubModule = new SubModule({
        title,
        lessons: parsedLessons,
      });

      const savedSubModule = await newSubModule.save();

      // Update the CourseModule to include the new SubModule
      const courseModule = await CourseModule.findById(moduleId);
      if (!courseModule) {
        return res.status(404).json({
          status: "error",
          message: "CourseModule not found.",
        });
      }

      courseModule.submodules.push(savedSubModule._id);
      await courseModule.save();

      res.status(201).json({
        status: "success",
        message: "SubModule created and added to CourseModule successfully",
        data: savedSubModule,
      });
    } catch (err) {
      console.error("Error processing request:", err);
      res.status(500).json({
        status: "error",
        message: "Failed to process request",
        error: err.message,
      });
    }
  }
);

router.put(
  "/:id",
  upload.fields([{ name: "file" }]),
  async (req, res) => {
    const { id } = req.params;
    const { title, lessons } = req.body;
    const { file } = req.files;

    try {
      const existingSubModule = await SubModule.findById(id);
      if (!existingSubModule) {
        return res.status(404).json({
          status: "error",
          message: "SubModule not found",
        });
      }

      let updatedFileId = null;

      if (file && file[0] && file[0].mimetype === 'application/pdf') {
        const pdfFile = file[0];
        const cloudinaryFolder = `pdf_app/${pdfFile.originalname.split(".")[0]}`;

        // Upload new PDF
        const pdfUrl = await uploadPdfToCloudinary(
          pdfFile.buffer,
          cloudinaryFolder,
          pdfFile.originalname.split(".")[0]
        );

        // Create new file document
        const fileDocument = new File({
          originalName: pdfFile.originalname,
          storedName: `${Date.now()}-${pdfFile.originalname}`,
          pdfUrl: pdfUrl,
          path: cloudinaryFolder,
        });

        await fileDocument.save();
        updatedFileId = fileDocument._id;
      }

      if (title) {
        existingSubModule.title = title;
      }

      if (lessons) {
        let parsedLessons = JSON.parse(lessons).map((lesson, index) => {
          let existingResources = existingSubModule.lessons[index]?.resources || [];
          
          return {
            title: lesson.title,
            description: lesson.description,
            videoUrl: lesson.videoUrl || null,
            resources: updatedFileId ? [updatedFileId.toString()] : existingResources,
          };
        });

        existingSubModule.lessons = parsedLessons;
      }

      await existingSubModule.validate();
      await existingSubModule.save();
      await existingSubModule.populate("lessons.resources");

      res.status(200).json({
        status: "success",
        message: "SubModule updated successfully",
        data: existingSubModule,
      });
    } catch (err) {
      console.error("Update Error:", err);
      res.status(500).json({
        status: "error",
        message: "Failed to update SubModule",
        error: err.message,
      });
    }
  }
);

// Get all files route
router.get("/", async (req, res) => {
  try {
    const files = await File.find();
    res.status(200).json(files);
  } catch (err) {
    console.error("Error fetching files:", err);
    res.status(500).json({ error: "Failed to fetch files" });
  }
});

router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const file = await File.findById(id);
    if (!file) {
      return res.status(404).json({ error: "File not found" });
    }

    // Delete PDF from Cloudinary
    const publicId = file.pdfUrl.split("/").slice(-2).join("/").split(".")[0];
    await cloudinary.uploader.destroy(publicId, { resource_type: "raw" });

    // Remove the file from the database
    await file.deleteOne();

    res.status(200).json({ message: "File deleted successfully" });
  } catch (err) {
    console.error("Error deleting file:", err);
    res.status(500).json({ error: "Failed to delete file" });
  }
});

module.exports = router;