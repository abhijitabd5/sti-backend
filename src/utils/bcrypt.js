import bcrypt from 'bcrypt';

const SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12;

export const hashPassword = async (password) => {
  try {
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    return await bcrypt.hash(password, salt);
  } catch (error) {
    throw new Error('Password hashing failed');
  }
};

export const comparePassword = async (password, hashedPassword) => {
  try {
    return await bcrypt.compare(password, hashedPassword);
  } catch (error) {
    throw new Error('Password comparison failed');
  }
};

export const generateSalt = async (rounds = SALT_ROUNDS) => {
  try {
    return await bcrypt.genSalt(rounds);
  } catch (error) {
    throw new Error('Salt generation failed');
  }
};

export const hashWithSalt = async (data, salt) => {
  try {
    return await bcrypt.hash(data, salt);
  } catch (error) {
    throw new Error('Hashing with salt failed');
  }
};

export default {
  hashPassword,
  comparePassword,
  generateSalt,
  hashWithSalt
};
