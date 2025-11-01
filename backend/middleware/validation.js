const Joi = require('joi');

// Validation schemas
const schemas = {
    // User validation
    register: Joi.object({
        name: Joi.string().min(2).max(50).required(),
        email: Joi.string().email().required(),
        password: Joi.string().min(6).required(),
        role: Joi.string().valid('patient', 'doctor', 'admin').default('patient')
    }),

    login: Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().required()
    }),

    // Appointment validation
    appointment: Joi.object({
        patientName: Joi.string().required(),
        doctor: Joi.string().required(),
        datetime: Joi.date().iso().required(),
        consultationType: Joi.string().valid('Video Call', 'Audio Call', 'In-Person').required(),
        notes: Joi.string(),
        patientEmail: Joi.string().email(),
        patientPhone: Joi.string(),
        patientAge: Joi.number().min(0).max(150)
    }),

    // Prescription validation
    prescription: Joi.object({
        patientName: Joi.string().required(),
        doctor: Joi.string().required(),
        doctorSpecialty: Joi.string(),
        medicines: Joi.array().items(Joi.object({
            name: Joi.string().required(),
            dose: Joi.string().required(),
            frequency: Joi.string().required(),
            duration: Joi.string(),
            instructions: Joi.string()
        })),
        notes: Joi.string(),
        validUntil: Joi.date().iso()
    })
};

// Validation middleware
const validate = (schema) => {
    return (req, res, next) => {
        const { error } = schemas[schema].validate(req.body, {
            abortEarly: false,
            stripUnknown: true
        });

        if (error) {
            const errors = error.details.map(err => ({
                field: err.path[0],
                message: err.message
            }));
            return res.status(400).json({ errors });
        }

        next();
    };
};

module.exports = validate;