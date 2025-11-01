const express = require('express');
const router = express.Router();
const Diagnostic = require('../models/diagnostic');

// Get all diagnostics
router.get('/', async (req, res) => {
    try {
        const diagnostics = await Diagnostic.find().sort({ createdAt: -1 });
        res.json(diagnostics);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get single diagnostic
router.get('/:id', async (req, res) => {
    try {
        const diagnostic = await Diagnostic.findById(req.params.id);
        if (!diagnostic) {
            return res.status(404).json({ error: 'Diagnostic not found' });
        }
        res.json(diagnostic);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create diagnostic
router.post('/', async (req, res) => {
    try {
        const diagnostic = new Diagnostic(req.body);
        const savedDiagnostic = await diagnostic.save();
        res.status(201).json(savedDiagnostic);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Update diagnostic
router.put('/:id', async (req, res) => {
    try {
        const diagnostic = await Diagnostic.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!diagnostic) {
            return res.status(404).json({ error: 'Diagnostic not found' });
        }
        res.json(diagnostic);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Delete diagnostic
router.delete('/:id', async (req, res) => {
    try {
        const diagnostic = await Diagnostic.findByIdAndDelete(req.params.id);
        if (!diagnostic) {
            return res.status(404).json({ error: 'Diagnostic not found' });
        }
        res.json(diagnostic);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
