const express = require("express");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");
const { SubModule, File } = require("../models/CourseSubModuleSchema");
const gm = require("gm").subClass({ imageMagick: true });

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

// Unified API to Upload PDF, SubModule Image & Create SubModule
router.post("/", upload.fields([{ name: "file" }, { name: "image" }]), async (req, res) => {
  const { file, image } = req.files;
  const { title, lessons } = req.body;

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

    // Check if SubModule with same title exists
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

    await newSubModule.save();

    res.status(201).json({
      status: "success",
      message: "SubModule created successfully with uploaded file and image",
      data: newSubModule,
    });
  } catch (err) {
    console.error("Error processing request:", err);
    res.status(500).json({
      status: "error",
      message: "Failed to process request",
      error: err.message,
    });
  }
});

module.exports = router;