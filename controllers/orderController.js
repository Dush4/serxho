const db = require('../config/database');

exports.getAllOrders = (req, res) => {
  db.query('SELECT * FROM Orders', (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results);
  });
};

exports.getOrderById = (req, res) => {
  db.query('SELECT * FROM Orders WHERE OrderID = ?', [req.params.id], (err, result) => {
    if (err) return res.status(500).send(err);
    if (result.length === 0) return res.status(404).send('Order not found');
    res.json(result[0]);
  });
};

exports.createOrder = (req, res) => {
  const { UserID, OrderDate, TotalAmount, Status } = req.body;
  db.query(
    'INSERT INTO Orders (UserID, OrderDate, TotalAmount, Status) VALUES (?, ?, ?, ?)',
    [UserID, OrderDate, TotalAmount, Status],
    (err, result) => {
      if (err) return res.status(500).send(err);
      res.status(201).send('Order created');
    }
  );
};

exports.updateOrder = (req, res) => {
  const { UserID, OrderDate, TotalAmount, Status } = req.body;
  db.query(
    'UPDATE Orders SET UserID = ?, OrderDate = ?, TotalAmount = ?, Status = ? WHERE OrderID = ?',
    [UserID, OrderDate, TotalAmount, Status, req.params.id],
    (err) => {
      if (err) return res.status(500).send(err);
      res.send('Order updated');
    }
  );
};

exports.deleteOrder = (req, res) => {
  db.query('DELETE FROM Orders WHERE OrderID = ?', [req.params.id], (err) => {
    if (err) return res.status(500).send(err);
    res.send('Order deleted');
  });
};
