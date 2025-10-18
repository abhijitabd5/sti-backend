
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
3. `courses`  
4. `student_enrollments`  
5. `transaction_categories`  
6. `transactions`  
7. `student_payments`  
8. `student_documents`  
9. `enquiries`  
10. `pages`  
11. `page_contents`  
12. `gallery_items`  
13. `reviews`
14. `certificates`  

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
- created_by
- updated_by (JSON, default [])
- is_deleted (boolean, default false)
- deleted_by
- createdAt
- updatedAt
- deletedAt

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
- user_id (FK to users.id, unique, not null)
- student_code (unique, not null)
- name_on_id (not null)
- father_name (nullable)
- mother_name (nullable)
- date_of_birth (date only, not null)
- gender (not null)
- address (text, not null)
- state (not null)
- city (not null)
- pincode (not null)
- enrollment_date (date only, not null)
- aadhar_number (not null)
- pan_number (nullable)
- login_enabled (boolean, default true)
- last_login_at (timestamp, nullable)
- created_by
- updated_by (JSON, default [])
- is_deleted (boolean, default false)
- deleted_by
- createdAt
- updatedAt
- deletedAt

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

## 3) courses
- id (PK)
- course_group_id (not null)
- title (not null)
- slug (unique, not null)
- language (enum: en, hi, mar) (default en)
- summary (text, not null)
- description (long text, not null)
- duration (in hours or days, integer, not null)
- syllabus_text (text, nullable)
- syllabus_file_path (nullable)

- base_course_fee (decimal, not null)
- is_discounted (boolean, default true)
- discount_percentage (decimal, default 0.0)
- discount_amount (decimal, default 0.0)
- discounted_course_fee (decimal, not null)
- hostel_available (boolean, default false)
- hostel_fee (decimal, default 0.0)
- mess_available (boolean, default false)
- mess_fee (decimal, default 0.0)
- total_fee (decimal, not null)

- show_offer_badge (boolean, default false)
- offer_badge_text (nullable)
- thumbnail (nullable)
- is_active (boolean, default true)
- display_order (integer, default 0)

- created_by
- updated_by (JSON, default [])
- is_deleted (boolean, default false)
- deleted_by
- createdAt
- updatedAt
- deletedAt

**Associations**
- `Course.hasMany(StudentEnrollment, { foreignKey: 'course_id', as: 'enrollments' })`
- `Course.hasMany(Certificate, { foreignKey: 'course_id', as: 'certificates' })`
- `Course.hasMany(Payment, { foreignKey: 'course_id', as: 'payments' })`

**Hooks**
- `beforeCreate` → set `created_by`.
- `beforeUpdate` → append to `updated_by`.
- `beforeDestroy` → set `is_deleted` and `deleted_by`.

---

## 4) student_enrollments
- id (PK)
- student_id (FK to students.id, not null)
- course_id (FK to courses.id, not null)
- status (enum: not_started, ongoing, completed, aborted, expelled) (default not_started)
- enrollment_date (date only, not null)
- completion_date (date only, nullable)

- base_course_fee (decimal, not null)
- course_discount_amount (decimal, default 0)
- course_discount_percentage (decimal, default 0)
- discounted_course_fee (decimal, not null)

- is_hostel_opted (boolean, default false)
- hostel_fee (decimal, default 0)
- is_mess_opted (boolean, default false)
- mess_fee (decimal, default 0)

- pre_tax_total_fee (decimal, default 0)

- extra_discount_amount (decimal, default 0)

- taxable_amount (decimal, default 0)
- sgst_percentage (decimal, nullable)
- cgst_percentage (decimal, nullable)
- sgst_amount (decimal, default 0)
- cgst_amount (decimal, default 0)
- igst_applicable(boolean, default false)
- igst_percentage (decimal, nullable)
- igst_amount (decimal, default 0)
- total_tax_amount (decimal, default 0)

- total_payable_fee (decimal, not null)
- paid_amount (decimal, default 0)
- due_amount (decimal, not null)

- remark (text, nullable)

- created_by (nullable)
- updated_by (JSON, default [])
- is_deleted (boolean, default false)
- deleted_by (nullable)
- createdAt
- updatedAt
- deletedAt

**Associations**
- `StudentEnrollment.belongsTo(Student, { foreignKey: 'student_id', as: 'student' })`
- `StudentEnrollment.belongsTo(Course, { foreignKey: 'course_id', as: 'course' })`

**Hooks**
- `beforeCreate` → set `created_by`.
- `beforeUpdate` → append to `updated_by`.
- `beforeDestroy` → set `is_deleted` and `deleted_by`.

---

## 5) transaction_categories
- id (PK)
- name (unique, not null)
- slug (unique, not null)
- type (enum: income, expense, not null)
- is_active (boolean, default true)
- display_order (integer, default 0)

- created_by (nullable)
- updated_by (JSON, default [])
- is_deleted (boolean, default false)
- deleted_by (nullable)
- createdAt
- updatedAt
- deletedAt

**Associations**
- `TransactionCategory.hasMany(Transaction, { foreignKey: 'category_id', as: 'transactions' })`

**Hooks**
- `beforeCreate` → set `created_by`.
- `beforeUpdate` → append to `updated_by`.
- `beforeDestroy` → set `is_deleted` and `deleted_by`.
- **Business rule (migration/model-level suggestion):** Prevent deletion if linked transactions exist; implement in service layer or in `beforeDestroy` by checking related transactions.

---

## 6) transactions
- id (PK)
- type (enum: income, expense, not null)
- category_id (FK to transaction_categories.id)
- student_id (FK to students.id)
- expense_for_user (FK to users.id)
- course_id (FK to courses.id)
- enrollment_id (FK to student_enrollments.id)
- amount (decimal, not null)
- transaction_date (date only, not null)

- payment_mode (enum: cash, cheque, upi, bank_transfer, card, net_banking, payment_gateway, not null)
- description (text)

- payment_ref_num (nullable)
- payment_ref_type (enum: receipt, transaction, cheque, invoice, other, default other)

- payer_name (nullable)
- payer_contact (nullable)
- payer_bank_name (nullable)
- payer_account_number (nullable)
- payer_upi_id (nullable)

- payee_name (nullable)
- payee_contact (nullable)
- payee_bank_name (nullable)
- payee_account_number (nullable)
- payee_upi_id (nullable)

- attachment_type (enum: invoice, receipt, proof, other, default other)
- attachment_path (nullable)
- reference_note (text)

- created_by (nullable)
- updated_by (JSON, default [])
- is_deleted (boolean, default false)
- deleted_by (nullable)
- createdAt
- updatedAt
- deletedAt

**Associations**
- `Transaction.belongsTo(TransactionCategory, { foreignKey: 'category_id', as: 'category' })`
- `Transaction.belongsTo(User, { foreignKey: 'expense_by', as: 'payer' })`

**Hooks**
- `beforeCreate` → set `created_by`.
- `beforeUpdate` → append to `updated_by`.
- `beforeDestroy` → set `is_deleted` and `deleted_by`.

---

## 7) student_payments
- id (PK)
- student_id (FK to students.id, not null)
- course_id (FK to courses.id, not null)
- enrollment_id (FK to student_enrollments.id, not null)
- type (enum: course_fee, accommodation_fee, penalty, miscellaneous)
- amount (decimal, not null)
- payment_date (date only, not null)
- payment_method (enum: cash, cheque, upi, bank_transfer, card, net_banking, payment_gateway, not null)
- previous_due_amount (decimal, nullable)
- remaining_due_amount (decimal, nullable)

- created_by (nullable)
- updated_by (JSON, default [])
- is_deleted (boolean, default false)
- deleted_by (nullable)
- createdAt
- updatedAt
- deletedAt

---

## 8) student_documents
- id (PK)
- student_id (FK to students.id, not null)
- slug (enum: aadhaar, pan, ssc, hsc, diploma, graduation, post_grad, school_leaving, birth_certificate, caste_certificate, income_certificate, disability_certificate, photo, signature, not null)
- file_path (string, not null)
- file_name (string, not null)
- is_verified (boolean default false)
- uploaded_at (timestamp, default now)
- created_by
- updated_by (JSON, default [])
- is_deleted (boolean, default false)
- deleted_by
- createdAt
- updatedAt
- deletedAt

----

## 9) enquiries
- id (PK)
- name (string, not null)
- email (string, nullable)
- phone (string, not null)
- course_id (FK to courses.id, nullable)
- message (text, not null)
- status (enum: unread, read, action_taken, default unread)
- is_action_taken (boolean, default false)
- action_type (enum: call, whatsapp, email, text_message, visit, nullable)
- remark (text, nullable)

- created_by
- updated_by (JSON)
- is_deleted (boolean, default false)
- deleted_by
- createdAt
- updatedAt
- deletedAt

---

**Hooks**
- `beforeCreate` → set `created_by`.
- `beforeUpdate` → append to `updated_by`.
- `beforeDestroy` → set `is_deleted` and `deleted_by`.

---

## 10) pages
- id (PK)
- name (string, not null)
- slug (string, unique, not null)
- language (enum: en, hi, mar, not null)
- page_title (string, nullable)
- meta_title (string, nullable)
- meta_description (string, nullable)
- meta_keywords (string, nullable)

- created_by
- updated_by (JSON)
- is_deleted (boolean, default false)
- deleted_by
- createdAt
- updatedAt
- deletedAt

---

**Associations**
- `Page.hasMany(PageContent, { foreignKey: 'page_id', as: 'contents' })`

**Hooks**
- `beforeCreate` → set `created_by`.
- `beforeUpdate` → append to `updated_by`.
- `beforeDestroy` → set `is_deleted` and `deleted_by`.

---

## 11) page_contents
- id (PK)
- page_id (integer, not null)
- page_name (string, not null)
- section_key (string, not null)
- section_name (string, not null)
- language (enum: en, hi, mar, not null)
- title (string, nullable)
- subtitle (string, nullable)
- content (text, not null)

- created_by
- updated_by (JSON)
- is_deleted (boolean, default false)
- deleted_by
- createdAt
- updatedAt
- deletedAt

---

**Associations**
- `PageContent.belongsTo(Page, { foreignKey: 'page_id', as: 'page' })`

**Hooks**
- `beforeCreate` → set `created_by`.
- `beforeUpdate` → append to `updated_by`.
- `beforeDestroy` → set `is_deleted` and `deleted_by`.

---

## 12) gallery_items
- id (PK)
- media_type (enum: photo, video, not null)
- caption (string, nullable)
- title (string, nullable)
- slug (string, unique, not null)
- page_slug (string, refrences slug of pages table)
- is_media_remote (boolean, default false)
- media_path (string, nullable)
- is_thumbnail_remote (boolean, default false)
- thumbnail_path (string, nullable)
- display_order (integer, not null, default 0)
- created_by (integer, not null)
- updated_by (JSON)
- is_deleted (boolean, default false)
- deleted_by (integer)
- createdAt (date, not null)
- updatedAt (date, not null)
- deletedAt (date)

---

**Hooks**
- `beforeUpdate` → append to `updated_by`.
- `beforeDestroy` → set `is_deleted` and `deleted_by`.

---

## 13) reviews
- id (PK, auto-increment integer)
- student_id (integer, references students(id), nullable)
- phone (string, nullable)
- review_text (text, not null)
- rating (integer, not null)
- is_approved (boolean, default false)
- is_enrolled_student (boolean, default false)
- display_order (integer, default 0)
- qr_code_url (string, not null)
- created_by (integer, not null)
- updated_by (JSON)
- is_deleted (boolean, default false)
- deleted_by (integer, nullable)
- createdAt (date, not null)
- updatedAt (date, not null)
- deletedAt (date, nullable)

**Associations**
- `StudentReview.belongsTo(Student, { foreignKey: 'student_id', as: 'student' })`

**Hooks**
- `beforeUpdate` → append to `updated_by`.
- `beforeDestroy` → set `is_deleted` and `deleted_by`.

---

## 14) certificates
- id (PK, auto-increment integer)
- certificate_number (string, unique, not null)
- student_id (integer, not null, references students(id))
- course_id (integer, not null, references courses(id))
- enrollment_id (integer, not null, references student_enrollments(id))
- issue_date (date only, not null)
- file_path (string, not null)
- hard_copy_delivered (boolean, default false)
- delivery_address (string, nullable)
- status (enum: "valid", "revoked", "expired", default "valid")
- created_by (integer, nullable)
- updated_by (JSON, default empty array)
- is_deleted (boolean, default false)
- deleted_by (integer, nullable)
- createdAt (datetime, not null)
- updatedAt (datetime, not null)
- deletedAt (datetime, nullable)

# End of schema reference

If you'd like:
- I can **add FK constraints** and `ON DELETE`/`ON UPDATE` rules explicitly into the migration snippets for each table (recommended for integrity).  
- Or produce a **compact CSV** of tables & columns, or generate an **ERD SVG**.

---

