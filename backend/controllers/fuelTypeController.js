const { FuelType } = require('../models/FuelType')
const { httpError } = require('../utils/httpError')

async function listFuelTypes(req, res, next) {
  try {
    const { includeInactive } = req.query
    const filter = { adminId: req.user.id }
    if (includeInactive !== 'true') filter.isActive = true
    const items = await FuelType.find(filter).sort({ name: 1 })
    res.json({ items })
  } catch (err) {
    next(err)
  }
}

async function createFuelType(req, res, next) {
  try {
    const { name, pricePerLiter, currentStockLiters, lowStockThreshold, isActive } = req.body || {}
    if (!name) throw httpError(400, 'Fuel name is required')
    if (pricePerLiter == null) throw httpError(400, 'Price per liter is required')

    const doc = await FuelType.create({
      adminId: req.user.id,
      name: String(name).trim(),
      pricePerLiter: Number(pricePerLiter),
      currentStockLiters: Number(currentStockLiters || 0),
      lowStockThreshold: Number(lowStockThreshold || 0),
      isActive: isActive == null ? true : Boolean(isActive),
    })
    res.status(201).json({ item: doc })
  } catch (err) {
    if (err.code === 11000) return next(httpError(409, 'Fuel type already exists'))
    next(err)
  }
}

async function updateFuelType(req, res, next) {
  try {
    const { id } = req.params
    const patch = {}
    const fields = ['name', 'pricePerLiter', 'currentStockLiters', 'lowStockThreshold', 'isActive']
    for (const f of fields) if (req.body?.[f] != null) patch[f] = req.body[f]
    if (patch.name != null) patch.name = String(patch.name).trim()
    for (const n of ['pricePerLiter', 'currentStockLiters', 'lowStockThreshold'])
      if (patch[n] != null) patch[n] = Number(patch[n])
    if (patch.isActive != null) patch.isActive = Boolean(patch.isActive)

    const doc = await FuelType.findOneAndUpdate({ _id: id, adminId: req.user.id }, patch, { new: true })
    if (!doc) throw httpError(404, 'Fuel type not found')
    res.json({ item: doc })
  } catch (err) {
    if (err.code === 11000) return next(httpError(409, 'Fuel type already exists'))
    next(err)
  }
}

async function deleteFuelType(req, res, next) {
  try {
    const { id } = req.params
    const doc = await FuelType.findOneAndDelete({ _id: id, adminId: req.user.id })
    if (!doc) throw httpError(404, 'Fuel type not found')
    res.json({ ok: true })
  } catch (err) {
    next(err)
  }
}

async function addStock(req, res, next) {
  try {
    const { id } = req.params
    const { quantityLiters } = req.body || {}
    const qty = Number(quantityLiters)
    if (!qty || qty <= 0) throw httpError(400, 'quantityLiters must be > 0')
    const doc = await FuelType.findOneAndUpdate(
      { _id: id, adminId: req.user.id },
      { $inc: { currentStockLiters: qty } },
      { new: true },
    )
    if (!doc) throw httpError(404, 'Fuel type not found')
    res.json({ item: doc })
  } catch (err) {
    next(err)
  }
}

module.exports = { listFuelTypes, createFuelType, updateFuelType, deleteFuelType, addStock }

