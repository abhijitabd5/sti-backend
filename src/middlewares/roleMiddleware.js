import { forbiddenResponse, unauthorizedResponse } from '../utils/responseFormatter.js';
import { USER_ROLES, ROLE_PERMISSIONS} from '../constants/roles.js';
import { ERROR_MESSAGES } from '../constants/messages.js';


export const checkRoles = (...roles) => {
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

export const requirePermissions = (...requiredPermissions) => {
  return (req, res, next) => {
    if (!req.user) {
      return unauthorizedResponse(res, ERROR_MESSAGES.UNAUTHORIZED);
    }

    if (req.user.role === USER_ROLES.SUPER_ADMIN) {
      return next();
    }

    const userPermissions = ROLE_PERMISSIONS[req.user.role] || [];

    if (userPermissions.includes('all_permissions')) {
      return next();
    }

    const hasPermission = requiredPermissions.some(permission => 
      userPermissions.includes(permission)
    );

    if (!hasPermission) {
      return forbiddenResponse(res, `Access denied. Required permissions: ${requiredPermissions.join(', ')}`);
    }

    next();
  };
};


export default {
  requirePermissions,
  checkRoles
};
