const request = require('supertest');
const path = require('path');
const fs = require('fs');
const { connectDB, pool } = require('../../src/config/db');
const app = require('../../app');

describe('Contact API', () => {
  beforeAll(async () => {
    await connectDB();
  });

  beforeEach(async () => {
    await pool.execute('TRUNCATE TABLE contacts');
  });

  afterAll(async () => {
    await pool.end();
  });

  const validContact = {
    nama: 'Budi Santoso',
    telepon: '08123456789',
    email: 'budi@example.com',
    alamat: 'Jl. Merdeka No. 1, Jakarta',
  };

  describe('POST /api/contact', () => {
    it('harus membuat kontak baru dan return 201', async () => {
      const res = await request(app)
        .post('/api/contact')
        .send(validContact)
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toMatchObject({
        nama: validContact.nama,
        telepon: validContact.telepon,
        email: validContact.email,
        alamat: validContact.alamat,
      });
      expect(res.body.data.id).toBeDefined();
      expect(res.body.data.foto).toBe('');
    });

    it('harus return 400 jika field wajib kosong', async () => {
      const res = await request(app)
        .post('/api/contact')
        .send({ nama: 'A', telepon: '08' })
        .expect(400);

      expect(res.body.error).toMatch(/wajib diisi/i);
    });
  });

  describe('GET /api/contact', () => {
    it('harus return list kontak (kosong awalnya)', async () => {
      const res = await request(app).get('/api/contact').expect(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toEqual([]);
    });

    it('harus return semua kontak yang ada', async () => {
      await request(app).post('/api/contact').send(validContact);
      const res = await request(app).get('/api/contact').expect(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].nama).toBe(validContact.nama);
    });
  });

  describe('GET /api/contact/:id', () => {
    it('harus return satu kontak by id', async () => {
      const created = await request(app).post('/api/contact').send(validContact);
      const id = created.body.data.id;
      const res = await request(app).get(`/api/contact/${id}`).expect(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toMatchObject(validContact);
    });

    it('harus return 404 jika id tidak ditemukan', async () => {
      await request(app).get('/api/contact/99999').expect(404);
    });
  });

  describe('PUT /api/contact/:id', () => {
    it('harus update kontak', async () => {
      const created = await request(app).post('/api/contact').send(validContact);
      const id = created.body.data.id;
      const updated = await request(app)
        .put(`/api/contact/${id}`)
        .send({ nama: 'Budi Updated', email: 'budi.new@example.com' })
        .expect(200);

      expect(updated.body.success).toBe(true);
      expect(updated.body.data.nama).toBe('Budi Updated');
      expect(updated.body.data.email).toBe('budi.new@example.com');
      expect(updated.body.data.telepon).toBe(validContact.telepon);
    });

    it('harus return 404 jika id tidak ditemukan', async () => {
      await request(app)
        .put('/api/contact/99999')
        .send({ nama: 'X' })
        .expect(404);
    });
  });

  describe('DELETE /api/contact/:id', () => {
    it('harus hapus kontak dan return 200', async () => {
      const created = await request(app).post('/api/contact').send(validContact);
      const id = created.body.data.id;
      const res = await request(app).delete(`/api/contact/${id}`).expect(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toMatch(/berhasil dihapus/i);

      const getRes = await request(app).get(`/api/contact/${id}`).expect(404);
      expect(getRes.body.error).toMatch(/tidak ditemukan/i);
    });

    it('harus return 404 jika id tidak ditemukan', async () => {
      await request(app).delete('/api/contact/99999').expect(404);
    });
  });
});
