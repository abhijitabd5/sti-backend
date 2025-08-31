
# Earth Movers Training Academy — Database Schema Reference

**Generated:** 2025-08-18  
**Scope:** All tables defined so far for the project. This file documents table names, columns, datatypes, constraints, relations and the Sequelize hooks implemented for audit behavior.

---

## Conventions & Notes (global)
- All models use **`timestamps: true`** and **`paranoid: true`**.  
  Sequelize will maintain `createdAt`, `updatedAt`, and `deletedAt` automatically. These are **not** repeated below except where explicitly relevant.
- **Audit fields (present on most tables):**
  - `created_by` — INTEGER (user ID who created the row). Set by model `beforeCreate` hook from `options.currentUserId`.
  - `updated_by` — JSON (ARRAY of update entries). Each entry is an object:  
    ```json
    { "id": "<userId>", "timestamp": "2025-08-15T10:23:45Z" }
    ```  
    The `beforeUpdate` hook appends a new entry on every update (if `options.currentUserId` is provided).
  - `is_deleted` — BOOLEAN (soft-delete flag). Model `beforeDestroy` sets `true` before soft-deleting.
  - `deleted_by` — INTEGER (user ID who soft-deleted the row). Set by `beforeDestroy`.
  - NOTE: `deleted_at` is handled by Sequelize's `paranoid` option and corresponds to `deletedAt`.
- **Hook behaviour (standard across models):**
  - `beforeCreate(instance, options)`  
    → If `options.currentUserId` exists, set `instance.created_by = options.currentUserId`.
  - `beforeUpdate(instance, options)`  
    → If `options.currentUserId` exists, push `{ id: options.currentUserId, timestamp: new Date().toISOString() }` to `instance.updated_by` (array).
  - `beforeDestroy(instance, options)`  
    → If `options.currentUserId` exists, set `instance.is_deleted = true` and `instance.deleted_by = options.currentUserId`. With `paranoid: true` Sequelize will set `deletedAt`.
  - Controllers/services should pass `currentUserId` via `options` when calling `.create()`, `.update()` or `.destroy()` on models.
- **updated_by JSON format (example):**
  ```json
  [
    { "id": "124", "timestamp": "2025-08-15T10:23:45Z" },
    { "id": "125", "timestamp": "2025-08-15T10:25:00Z" }
  ]
  ```
- **Foreign keys:** Most migrations created integer FK columns. Some migrations explicitly set FK constraints (e.g. `student_reviews.student_id` references `students.id` with `ON DELETE SET NULL`). Where FK constraints are required you can add them in migrations (the models contain `associate()` definitions).

---

## Table list (quick nav)
1. `users`  
2. `students`  
3. `student_documents`  
4. `courses`  
5. `student_enrollments`  
6. `certificates`  
7. `payments`  
8. `transaction_categories`  
9. `transactions`  
10. `enquiries`  
11. `pages`  
12. `page_contents`  
13. `gallery_photos`  
14. `gallery_videos`  
15. `student_reviews`

---

---

## 1) users
- id (PK)
- first_name
- last_name
- mobile (unique)
- email (nullable)
- password (hashed with bcrypt)
- role (enum: super_admin, admin, account, seo, employee, trainer, warden, student, marketing) (default student)
- profile_image (nullable)
- is_active (boolean, default true)
- last_login_at (timestamp, nullable)
- created_by, updated_by, is_deleted, deleted_by, deleted_at
> (Students will have a separate table linked to users for student-specific info)

**Associations**
- `User.hasOne(Student, { foreignKey: 'user_id', as: 'student' })`

**Hooks**
- `beforeCreate` → set `created_by` from `options.currentUserId` if present.
- `beforeUpdate` → append to `updated_by` array with `{id, timestamp}`.
- `beforeDestroy` → set `is_deleted = true` and `deleted_by` from `options.currentUserId`.

---

## 2) students
- id (PK)
- user_id (FK → users.id, unique)
- student_id (unique, formatted string like STI202500001)
- name_on_id
- date_of_birth
- gender
- address
- state
- city
- pincode
- enrollment_date
- aadhar_number
- pan_number (nullable)
- login_enabled (boolean)
- created_by, updated_by, is_deleted, deleted_by, deleted_at

**Associations**
- `Student.belongsTo(User, { foreignKey: 'user_id', as: 'user' })`
- `Student.hasMany(StudentDocument, { foreignKey: 'student_id', as: 'documents' })`
- `Student.hasMany(StudentEnrollment, { foreignKey: 'student_id', as: 'enrollments' })`
- `Student.hasMany(Payment, { foreignKey: 'student_id', as: 'payments' })`
- `Student.hasMany(Certificate, { foreignKey: 'student_id', as: 'certificates' })`

**Hooks**
- `beforeCreate` → set `created_by`.
- `beforeUpdate` → append to `updated_by`.
- `beforeDestroy` → set `is_deleted` and `deleted_by`.

---

## 3) student_documents
- id (PK)
- student_id (FK → students.id)
- slug (Enum `['aadhaar','pan','ssc','hsc','diploma','graduation','post_grad','school_leaving','birth_certificate','caste_certificate','income_certificate','disability_certificate','photo','signature']` )
- file_path
- file_name
- uploaded_at
- created_by, updated_by, is_deleted, deleted_by, deleted_at

**Associations**
- `StudentDocument.belongsTo(Student, { foreignKey: 'student_id', as: 'student' })`

**Hooks**
- `beforeCreate` → set `created_by`.
- `beforeUpdate` → append to `updated_by`.
- `beforeDestroy` → set `is_deleted` and `deleted_by`.

---

## 4) courses
- id (PK)
- course_group_id
- title
- slug (unique, from title)
- language (enum : 'en','hi','mar')
- summary (text)
- description (longtext)
- duration (integer)
- syllabus_text (text)
- syllabus_file_path (file_path for PDF)
- original_fee
- is_discounted(boolean)
- discounted_fee
- discount_percentage
- show_offer_badge (boolean)
- offer_badge_text
- thumbnail (file_path)
- is_active(boolean)
- display_order (int)
- created_by, updated_by, is_deleted, deleted_by, deleted_at

**Associations**
- `Course.hasMany(StudentEnrollment, { foreignKey: 'course_id', as: 'enrollments' })`
- `Course.hasMany(Certificate, { foreignKey: 'course_id', as: 'certificates' })`
- `Course.hasMany(Payment, { foreignKey: 'course_id', as: 'payments' })`

**Hooks**
- `beforeCreate` → set `created_by`.
- `beforeUpdate` → append to `updated_by`.
- `beforeDestroy` → set `is_deleted` and `deleted_by`.

---

## 5) student_enrollments
- id (PK)
- student_id (FK → students.id)
- course_id (FK → courses.id)
- status (enum: not_started, ongoing, completed, aborted)
- enrollment_date
- completion_date (nullable)
- base_course_fee (decimal)
- course_discount_amount (decimal, default 0)
- course_discount_percentage (decimal, default 0)
- is_hostel_opted (boolean, default false)
- is_mess_opted (boolean, default false)
- hostel_fee (decimal, nullable)
- mess_fee (decimal)
- accommodation_discount_amount (decimal, default 0)
- accommodation_discount_percentage (decimal, default 0)
- accommodation_total_amount (decimal, default 0)
- pre_tax_total_fee (decimal, default 0) — *Discounted course fee inclusive of accommodation*
- extra_discount_amount (decimal, default 0) — *Additional exception discount, applied before tax*
- taxable_amount (decimal, default 0) — *Discounted course fee exclusive of non-taxable accommodation fees*
- sgst_percentage (decimal)
- cgst_percentage (decimal)
- sgst_amount (decimal, default 0)
- cgst_amount (decimal, default 0)
- total_payable_fee (decimal)
- paid_amount (decimal, default 0)
- due_amount (decimal)
- remark (text)
- created_by, updated_by, is_deleted, deleted_by, deleted_at

**Associations**
- `StudentEnrollment.belongsTo(Student, { foreignKey: 'student_id', as: 'student' })`
- `StudentEnrollment.belongsTo(Course, { foreignKey: 'course_id', as: 'course' })`

**Hooks**
- `beforeCreate` → set `created_by`.
- `beforeUpdate` → append to `updated_by`.
- `beforeDestroy` → set `is_deleted` and `deleted_by`.

---

## 6) certificates
- id (PK)
- certificate_number (unique)
- student_id (FK → students.id)
- course_id (FK → courses.id)
- issue_date
- file_path (soft copy PDF)
- status (enum: valid, revoked, expired)
- created_by, updated_by, is_deleted, deleted_by, deleted_at

**Associations**
- `Certificate.belongsTo(Student, { foreignKey: 'student_id', as: 'student' })`
- `Certificate.belongsTo(Course, { foreignKey: 'course_id', as: 'course' })`

**Hooks**
- `beforeCreate` → set `created_by`.
- `beforeUpdate` → append to `updated_by`.
- `beforeDestroy` → set `is_deleted` and `deleted_by`.

---

## 7) payments
- id (PK)
- student_id (FK → students.id)
- course_id (FK → courses.id, nullable if general payment)
- amount
- discount_amount (if applicable)
- net_amount
- payment_date
- payment_method (cash, bank_transfer, cheque, UPI, etc.)
- description
- receipt_number (unique, auto-generated)
- created_by, updated_by, is_deleted, deleted_by, deleted_at

**Associations**
- `Payment.belongsTo(Student, { foreignKey: 'student_id', as: 'student' })`
- `Payment.belongsTo(Course, { foreignKey: 'course_id', as: 'course' })`

**Hooks**
- `beforeCreate` → set `created_by`.
- `beforeUpdate` → append to `updated_by`.
- `beforeDestroy` → set `is_deleted` and `deleted_by`.

---

## 8) transaction_categories
- id (PK)
- name (unique)
- slug (unique)
- type ENUM('income','expense')
- is_active BOOLEAN DEFAULT true
- display_order INT NULL
- created_by, updated_by, is_deleted, deleted_by, deleted_at

**Associations**
- `TransactionCategory.hasMany(Transaction, { foreignKey: 'category_id', as: 'transactions' })`

**Hooks**
- `beforeCreate` → set `created_by`.
- `beforeUpdate` → append to `updated_by`.
- `beforeDestroy` → set `is_deleted` and `deleted_by`.
- **Business rule (migration/model-level suggestion):** Prevent deletion if linked transactions exist; implement in service layer or in `beforeDestroy` by checking related transactions.

---

## 9) transactions

- id (PK)
- type ENUM('income','expense')

- category_id (FK → transaction_categories.id)
- student_id (nullable, FK → students.id)   -- only for student payments
- expense_for_user (nullable, FK → users.id)
- course_id (nullable, FK → courses.id)
- enrollment_id (nullable, FK → student_enrollments.id)

- amount DECIMAL
- transaction_date DATE

- payment_mode ENUM('cash','cheque','upi','bank_transfer','card','online')
- description TEXT

<!-- Payment identifiers -->
- payment_ref_num (nullable)
- payment_ref_type ENUM('receipt', 'transaction', 'cheque', 'invoice', 'other')

 <!-- Payer (for income, e.g. student) -->
- payer_name STRING (nullable)
- payer_contact STRING (nullable)
- payer_bank_name STRING (nullable)
- payer_account_number STRING (nullable)
- payer_upi_id STRING (nullable)

 <!-- Payee (for expense, e.g. vendor/staff) -->
- payee_name STRING (nullable)
- payee_contact STRING (nullable)
- payee_bank_name STRING (nullable)
- payee_account_number STRING (nullable)
- payee_upi_id STRING (nullable)

 <!-- Attachments -->
- attachment_path STRING NULL,
- attachment_type ENUM('invoice','receipt','proof','other') DEFAULT 'invoice'

- reference_note TEXT (nullable)

<!-- Audit -->
- created_by, updated_by, is_deleted, deleted_by, deleted_at

---

**Associations**
- `Transaction.belongsTo(TransactionCategory, { foreignKey: 'category_id', as: 'category' })`
- `Transaction.belongsTo(User, { foreignKey: 'expense_by', as: 'payer' })`

**Hooks**
- `beforeCreate` → set `created_by`.
- `beforeUpdate` → append to `updated_by`.
- `beforeDestroy` → set `is_deleted` and `deleted_by`.

---

## 10) enquiries
- id (PK)
- name
- email (nullable)
- phone
- message (text)
- status (enum: unread, read, action_taken)
- is_action_taken (boolean)
- action_type ENUM('call', 'whatsapp', 'email', 'text_message','visit') (nullable)
- remark (text, nullable)
- created_by, updated_by, is_deleted, deleted_by, deleted_at, created_at, updated_at

---

**Hooks**
- `beforeCreate` → set `created_by`.
- `beforeUpdate` → append to `updated_by`.
- `beforeDestroy` → set `is_deleted` and `deleted_by`.

---

## 11) pages
- id (PK)
- page_name
- slug (unique)
- language (enum: 'en', 'hi', 'mar')
- meta_title
- meta_description
- meta_keywords
- created_by, updated_by, is_deleted, deleted_by, deleted_at

---

**Associations**
- `Page.hasMany(PageContent, { foreignKey: 'page_id', as: 'contents' })`

**Hooks**
- `beforeCreate` → set `created_by`.
- `beforeUpdate` → append to `updated_by`.
- `beforeDestroy` → set `is_deleted` and `deleted_by`.

---

## 12) page_contents
- id (PK)
- page_id (FK → pages.id)
- section_key (string)
- language (enum: 'en', 'hi', 'mar')
- title (string, nullable)
- subtitle (string, nullable)
- content (longtext)
- created_by, updated_by, is_deleted, deleted_by, deleted_at

---

**Associations**
- `PageContent.belongsTo(Page, { foreignKey: 'page_id', as: 'page' })`

**Hooks**
- `beforeCreate` → set `created_by`.
- `beforeUpdate` → append to `updated_by`.
- `beforeDestroy` → set `is_deleted` and `deleted_by`.

---

## 13) gallery_photos
- id (PK)
- caption
- slug
- image_path
- display_order
- created_by, updated_by, is_deleted, deleted_by, deleted_at

---

**Hooks**
- `beforeUpdate` → append to `updated_by`.
- `beforeDestroy` → set `is_deleted` and `deleted_by`.

---

## 14) gallery_videos
- id (PK)
- title
- video_url (YouTube/Facebook)
- thumbnail (optional)
- slug
- display_order
- created_by, updated_by, is_deleted, deleted_by, deleted_at

---

**Hooks**
- `beforeUpdate` → append to `updated_by`.
- `beforeDestroy` → set `is_deleted` and `deleted_by`.

---

## 15) student_reviews
- id (PK)
- student_id (FK → students.id, nullable if anonymous)
- phone (nullable)
- review_text (text)
- rating (int 1–5)
- is_approved (boolean)
- display_order
- qr_code_url
- created_by, updated_by, is_deleted, deleted_by, deleted_at

**Associations**
- `StudentReview.belongsTo(Student, { foreignKey: 'student_id', as: 'student' })`

**Hooks**
- `beforeUpdate` → append to `updated_by`.
- `beforeDestroy` → set `is_deleted` and `deleted_by`.

---

# End of schema reference

If you'd like:
- I can **add FK constraints** and `ON DELETE`/`ON UPDATE` rules explicitly into the migration snippets for each table (recommended for integrity).  
- Or produce a **compact CSV** of tables & columns, or generate an **ERD SVG**.

---

