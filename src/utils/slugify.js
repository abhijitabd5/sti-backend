import slugifyPackage from 'slugify';
import { Op } from 'sequelize';

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

export const generateStudentId = (name, enrollmentYear) => {
  const year = enrollmentYear.toString().slice(-2);
  const nameSlug = slugify(name.substring(0, 3));
  const timestamp = Date.now().toString().slice(-4);
  
  return `EMA${year}${nameSlug.toUpperCase()}${timestamp}`;
};

export const generateCertificateNumber = (studentId, courseCode) => {
  const year = new Date().getFullYear().toString().slice(-2);
  const month = (new Date().getMonth() + 1).toString().padStart(2, '0');
  const timestamp = Date.now().toString().slice(-6);
  
  return `EMA-CERT-${year}${month}-${courseCode}-${studentId}-${timestamp}`;
};

export default {
  slugify,
  createUniqueSlug,
  generateStudentId,
  generateCertificateNumber
};
