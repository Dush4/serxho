const db = require('../config/database');

exports.getAllProducts = (req, res) => {
  db.query('SELECT * FROM Products', (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results);
  });
};

exports.getProductById = (req, res) => {
  db.query('SELECT * FROM Products WHERE ProductID = ?', [req.params.id], (err, result) => {
    if (err) return res.status(500).send(err);
    if (result.length === 0) return res.status(404).send('Product not found');
    res.json(result[0]);
  });
};

exports.createProduct = (req, res) => {
  const { ProductName, Description, Price, CategoryID, ImageURL } = req.body;
  db.query('INSERT INTO Products (ProductName, Description, Price, CategoryID, ImageURL) VALUES (?, ?, ?, ?, ?)',
    [ProductName, Description, Price, CategoryID, ImageURL], (err, result) => {
      if (err) return res.status(500).send(err);
      res.status(201).send('Product created');
    });
};

exports.updateProduct = (req, res) => {
  const { ProductName, Description, Price, CategoryID, ImageURL } = req.body;
  db.query('UPDATE Products SET ProductName = ?, Description = ?, Price = ?, CategoryID = ?, ImageURL = ? WHERE ProductID = ?',
    [ProductName, Description, Price, CategoryID, ImageURL, req.params.id], (err) => {
      if (err) return res.status(500).send(err);
      res.send('Product updated');
    });
};

exports.deleteProduct = (req, res) => {
  db.query('DELETE FROM Products WHERE ProductID = ?', [req.params.id], (err) => {
    if (err) return res.status(500).send(err);
    res.send('Product deleted');
  });
};