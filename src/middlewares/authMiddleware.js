import { verifyToken } from "../utils/jwt.js";
import {
  unauthorizedResponse,
  forbiddenResponse,
} from "../utils/responseFormatter.js";
import { ERROR_MESSAGES } from "../constants/messages.js";
import { User } from "../models/index.js";
import { Student } from "../models/index.js";
import { USER_ROLES } from "../constants/roles.js";

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return unauthorizedResponse(res, ERROR_MESSAGES.UNAUTHORIZED);
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return unauthorizedResponse(res, ERROR_MESSAGES.UNAUTHORIZED);
    }

    try {
      const decoded = verifyToken(token);
      req.user = decoded;

      // Check if user still exists and is active
      // Check if student is active to access courses in student portal
      if (decoded.role === USER_ROLES.STUDENT) {
        const student = await Student.findByPk(decoded.id);
        if (!student || student.status !== "active" || !student.loginEnabled) {
          return unauthorizedResponse(res, ERROR_MESSAGES.USER_INACTIVE);
        }
        req.student = student;
      } else {
        const user = await User.findByPk(decoded.id);
        if (!user || !user.is_active) {
          return unauthorizedResponse(res, ERROR_MESSAGES.USER_INACTIVE);
        }
        req.currentUser = user;
      }

      next();
    } catch (error) {
      return unauthorizedResponse(res, error.message);
    }
  } catch (error) {
    return unauthorizedResponse(res, ERROR_MESSAGES.UNAUTHORIZED);
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return unauthorizedResponse(res, ERROR_MESSAGES.UNAUTHORIZED);
    }

    if (!roles.includes(req.user.role)) {
      return forbiddenResponse(res, ERROR_MESSAGES.FORBIDDEN);
    }

    next();
  };
};

export const authorizePermissions = (...permissions) => {
  return (req, res, next) => {
    if (!req.user) {
      return unauthorizedResponse(res, ERROR_MESSAGES.UNAUTHORIZED);
    }

    // Super admin has all permissions
    if (req.user.role === USER_ROLES.SUPER_ADMIN) {
      return next();
    }

    // Check if user has required permissions
    const userPermissions = req.user.permissions || [];
    const hasPermission = permissions.some((permission) =>
      userPermissions.includes(permission)
    );

    if (!hasPermission) {
      return forbiddenResponse(res, ERROR_MESSAGES.FORBIDDEN);
    }

    next();
  };
};

export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];

      if (token) {
        try {
          const decoded = verifyToken(token);
          req.user = decoded;

          // Check if user still exists and is active
          if (decoded.role === USER_ROLES.STUDENT) {
            const student = await Student.findByPk(decoded.id);
            if (
              student &&
              student.status === "active" &&
              student.loginEnabled
            ) {
              req.student = student;
            }
          } else {
            const user = await User.findByPk(decoded.id);
            if (user && user.is_active) {
              req.currentUser = user;
            }
          }
        } catch (error) {
          // Continue without authentication if token is invalid
        }
      }
    }

    next();
  } catch (error) {
    next();
  }
};

export const adminOnly = authorize(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN);

export const studentOnly = authorize(USER_ROLES.STUDENT);

export const staffOnly = authorize(
  USER_ROLES.SUPER_ADMIN,
  USER_ROLES.ADMIN,
  USER_ROLES.EMPLOYEE,
  USER_ROLES.TRAINER,
  USER_ROLES.WARDEN,
  USER_ROLES.ACCOUNT,
  USER_ROLES.SEO,
  USER_ROLES.MARKETING
);

export const superAdminOnly = authorize(USER_ROLES.SUPER_ADMIN);

export default {
  authenticate,
  authorize,
  authorizePermissions,
  optionalAuth,
  adminOnly,
  studentOnly,
  staffOnly,
  superAdminOnly,
};
