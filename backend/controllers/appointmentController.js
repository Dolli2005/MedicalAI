const Appointment = require('../models/appointment');

// Get all appointments
exports.getAppointments = async (req, res) => {
    try {
        let query = {};

        // If user is a patient, show only their appointments
        if (req.user.role === 'patient') {
            query.patientEmail = req.user.email;
        }
        // If user is a doctor, show only their appointments
        else if (req.user.role === 'doctor') {
            query.doctor = req.user.name;
        }

        const appointments = await Appointment.find(query)
            .sort({ datetime: -1 });
        res.json(appointments);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get single appointment
exports.getAppointment = async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.id);
        
        if (!appointment) {
            return res.status(404).json({ error: 'Appointment not found' });
        }

        // Check if user has permission to view this appointment
        if (req.user.role === 'patient' && appointment.patientEmail !== req.user.email) {
            return res.status(403).json({ error: 'Not authorized to view this appointment' });
        }
        if (req.user.role === 'doctor' && appointment.doctor !== req.user.name) {
            return res.status(403).json({ error: 'Not authorized to view this appointment' });
        }

        res.json(appointment);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Create appointment
exports.createAppointment = async (req, res) => {
    try {
        // If user is a patient, ensure they're booking for themselves
        if (req.user.role === 'patient') {
            req.body.patientEmail = req.user.email;
            req.body.patientName = req.user.name;
        }

        const appointment = new Appointment(req.body);
        await appointment.save();
        
        res.status(201).json(appointment);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Update appointment
exports.updateAppointment = async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.id);
        
        if (!appointment) {
            return res.status(404).json({ error: 'Appointment not found' });
        }

        // Check if user has permission to update this appointment
        if (req.user.role === 'patient' && appointment.patientEmail !== req.user.email) {
            return res.status(403).json({ error: 'Not authorized to update this appointment' });
        }
        if (req.user.role === 'doctor' && appointment.doctor !== req.user.name) {
            return res.status(403).json({ error: 'Not authorized to update this appointment' });
        }

        // Don't allow changing patient or doctor details unless admin
        if (req.user.role !== 'admin') {
            delete req.body.patientEmail;
            delete req.body.patientName;
            delete req.body.doctor;
        }

        Object.assign(appointment, req.body);
        await appointment.save();
        
        res.json(appointment);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Delete appointment
exports.deleteAppointment = async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.id);
        
        if (!appointment) {
            return res.status(404).json({ error: 'Appointment not found' });
        }

        // Check if user has permission to delete this appointment
        if (req.user.role === 'patient' && appointment.patientEmail !== req.user.email) {
            return res.status(403).json({ error: 'Not authorized to delete this appointment' });
        }
        if (req.user.role === 'doctor' && appointment.doctor !== req.user.name) {
            return res.status(403).json({ error: 'Not authorized to delete this appointment' });
        }

        await appointment.remove();
        res.json({ message: 'Appointment deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};