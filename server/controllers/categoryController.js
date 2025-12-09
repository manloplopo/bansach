const { Category } = require('../models');

module.exports.list = async (req, res) => {
  try { const rows = await Category.findAll(); res.json(rows); } catch (e) { console.error(e); res.status(500).json({ message: 'Server error' }); }
};
module.exports.create = async (req, res) => {
  try { const { name, slug } = req.body; const row = await Category.create({ name, slug }); res.status(201).json(row); } catch (e) { console.error(e); res.status(500).json({ message: 'Server error' }); }
};
module.exports.update = async (req, res) => {
  try { const row = await Category.findByPk(req.params.id); if (!row) return res.status(404).json({ message: 'Not found' }); Object.assign(row, req.body); await row.save(); res.json(row); } catch (e) { console.error(e); res.status(500).json({ message: 'Server error' }); }
};
module.exports.remove = async (req, res) => {
  try { const row = await Category.findByPk(req.params.id); if (!row) return res.status(404).json({ message: 'Not found' }); await row.destroy(); res.json({ message: 'Deleted' }); } catch (e) { console.error(e); res.status(500).json({ message: 'Server error' }); }
};
