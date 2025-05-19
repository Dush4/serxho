const db = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { jwtSecret, jwtExpiration } = require('../config/auth');

// Register user
exports.register = async (req, res) => {
  const { Username, Password, Role } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(Password, 10);
    const pool = await db;
    await pool
      .request()
      .input('Username', Username)
      .input('Password', hashedPassword)
      .input('Role', Role || 'user')
      .query('INSERT INTO Users (Username, Password, Role) VALUES (@Username, @Password, @Role)');
    res.status(201).send('User registered');
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Login user
exports.login = async (req, res) => {
  const { Username, Password } = req.body;
  try {
    const pool = await db;
    const result = await pool
      .request()
      .input('Username', Username)
      .query('SELECT * FROM Users WHERE Username = @Username');

    if (result.recordset.length === 0)
      return res.status(404).send('User not found');

    const user = result.recordset[0];
    const match = await bcrypt.compare(Password, user.Password);

    if (!match) return res.status(401).send('Invalid credentials');

    const token = jwt.sign(
      { id: user.UserID, role: user.Role },
      jwtSecret,
      { expiresIn: jwtExpiration }
    );

    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all users (admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const pool = await db;
    const result = await pool.request().query('SELECT UserID, Username, Role FROM Users');
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete user (admin only)
exports.deleteUser = async (req, res) => {
  try {
    const pool = await db;
    await pool
      .request()
      .input('id', req.params.id)
      .query('DELETE FROM Users WHERE UserID = @id');
    res.send('User deleted');
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
