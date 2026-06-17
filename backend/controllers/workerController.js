const pool = require('../config/db');
const bcrypt = require('bcryptjs');

// GET /api/v1/workers
const getAllWorkers = async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT w.worker_id, w.name, w.CNIC, w.phone, w.hire_date,
             wt.type_name  AS worker_type,
             es.status_name AS employment_status,
             c.campus_name
      FROM   worker w
      JOIN   worker_type       wt ON w.worker_type_id       = wt.worker_type_id
      JOIN   employment_status es ON w.employment_status_id = es.employment_status_id
      JOIN   campus             c ON w.campus_id            = c.campus_id
      ORDER  BY w.worker_id
    `);
    return res.status(200).json(rows);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// GET /api/v1/workers/:id
const getWorkerById = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.execute(`
      SELECT w.worker_id, w.name, w.CNIC, w.phone, w.hire_date,
             wt.type_name  AS worker_type,
             es.status_name AS employment_status,
             c.campus_name
      FROM   worker w
      JOIN   worker_type       wt ON w.worker_type_id       = wt.worker_type_id
      JOIN   employment_status es ON w.employment_status_id = es.employment_status_id
      JOIN   campus             c ON w.campus_id            = c.campus_id
      WHERE  w.worker_id = ?
    `, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Worker not found' });
    }
    return res.status(200).json(rows[0]);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// POST /api/v1/workers
// TRANSACTION: insert worker  +  create user account atomically
const createWorker = async (req, res) => {
  const { campus_id, name, CNIC, phone, hire_date, worker_type_id, username, password } = req.body;

  if (!campus_id || !name || !CNIC || !worker_type_id || !username || !password) {
    return res.status(400).json({ error: 'campus_id, name, CNIC, worker_type_id, username, password are required' });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    console.log('[TRANSACTION] BEGIN — createWorker');

    // 1. Insert worker
    const [workerResult] = await conn.execute(
      `INSERT INTO worker (campus_id, name, CNIC, phone, hire_date, worker_type_id, employment_status_id)
       VALUES (?, ?, ?, ?, ?, ?, 1)`,
      [campus_id, name, CNIC, phone || null, hire_date || null, worker_type_id]
    );
    const newWorkerId = workerResult.insertId;
    console.log(`[TRANSACTION] Inserted worker id=${newWorkerId}`);

    // 2. Determine role from worker_type_id
    const roleMap = { 1: 'Manager', 2: 'Admin', 3: 'Cleaner' };
    const role = roleMap[worker_type_id] || 'Cleaner';

    // 3. Hash password
    const hash = await bcrypt.hash(password, 10);

    // 4. Insert user account
    await conn.execute(
      `INSERT INTO users (worker_id, username, password_hash, role) VALUES (?, ?, ?, ?)`,
      [newWorkerId, username, hash, role]
    );
    console.log(`[TRANSACTION] Inserted user account for worker id=${newWorkerId}`);

    await conn.commit();
    console.log('[TRANSACTION] COMMIT — createWorker SUCCESS');

    return res.status(201).json({
      message: 'Worker and user account created successfully',
      worker_id: newWorkerId
    });
  } catch (err) {
    await conn.rollback();
    console.log('[TRANSACTION] ROLLBACK — createWorker FAILED:', err.message);

    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'CNIC or username already exists' });
    }
    return res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
};

// PUT /api/v1/workers/:id
const updateWorker = async (req, res) => {
  const { id } = req.params;
  const { name, phone, employment_status_id } = req.body;

  try {
    const [result] = await pool.execute(
      `UPDATE worker
       SET name                 = COALESCE(?, name),
           phone                = COALESCE(?, phone),
           employment_status_id = COALESCE(?, employment_status_id)
       WHERE worker_id = ?`,
      [name || null, phone || null, employment_status_id || null, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Worker not found' });
    }
    return res.status(200).json({ message: 'Worker updated successfully' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// DELETE /api/v1/workers/:id
const deleteWorker = async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await pool.execute(
      'DELETE FROM worker WHERE worker_id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Worker not found' });
    }
    return res.status(200).json({ message: 'Worker deleted successfully' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

module.exports = { getAllWorkers, getWorkerById, createWorker, updateWorker, deleteWorker };
