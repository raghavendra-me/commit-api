const express = require('express');
const router = express.Router();
const { createGoal, getGoals} = require('../controllers/goalController');
const validateGoal = require('../middleware/validateGoal');
const { authenticateToken } = require('../middleware/auth.middleware'); // Assuming you have auth middleware

// POST /api/goals/create
router.post('/create', authenticateToken, validateGoal, createGoal);
router.get('/user-goals', authenticateToken, getGoals);

module.exports = router;