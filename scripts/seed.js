const { poolPromise, sql } = require('../db');

async function seedDatabase() {
  try {
    const pool = await poolPromise;
    
    
    await pool.request().query('DELETE FROM OrderDetails');
    await pool.request().query('DELETE FROM Orders');
    await pool.request().query('DELETE FROM ProductVariations');
    await pool.request().query('DELETE FROM Products');
    await pool.request().query('DELETE FROM Categories');
    await pool.request().query('DELETE FROM Customers');
    
   
    await pool.request().query(`
      INSERT INTO Categories (CategoryName, Description)
      VALUES 
        ('Electronics', 'Electronic devices and accessories'),
        ('Clothing', 'Men and women clothing'),
        ('Books', 'Various books and literature')
    `);
    
    
    await pool.request().query(`
      INSERT INTO Products (ProductName, Description, Price, CategoryID, ImageURL)
      VALUES 
        ('Laptop', 'High performance laptop', 999.99, 1, 'https://example.com/laptop.jpg'),
        ('T-Shirt', 'Cotton t-shirt', 19.99, 2, 'https://example.com/tshirt.jpg'),
        ('JavaScript Book', 'Learn JavaScript programming', 29.99, 3, 'https://example.com/jsbook.jpg')
    `);
    
   
    await pool.request().query(`
      INSERT INTO ProductVariations (ProductID, VariationType, VariationValue, Stock, Price)
      VALUES 
        (1, 'Color', 'Silver', 50, 999.99),
        (1, 'Color', 'Black', 30, 999.99),
        (2, 'Size', 'S', 100, 19.99),
        (2, 'Size', 'M', 150, 19.99)
    `);
    
    
    await pool.request().query(`
      INSERT INTO Customers (FirstName, LastName, Email, PasswordHash, Phone)
      VALUES 
        ('John', 'Doe', 'john@example.com', 'hashedpassword123', '1234567890'),
        ('Jane', 'Smith', 'jane@example.com', 'hashedpassword456', '0987654321')
    `);
    
    console.log('✅ Database seeded successfully');
  } catch (err) {
    console.error('❌ Error seeding database:', err);
  }
}

seedDatabase();