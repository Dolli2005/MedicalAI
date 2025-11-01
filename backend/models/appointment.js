const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
    patientName: {
        type: String,
        required: true
    },
    doctor: {
        type: String,
        required: true
    },
    datetime: {
        type: Date,
        required: true
    },
    consultationType: {
        type: String,
        enum: ['Video Call', 'Audio Call', 'In-Person'],
        default: 'Video Call'
    },
    status: {
        type: String,
        enum: ['upcoming', 'completed', 'cancelled'],
        default: 'upcoming'
    },
    notes: String,
    patientEmail: String,
    patientPhone: String,
    patientAge: Number,
    cancellationReason: String
}, {
    timestamps: true
});

// expose `id` virtual for frontend convenience and include virtuals in JSON output
appointmentSchema.virtual('id').get(function () {
    return this._id.toString();
});
appointmentSchema.set('toJSON', { virtuals: true });
appointmentSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Appointment', appointmentSchema);