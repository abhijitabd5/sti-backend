import slugifyPackage from 'slugify';
import { Op } from 'sequelize';
import path from 'path';

export const slugify = (text, options = {}) => {
  const defaultOptions = {
    lower: true,
    strict: true,
    trim: true,
    replacement: '-'
  };

  return slugifyPackage(text, { ...defaultOptions, ...options });
};

export const generateSlug = async (text) => {
  return slugify(text);
};

export const createUniqueSlug = async (text, model, field = 'slug', id = null) => {
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
  const cleanName = nameWithoutExt.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
  const timestamp = Date.now();
  return `${studentId}-${cleanName}-${timestamp}${extension}`;
}

export const generateCertificateNumber = (studentId, courseCode) => {
  const year = new Date().getFullYear().toString().slice(-2);
  const month = (new Date().getMonth() + 1).toString().padStart(2, '0');
  const timestamp = Date.now().toString().slice(-6);
  
  return `EMA-CERT-${year}${month}-${courseCode}-${studentId}-${timestamp}`;
};

export default {
  slugify,
  createUniqueSlug,
  generateStudentDocName,
  generateCertificateNumber
};
