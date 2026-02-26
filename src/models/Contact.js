const { pool } = require('../config/db');

exports.create = async (data) => {
  const [result] = await pool.execute(
    'INSERT INTO contacts (nama, telepon, email, alamat, foto) VALUES (?, ?, ?, ?, ?)',
    [data.nama, data.telepon, data.email, data.alamat, data.foto || '']
  );
  return exports.findById(result.insertId);
};

exports.findAll = async () => {
  const [rows] = await pool.execute(
    'SELECT * FROM contacts ORDER BY updatedAt DESC'
  );
  return rows;
};

exports.findById = async (id) => {
  const [rows] = await pool.execute('SELECT * FROM contacts WHERE id = ?', [
    id,
  ]);
  return rows[0] || null;
};

exports.findByEmail = async (email, excludeId = null) => {
  if (excludeId != null) {
    const [rows] = await pool.execute(
      'SELECT * FROM contacts WHERE email = ? AND id != ?',
      [email, excludeId]
    );
    return rows[0] || null;
  }
  const [rows] = await pool.execute('SELECT * FROM contacts WHERE email = ?', [
    email,
  ]);
  return rows[0] || null;
};

exports.update = async (id, data) => {
  const updates = [];
  const values = [];
  if (data.nama !== undefined) {
    updates.push('nama = ?');
    values.push(data.nama);
  }
  if (data.telepon !== undefined) {
    updates.push('telepon = ?');
    values.push(data.telepon);
  }
  if (data.email !== undefined) {
    updates.push('email = ?');
    values.push(data.email);
  }
  if (data.alamat !== undefined) {
    updates.push('alamat = ?');
    values.push(data.alamat);
  }
  if (data.foto !== undefined) {
    updates.push('foto = ?');
    values.push(data.foto);
  }
  if (updates.length === 0) return exports.findById(id);
  values.push(id);
  await pool.execute(
    `UPDATE contacts SET ${updates.join(', ')}, updatedAt = CURRENT_TIMESTAMP WHERE id = ?`,
    values
  );
  return exports.findById(id);
};

exports.deleteById = async (id) => {
  const [result] = await pool.execute('DELETE FROM contacts WHERE id = ?', [
    id,
  ]);
  return result.affectedRows > 0;
};
