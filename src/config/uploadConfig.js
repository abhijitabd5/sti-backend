// src/config/uploadConfig.js
import multer from "multer";
import path from "path";
import fs from "fs";
import { generateStudentDocName, generateFileName } from "../utils/slugify.js";

// File type mappings
const FILE_TYPES = {
  images: ["image/jpeg", "image/png", "image/jpg", "image/webp"],
  documents: [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ],
  videos: ["video/mp4", "video/avi", "video/mov", "video/wmv"],
  all_media: [
    "image/jpeg", "image/png", "image/jpg", "image/webp",
    "video/mp4", "video/avi", "video/mov", "video/wmv"
  ],
  // New combined type for student documents
  student_files: [
    "image/jpeg", "image/png", "image/jpg", "image/webp",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ],
};

// Generic upload configuration factory
export const createUploadConfig = (options = {}) => {
  const {
    uploadType = "generic",
    destinationPath,
    allowedFileTypes = "images",
    maxFileSize = 10 * 1024 * 1024, // 10MB default
    maxFiles = 5,
    customFilename = null,
  } = options;

  // Storage configuration
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      try {
        let uploadPath;

        // Handle dynamic path generation
        if (typeof destinationPath === "function") {
          uploadPath = path.join(process.cwd(), destinationPath(req, file));
        } else {
          uploadPath = path.join(process.cwd(), destinationPath);
        }

        // Create directory if it doesn't exist
        fs.mkdirSync(uploadPath, { recursive: true });
        cb(null, uploadPath);
      } catch (error) {
        cb(error);
      }
    },

    filename: function (req, file, cb) {
      try {
        let fileName;

        // Use custom filename function if provided
        if (customFilename && typeof customFilename === "function") {
          fileName = customFilename(req, file);
        } else {
          // Generate default filename with timestamp
          const timestamp = Date.now();
          const ext = path.extname(file.originalname);
          const name = file.fieldname;
          fileName = `${name}_${timestamp}${ext}`;
        }

        cb(null, fileName);
      } catch (error) {
        cb(error);
      }
    },
  });

  // Get allowed mime types - FIXED to properly handle arrays
  const getAllowedTypes = () => {
    if (Array.isArray(allowedFileTypes)) {
      // Flatten nested arrays if present
      return allowedFileTypes.flat();
    }
    return FILE_TYPES[allowedFileTypes] || FILE_TYPES.images;
  };

  // File filter function
  const fileFilter = (req, file, cb) => {
    const allowedTypes = getAllowedTypes();

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      const allowedExtensions = allowedTypes
        .map((type) => type.split("/")[1])
        .join(", ");
      cb(
        new Error(
          `Invalid file type: ${file.mimetype}. Only ${allowedExtensions} files are allowed.`
        ),
        false
      );
    }
  };

  // Return configured multer instance
  return multer({
    storage: storage,
    limits: {
      fileSize: maxFileSize,
      files: maxFiles,
    },
    fileFilter: fileFilter,
  });
};

// Predefined upload configurations
export const uploadConfigs = {
  // Student documents upload - FIXED
  studentDocuments: (studentId) =>
    createUploadConfig({
      uploadType: "student-documents",
      destinationPath: (req) => 
        `uploads/students/${req.params.studentId || req.params.id || studentId}`,
      allowedFileTypes: "student_files", // Use the predefined type
      maxFileSize: 50 * 1024 * 1024, // 50MB
      maxFiles: 10,
      customFilename: (req, file) => {
        const studentId = req.params.studentId || req.params.id;
        return generateStudentDocName(studentId, file.originalname);
      },
    }),

  // Profile photos upload
  profilePhotos: createUploadConfig({
    uploadType: "profile-photos",
    destinationPath: "uploads/profiles",
    allowedFileTypes: "images",
    maxFileSize: 5 * 1024 * 1024, // 5MB
    maxFiles: 1,
    customFilename: (req, file) => 
      generateFileName("profile", file.originalname),
  }),

  // Gallery media upload
  galleryMedia: createUploadConfig({
    uploadType: "gallery-media",
    destinationPath: (req) => {
      const category = req.body.category || "general";
      const mediaType = req.body.media_type || "images";
      return `uploads/gallery/${mediaType}/${category}`;
    },
    allowedFileTypes: "all_media",
    maxFileSize: 100 * 1024 * 1024, // 100MB
    maxFiles: 5,
    customFilename: (req, file) => 
      generateFileName("gallery", file.originalname),
  }),

  // Course thumbnails upload
  courseThumbnails: createUploadConfig({
    uploadType: "course-thumbnails",
    destinationPath: "uploads/courses/thumbnails",
    allowedFileTypes: "images",
    maxFileSize: 10 * 1024 * 1024, // 10MB
    maxFiles: 1,
    customFilename: (req, file) => 
      generateFileName("course", file.originalname),
  }),

  // Certificate uploads
  certificates: createUploadConfig({
    uploadType: "certificates",
    destinationPath: "uploads/certificates",
    allowedFileTypes: "documents",
    maxFileSize: 20 * 1024 * 1024, // 20MB
    maxFiles: 1,
    customFilename: (req, file) => 
      generateFileName("certificate", file.originalname),
  }),

  // Receipt uploads
  receipts: createUploadConfig({
    uploadType: "receipts",
    destinationPath: "uploads/receipts",
    allowedFileTypes: [...FILE_TYPES.images, ...FILE_TYPES.documents],
    maxFileSize: 10 * 1024 * 1024, // 10MB
    maxFiles: 1,
    customFilename: (req, file) => 
      generateFileName("receipt", file.originalname),
  }),

  // Invoice uploads
  invoices: createUploadConfig({
    uploadType: "invoices",
    destinationPath: "uploads/invoices",
    allowedFileTypes: "documents",
    maxFileSize: 10 * 1024 * 1024, // 10MB
    maxFiles: 1,
    customFilename: (req, file) => 
      generateFileName("invoice", file.originalname),
  }),
};

// Export the factory function and predefined configs
export default {
  createUploadConfig,
  uploadConfigs,
  FILE_TYPES,
};