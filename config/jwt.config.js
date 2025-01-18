require('dotenv').config();

module.exports = {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    tokenExpiration: '1h',
    cookieExpiration: 3600000 // 1 hour in milliseconds
};