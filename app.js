console.log('🟢 KY ËSHTË APP.JS I DREJTË!');
const express = require('express');
const app = express();
const productRoutes = require('./routes/products');
const customerRoutes = require('./routes/customers');
const orderRoutes = require('./routes/orders');
const userRoutes = require('./routes/users');


app.use(express.json());

app.use('/api/products', productRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);

app.get('/prov', (req, res) => {
  res.send('App is working ✅');
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));


process.on('uncaughtException', (err) => {
  console.error('‼️ Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('‼️ Unhandled Rejection:', reason);
});
