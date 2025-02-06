const User = require('../models/User');
const bcrypt = require('bcryptjs');

const createAdminUser = async () => {
  try {
    // Check if admin user already exists
    const adminExists = await User.findOne({ email: 'admin@example.com' });
    
    if (!adminExists) {
      console.log('Creating admin user...');
      
      // Create admin user with hashed password
      const adminUser = new User({
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'admin123', // Will be hashed by pre-save middleware
        role: 'admin',
        isVerified: true
      });

      await adminUser.save();
      
      // Verify the password was hashed
      const savedAdmin = await User.findOne({ email: 'admin@example.com' }).select('+password');
      console.log('Admin user created successfully');
      console.log('Admin password is hashed:', savedAdmin.password.startsWith('$2a$'));
    } else {
      console.log('Admin user already exists');
    }
  } catch (error) {
    console.error('Error creating admin user:', error);
  }
};

module.exports = createAdminUser; 