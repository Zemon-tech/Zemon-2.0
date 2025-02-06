const isAdmin = (req, res, next) => {
  console.log('Checking admin status for user:', req.user);
  
  if (req.user.role !== 'admin') {
    console.log('Access denied: User is not admin');
    return res.status(403).json({ error: 'Access denied. Admin only.' });
  }
  
  console.log('Admin access granted');
  next();
};

// Add a new middleware for checking admin or team leader
const isAdminOrTeamLeader = (req, res, next) => {
  if (req.user.role !== 'admin' && req.user.role !== 'team-leader') {
    return res.status(403).json({ error: 'Access denied. Admin or Team Leader only.' });
  }
  next();
};

module.exports = { isAdmin, isAdminOrTeamLeader }; 