const express = require('express');
const router = express.Router();
const { poolPromise, sql } = require('../db');
const validateProduct = require('../middleware/validateProduct');

// GET all products
router.get('/', async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query('SELECT * FROM Products WHERE Active = 1');
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single product
router.get('/:id', async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('id', sql.Int, req.params.id)
      .query('SELECT * FROM Products WHERE ProductID = @id AND Active = 1');
    
    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json(result.recordset[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//create product
router.post('/', validateProduct, async (req, res) => {
  const { ProductName, Description, Price, CategoryID, ImageURL } = req.body;
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('ProductName', sql.NVarChar(255), ProductName)
      .input('Description', sql.NVarChar(500), Description)
      .input('Price', sql.Decimal(10, 2), Price)
      .input('CategoryID', sql.Int, CategoryID)
      .input('ImageURL', sql.NVarChar(500), ImageURL)
      .query(`INSERT INTO Products 
              (ProductName, Description, Price, CategoryID, ImageURL) 
              OUTPUT INSERTED.ProductID
              VALUES (@ProductName, @Description, @Price, @CategoryID, @ImageURL)`);
    
    res.status(201).json({ 
      message: 'Product created',
      productId: result.recordset[0].ProductID
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// update product
router.put('/:id', validateProduct, async (req, res) => {
  const { ProductName, Description, Price, CategoryID, ImageURL } = req.body;
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('id', sql.Int, req.params.id)
      .input('ProductName', sql.NVarChar(255), ProductName)
      .input('Description', sql.NVarChar(500), Description)
      .input('Price', sql.Decimal(10, 2), Price)
      .input('CategoryID', sql.Int, CategoryID)
      .input('ImageURL', sql.NVarChar(500), ImageURL)
      .query(`UPDATE Products SET 
              ProductName = @ProductName,
              Description = @Description,
              Price = @Price,
              CategoryID = @CategoryID,
              ImageURL = @ImageURL
              WHERE ProductID = @id`);
    
    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json({ message: 'Product updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE product
router.delete('/:id', async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('id', sql.Int, req.params.id)
      .query('UPDATE Products SET Active = 0 WHERE ProductID = @id');
    
    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json({ message: 'Product deactivated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;