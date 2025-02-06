const User = require('../models/User');
const bcrypt = require('bcryptjs');

const createTeamLeader = async () => {
  try {
    const existingTeamLeader = await User.findOne({ email: 'teamleader@example.com' });
    
    if (!existingTeamLeader) {
      const password = await bcrypt.hash('teamleader123', 10);
      
      await User.create({
        name: 'Team Leader',
        email: 'teamleader@example.com',
        password,
        role: 'team-leader',
        isVerified: true
      });
      
      console.log('Team Leader created successfully');
    }
  } catch (error) {
    console.error('Error creating team leader:', error);
  }
};

module.exports = createTeamLeader; 