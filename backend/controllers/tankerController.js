const mongoose = require('mongoose')
const { Tanker } = require('../models/Tanker')
const { FuelType } = require('../models/FuelType')
const { httpError } = require('../utils/httpError')

async function listTankers(req, res, next) {
  try {
    const limit = Math.min(Number(req.query.limit || 50), 200)
    const items = await Tanker.find({ adminId: req.user.id })
      .populate('fuelType', 'name')
      .sort({ deliveryDate: -1, createdAt: -1 })
      .limit(limit)
    res.json({ items })
  } catch (err) {
    next(err)
  }
}

async function createTanker(req, res, next) {
  const session = await mongoose.startSession()
  try {
    const { fuelTypeId, supplierName, tankerNumber, quantityDeliveredLiters, pricePerLiter, deliveryDate } =
      req.body || {}

    const qty = Number(quantityDeliveredLiters)
    if (!fuelTypeId) throw httpError(400, 'fuelTypeId is required')
    if (!supplierName) throw httpError(400, 'supplierName is required')
    if (!tankerNumber) throw httpError(400, 'tankerNumber is required')
    if (!qty || qty <= 0) throw httpError(400, 'quantityDeliveredLiters must be > 0')
    if (pricePerLiter == null) throw httpError(400, 'pricePerLiter is required')
    if (!deliveryDate) throw httpError(400, 'deliveryDate is required')

    let tankerDoc

    await session.withTransaction(async () => {
      const fuelType = await FuelType.findOne({ _id: fuelTypeId, adminId: req.user.id }).session(session)
      if (!fuelType) throw httpError(404, 'Fuel type not found')

      tankerDoc = await Tanker.create(
        [
          {
            adminId: req.user.id,
            fuelType: fuelType._id,
            supplierName: String(supplierName).trim(),
            tankerNumber: String(tankerNumber).trim(),
            quantityDeliveredLiters: qty,
            pricePerLiter: Number(pricePerLiter),
            deliveryDate: new Date(deliveryDate),
          },
        ],
        { session },
      )
      tankerDoc = tankerDoc[0]

      await FuelType.updateOne({ _id: fuelType._id }, { $inc: { currentStockLiters: qty } }, { session })
    })

    const populated = await Tanker.findById(tankerDoc._id).populate('fuelType', 'name')
    req.app.get('io')?.to('admins')?.emit('tanker:created', { tanker: populated })
    res.status(201).json({ item: populated })
  } catch (err) {
    next(err)
  } finally {
    session.endSession()
  }
}

async function updateTanker(req, res, next) {
  const session = await mongoose.startSession()
  try {
    const { id } = req.params
    const { fuelTypeId, supplierName, tankerNumber, quantityDeliveredLiters, pricePerLiter, deliveryDate } =
      req.body || {}

    const existing = await Tanker.findOne({ _id: id, adminId: req.user.id })
      .populate('fuelType')
      .session(session)
    if (!existing) throw httpError(404, 'Tanker delivery not found')

    const qty = quantityDeliveredLiters != null ? Number(quantityDeliveredLiters) : existing.quantityDeliveredLiters
    if (qty <= 0) throw httpError(400, 'quantityDeliveredLiters must be > 0')

    const fuelTypeIdToUse = fuelTypeId || existing.fuelType
    const supplierNameToUse = supplierName != null ? String(supplierName).trim() : existing.supplierName
    const tankerNumberToUse = tankerNumber != null ? String(tankerNumber).trim() : existing.tankerNumber
    const pricePerLiterToUse = pricePerLiter != null ? Number(pricePerLiter) : existing.pricePerLiter
    const deliveryDateToUse = deliveryDate != null ? new Date(deliveryDate) : existing.deliveryDate

    if (!supplierNameToUse) throw httpError(400, 'supplierName is required')
    if (!tankerNumberToUse) throw httpError(400, 'tankerNumber is required')
    if (pricePerLiterToUse < 0) throw httpError(400, 'pricePerLiter must be >= 0')

    let updated

    await session.withTransaction(async () => {
      const fuelType = await FuelType.findOne({ _id: fuelTypeIdToUse, adminId: req.user.id }).session(session)
      if (!fuelType) throw httpError(404, 'Fuel type not found')

      const oldFuelId = existing.fuelType._id.toString()
      const newFuelId = fuelType._id.toString()
      const oldQty = existing.quantityDeliveredLiters

      if (oldFuelId === newFuelId) {
        const diff = qty - oldQty
        await FuelType.updateOne({ _id: fuelType._id }, { $inc: { currentStockLiters: diff } }, { session })
      } else {
        await FuelType.updateOne({ _id: existing.fuelType._id }, { $inc: { currentStockLiters: -oldQty } }, { session })
        await FuelType.updateOne({ _id: fuelType._id }, { $inc: { currentStockLiters: qty } }, { session })
      }

      updated = await Tanker.findOneAndUpdate(
        { _id: id, adminId: req.user.id },
        {
          fuelType: fuelType._id,
          supplierName: supplierNameToUse,
          tankerNumber: tankerNumberToUse,
          quantityDeliveredLiters: qty,
          pricePerLiter: pricePerLiterToUse,
          deliveryDate: deliveryDateToUse,
        },
        { new: true, session },
      )
    })

    const populated = await Tanker.findById(updated._id).populate('fuelType', 'name')
    req.app.get('io')?.to('admins')?.emit('tanker:updated', { tanker: populated })
    res.json({ item: populated })
  } catch (err) {
    next(err)
  } finally {
    session.endSession()
  }
}

async function deleteTanker(req, res, next) {
  const session = await mongoose.startSession()
  try {
    const { id } = req.params

    const existing = await Tanker.findOne({ _id: id, adminId: req.user.id })
      .populate('fuelType')
      .session(session)
    if (!existing) throw httpError(404, 'Tanker delivery not found')

    await session.withTransaction(async () => {
      await FuelType.updateOne(
        { _id: existing.fuelType._id },
        { $inc: { currentStockLiters: -existing.quantityDeliveredLiters } },
        { session },
      )
      await Tanker.deleteOne({ _id: id, adminId: req.user.id }, { session })
    })

    req.app.get('io')?.to('admins')?.emit('tanker:deleted', { id })
    res.json({ ok: true })
  } catch (err) {
    next(err)
  } finally {
    session.endSession()
  }
}

module.exports = { listTankers, createTanker, updateTanker, deleteTanker }

