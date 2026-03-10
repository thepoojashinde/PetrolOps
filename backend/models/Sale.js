const mongoose = require('mongoose')

const saleSchema = new mongoose.Schema(
  {
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    worker: { type: mongoose.Schema.Types.ObjectId, ref: 'Worker', required: true },
    machine: { type: mongoose.Schema.Types.ObjectId, ref: 'Machine', required: true },
    fuelType: { type: mongoose.Schema.Types.ObjectId, ref: 'FuelType', required: true },
    quantityLiters: { type: Number, required: true, min: 0.01 },
    pricePerLiterAtSale: { type: Number, required: true, min: 0 },
    amount: { type: Number, required: true, min: 0 },
    paymentMethod: {
      type: String,
      enum: ['cash', 'upi', 'card', 'credit', 'other'],
      default: 'cash',
    },
  },
  { timestamps: true },
)

saleSchema.index({ adminId: 1, createdAt: -1 })
saleSchema.index({ adminId: 1, fuelType: 1, createdAt: -1 })

const Sale = mongoose.model('Sale', saleSchema)

module.exports = { Sale }

