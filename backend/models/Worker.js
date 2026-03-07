const mongoose = require('mongoose')

const workerSchema = new mongoose.Schema(
  {
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    passwordHash: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    isWorking: { type: Boolean, default: false },
    currentMachine: { type: mongoose.Schema.Types.ObjectId, ref: 'Machine', default: null },
    currentFuelType: { type: mongoose.Schema.Types.ObjectId, ref: 'FuelType', default: null },
  },
  { timestamps: true },
)

workerSchema.index({ adminId: 1, isActive: 1 })
workerSchema.index({ adminId: 1, isWorking: 1 })
workerSchema.index({ adminId: 1, phone: 1 }, { unique: true })

const Worker = mongoose.model('Worker', workerSchema)

module.exports = { Worker }

