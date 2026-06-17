const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// POST /api/v1/auth/login
const login = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  try {
    const [rows] = await pool.execute(
      'SELECT * FROM users WHERE username = ?',
      [username]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = rows[0];
    const match = await bcrypt.compare(password, user.password_hash);

    if (!match) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      {
        user_id: user.user_id,
        username: user.username,
        role: user.role,
        worker_id: user.worker_id
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    return res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        username: user.username,
        role: user.role
      }
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// POST /api/v1/auth/register  —  Manager only
const register = async (req, res) => {
  const { username, password, role, worker_id } = req.body;

  if (!username || !password || !role) {
    return res.status(400).json({ error: 'username, password and role are required' });
  }

  const validRoles = ['Manager', 'Admin', 'Cleaner'];
  if (!validRoles.includes(role)) {
    return res.status(400).json({ error: 'Invalid role. Must be Manager, Admin or Cleaner' });
  }

  try {
    const hash = await bcrypt.hash(password, 10);

    await pool.execute(
      'INSERT INTO users (worker_id, username, password_hash, role) VALUES (?, ?, ?, ?)',
      [worker_id || null, username, hash, role]
    );

    return res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Username already exists' });
    }
    return res.status(500).json({ error: err.message });
  }
};

module.exports = { login, register };
