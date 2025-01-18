const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', authController.logout);

// Example protected route
router.get('/protected', authenticateToken, (req, res) => {
    res.json({ message: 'This is a protected route', userId: req.userId });
});

module.exports = router;