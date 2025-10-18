// src/config/uploadConfig.js
import multer from "multer";
import path from "path";
import fs from "fs";
import { generateStudentDocName, generateFileName } from "../utils/customSlugify.js";

// File type mappings
const FILE_TYPES = {
  images: ["image/jpeg", "image/png", "image/jpg", "image/webp"],
  documents: [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ],
  videos: ["video/mp4", "video/avi", "video/mov", "video/wmv"],
  all_media: ["image/jpeg", "image/png", "image/jpg", "image/webp", "video/mp4", "video/avi", "video/mov", "video/wmv"],
  images_and_documents: [
    "image/jpeg",
    "image/png",
    "image/jpg",
    "image/webp",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ],
};

// Generic upload configuration factory
export const createUploadConfig = (options = {}) => {
  const {
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

  // Get allowed mime types
  const getAllowedTypes = (file) => {
    // Support dynamic file type based on file
    if (typeof allowedFileTypes === "function") {
      const dynamicType = allowedFileTypes(file);
      if (Array.isArray(dynamicType)) {
        return dynamicType.flat();
      }
      return FILE_TYPES[dynamicType] || FILE_TYPES.images;
    }

    if (Array.isArray(allowedFileTypes)) {
      return allowedFileTypes.flat();
    }
    return FILE_TYPES[allowedFileTypes] || FILE_TYPES.images;
  };

  // File filter function
  const fileFilter = (req, file, cb) => {
    const allowedTypes = getAllowedTypes(file);

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      const allowedExtensions = allowedTypes.map((type) => type.split("/")[1]).join(", ");
      cb(new Error(`Invalid file type: ${file.mimetype}. Only ${allowedExtensions} files are allowed.`), false);
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
  // Student documents upload
  studentDocuments: (studentId) =>
    createUploadConfig({
      destinationPath: (req) => `uploads/students/${req.params.studentId || req.params.id || studentId}`,
      allowedFileTypes: "images_and_documents",
      maxFileSize: 50 * 1024 * 1024, // 50MB
      maxFiles: 10,
      customFilename: (req, file) => {
        const studentId = req.params.studentId || req.params.id;
        return generateStudentDocName(studentId, file.originalname);
      },
    }),

  // Profile photos upload
  profilePhotos: createUploadConfig({
    destinationPath: "uploads/profiles",
    allowedFileTypes: "images",
    maxFileSize: 5 * 1024 * 1024, // 5MB
    maxFiles: 1,
    customFilename: (req, file) => generateFileName(file.originalname),
  }),

  // Gallery media upload
  galleryMedia: createUploadConfig({
    destinationPath: (req) => {
      const mediaType = req.body.media_type || "images";
      return `uploads/gallery/${mediaType}`;
    },
    allowedFileTypes: "all_media",
    maxFileSize: 100 * 1024 * 1024, // 100MB
    maxFiles: 5,
    customFilename: (req, file) => generateFileName(file.originalname),
  }),

  // Gallery Image upload

  galleryImages: createUploadConfig({
    destinationPath: "uploads/gallery/images",
    allowedFileTypes: "images",
    maxFileSize: 10 * 1024 * 1024, // 10MB
    maxFiles: 1,
    customFilename: (req, file) => generateFileName(file.originalname),
  }),
  // Gallery videos upload
  galleryVideos: createUploadConfig({
    destinationPath: "uploads/courses/videos",
    allowedFileTypes: "videos",
    maxFileSize: 10 * 1024 * 1024, // 10MB
    maxFiles: 1,
    customFilename: (req, file) => generateFileName(file.originalname),
  }),

  // Gallery thumbnails upload
  galleryThumbnails: createUploadConfig({
    destinationPath: "uploads/gallery/thumbnails",
    allowedFileTypes: "images",
    maxFileSize: 10 * 1024 * 1024, // 10MB
    maxFiles: 1,
    customFilename: (req, file) => generateFileName(file.originalname),
  }),

  // Course thumbnails upload
  courseThumbnails: createUploadConfig({
    destinationPath: "uploads/courses/thumbnails",
    allowedFileTypes: "images",
    maxFileSize: 10 * 1024 * 1024, // 10MB
    maxFiles: 1,
    customFilename: (req, file) => generateFileName(file.originalname),
  }),

  // Course syllabus upload
  courseSyllabus: createUploadConfig({
    destinationPath: "uploads/courses/syllabus",
    allowedFileTypes: "documents",
    maxFileSize: 20 * 1024 * 1024, // 20MB
    maxFiles: 1,
    customFilename: (req, file) => generateFileName(file.originalname),
  }),

  // Certificate uploads
  certificates: createUploadConfig({
    destinationPath: "uploads/certificates",
    allowedFileTypes: "documents",
    maxFileSize: 20 * 1024 * 1024, // 20MB
    maxFiles: 1,
    customFilename: (req, file) => generateFileName(file.originalname),
  }),

  // Receipt uploads
  receipts: createUploadConfig({
    destinationPath: "uploads/receipts",
    allowedFileTypes: "images_and_documents",
    maxFileSize: 10 * 1024 * 1024, // 10MB
    maxFiles: 1,
    customFilename: (req, file) => generateFileName(file.originalname),
  }),

  //Transaction proof uploads
  transactionProofs: createUploadConfig({
    destinationPath: "uploads/transactions/proofs",
    allowedFileTypes: "images_and_documents",
    maxFileSize: 10 * 1024 * 1024, // 10MB
    maxFiles: 1,
    customFilename: (req, file) => generateFileName(file.originalname),
  }),
  //Transaction Invoices uploads
  transactionInvoices: createUploadConfig({
    destinationPath: "uploads/transactions/invoices",
    allowedFileTypes: "images_and_documents",
    maxFileSize: 10 * 1024 * 1024, // 10MB
    maxFiles: 1,
    customFilename: (req, file) => generateFileName(file.originalname),
  }),
  //Transaction Receipts uploads
  transactionReceipts: createUploadConfig({
    destinationPath: "uploads/transactions/receipts",
    allowedFileTypes: "images_and_documents",
    maxFileSize: 10 * 1024 * 1024, // 10MB
    maxFiles: 1,
    customFilename: (req, file) => generateFileName(file.originalname),
  }),

  // Invoice uploads
  invoices: createUploadConfig({
    destinationPath: "uploads/invoices",
    allowedFileTypes: "documents",
    maxFileSize: 10 * 1024 * 1024, // 10MB
    maxFiles: 1,
    customFilename: (req, file) => generateFileName(file.originalname),
  }),

  // Course files (thumbnail + syllabus)
  courseFiles: createUploadConfig({
    destinationPath: (req, file) => {
      if (file.fieldname === "thumbnail") {
        return "uploads/courses/thumbnails";
      } else if (file.fieldname === "syllabus") {
        return "uploads/courses/syllabus";
      }
      return "uploads/courses";
    },
    allowedFileTypes: (file) => {
      if (file.fieldname === "thumbnail") {
        return "images";
      } else if (file.fieldname === "syllabus") {
        return "documents";
      }
      return "images";
    },
    maxFileSize: 20 * 1024 * 1024, // 20MB
    maxFiles: 2,
    customFilename: (req, file) => {
      const prefix = file.fieldname === "thumbnail" ? "course" : "syllabus";
      return generateFileName(file.originalname);
    },
  }).fields([
    { name: "thumbnail", maxCount: 1 },
    { name: "syllabus", maxCount: 1 },
  ]),
};

// Export the factory function and predefined configs
export default {
  createUploadConfig,
  uploadConfigs,
  FILE_TYPES,
};
