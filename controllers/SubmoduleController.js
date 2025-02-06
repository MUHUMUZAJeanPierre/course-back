const express = require("express");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");
const { SubModule, File } = require("../models/CourseSubModuleSchema");
const gm = require("gm").subClass({ imageMagick: true });
const CourseModule = require('../models/CourseModule');
const router = express.Router();
const dotenv = require("dotenv");
dotenv.config();

// Multer configuration for file uploads (memory storage)
const upload = multer({ storage: multer.memoryStorage() });


// Upload image to Cloudinary
const uploadImageToCloudinary = (buffer, folder, fileName) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: folder,
        public_id: fileName,
        resource_type: "image",
      },
      (err, result) => {
        if (err) reject(err);
        else resolve(result.secure_url);
      }
    );
    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
};

// Upload slide to Cloudinary
const uploadSlideToCloudinary = (buffer, folder, fileName) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: folder,
        public_id: fileName,
        resource_type: "image",
      },
      (err, result) => {
        if (err) reject(err);
        else resolve(result.secure_url);
      }
    );
    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
};

// Extract slides from PDF and upload to Cloudinary
const processPdfSlides = (pdfBuffer, folder) => {
  return new Promise((resolve, reject) => {
    gm(pdfBuffer).toBuffer("PDF", async (err, buffer) => {
      if (err) return reject(err);

      const slideUrls = [];
      gm(buffer).identify("%p ", async (err, pages) => {
        if (err) return reject(err);

        const totalSlides = pages.split(" ").filter((p) => p).length;

        for (let i = 0; i < totalSlides; i++) {
          gm(buffer, `[${i}]`)
            .toBuffer("PNG", async (err, slideBuffer) => {
              if (err) return reject(err);

              const slideUrl = await uploadSlideToCloudinary(
                slideBuffer,
                folder,
                `slide${i + 1}`
              );
              slideUrls.push(slideUrl);

              if (slideUrls.length === totalSlides) {
                resolve(slideUrls);
              }
            });
        }
      });
    });
  });
};

router.post(
  "/",
  upload.fields([{ name: "file" }, { name: "image" }]),
  async (req, res) => {
    const { file, image } = req.files;
    const { title, lessons, moduleId } = req.body;

    if (!file || !file[0] || !file[0].mimetype.includes("pdf")) {
      return res.status(400).json({ error: "Please upload a valid PDF file" });
    }

    const pdfFile = file[0]; // PDF file
    const cloudinaryFolder = `pdf_app/${pdfFile.originalname.split(".")[0]}`;

    try {
      // Process and upload slides
      const slideUrls = await processPdfSlides(pdfFile.buffer, cloudinaryFolder);

      // Save file metadata to database
      const newFile = new File({
        originalName: pdfFile.originalname,
        storedName: `${Date.now()}-${pdfFile.originalname}`,
        slides: slideUrls,
        totalSlides: slideUrls.length,
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

      // Upload the SubModule image if provided
      let imageUrl = null;
      if (image && image[0]) {
        imageUrl = await uploadImageToCloudinary(image[0].buffer, "submodule_images", `submodule-${Date.now()}`);
      }

      // Parse lessons and attach file as a resource
      const parsedLessons = JSON.parse(lessons).map((lesson) => ({
        title: lesson.title,
        description: lesson.description,
        videoUrl: lesson.videoUrl || null,
        resources: [newFile._id], // Attach file as a resource
      }));

      // Create and save the new SubModule
      const newSubModule = new SubModule({
        title,
        image: imageUrl, // Save image URL
        lessons: parsedLessons,
      });

      const savedSubModule = await newSubModule.save();

      // **Update the CourseModule to include the new SubModule**
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


// Unified API to Upload PDF, SubModule Image & Create SubModule
// router.post("/", upload.fields([{ name: "file" }, { name: "image" }]), async (req, res) => {
//   const { file, image } = req.files;
//   const { title, lessons } = req.body;

//   if (!file || !file[0] || !file[0].mimetype.includes("pdf")) {
//     return res.status(400).json({ error: "Please upload a valid PDF file" });
//   }

//   const pdfFile = file[0]; // PDF file
//   const cloudinaryFolder = `pdf_app/${pdfFile.originalname.split(".")[0]}`;

//   try {
//     // Process and upload slides
//     const slideUrls = await processPdfSlides(pdfFile.buffer, cloudinaryFolder);

//     // Save file metadata to database
//     const newFile = new File({
//       originalName: pdfFile.originalname,
//       storedName: `${Date.now()}-${pdfFile.originalname}`,
//       slides: slideUrls,
//       totalSlides: slideUrls.length,
//       path: cloudinaryFolder,
//     });

//     await newFile.save();

//     // Check if SubModule with same title exists
//     const existingSubModule = await SubModule.findOne({ title });
//     if (existingSubModule) {
//       return res.status(400).json({
//         status: "error",
//         message: "A SubModule with this title already exists",
//       });
//     }

//     // Upload the SubModule image if provided
//     let imageUrl = null;
//     if (image && image[0]) {
//       imageUrl = await uploadImageToCloudinary(image[0].buffer, "submodule_images", `submodule-${Date.now()}`);
//     }

//     // Parse lessons and attach file as a resource
//     const parsedLessons = JSON.parse(lessons).map((lesson) => ({
//       title: lesson.title,
//       description: lesson.description,
//       videoUrl: lesson.videoUrl || null,
//       resources: [newFile._id], // Attach file as a resource
//     }));

//     // Create and save the new SubModule
//     const newSubModule = new SubModule({
//       title,
//       image: imageUrl, // Save image URL
//       lessons: parsedLessons,
//     });

//     await newSubModule.save();

//     res.status(201).json({
//       status: "success",
//       message: "SubModule created successfully with uploaded file and image",
//       data: newSubModule,
//     });
//   } catch (err) {
//     console.error("Error processing request:", err);
//     res.status(500).json({
//       status: "error",
//       message: "Failed to process request",
//       error: err.message,
//     });
//   }
// });

// PUT Route: Update SubModule
router.put(
  "/:id",
  upload.fields([{ name: "file" }, { name: "image" }]),
  async (req, res) => {
    const { id } = req.params;
    const { title, lessons } = req.body;
    const { file, image } = req.files;

    try {
      // Check if SubModule exists
      const existingSubModule = await SubModule.findById(id);
      if (!existingSubModule) {
        return res.status(404).json({
          status: "error",
          message: "SubModule not found",
        });
      }

      let imageUrl = existingSubModule.image;
      let updatedFileId = null;

      // Upload new image to Cloudinary if provided
      if (image && image[0]) {
        imageUrl = await uploadImageToCloudinary(
          image[0].buffer,
          "submodule_images",
          `submodule-${Date.now()}`
        );
      }

      // Process new PDF file if provided
      if (file && file[0] && file[0].mimetype.includes("pdf")) {
        const pdfFile = file[0];
        const cloudinaryFolder = `pdf_app/${pdfFile.originalname.split(".")[0]}`;

        // Process and upload slides
        const slideUrls = await processPdfSlides(pdfFile.buffer, cloudinaryFolder);

        // Create a new file document
        const fileDocument = new File({
          originalName: pdfFile.originalname,
          storedName: `${Date.now()}-${pdfFile.originalname}`,
          slides: slideUrls,
          totalSlides: slideUrls.length,
          path: cloudinaryFolder,
        });

        await fileDocument.save();
        updatedFileId = fileDocument._id; // Get the ID of the uploaded file
      }

      // Update the title if provided
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
    

      // Update image URL
      existingSubModule.image = imageUrl;

      // Validate and save the updated SubModule
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

    // Delete slides from Cloudinary
    for (const slideUrl of file.slides) {
      const publicId = slideUrl.split("/").slice(-2).join("/").split(".")[0];
      await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
    }

    // Remove the file from the database
    await file.deleteOne();

    res.status(200).json({ message: "File deleted successfully" });
  } catch (err) {
    console.error("Error deleting file:", err);
    res.status(500).json({ error: "Failed to delete file" });
  }
});

module.exports = router;
