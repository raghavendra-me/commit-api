// controllers/groupController.js

const Group = require('../models/Group');
const User = require('../models/user.model');
const mongoose = require('mongoose');

// Create a new group
const createGroup = async (req, res) => {
    try {
        const { name, members = [] } = req.body;
        const creatorId = req.userId;

        // Create group with creator as admin
        const newGroup = new Group({
            name,
            creator: creatorId,
            members: [{ user: creatorId, role: 'admin' }]
        });

        // Add other members if provided
        if (members.length > 0) {
            const otherMembers = members.filter(memberId => memberId !== creatorId);
            
            if (otherMembers.length > 0) {
                // Add members with 'member' role
                newGroup.members.push(...otherMembers.map(memberId => ({
                    user: memberId,
                    role: 'member'
                })));
            }
        }

        await newGroup.save();

        // Populate member details before sending response
        const populatedGroup = await Group.findById(newGroup._id)
            .populate('members.user', 'email')
            .populate('creator', 'email');

        res.status(201).json({
            success: true,
            message: "Group created successfully",
            data: populatedGroup
        });

    } catch (error) {
        console.error('Error in createGroup:', error);
        res.status(500).json({
            success: false,
            message: "Error creating group",
            error: error.message
        });
    }
};

// Get all user's groups
const getUserGroups = async (req, res) => {
    try {
        const userId = req.userId;

        const groups = await Group.find({
            'members.user': userId
        })
        .populate('members.user', 'email')
        .populate('creator', 'email')
        .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: groups
        });

    } catch (error) {
        console.error('Error in getUserGroups:', error);
        res.status(500).json({
            success: false,
            message: "Error fetching user groups",
            error: error.message
        });
    }
};

// Get specific group details
const getGroupDetails = async (req, res) => {
    try {
        const { groupId } = req.params;
        const userId = req.userId;

        if (!mongoose.Types.ObjectId.isValid(groupId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid group ID format"
            });
        }

        const group = await Group.findById(groupId)
            .populate('members.user', 'email')
            .populate('creator', 'email');

        if (!group) {
            return res.status(404).json({
                success: false,
                message: "Group not found"
            });
        }

        // Verify user is a member of the group
        const isMember = group.members.some(member => 
            member.user._id.toString() === userId
        );

        if (!isMember) {
            return res.status(403).json({
                success: false,
                message: "You are not a member of this group"
            });
        }

        res.status(200).json({
            success: true,
            data: group
        });

    } catch (error) {
        console.error('Error in getGroupDetails:', error);
        res.status(500).json({
            success: false,
            message: "Error fetching group details",
            error: error.message
        });
    }
};

// Add member to group
const addGroupMember = async (req, res) => {
    try {
        const { groupId, userId: newMemberId } = req.body;
        const requesterId = req.userId;

        if (!mongoose.Types.ObjectId.isValid(groupId) || !mongoose.Types.ObjectId.isValid(newMemberId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid group or user ID format"
            });
        }

        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({
                success: false,
                message: "Group not found"
            });
        }

        // Check if requester is admin
        const requesterMember = group.members.find(
            member => member.user.toString() === requesterId.toString()
        );
        
        if (!requesterMember || requesterMember.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: "Only group admins can add members"
            });
        }

        // Check if new member exists
        const newMember = await User.findById(newMemberId);
        if (!newMember) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Check if user is already a member
        if (group.members.some(member => member.user.toString() === newMemberId)) {
            return res.status(400).json({
                success: false,
                message: "User is already a member of this group"
            });
        }

        // Check max members limit
        if (group.members.length >= group.maxMembers) {
            return res.status(400).json({
                success: false,
                message: `Group has reached maximum member limit of ${group.maxMembers}`
            });
        }

        // Add new member
        group.members.push({
            user: newMemberId,
            role: 'member'
        });

        await group.save();

        const updatedGroup = await Group.findById(groupId)
            .populate('members.user', 'email')
            .populate('creator', 'email');

        res.status(200).json({
            success: true,
            message: "Member added successfully",
            data: updatedGroup
        });

    } catch (error) {
        console.error('Error in addGroupMember:', error);
        res.status(500).json({
            success: false,
            message: "Error adding group member",
            error: error.message
        });
    }
};

// Remove member from group
const removeGroupMember = async (req, res) => {
    try {
        const { groupId, userId: memberToRemoveId } = req.body;
        const requesterId = req.userId;

        if (!mongoose.Types.ObjectId.isValid(groupId) || !mongoose.Types.ObjectId.isValid(memberToRemoveId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid group or user ID format"
            });
        }

        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({
                success: false,
                message: "Group not found"
            });
        }

        // Check if requester is admin
        const requesterMember = group.members.find(
            member => member.user.toString() === requesterId.toString()
        );

        if (!requesterMember || requesterMember.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: "Only group admins can remove members"
            });
        }

        // Cannot remove the creator/admin
        if (memberToRemoveId === group.creator.toString()) {
            return res.status(400).json({
                success: false,
                message: "Cannot remove the group creator"
            });
        }

        // Check if member exists in group
        const memberExists = group.members.some(
            member => member.user.toString() === memberToRemoveId
        );

        if (!memberExists) {
            return res.status(404).json({
                success: false,
                message: "Member not found in group"
            });
        }

        // Remove member
        group.members = group.members.filter(
            member => member.user.toString() !== memberToRemoveId
        );

        await group.save();

        const updatedGroup = await Group.findById(groupId)
            .populate('members.user', 'email')
            .populate('creator', 'email');

        res.status(200).json({
            success: true,
            message: "Member removed successfully",
            data: updatedGroup
        });

    } catch (error) {
        console.error('Error in removeGroupMember:', error);
        res.status(500).json({
            success: false,
            message: "Error removing group member",
            error: error.message
        });
    }
};

module.exports = {
    createGroup,
    getUserGroups,
    getGroupDetails,
    addGroupMember,
    removeGroupMember
};