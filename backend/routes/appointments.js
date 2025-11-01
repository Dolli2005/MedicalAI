const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const validate = require('../middleware/validation');
const {
    getAppointments,
    getAppointment,
    createAppointment,
    updateAppointment,
    deleteAppointment
} = require('../controllers/appointmentController');

// All routes require authentication
router.use(auth);

// Create appointment
router.post('/create-appointment', async (req, res) => {
    try {
        const appointment = new Appointment(req.body);
        const savedAppointment = await appointment.save();
        res.status(201).json(savedAppointment);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Get single appointment (with permission check)
router.get('/:id', getAppointment);

// Create appointment (with validation)
router.post('/', validate('appointment'), createAppointment);

// Update appointment (with validation and permission check)
router.put('/:id', validate('appointment'), updateAppointment);

// Delete appointment (with permission check)
router.delete('/:id', deleteAppointment);

module.exports = router;
