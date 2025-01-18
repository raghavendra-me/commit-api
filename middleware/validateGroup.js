const Joi = require('joi');

const validateGroup = (req, res, next) => {
    const schema = Joi.object({
        name: Joi.string().required().min(3).max(30).messages({
            'string.empty': 'Group name is required',
            'string.min': 'Group name must be at least 3 characters long',
            'string.max': 'Group name cannot exceed 30 characters'
        }),
        members: Joi.array().items(Joi.string()).min(1).messages({
            'array.min': 'At least one member is required'
        })
    });

    const { error } = schema.validate(req.body);
    if (error) {
        return res.status(400).json({
            success: false,
            message: error.details[0].message
        });
    }
    next();
};

module.exports = validateGroup;