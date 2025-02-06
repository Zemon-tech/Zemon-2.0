const isTeamLeader = (req, res, next) => {
  if (req.user.role !== 'team-leader' && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Team Leader or Admin only.' });
  }
  next();
};

module.exports = isTeamLeader; 