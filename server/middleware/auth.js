const { verifyJwt } = require('../utils/jwt');
const { User } = require('../models');

async function authRequired(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  const token = header.split(' ')[1];
  const decoded = verifyJwt(token);
  if (!decoded) return res.status(401).json({ message: 'Invalid token' });
  const user = await User.findByPk(decoded.sub);
  if (!user) return res.status(401).json({ message: 'User not found' });
  req.user = user;
  next();
}

function adminRequired(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Forbidden' });
  }
  next();
}

module.exports = { authRequired, adminRequired };
