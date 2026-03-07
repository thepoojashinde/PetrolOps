const mongoose = require('mongoose')

const machineSchema = new mongoose.Schema(
  {
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true, trim: true },
    supportedFuelTypes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'FuelType', required: true }],
    isActive: { type: Boolean, default: true },
    occupiedByWorker: { type: mongoose.Schema.Types.ObjectId, ref: 'Worker', default: null },
  },
  { timestamps: true },
)

machineSchema.index({ adminId: 1, isActive: 1 })
machineSchema.index({ adminId: 1, name: 1 }, { unique: true })

const Machine = mongoose.model('Machine', machineSchema)

module.exports = { Machine }

