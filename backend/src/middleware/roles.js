exports.isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ error: 'Access denied. Admin only.' });
  }
};

exports.isTeamLeader = (req, res, next) => {
  if (req.user && (req.user.role === 'team-leader' || req.user.role === 'admin')) {
    next();
  } else {
    res.status(403).json({ error: 'Access denied. Team leader or admin only.' });
  }
};

exports.isAdminOrTeamLeader = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'team-leader')) {
    next();
  } else {
    res.status(403).json({ error: 'Access denied. Admin or team leader only.' });
  }
}; 