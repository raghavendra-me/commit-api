const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
   email: {
       type: String,
       required: true,
       unique: true,
       trim: true,
       lowercase: true
   },
   password: {
       type: String,
       required: true
   },
   createdAt: {
       type: Date,
       default: Date.now
   },
   tokens: {
       type: Number,
       default: 0
   },
   currentStreak: {
       type: Number,
       default: 0
   },
   achievementCount: {
       type: Number,
       default: 0
   },
   completionRate: {
       type: Number,
       default: 0
   },
   dailyCompletions: [{
       date: { type: Date },
       completed: { type: Boolean, default: false }
   }]
});

module.exports = mongoose.model('User', userSchema);