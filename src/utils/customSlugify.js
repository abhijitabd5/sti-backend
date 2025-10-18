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
  const alphabet = "abcdefghijklmnopqrstuvwxyz";
  let result = "";
  for (let i = 0; i < 3; i++) {
    result += alphabet.charAt(Math.floor(Math.random() * alphabet.length));
  }
  return result;
};

export const sanitizeText = (text) => {
  // Remove or replace problematic characters, including dots and underscores
  return text
    .replace(/[<>:"/\\|?*]/g, "") // Remove Windows forbidden characters
    .replace(/[\x00-\x1f\x80-\x9f]/g, "") // Remove control characters
    .replace(/^\.+/, "") // Remove leading dots
    .replace(/\.+$/, "") // Remove trailing dots
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/[^\w\-]/g, "") // Keep only word characters and hyphens
    .replace(/[._]/g, "") // Remove all dots and underscores
    .substring(0, 50); // Limit length to 50 characters
};

export const generateFileName = (originalFilename) => {
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
  const sanitizedFilename = sanitizeText(originalFilename);

  return `${timestamp}-${sanitizedFilename}-${randomChars}${extension}`;
};

export const generateSlug = async (text) => {
  const sanitizedText = sanitizeText(text);
  const randomCharsOne = generateRandomAlphabets();
  const randomCharsTwo = generateRandomAlphabets();
  return `${sanitizedText}-${randomCharsOne}-${randomCharsTwo}`;
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
