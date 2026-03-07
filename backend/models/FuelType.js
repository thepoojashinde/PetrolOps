const mongoose = require('mongoose')

const fuelTypeSchema = new mongoose.Schema(
  {
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true, trim: true },
    pricePerLiter: { type: Number, required: true, min: 0 },
    currentStockLiters: { type: Number, required: true, min: 0, default: 0 },
    lowStockThreshold: { type: Number, required: true, min: 0, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
)

fuelTypeSchema.index({ adminId: 1, isActive: 1 })
fuelTypeSchema.index({ adminId: 1, name: 1 }, { unique: true })

const FuelType = mongoose.model('FuelType', fuelTypeSchema)

module.exports = { FuelType }

