import { sequelize } from '../config/database.js';

// Import model definition functions
import UserModel from './user.js';
import StudentModel from './student.js';
import CourseModel from './course.js';
import StudentDocumentModel from './student-document.js';
import StudentEnrollmentModel from './student-enrollment.js';
import CertificateModel from './certificate.js';
import StudentPaymentModel from './student-payment.js';
import TransactionCategoryModel from './transaction-category.js';
import TransactionModel from './transaction.js';
import EnquiryModel from './enquiry.js';
import PageModel from './page.js';
import PageContentModel from './page-content.js';
import GalleryItemModel from './gallery-item.js';
import ReviewModel from './review.js';

// Initialize models
const User = UserModel(sequelize);
const Student = StudentModel(sequelize);
const Course = CourseModel(sequelize);
const StudentDocument = StudentDocumentModel(sequelize);
const StudentEnrollment = StudentEnrollmentModel(sequelize);
const Certificate = CertificateModel(sequelize);
const StudentPayment = StudentPaymentModel(sequelize);
const TransactionCategory = TransactionCategoryModel(sequelize);
const Transaction = TransactionModel(sequelize);
const Enquiry = EnquiryModel(sequelize);
const Page = PageModel(sequelize);
const PageContent = PageContentModel(sequelize);
const GalleryItem = GalleryItemModel(sequelize);
const Review = ReviewModel(sequelize);

// Create models object for associations
const models = {
  User,
  Student,
  Course,
  StudentDocument,
  StudentEnrollment,
  Certificate,
  StudentPayment,
  TransactionCategory,
  Transaction,
  Enquiry,
  Page,
  PageContent,
  GalleryItem,
  Review
};

// Setup associations
Object.keys(models).forEach(modelName => {
  if (models[modelName].associate) {
    models[modelName].associate(models);
  }
});

// Export individual models
export {
  User,
  Student,
  Course,
  StudentDocument,
  StudentEnrollment,
  Certificate,
  StudentPayment,
  TransactionCategory,
  Transaction,
  Enquiry,
  Page,
  PageContent,
  GalleryItem,
  Review,
  sequelize
};

// Export models object and sequelize instance
export default {
  ...models,
  sequelize
};
