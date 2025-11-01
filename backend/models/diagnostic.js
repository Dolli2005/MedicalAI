const mongoose = require('mongoose');

const diagnosticSchema = new mongoose.Schema({
    patientName: {
        type: String,
        required: true
    },
    test: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['vital', 'lab', 'imaging', 'genetic'],
        default: 'lab'
    },
    result: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['normal', 'abnormal', 'critical', 'pending'],
        default: 'pending'
    },
    date: {
        type: Date,
        default: Date.now
    },
    description: String,
    doctor: String,
    referenceRange: String,
    additionalNotes: String
}, {
    timestamps: true
});

// expose `id` virtual and include virtuals in JSON
diagnosticSchema.virtual('id').get(function () {
    return this._id.toString();
});
diagnosticSchema.set('toJSON', { virtuals: true });
diagnosticSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Diagnostic', diagnosticSchema);