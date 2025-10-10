import slugifyPackage from "slugify";
import { Op } from "sequelize";
import path from "path";

export const slugify = (text, options = {}) => {
  const defaultOptions = {
    lower: true,
    strict: true,
    trim: true,
    replacement: "-",
  };

  return slugifyPackage(text, { ...defaultOptions, ...options });
};

export const generateSlug = async (text) => {
  return slugify(text);
};

export const createUniqueSlug = async (text, model, field = "slug", id = null) => {
  let baseSlug = slugify(text);
  let finalSlug = baseSlug;
  let counter = 1;

  while (true) {
    const whereClause = { [field]: finalSlug };
    if (id) {
      whereClause.id = { [Op.ne]: id };
    }

    const existing = await model.findOne({ where: whereClause });

    if (!existing) {
      break;
    }

    finalSlug = `${baseSlug}-${counter}`;
    counter++;
  }

  return finalSlug;
};

export const generateStudentDocName = (studentId, originalFilename) => {
  const extension = path.extname(originalFilename);
  const nameWithoutExt = path.basename(originalFilename, extension);
  const cleanName = nameWithoutExt
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  const timestamp = new Date()
    .toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    })
    .replace(/[\/,:\s]/g, "");
  return `${cleanName}-${timestamp}${extension}`;
};

const generateRandomAlphabets = () => {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let result = "";
  for (let i = 0; i < 3; i++) {
    result += alphabet.charAt(Math.floor(Math.random() * alphabet.length));
  }
  return result;
};

export const sanitizeFileName = (filename) => {
  // Remove or replace problematic characters
  return filename
    .replace(/[<>:"/\\|?*]/g, "") // Remove Windows forbidden characters
    .replace(/[\x00-\x1f\x80-\x9f]/g, "") // Remove control characters
    .replace(/^\.+/, "") // Remove leading dots
    .replace(/\.+$/, "") // Remove trailing dots
    .replace(/\s+/g, "_") // Replace spaces with underscores
    .replace(/[^\w\-_.]/g, "") // Keep only word characters, hyphens, underscores, and dots
    .substring(0, 100); // Limit length to 100 characters
};

export const generateFileName = (type, originalFilename) => {
  const timestamp = new Date()
    .toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    })
    .replace(/[\/,:\s]/g, "");
  const randomChars = generateRandomAlphabets();
  const extension = path.extname(originalFilename);
  const sanitizedType = sanitizeFileName(type);

  return `${sanitizedType}-${timestamp}-${randomChars}${extension}`;
};

export const generateCertificateNumber = (studentId, courseCode) => {
  const year = new Date().getFullYear().toString().slice(-2);
  const month = (new Date().getMonth() + 1).toString().padStart(2, "0");
  const timestamp = Date.now().toString().slice(-6);

  return `STI-${year}${month}-${courseCode}-${studentId}-${timestamp}`;
};

export default {
  slugify,
  createUniqueSlug,
  generateStudentDocName,
  generateFileName,
  generateCertificateNumber,
};
