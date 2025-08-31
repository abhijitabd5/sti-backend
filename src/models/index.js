import { sequelize } from '../config/database.js';

// Import model definition functions
import UserModel from './user.js';
import StudentModel from './student.js';
import CourseModel from './course.js';
import StudentDocumentModel from './studentdocument.js';
import StudentEnrollmentModel from './studentenrollment.js';
import CertificateModel from './certificate.js';
import PaymentModel from './payment.js';
import TransactionCategoryModel from './transactioncategory.js';
import TransactionModel from './transaction.js';
import EnquiryModel from './enquiry.js';
import PageModel from './page.js';
import PageContentModel from './pagecontent.js';
import GalleryPhotoModel from './galleryphoto.js';
import GalleryVideoModel from './galleryvideo.js';
import StudentReviewModel from './studentreview.js';

// Initialize models
const User = UserModel(sequelize);
const Student = StudentModel(sequelize);
const Course = CourseModel(sequelize);
const StudentDocument = StudentDocumentModel(sequelize);
const StudentEnrollment = StudentEnrollmentModel(sequelize);
const Certificate = CertificateModel(sequelize);
const Payment = PaymentModel(sequelize);
const TransactionCategory = TransactionCategoryModel(sequelize);
const Transaction = TransactionModel(sequelize);
const Enquiry = EnquiryModel(sequelize);
const Page = PageModel(sequelize);
const PageContent = PageContentModel(sequelize);
const GalleryPhoto = GalleryPhotoModel(sequelize);
const GalleryVideo = GalleryVideoModel(sequelize);
const StudentReview = StudentReviewModel(sequelize);

// Create models object for associations
const models = {
  User,
  Student,
  Course,
  StudentDocument,
  StudentEnrollment,
  Certificate,
  Payment,
  TransactionCategory,
  Transaction,
  Enquiry,
  Page,
  PageContent,
  GalleryPhoto,
  GalleryVideo,
  StudentReview
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
  Payment,
  TransactionCategory,
  Transaction,
  Enquiry,
  Page,
  PageContent,
  GalleryPhoto,
  GalleryVideo,
  StudentReview,
  sequelize
};

// Export models object and sequelize instance
export default {
  ...models,
  sequelize
};
