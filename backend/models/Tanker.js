const mongoose = require('mongoose')

const tankerSchema = new mongoose.Schema(
  {
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    fuelType: { type: mongoose.Schema.Types.ObjectId, ref: 'FuelType', required: true },
    supplierName: { type: String, required: true, trim: true },
    tankerNumber: { type: String, required: true, trim: true },
    quantityDeliveredLiters: { type: Number, required: true, min: 0.01 },
    pricePerLiter: { type: Number, required: true, min: 0 },
    deliveryDate: { type: Date, required: true },
  },
  { timestamps: true },
)

tankerSchema.index({ adminId: 1, deliveryDate: -1 })

const Tanker = mongoose.model('Tanker', tankerSchema)

module.exports = { Tanker }

