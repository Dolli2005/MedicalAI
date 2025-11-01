const express = require('express');
const router = express.Router();
const Prescription = require('../models/prescription');

// Get all prescriptions
router.get('/', async (req, res) => {
    try {
        const prescriptions = await Prescription.find().sort({ createdAt: -1 });
        res.json(prescriptions);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get single prescription
router.get('/:id', async (req, res) => {
    try {
        const prescription = await Prescription.findById(req.params.id);
        if (!prescription) {
            return res.status(404).json({ error: 'Prescription not found' });
        }
        res.json(prescription);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create prescription
router.post('/', async (req, res) => {
    try {
        const prescription = new Prescription(req.body);
        const savedPrescription = await prescription.save();
        res.status(201).json(savedPrescription);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Update prescription
router.put('/:id', async (req, res) => {
    try {
        const prescription = await Prescription.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!prescription) {
            return res.status(404).json({ error: 'Prescription not found' });
        }
        res.json(prescription);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Delete prescription
router.delete('/:id', async (req, res) => {
    try {
        const prescription = await Prescription.findByIdAndDelete(req.params.id);
        if (!prescription) {
            return res.status(404).json({ error: 'Prescription not found' });
        }
        res.json(prescription);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
