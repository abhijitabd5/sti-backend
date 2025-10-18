import AuthRepository from '../repositories/AuthRepository.js';
import { hashPassword, comparePassword } from '../utils/bcrypt.js';
import { generateToken, generateRefreshToken } from '../utils/jwt.js';
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from '../constants/messages.js';
import { USER_ROLES } from '../constants/roles.js';

class AuthService {
  /**
   * Login user with mobile/email and password
   */
  async login(credentials) {
    try {
      const { login, password } = credentials; // login can be mobile or email
      
      // Validate required fields
      if (!login || !password) {
        return {
          success: false,
          message: ERROR_MESSAGES.REQUIRED_FIELDS_MISSING,
          errors: {
            login: !login ? 'Mobile number or email is required' : undefined,
            password: !password ? 'Password is required' : undefined
          }
        };
      }

      // Find user by mobile or email
      let user;
      if (this.isEmail(login)) {
        user = await AuthRepository.findUserByEmail(login);
      } else {
        user = await AuthRepository.findUserByMobile(login);
      }

      if (!user) {
        return {
          success: false,
          message: ERROR_MESSAGES.INVALID_CREDENTIALS
        };
      }

      // Check if user is active
      if (!user.is_active) {
        return {
          success: false,
          message: ERROR_MESSAGES.USER_INACTIVE
        };
      }

      // Verify password
      const isPasswordValid = await comparePassword(password, user.password);
      if (!isPasswordValid) {
        return {
          success: false,
          message: ERROR_MESSAGES.INVALID_CREDENTIALS
        };
      }

      // Update last login time
      await AuthRepository.updateLastLogin(user.id);

      // Generate tokens
      const tokenPayload = {
        id: user.id,
        mobile: user.mobile,
        email: user.email,
        role: user.role,
        name: `${user.first_name} ${user.last_name}`
      };

      const accessToken = generateToken(tokenPayload);
      const refreshToken = generateRefreshToken({ id: user.id });

      // Prepare user data (exclude password)
      const userData = {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        mobile: user.mobile,
        email: user.email,
        role: user.role,
        profile_image: user.profile_image,
        last_login_at: new Date()
      };

      // If user is a student, get additional student info
      if (user.role === USER_ROLES.STUDENT) {
        const student = await AuthRepository.findStudentByUserId(user.id);
        if (student) {
          userData.student = {
            id: student.id,
            student_id: student.student_id,
            name_on_id: student.name_on_id,
            login_enabled: student.login_enabled
          };
        }
      }

      return {
        success: true,
        message: SUCCESS_MESSAGES.LOGIN_SUCCESS,
        data: {
          user: userData,
          tokens: {
            access_token: accessToken,
            refresh_token: refreshToken,
            token_type: 'Bearer'
          }
        }
      };
    } catch (error) {
      console.error('Error in AuthService.login:', error);
      throw new Error(ERROR_MESSAGES.DATABASE_ERROR);
    }
  }

  /**
   * Get user profile by ID
   */
  async getProfile(userId) {
    try {
      const user = await AuthRepository.findUserById(userId);
      
      if (!user) {
        return {
          success: false,
          message: ERROR_MESSAGES.USER_NOT_FOUND
        };
      }

      // If user is a student, get additional student info
      let userData = user.toJSON();
      if (user.role === USER_ROLES.STUDENT) {
        const student = await AuthRepository.findStudentByUserId(user.id);
        if (student) {
          userData.student = student.toJSON();
        }
      }

      return {
        success: true,
        message: SUCCESS_MESSAGES.DATA_RETRIEVED,
        data: userData
      };
    } catch (error) {
      console.error('Error in AuthService.getProfile:', error);
      throw new Error(ERROR_MESSAGES.DATABASE_ERROR);
    }
  }

  /**
   * Change user password
   */
  async changePassword(userId, passwordData) {
    try {
      const { currentPassword, newPassword, confirmPassword } = passwordData;

      // Validate required fields
      if (!currentPassword || !newPassword || !confirmPassword) {
        return {
          success: false,
          message: ERROR_MESSAGES.REQUIRED_FIELDS_MISSING,
          errors: {
            currentPassword: !currentPassword ? 'Current password is required' : undefined,
            newPassword: !newPassword ? 'New password is required' : undefined,
            confirmPassword: !confirmPassword ? 'Confirm password is required' : undefined
          }
        };
      }

      // Validate new password confirmation
      if (newPassword !== confirmPassword) {
        return {
          success: false,
          message: ERROR_MESSAGES.VALIDATION_ERROR,
          errors: {
            confirmPassword: 'New password and confirm password do not match'
          }
        };
      }

      // Get user with password - need to fetch by ID but with password field
      const user = await AuthRepository.findUserById(userId);
      if (user) {
        // Get the password by finding the user again with password attribute
        const userWithPassword = await AuthRepository.findUserByMobile(user.mobile);
        user.password = userWithPassword?.password;
      }
      if (!user) {
        return {
          success: false,
          message: ERROR_MESSAGES.USER_NOT_FOUND
        };
      }

      // Verify current password
      const isCurrentPasswordValid = await comparePassword(currentPassword, user.password);
      if (!isCurrentPasswordValid) {
        return {
          success: false,
          message: ERROR_MESSAGES.PASSWORD_MISMATCH
        };
      }

      // Hash new password
      const hashedNewPassword = await hashPassword(newPassword);

      // Update password
      await AuthRepository.updatePassword(userId, hashedNewPassword, userId);

      return {
        success: true,
        message: SUCCESS_MESSAGES.PASSWORD_CHANGED,
        data: null
      };
    } catch (error) {
      console.error('Error in AuthService.changePassword:', error);
      throw new Error(ERROR_MESSAGES.DATABASE_ERROR);
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(userId, updateData) {
    try {
      const { first_name, last_name, email, profile_image } = updateData;

      // Validate required fields
      if (!first_name || !last_name) {
        return {
          success: false,
          message: ERROR_MESSAGES.VALIDATION_ERROR,
          errors: {
            first_name: !first_name ? 'First name is required' : undefined,
            last_name: !last_name ? 'Last name is required' : undefined
          }
        };
      }

      // Check if email already exists (if email is being updated)
      if (email) {
        const emailExists = await AuthRepository.emailExists(email, userId);
        if (emailExists) {
          return {
            success: false,
            message: ERROR_MESSAGES.VALIDATION_ERROR,
            errors: {
              email: 'Email already exists'
            }
          };
        }
      }

      // Prepare update data
      const profileData = {
        first_name,
        last_name,
        email: email || null,
        profile_image: profile_image || null
      };

      // Update profile
      await AuthRepository.updateProfile(userId, profileData, userId);

      // Get updated user data
      const updatedUser = await AuthRepository.findUserById(userId);

      return {
        success: true,
        message: SUCCESS_MESSAGES.USER_UPDATED,
        data: updatedUser
      };
    } catch (error) {
      console.error('Error in AuthService.updateProfile:', error);
      throw new Error(ERROR_MESSAGES.DATABASE_ERROR);
    }
  }

  /**
   * Logout user (client-side token invalidation)
   */
  async logout() {
    return {
      success: true,
      message: SUCCESS_MESSAGES.LOGOUT_SUCCESS,
      data: null
    };
  }

  /**
   * Check if string is email format
   */
  isEmail(str) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(str);
  }

  /**
   * Validate password strength
   */
  validatePasswordStrength(password) {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (password.length < minLength || !hasUpperCase || !hasLowerCase || !hasNumbers || !hasSpecialChar) {
      return {
        isValid: false,
        message: ERROR_MESSAGES.WEAK_PASSWORD
      };
    }

    return {
      isValid: true,
      message: 'Password is strong'
    };
  }
}

export default new AuthService();
