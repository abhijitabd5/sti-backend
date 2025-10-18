import AuthService from '../../services/AuthService.js';
import { 
  successResponse, 
  errorResponse,
  validationErrorResponse
} from '../../utils/responseFormatter.js';
import { STATUS_CODES } from '../../constants/messages.js';

class AuthController {
  /**
   * Login user
   * @route POST /login
   * @access Public
   */
  static async login(req, res) {
    try {
      const result = await AuthService.login(req.body);

      if (!result.success) {
        if (result.errors) {
          return validationErrorResponse(res, result.errors, result.message);
        }
        return errorResponse(res, result.message, STATUS_CODES.UNAUTHORIZED);
      }

      return successResponse(res, result.data, result.message);
    } catch (error) {
      console.error('Error in AuthController.login:', error);
      return errorResponse(res, error.message, STATUS_CODES.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Get user profile
   * @route GET /profile
   * @access Private
   */
  static async getProfile(req, res) {
    try {
      const result = await AuthService.getProfile(req.user.id);

      if (!result.success) {
        return errorResponse(res, result.message, STATUS_CODES.NOT_FOUND);
      }

      return successResponse(res, result.data, result.message);
    } catch (error) {
      console.error('Error in AuthController.getProfile:', error);
      return errorResponse(res, error.message, STATUS_CODES.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Update user profile
   * @route PUT /profile
   * @access Private
   */
  static async updateProfile(req, res) {
    try {
      const result = await AuthService.updateProfile(req.user.id, req.body);

      if (!result.success) {
        if (result.errors) {
          return validationErrorResponse(res, result.errors, result.message);
        }
        return errorResponse(res, result.message, STATUS_CODES.BAD_REQUEST);
      }

      return successResponse(res, result.data, result.message);
    } catch (error) {
      console.error('Error in AuthController.updateProfile:', error);
      return errorResponse(res, error.message, STATUS_CODES.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Change user password
   * @route PUT /change-password
   * @access Private
   */
  static async changePassword(req, res) {
    try {
      const result = await AuthService.changePassword(req.user.id, req.body);

      if (!result.success) {
        if (result.errors) {
          return validationErrorResponse(res, result.errors, result.message);
        }
        return errorResponse(res, result.message, STATUS_CODES.BAD_REQUEST);
      }

      return successResponse(res, result.data, result.message);
    } catch (error) {
      console.error('Error in AuthController.changePassword:', error);
      return errorResponse(res, error.message, STATUS_CODES.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Logout user
   * @route POST /logout
   * @access Private
   */
  static async logout(req, res) {
    try {
      const result = await AuthService.logout();
      return successResponse(res, result.data, result.message);
    } catch (error) {
      console.error('Error in AuthController.logout:', error);
      return errorResponse(res, error.message, STATUS_CODES.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Get current user info (for token validation)
   * @route GET /me
   * @access Private
   */
  static async me(req, res) {
    try {
      const result = await AuthService.getProfile(req.user.id);

      if (!result.success) {
        return errorResponse(res, result.message, STATUS_CODES.NOT_FOUND);
      }

      return successResponse(res, result.data, 'User information retrieved successfully');
    } catch (error) {
      console.error('Error in AuthController.me:', error);
      return errorResponse(res, error.message, STATUS_CODES.INTERNAL_SERVER_ERROR);
    }
  }
}

export default AuthController;
