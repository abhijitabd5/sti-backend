# Earth Movers Training Academy - Backend API

**Project Type:** Training Academy Management System  
**Architecture:** MVC + Service + Repository Pattern  
**Version:** 1.0.0  
**Node.js:** ES6+ with Express.js

---

## 📖 Project Introduction

Earth Movers Training Academy Backend is a comprehensive API system designed to manage a training academy for heavy machinery operators. The system handles student enrollment, course management, certificates, transactions, and content management with a robust role-based access control system.

### **Core Features:**
- 🎓 **Course Management** - Create, manage, and display training courses
- 👥 **Student Management** - Handle student enrollment and tracking
- 📜 **Certificate Generation** - Issue and verify certificates
- 💼 **Transaction Tracking** - Monitor academy expenses/income
- 🌐 **CMS System** - Manage website content
- 🔐 **Authentication** - JWT-based auth with role permissions
- 📊 **Dashboard Analytics** - Business insights and reports

---

## 🛠️ Technology Stack

### **Backend Technologies:**
- **Node.js** (v18+) - JavaScript runtime
- **Express.js** (v4.19+) - Web application framework
- **Sequelize ORM** (v6.37+) - Database ORM with MySQL
- **MySQL** (v8.0+) - Primary database
- **Redis** (v4.7+) - Caching (optional via .env)
- **JWT** - Authentication tokens
- **bcrypt** - Password hashing
- **Multer** (v2.0+) - File uploads
- **Winston** - Logging
- **Joi** - Data validation

### **Development Tools:**
- **Nodemon** - Development server
- **ESLint** - Code linting (if configured)
- **Sequelize CLI** - Database migrations and seeders

---

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/              # Configuration files
│   │   ├── database.js      # Sequelize database config
│   │   ├── redis.js         # Redis connection config
│   │   └── logger.js        # Winston logger config
│   │
│   ├── constants/           # Application constants
│   │   ├── config.js        # App configuration constants
│   │   ├── messages.js      # Success/error messages
│   │   └── roles.js         # User roles and permissions
│   │
│   ├── controllers/         # HTTP request/response handlers
│   │   ├── auth/            # Authentication controllers
│   │   │   └── authController.js
│   │   ├── internal/        # Staff/admin controllers
│   │   │   └── courseController.js
│   │   ├── student/         # Student portal controllers
│   │   └── website/         # Public website controllers
│   │       └── webCourseController.js
│   │
│   ├── middlewares/         # Express middlewares
│   │   ├── authMiddleware.js    # JWT authentication
│   │   ├── roleMiddleware.js    # Role-based access control
│   │   ├── errorHandler.js      # Global error handling
│   │   └── validateRequest.js   # Request validation
│   │
│   ├── migrations/          # Database migrations
│   │
│   ├── models/              # Sequelize data models
│   │   └── user.js          # User model
│   │
│   ├── repositories/            # Data access layer
│   │   ├── AuthRepository.js    # Authentication data access
│   │   └── CourseRepository.js  # Course data access
│   │
│   ├── routes/
│   │   ├── index.js
│   │   ├── authRoutes.js        # Authentication routes
│   │   ├── internalRoutes.js    # Internal management routes
│   │   ├── studentRoutes.js     # Student portal routes
│   │   └── websiteRoutes.js     # Public website routes
│   │
│   ├── seeders/             # Database seeders
│   │
│   ├── services/            # Business logic layer
│   │   ├── AuthService.js   # Authentication business logic
│   │   └── CourseService.js # Course business logic
│   │
│   ├── utils/                    # Utility functions
│   │   ├── bcrypt.js             # Password hashing utilities
│   │   ├── jwt.js                # JWT token utilities
│   │   ├── responseFormatter.js  # API response formatting
│   │   ├── customSlugify.js      # Custom slug generation
│   │   └── pdfGenerator.js       # PDF generation utilities
│   │
│   ├── validations/         # Request validation schemas
│   │
│   ├── app.js               # Express app configuration
│   └── server.js            # Application entry point
│
├── docs/
│   ├── schema.md
│   └── progress_log.md
│
├── uploads/                 # File upload directory
│   ├── courses/             # Course thumbnails and files
│   ├── gallery/             # Gallery images/videos
│   |       ├── images/
|   |       └── videos/ 
│   ├── certificates/        # Generated certificates
│   ├── receipts/
│   ├── invoices/
│   ├── students/           # Student files stored in dedicated folder
│   |        ├── 1/
|   |        └── [student-id]/
│   └── profiles/            # User profile images
│
├── .env                     # Environment variables
├── .gitignore              # Git ignore rules
├── package.json            # Dependencies and scripts
└── README.md               # This file
```

---

## ⚙️ Initial Setup & Installation

### **Prerequisites:**
- **Node.js** v18 or higher
- **MySQL** v8.0 or higher
- **Redis** (optional, can be disabled)

### **Installation Steps:**

1. **Clone the repository:**

git clone <repository-url>
cd jcb-training/backend

2. **Install dependencies:**

npm install

3. **Environment Configuration:**
Copy `.env.example` to `.env` and configure:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=sti_database
DB_USERNAME=root
DB_PASSWORD=your-mysql-password

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your-refresh-secret-key-here
JWT_REFRESH_EXPIRES_IN=30d

# Redis Configuration (IMPORTANT)
REDIS_ENABLED=false          # Set to 'true' to enable Redis caching
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=              # Leave empty if no password

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# File Upload Configuration
UPLOAD_PATH=uploads/
MAX_FILE_SIZE=10485760       # 10MB

# Security
BCRYPT_SALT_ROUNDS=12
```

4. **Database Setup:**
```bash
# Create database
npm run db:create

# Run migrations
npm run migrate

# Run seeders (optional)
npm run seed
```

5. **Start the server:**
```bash
# Development mode
npm run dev

# Production mode
npm start
```

### **Redis Management via Environment:**
Redis usage is **completely controlled via .env**:
- **`REDIS_ENABLED=false`** → Redis is disabled, no caching
- **`REDIS_ENABLED=true`** → Redis is enabled for caching

The server will gracefully handle Redis unavailability and continue operating without caching when disabled.

---

## 🏗️ Architecture & Code Constraints

### **ES6+ Standards:**
- **ES6 Modules:** `import/export` syntax throughout
- **Async/Await:** No callbacks or `.then()` chains
- **Arrow Functions:** Used for consistency
- **Template Literals:** For string interpolation
- **Destructuring:** For clean parameter handling

### **MVC + Service + Repository Pattern:**

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Controllers/  │ ──→│    Services/    │ ──→│  Repositories/  │ ──→│     Models/     │
│  (HTTP Layer)   │    │ (Business Logic)│    │ (Data Access)   │    │   (Database)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘    └─────────────────┘
```

### **Controller Pattern (Classes with Static Methods):**
```javascript
class CourseController {
  static async getAllCourses(req, res) {
    try {
      const result = await CourseService.getAllCourses(filters, req.user.id);
      return paginatedResponse(res, result.data, result.pagination, result.message);
    } catch (error) {
      return errorResponse(res, error.message, 500);
    }
  }
}
```

**Why Classes:**
- **Organization:** Groups related methods under one namespace
- **Static Methods:** No instantiation overhead, direct method calls
- **Consistency:** Matches Service and Repository layer patterns
- **Scalability:** Better structure as controllers grow
- **Modern ES6+:** Aligns with current JavaScript standards

### **Service Pattern (Classes with Instance Methods):**
```javascript
class CourseService {
  async getAllCourses(filters, currentUserId) {
    // Business logic, validation, data processing
    const result = await CourseRepository.findAll(filters);
    return { success: true, message: 'Success', data: result };
  }
}

export default new CourseService(); // Singleton pattern
```

### **Repository Pattern (Classes with Instance Methods):**
```javascript
class CourseRepository {
  async findAll(filters) {
    // Pure database operations using Sequelize
    return await Course.findAndCountAll({ where: conditions });
  }
}

export default new CourseRepository(); // Singleton pattern
```

---

## 🛣️ Route Structure & Middleware

### **Route Mounting (With Prefixes):**
```javascript
// src/routes/index.js
const router = express.Router();

router.use('/auth', authRoutes);        // /api/auth/login
router.use('/internal', internalRoutes); // /api/internal/courses  
router.use('/student', studentRoutes);   // /api/student/profile
router.use('/public', websiteRoutes);    // /api/public/courses
```

### **Internal Routes Pattern:**
```javascript
// src/routes/internalRoutes.js
import { authenticate } from '../middlewares/authMiddleware.js';
import { checkRoles } from '../middlewares/roleMiddleware.js';

const router = express.Router();

// Apply authentication to ALL internal routes
router.use(authenticate);

// Apply role-based access to specific route groups
router.use('/courses', checkRoles('admin', 'seo'));
router.get('/courses', CourseController.getAllCourses);
router.post('/courses', CourseController.createCourse);
```

### **Middleware Application Strategy:**
1. **Global Authentication:** Applied to all internal routes at router level
2. **Route-level Role Check:** Applied to specific endpoint groups
3. **Permission-based Access:** Using `requirePermissions()` for granular control

### **Role Middleware (Simplified):**
```javascript
// Only two essential functions kept
export const checkRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) return unauthorizedResponse(res, ERROR_MESSAGES.UNAUTHORIZED);
    if (!roles.includes(req.user.role)) return forbiddenResponse(res, ERROR_MESSAGES.FORBIDDEN);
    next();
  };
};

export const requirePermissions = (...requiredPermissions) => {
  // Granular permission checking logic
};
```

---

## 📝 Response Formatter System

### **Standardized API Responses:**
All endpoints use consistent response format via `responseFormatter.js`:

```javascript
// Success Response
{
  "success": true,
  "message": "Data retrieved successfully",
  "data": { /* actual data */ },
  "timestamp": "2025-08-18T10:23:45.123Z"
}

// Paginated Response
{
  "success": true,
  "message": "Data retrieved successfully", 
  "data": [/* array of items */],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10,
    "hasNext": true,
    "hasPrev": false
  },
  "timestamp": "2025-08-18T10:23:45.123Z"
}

// Error Response
{
  "success": false,
  "message": "Error message",
  "errors": { /* validation errors */ },
  "timestamp": "2025-08-18T10:23:45.123Z"
}
```

### **Response Formatter Functions:**
- `successResponse()` - Standard success response
- `errorResponse()` - Standard error response
- `paginatedResponse()` - Paginated data response
- `validationErrorResponse()` - Validation error response
- `createResponse()` - Resource creation response
- `notFoundResponse()` - 404 responses
- `unauthorizedResponse()` - 401 responses
- `forbiddenResponse()` - 403 responses

---

## 🔧 Utilities Created

### **1. Authentication Utilities (`utils/`)**

#### **`bcrypt.js`** - Password Security
```javascript
export const hashPassword = async (password) => { /* bcrypt hashing */ };
export const comparePassword = async (password, hash) => { /* verification */ };
```

#### **`jwt.js`** - Token Management
```javascript
export const generateToken = (payload, expiresIn) => { /* JWT generation */ };
export const verifyToken = (token) => { /* JWT verification */ };
export const generateRefreshToken = (payload) => { /* Refresh tokens */ };
```

### **2. Data Processing Utilities**

#### **`customSlugify.js`** - Custom Slug Generation
```javascript
export const generateSlug = async (text) => { /* SEO-friendly slugs */ };
export const generateFileName = async (text) => { /* Generate File Name */ };
export const generateStudentId = (name, year) => { /* Student ID format */ };
export const generateCertificateNumber = (studentId, courseCode) => { /* Cert numbers */ };
```

#### **`responseFormatter.js`** - API Response Standardization
- Ensures all API responses follow the same format
- Handles success, error, pagination, and validation responses
- Includes timestamps for better debugging

#### **`pdfGenerator.js`** - Document Generation
- Certificate generation
- Receipt generation  
- Report generation utilities

### **3. Configuration Utilities**

#### **Database Configuration (`config/database.js`)**
- Sequelize connection setup
- Environment-based configuration
- Connection pooling and retry logic

#### **Redis Configuration (`config/redis.js`)**
- **Environment-controlled Redis usage**
- Graceful fallback when Redis is disabled
- Connection error handling

#### **Logger Configuration (`config/logger.js`)**
- Winston-based logging
- File and console output
- Environment-based log levels

---

## 🔐 Authentication & Authorization System

### **Role Hierarchy:**
```javascript
// User Roles (from constants/roles.js)
USER_ROLES = {
  SUPER_ADMIN: 'super_admin',    // Full system access
  ADMIN: 'admin',                // Management access
  EMPLOYEE: 'employee',          // General staff access
  TRAINER: 'trainer',            // Training-specific access
  WARDEN: 'warden',             // Hostel management
  ACCOUNT: 'account',           // Financial operations
  SEO: 'seo',                   // Content management
  MARKETING: 'marketing',       // Marketing operations
  STUDENT: 'student'            // Student portal access
}
```

### **Permission System:**
```javascript
// Role-based permissions
ROLE_PERMISSIONS = {
  [USER_ROLES.ADMIN]: [
    'manage_students', 'manage_courses', 'manage_payments',
    'manage_expenses', 'view_dashboard', 'manage_cms'
  ],
  [USER_ROLES.ACCOUNT]: [
    'manage_payments', 'manage_expenses', 'view_financial_dashboard'
  ],
  [USER_ROLES.SEO]: [
    'manage_cms', 'manage_courses', 'manage_seo_content'
  ]
  // ... other roles
}
```

### **Middleware Usage:**
```javascript
// Role-based route protection
router.use('/courses', checkRoles('admin', 'seo'));

// Permission-based route protection  
router.use('/payments', requirePermissions('manage_payments'));
```

---

## 🗄️ Database Design

### **Audit Trail System:**
Every model includes automatic audit fields:
- **`created_by`** - User ID who created the record
- **`updated_by`** - JSON array of update history
- **`is_deleted`** - Soft delete flag
- **`deleted_by`** - User ID who deleted the record
- **`createdAt`** / **`updatedAt`** / **`deletedAt`** - Automatic timestamps

### **Sequelize Hooks:**
```javascript
hooks: {
  beforeCreate: (instance, options) => {
    if (options.currentUserId) instance.created_by = options.currentUserId;
  },
  beforeUpdate: (instance, options) => {
    if (options.currentUserId) {
      const history = instance.updated_by || [];
      history.push({
        id: options.currentUserId,
        timestamp: new Date().toISOString()
      });
      instance.updated_by = history;
    }
  },
  beforeDestroy: (instance, options) => {
    if (options.currentUserId) {
      instance.is_deleted = true;
      instance.deleted_by = options.currentUserId;
    }
  }
}
```

---

## 🚀 API Endpoints

### **Authentication:**
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update profile
- `PUT /api/auth/change-password` - Change password
- `POST /api/auth/logout` - Logout user

### **Course Management (Internal):**
- `GET /api/internal/courses` - List courses (admin/seo)
- `POST /api/internal/courses` - Create course (admin/seo)
- `PUT /api/internal/courses/:id` - Update course (admin/seo)
- `DELETE /api/internal/courses/:id` - Delete course (admin/seo)

### **Public Website:**
- `GET /api/public/courses` - Public course listing
- `GET /api/public/courses/:slug` - Course details by slug
- `GET /api/public/courses/featured` - Featured courses
- `GET /api/public/courses/stats` - Course statistics

---

## 📊 Redis Caching Strategy

### **Environment-Controlled Redis:**
```javascript
// In server.js
if (process.env.REDIS_ENABLED === "true") {
  await connectRedis();
  logger.info("Redis connection established");
} else {
  logger.info("Redis is disabled via .env");
}
```

### **Cache Keys & TTL:**
```javascript
// From constants/config.js
CACHE_KEYS = {
  COURSES: 'courses',
  GALLERY_IMAGES: 'gallery_images',
  DASHBOARD_STATS: 'dashboard_stats'
}

CACHE_TTL = {
  SHORT: 300,    // 5 minutes
  MEDIUM: 1800,  // 30 minutes  
  LONG: 3600,    // 1 hour
  VERY_LONG: 86400 // 24 hours
}
```

---

## 🛡️ Security Features

### **Password Security:**
- **bcrypt** hashing with configurable salt rounds
- Password strength validation
- Secure password change workflow

### **JWT Security:**
- Access tokens (7 days default)
- Refresh tokens (30 days default)
- Token verification with issuer/audience validation

### **Request Security:**
- **Helmet.js** - Security headers
- **CORS** - Cross-origin request handling
- **Rate Limiting** - Prevent abuse
- **Input Validation** - Joi-based validation
- **SQL Injection Protection** - Sequelize ORM parameterized queries

---

## 📝 Development Scripts

```json
{
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js",
    "migrate": "sequelize-cli db:migrate",
    "migrate:undo": "sequelize-cli db:migrate:undo",
    "seed": "sequelize-cli db:seed:all",
    "seed:undo": "sequelize-cli db:seed:undo:all",
    "db:create": "sequelize-cli db:create",
    "db:drop": "sequelize-cli db:drop"
  }
}
```

---

## 🔍 Code Quality Standards

### **Naming Conventions:**
- **Controllers:** `PascalCase` classes with `static` methods
- **Services:** `PascalCase` classes with instance methods  
- **Repositories:** `PascalCase` classes with instance methods
- **Models:** `kebab-case`
- **Functions:** `camelCase`
- **Constants:** `UPPER_SNAKE_CASE`
- **Files:** `camelCase.js`

### **Error Handling:**
- Comprehensive try-catch blocks
- Consistent error response format
- Detailed error logging with Winston
- Graceful degradation for non-critical failures

### **Database Conventions:**
- **Soft deletes** with `paranoid: true`
- **Automatic timestamps** with `timestamps: true`
- **Audit trails** for all critical operations
- **Foreign key relationships** properly defined

---

## 🎯 Project Goals

1. **Scalable Architecture** - Easy to extend with new modules
2. **Role-based Security** - Granular access control
3. **API-First Design** - Clean separation between frontend and backend
4. **Data Integrity** - Comprehensive audit trails and soft deletes
5. **Performance** - Optional Redis caching and optimized queries
6. **Maintainability** - Clean code structure and comprehensive documentation

---

This backend API serves as the foundation for a complete training academy management system, designed to handle everything from student enrollment to certificate generation with enterprise-grade security and scalability.
