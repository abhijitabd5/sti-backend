import { Op } from 'sequelize';
import { User, Student } from '../models/index.js';

class AuthRepository {
  /**
   * Find user by mobile number
   */
  async findUserByMobile(mobile) {
    return await User.findOne({
      where: { mobile },
      attributes: ['id', 'first_name', 'last_name', 'mobile', 'email', 'password', 'role', 'profile_image', 'is_active', 'last_login_at']
    });
  }

  /**
   * Find user by email
   */
  async findUserByEmail(email) {
    return await User.findOne({
      where: { email },
      attributes: ['id', 'first_name', 'last_name', 'mobile', 'email', 'password', 'role', 'profile_image', 'is_active', 'last_login_at']
    });
  }

  /**
   * Find user by ID
   */
  async findUserById(id) {
    return await User.findByPk(id, {
      attributes: ['id', 'first_name', 'last_name', 'mobile', 'email', 'role', 'profile_image', 'is_active', 'last_login_at']
    });
  }

  /**
   * Find student by user ID
   */
  async findStudentByUserId(userId) {
    return await Student.findOne({
      where: { user_id: userId },
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'first_name', 'last_name', 'mobile', 'email', 'role', 'profile_image', 'is_active']
      }]
    });
  }

  /**
   * Update last login time
   */
  async updateLastLogin(userId) {
    return await User.update(
      { last_login_at: new Date() },
      { where: { id: userId } }
    );
  }

  /**
   * Create new user
   */
  async createUser(userData, currentUserId = null) {
    return await User.create(userData, {
      currentUserId
    });
  }

  /**
   * Update user password
   */
  async updatePassword(userId, hashedPassword, currentUserId) {
    return await User.update(
      { password: hashedPassword },
      { 
        where: { id: userId },
        currentUserId
      }
    );
  }

  /**
   * Update user profile
   */
  async updateProfile(userId, updateData, currentUserId) {
    return await User.update(updateData, {
      where: { id: userId },
      currentUserId
    });
  }

  /**
   * Check if mobile number exists
   */
  async mobileExists(mobile, excludeUserId = null) {
    const whereClause = { mobile };
    
    if (excludeUserId) {
      whereClause.id = { [Op.ne]: excludeUserId };
    }
    
    const user = await User.findOne({
      where: whereClause,
      attributes: ['id']
    });
    
    return !!user;
  }

  /**
   * Check if email exists
   */
  async emailExists(email, excludeUserId = null) {
    const whereClause = { email };
    
    if (excludeUserId) {
      whereClause.id = { [Op.ne]: excludeUserId };
    }
    
    const user = await User.findOne({
      where: whereClause,
      attributes: ['id']
    });
    
    return !!user;
  }
}

export default new AuthRepository();
