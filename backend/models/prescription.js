const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    dose: {
        type: String,
        required: true
    },
    frequency: {
        type: String,
        required: true
    },
    duration: String,
    instructions: String
});

const prescriptionSchema = new mongoose.Schema({
    patientName: {
        type: String,
        required: true
    },
    doctor: {
        type: String,
        required: true
    },
    doctorSpecialty: String,
    medicines: [medicineSchema],
    notes: String,
    status: {
        type: String,
        enum: ['active', 'completed', 'expired'],
        default: 'active'
    },
    validUntil: Date
}, {
    timestamps: true
});

// expose `id` virtual and include virtuals in JSON
prescriptionSchema.virtual('id').get(function () {
    return this._id.toString();
});
prescriptionSchema.set('toJSON', { virtuals: true });
prescriptionSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Prescription', prescriptionSchema);