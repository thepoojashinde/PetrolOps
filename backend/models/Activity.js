const mongoose = require('mongoose')

const activitySchema = new mongoose.Schema(
  {
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    worker: { type: mongoose.Schema.Types.ObjectId, ref: 'Worker', required: true },
    machine: { type: mongoose.Schema.Types.ObjectId, ref: 'Machine', required: true },
    fuelType: { type: mongoose.Schema.Types.ObjectId, ref: 'FuelType', required: true },
    status: { type: String, enum: ['active', 'stopped'], default: 'active' },
    startedAt: { type: Date, required: true, default: Date.now },
    stoppedAt: { type: Date, default: null },
  },
  { timestamps: true },
)

activitySchema.index({ adminId: 1, status: 1, startedAt: -1 })

const Activity = mongoose.model('Activity', activitySchema)

module.exports = { Activity }

