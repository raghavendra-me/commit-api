const jwt = require('jsonwebtoken');
const { secret } = require('../config/jwt.config');


const authenticateToken = (req, res, next) => {
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({ message: 'Authentication required' });
    }

    try {
        const decoded = jwt.verify(token, secret);
        req.userId = decoded.userId;
        next();
    } catch (error) {
        return res.status(403).json({ message: 'Invalid token' });
    }
};

module.exports = { authenticateToken };