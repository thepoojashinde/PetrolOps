const { Machine } = require('../models/Machine')
const { FuelType } = require('../models/FuelType')
const { httpError } = require('../utils/httpError')

async function listMachines(req, res, next) {
  try {
    const items = await Machine.find({ adminId: req.user.id })
      .populate('supportedFuelTypes', 'name isActive')
      .populate('occupiedByWorker', 'name phone')
      .sort({ name: 1 })
    res.json({ items })
  } catch (err) {
    next(err)
  }
}

async function createMachine(req, res, next) {
  try {
    const { name, supportedFuelTypes, isActive } = req.body || {}
    if (!name) throw httpError(400, 'Machine name is required')
    if (!Array.isArray(supportedFuelTypes) || supportedFuelTypes.length === 0)
      throw httpError(400, 'supportedFuelTypes must be a non-empty array')

    const fuelCount = await FuelType.countDocuments({ _id: { $in: supportedFuelTypes }, adminId: req.user.id })
    if (fuelCount !== supportedFuelTypes.length) throw httpError(400, 'Invalid fuel type in supportedFuelTypes')

    const doc = await Machine.create({
      adminId: req.user.id,
      name: String(name).trim(),
      supportedFuelTypes,
      isActive: isActive == null ? true : Boolean(isActive),
    })
    res.status(201).json({ item: doc })
  } catch (err) {
    if (err.code === 11000) return next(httpError(409, 'Machine already exists'))
    next(err)
  }
}

async function updateMachine(req, res, next) {
  try {
    const { id } = req.params
    const { name, supportedFuelTypes, isActive } = req.body || {}
    const patch = {}
    if (name != null) patch.name = String(name).trim()
    if (isActive != null) patch.isActive = Boolean(isActive)
    if (supportedFuelTypes != null) {
      if (!Array.isArray(supportedFuelTypes) || supportedFuelTypes.length === 0)
        throw httpError(400, 'supportedFuelTypes must be a non-empty array')
      const fuelCount = await FuelType.countDocuments({ _id: { $in: supportedFuelTypes }, adminId: req.user.id })
      if (fuelCount !== supportedFuelTypes.length) throw httpError(400, 'Invalid fuel type in supportedFuelTypes')
      patch.supportedFuelTypes = supportedFuelTypes
    }

    const doc = await Machine.findOneAndUpdate({ _id: id, adminId: req.user.id }, patch, { new: true })
    if (!doc) throw httpError(404, 'Machine not found')
    res.json({ item: doc })
  } catch (err) {
    if (err.code === 11000) return next(httpError(409, 'Machine already exists'))
    next(err)
  }
}

async function deleteMachine(req, res, next) {
  try {
    const { id } = req.params
    const doc = await Machine.findOneAndDelete({ _id: id, adminId: req.user.id })
    if (!doc) throw httpError(404, 'Machine not found')
    res.json({ ok: true })
  } catch (err) {
    next(err)
  }
}

module.exports = { listMachines, createMachine, updateMachine, deleteMachine }

