const bcrypt = require('bcrypt');
const { User, EmailToken, PasswordResetToken } = require('../models');
const { signJwt } = require('../utils/jwt');
const { v4: uuid } = require('uuid');

function minutesFromNow(mins) { return new Date(Date.now() + mins * 60000); }

module.exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'Missing fields' });
    const existing = await User.findOne({ where: { email } });
    if (existing) return res.status(409).json({ message: 'Email already registered' });
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, passwordHash });
    const token = uuid();
    await EmailToken.create({ UserId: user.id, token, expiresAt: minutesFromNow(parseInt(process.env.EMAIL_TOKEN_EXPIRES || '30',10)) });
    // TODO send email
    return res.status(201).json({ message: 'Registered. Verify email.', verifyToken: token });
  } catch (e) {
    console.error(e); return res.status(500).json({ message: 'Server error' });
  }
};

module.exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ message: 'Token required' });
    const record = await EmailToken.findOne({ where: { token, used: false } });
    if (!record) return res.status(400).json({ message: 'Invalid token' });
    if (record.expiresAt < new Date()) return res.status(400).json({ message: 'Token expired' });
    const user = await User.findByPk(record.UserId);
    user.isEmailVerified = true; await user.save();
    record.used = true; await record.save();
    return res.json({ message: 'Email verified' });
  } catch (e) { console.error(e); return res.status(500).json({ message: 'Server error' }); }
};

module.exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });
    const token = signJwt({ sub: user.id, role: user.role });
    return res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (e) { console.error(e); return res.status(500).json({ message: 'Server error' }); }
};

module.exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ where: { email } });
    if (user) {
      const token = uuid();
      await PasswordResetToken.create({ UserId: user.id, token, expiresAt: minutesFromNow(parseInt(process.env.RESET_TOKEN_EXPIRES || '30',10)) });
      // TODO send email
    }
    return res.json({ message: 'If account exists, password reset email sent' });
  } catch (e) { console.error(e); return res.status(500).json({ message: 'Server error' }); }
};

module.exports.resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    const record = await PasswordResetToken.findOne({ where: { token, used: false } });
    if (!record) return res.status(400).json({ message: 'Invalid token' });
    if (record.expiresAt < new Date()) return res.status(400).json({ message: 'Token expired' });
    const user = await User.findByPk(record.UserId);
    user.passwordHash = await bcrypt.hash(password, 10); await user.save();
    record.used = true; await record.save();
    return res.json({ message: 'Password updated' });
  } catch (e) { console.error(e); return res.status(500).json({ message: 'Server error' }); }
};
