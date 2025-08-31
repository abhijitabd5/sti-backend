import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const generateReceiptPDF = async (paymentData) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument();
      const fileName = `receipt-${paymentData.receiptNumber}-${Date.now()}.pdf`;
      const filePath = path.join(__dirname, '../../uploads/receipts/', fileName);
      
      // Ensure directory exists
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      // Header
      doc.fontSize(20).text('Earth Movers Training Academy', { align: 'center' });
      doc.fontSize(16).text('Payment Receipt', { align: 'center' });
      doc.moveDown();

      // Receipt details
      doc.fontSize(12);
      doc.text(`Receipt Number: ${paymentData.receiptNumber}`, { align: 'left' });
      doc.text(`Date: ${new Date(paymentData.paymentDate).toLocaleDateString()}`, { align: 'right' });
      doc.moveDown();

      // Student details
      doc.text('Student Details:', { underline: true });
      doc.text(`Name: ${paymentData.student.name}`);
      doc.text(`Student ID: ${paymentData.student.studentId}`);
      doc.text(`Course: ${paymentData.course.title}`);
      doc.moveDown();

      // Payment details
      doc.text('Payment Details:', { underline: true });
      doc.text(`Amount Paid: ₹${paymentData.amount}`);
      doc.text(`Payment Method: ${paymentData.paymentMethod}`);
      if (paymentData.discount > 0) {
        doc.text(`Discount Applied: ₹${paymentData.discount}`);
      }
      doc.text(`Description: ${paymentData.description || 'Course Fee Payment'}`);
      doc.moveDown();

      // Footer
      doc.text('Thank you for your payment!', { align: 'center' });
      doc.text('Earth Movers Training Academy', { align: 'center' });

      doc.end();

      stream.on('finish', () => {
        resolve({ fileName, filePath });
      });

      stream.on('error', (err) => {
        reject(err);
      });

    } catch (error) {
      reject(error);
    }
  });
};

export const generateCertificatePDF = async (certificateData) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', layout: 'landscape' });
      const fileName = `certificate-${certificateData.certificateNumber}-${Date.now()}.pdf`;
      const filePath = path.join(__dirname, '../../uploads/certificates/', fileName);
      
      // Ensure directory exists
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      // Certificate border
      doc.rect(50, 50, doc.page.width - 100, doc.page.height - 100).stroke();
      doc.rect(60, 60, doc.page.width - 120, doc.page.height - 120).stroke();

      // Header
      doc.fontSize(24).text('Earth Movers Training Academy', { align: 'center' });
      doc.moveDown();
      doc.fontSize(18).text('Certificate of Completion', { align: 'center' });
      doc.moveDown(2);

      // Certificate content
      doc.fontSize(14).text('This is to certify that', { align: 'center' });
      doc.moveDown();
      doc.fontSize(20).text(certificateData.student.name, { align: 'center', underline: true });
      doc.moveDown();
      doc.fontSize(14).text('has successfully completed the course', { align: 'center' });
      doc.moveDown();
      doc.fontSize(18).text(certificateData.course.title, { align: 'center', underline: true });
      doc.moveDown();
      doc.fontSize(12).text(`Duration: ${certificateData.course.duration}`, { align: 'center' });
      doc.moveDown(2);

      // Issue details
      doc.fontSize(12);
      doc.text(`Certificate Number: ${certificateData.certificateNumber}`, { align: 'left' });
      doc.text(`Issue Date: ${new Date(certificateData.issueDate).toLocaleDateString()}`, { align: 'right' });
      doc.moveDown(2);

      // Signature area
      doc.text('_________________________', 100, doc.page.height - 150);
      doc.text('Authorized Signature', 100, doc.page.height - 130);
      
      doc.text('_________________________', doc.page.width - 250, doc.page.height - 150);
      doc.text('Director', doc.page.width - 250, doc.page.height - 130);

      doc.end();

      stream.on('finish', () => {
        resolve({ fileName, filePath });
      });

      stream.on('error', (err) => {
        reject(err);
      });

    } catch (error) {
      reject(error);
    }
  });
};

export const generateStudentReportPDF = async (students, filters = {}) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument();
      const fileName = `student-report-${Date.now()}.pdf`;
      const filePath = path.join(__dirname, '../../uploads/reports/', fileName);
      
      // Ensure directory exists
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      // Header
      doc.fontSize(20).text('Earth Movers Training Academy', { align: 'center' });
      doc.fontSize(16).text('Student Report', { align: 'center' });
      doc.moveDown();

      // Filters applied
      if (Object.keys(filters).length > 0) {
        doc.fontSize(12).text('Filters Applied:', { underline: true });
        Object.entries(filters).forEach(([key, value]) => {
          if (value) {
            doc.text(`${key}: ${value}`);
          }
        });
        doc.moveDown();
      }

      // Student list
      doc.fontSize(12).text(`Total Students: ${students.length}`, { underline: true });
      doc.moveDown();

      students.forEach((student, index) => {
        doc.text(`${index + 1}. ${student.name} (${student.studentId}) - ${student.course ? student.course.title : 'No Course'}`);
        doc.text(`   State: ${student.state}, Status: ${student.status}`);
        doc.moveDown(0.5);
      });

      doc.end();

      stream.on('finish', () => {
        resolve({ fileName, filePath });
      });

      stream.on('error', (err) => {
        reject(err);
      });

    } catch (error) {
      reject(error);
    }
  });
};

export default {
  generateReceiptPDF,
  generateCertificatePDF,
  generateStudentReportPDF
};
