exports.isAdminOrTeamLeader = async (req, res, next) => {
  try {
    console.log('Role middleware - user:', {
      id: req.user._id,
      role: req.user.role
    });

    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (req.user.role !== 'admin' && req.user.role !== 'team-leader') {
      return res.status(403).json({ 
        message: 'Access denied. Admin or team leader role required',
        currentRole: req.user.role
      });
    }

    next();
  } catch (error) {
    console.error('Role middleware error:', error);
    res.status(500).json({ message: 'Server error in role middleware' });
  }
}; 