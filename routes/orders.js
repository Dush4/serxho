const express = require('express');
const router = express.Router();
const { poolPromise, sql } = require('../db');

// GET all orders
router.get('/', async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT o.*, c.FirstName, c.LastName 
      FROM Orders o
      JOIN Customers c ON o.CustomerID = c.CustomerID
    `);
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single order with details
router.get('/:id', async (req, res) => {
  try {
    const pool = await poolPromise;
    const transaction = new sql.Transaction(pool);
    
    await transaction.begin();
    try {
      // Get order header
      const orderResult = await new sql.Request(transaction)
        .input('id', sql.Int, req.params.id)
        .query(`
          SELECT o.*, c.FirstName, c.LastName, a.AddressLine1, a.City 
          FROM Orders o
          JOIN Customers c ON o.CustomerID = c.CustomerID
          JOIN CustomerAddresses a ON o.ShippingAddressID = a.AddressID
          WHERE o.OrderID = @id
        `);
      
      if (orderResult.recordset.length === 0) {
        await transaction.rollback();
        return res.status(404).json({ error: 'Order not found' });
      }
      
      // Get order items
      const itemsResult = await new sql.Request(transaction)
        .input('id', sql.Int, req.params.id)
        .query(`
          SELECT od.*, p.ProductName, p.ImageURL 
          FROM OrderDetails od
          JOIN Products p ON od.ProductID = p.ProductID
          WHERE od.OrderID = @id
        `);
      
      await transaction.commit();
      
      res.json({
        ...orderResult.recordset[0],
        items: itemsResult.recordset
      });
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create order (with transaction)
router.post('/', async (req, res) => {
  const { customerId, items, shippingAddressId } = req.body;
  const pool = await poolPromise;
  const transaction = new sql.Transaction(pool);
  
  try {
    await transaction.begin();
    
    try {
      // 1. Create the order
      const orderResult = await new sql.Request(transaction)
        .input('CustomerID', sql.Int, customerId)
        .input('ShippingAddressID', sql.Int, shippingAddressId)
        .input('TotalAmount', sql.Decimal(10, 2), 
          items.reduce((sum, item) => sum + (item.price * item.quantity), 0))
        .query(`INSERT INTO Orders 
                (CustomerID, ShippingAddressID, TotalAmount) 
                OUTPUT INSERTED.OrderID 
                VALUES (@CustomerID, @ShippingAddressID, @TotalAmount)`);
      
      const orderId = orderResult.recordset[0].OrderID;
      
      // 2. Add order items
      for (const item of items) {
        await new sql.Request(transaction)
          .input('OrderID', sql.Int, orderId)
          .input('ProductID', sql.Int, item.productId)
          .input('VariationID', sql.Int, item.variationId)
          .input('Quantity', sql.Int, item.quantity)
          .input('UnitPrice', sql.Decimal(10, 2), item.price)
          .query(`INSERT INTO OrderDetails 
                  (OrderID, ProductID, VariationID, Quantity, UnitPrice) 
                  VALUES (@OrderID, @ProductID, @VariationID, @Quantity, @UnitPrice)`);
        
        // 3. Update inventory
        await new sql.Request(transaction)
          .input('VariationID', sql.Int, item.variationId)
          .input('Quantity', sql.Int, item.quantity)
          .query('UPDATE ProductVariations SET Stock = Stock - @Quantity WHERE VariationID = @VariationID');
      }
      
      await transaction.commit();
      res.status(201).json({ orderId, message: 'Order created successfully' });
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update order status
router.put('/:id/status', async (req, res) => {
  const { status } = req.body;
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('id', sql.Int, req.params.id)
      .input('status', sql.NVarChar(50), status)
      .query('UPDATE Orders SET OrderStatus = @status WHERE OrderID = @id');
    
    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    res.json({ message: 'Order status updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;