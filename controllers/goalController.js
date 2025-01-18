const Goal = require('../models/Goal');
const User = require('../models/user.model');

const createGoal = async (req, res) => {
  try {
    const { gameName, goalName, deadline, isGroupGoal, groupId } = req.body;
    const userId = req.userId; // Assuming you have auth middleware that sets req.user
    console.log('userId:', userId);

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // If it's a group goal, verify group exists and user is a member
    if (isGroupGoal && groupId) {
      const group = await Group.findById(groupId);
      if (!group) {
        return res.status(404).json({
          success: false,
          message: 'Group not found'
        });
      }
      
      const isMember = group.members.some(member => 
        member.user.toString() === userId.toString()
      );
      
      if (!isMember) {
        return res.status(403).json({
          success: false,
          message: 'You are not a member of this group'
        });
      }
    }

    // Create new goal
    const newGoal = new Goal({
      user: userId,
      gameName,
      goalName,
      deadline: new Date(deadline),
      isGroupGoal,
      groupId: isGroupGoal ? groupId : null
    });

    // Save goal to database
    await newGoal.save();

    res.status(201).json({
      success: true,
      message: 'Goal created successfully',
      data: newGoal
    });

  } catch (error) {
    console.error('Error in createGoal:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Add this function to your existing controller
const getGoals = async (req, res) => {
    try {
        const userId = req.userId;

        // Fetch all goals for the user
        const goals = await Goal.find({ user: userId })
            .sort({ createdAt: -1 }); // Sort by newest first

        // Optional: Group goals by status
        const activeGoals = goals.filter(goal => goal.status === 'active');
        const completedGoals = goals.filter(goal => goal.status === 'completed');

        res.status(200).json({
            success: true,
            message: 'Goals retrieved successfully',
            data: {
                all: goals,
                active: activeGoals,
                completed: completedGoals,
                totalGoals: goals.length,
                activeCount: activeGoals.length,
                completedCount: completedGoals.length
            }
        });

    } catch (error) {
        console.error('Error in getGoals:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

module.exports = {
  createGoal,
  getGoals
};