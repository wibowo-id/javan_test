const Contact = require('../models/Contact');
const path = require('path');
const fs = require('fs');

const uploadsDir = path.join(__dirname, '../../uploads');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TELEPON_REGEX = /^\d+$/;

function validateEmail(email) {
  if (!email || typeof email !== 'string') return 'Email wajib diisi';
  const trimmed = email.trim();
  if (!trimmed) return 'Email wajib diisi';
  if (!EMAIL_REGEX.test(trimmed)) return 'Format email tidak valid';
  return null;
}

function validateTelepon(telepon) {
  if (!telepon || typeof telepon !== 'string') return 'Telepon wajib diisi';
  const digits = telepon.replace(/\s/g, '');
  if (!digits) return 'Telepon wajib diisi';
  if (!TELEPON_REGEX.test(digits)) return 'Telepon harus berupa nomor';
  return null;
}

// Create
exports.create = async (req, res) => {
  try {
    const { nama, telepon, email, alamat } = req.body;
    if (!nama || !telepon || !email || !alamat) {
      return res.status(400).json({ error: 'Nama, telepon, email, dan alamat wajib diisi' });
    }
    const emailErr = validateEmail(email);
    if (emailErr) return res.status(400).json({ error: emailErr });
    const teleponErr = validateTelepon(telepon);
    if (teleponErr) return res.status(400).json({ error: teleponErr });
    const existing = await Contact.findByEmail(email);
    if (existing) {
      return res.status(400).json({ error: 'Email sudah terdaftar' });
    }
    const foto = req.file ? req.file.filename : '';
    const contact = await Contact.create({
      nama,
      telepon: String(telepon).replace(/\s/g, ''),
      email: email.trim(),
      alamat,
      foto,
    });
    res.status(201).json({ success: true, data: contact });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Email sudah terdaftar' });
    }
    res.status(500).json({ error: err.message });
  }
};

// Read all
exports.getAll = async (req, res) => {
  try {
    const contacts = await Contact.findAll();
    res.json({ success: true, data: contacts });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Read one
exports.getOne = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    if (!contact) return res.status(404).json({ error: 'Kontak tidak ditemukan' });
    res.json({ success: true, data: contact });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update
exports.update = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    if (!contact) return res.status(404).json({ error: 'Kontak tidak ditemukan' });

    const data = {
      nama: req.body.nama !== undefined ? req.body.nama : contact.nama,
      telepon: req.body.telepon !== undefined ? req.body.telepon : contact.telepon,
      email: req.body.email !== undefined ? req.body.email : contact.email,
      alamat: req.body.alamat !== undefined ? req.body.alamat : contact.alamat,
      foto: contact.foto,
    };

    if (data.email !== contact.email) {
      const emailErr = validateEmail(data.email);
      if (emailErr) return res.status(400).json({ error: emailErr });
      const existing = await Contact.findByEmail(data.email, req.params.id);
      if (existing) {
        return res.status(400).json({ error: 'Email sudah terdaftar' });
      }
      data.email = data.email.trim();
    }
    if (data.telepon !== contact.telepon) {
      const teleponErr = validateTelepon(data.telepon);
      if (teleponErr) return res.status(400).json({ error: teleponErr });
      data.telepon = data.telepon.trim().replace(/\s/g, '');
    }

    if (req.file) {
      if (contact.foto) {
        const oldPath = path.join(uploadsDir, contact.foto);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      data.foto = req.file.filename;
    }

    const updated = await Contact.update(req.params.id, data);
    res.json({ success: true, data: updated });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Email sudah terdaftar' });
    }
    res.status(500).json({ error: err.message });
  }
};

// Delete
exports.delete = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    if (!contact) return res.status(404).json({ error: 'Kontak tidak ditemukan' });

    if (contact.foto) {
      const fotoPath = path.join(uploadsDir, contact.foto);
      if (fs.existsSync(fotoPath)) fs.unlinkSync(fotoPath);
    }

    await Contact.deleteById(req.params.id);
    res.json({ success: true, message: 'Kontak berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
