const express = require('express');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db.config');
const authRoutes = require('./routes/auth.routes');

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());

// Connect to MongoDB
connectDB();

//cors
app.use(cors({
    origin: 'http://localhost:5173', // Replace with your frontend URL
    credentials: true, // Allow credentials (cookies)
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api', welcomeRoutes);  // Add this line

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});