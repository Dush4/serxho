const express = require('express');
const router = express.Router();

const userController = require('../controllers/userController');
const { authenticate, authorize } = require('../middlewares/auth');

console.log('✅ userRoutes loaded');

// Public
router.post('/register', userController.register);
router.post('/login', userController.login);

// Protected
router.get('/', authenticate, authorize('admin'), userController.getAllUsers);
router.delete('/:id', authenticate, authorize('admin'), userController.deleteUser);

// Test route
router.get('/test', (req, res) => {
  res.send('Users route working ✅');
});

module.exports = router;
