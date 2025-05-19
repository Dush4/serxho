const db = require('../config/database');

exports.getAllCustomers = (req, res) => {
  db.query('SELECT * FROM Customers', (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results);
  });
};

exports.getCustomerById = (req, res) => {
  db.query('SELECT * FROM Customers WHERE CustomerID = ?', [req.params.id], (err, result) => {
    if (err) return res.status(500).send(err);
    if (result.length === 0) return res.status(404).send('Customer not found');
    res.json(result[0]);
  });
};

exports.createCustomer = (req, res) => {
  const { FirstName, LastName, Email, PasswordHash, Phone } = req.body;
  db.query(
    'INSERT INTO Customers (FirstName, LastName, Email, PasswordHash, Phone) VALUES (?, ?, ?, ?, ?)',
    [FirstName, LastName, Email, PasswordHash, Phone],
    (err, result) => {
      if (err) return res.status(500).send(err);
      res.status(201).send('Customer created');
    }
  );
};

exports.updateCustomer = (req, res) => {
  const { FirstName, LastName, Email, PasswordHash, Phone, IsActive } = req.body;
  db.query(
    'UPDATE Customers SET FirstName = ?, LastName = ?, Email = ?, PasswordHash = ?, Phone = ?, IsActive = ? WHERE CustomerID = ?',
    [FirstName, LastName, Email, PasswordHash, Phone, IsActive, req.params.id],
    (err) => {
      if (err) return res.status(500).send(err);
      res.send('Customer updated');
    }
  );
};

exports.deleteCustomer = (req, res) => {
  db.query('DELETE FROM Customers WHERE CustomerID = ?', [req.params.id], (err) => {
    if (err) return res.status(500).send(err);
    res.send('Customer deleted');
  });
};