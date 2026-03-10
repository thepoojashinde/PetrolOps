const bcrypt = require('bcryptjs')
const { Worker } = require('../models/Worker')
const { httpError } = require('../utils/httpError')

async function listWorkers(req, res, next) {
  try {
    const items = await Worker.find({ adminId: req.user.id })
      .select('-passwordHash')
      .populate('currentMachine', 'name')
      .populate('currentFuelType', 'name')
      .populate('assignedFuelTypes', 'name')
      .sort({ name: 1 })
    res.json({ items })
  } catch (err) {
    next(err)
  }
}

async function createWorker(req, res, next) {
  try {
    const { name, phone, password, isActive, assignedFuelTypeIds } = req.body || {}
    if (!name) throw httpError(400, 'Name is required')
    if (!phone) throw httpError(400, 'Phone is required')
    if (!password) throw httpError(400, 'Password is required')

    const passwordHash = await bcrypt.hash(String(password), 10)
    const doc = await Worker.create({
      adminId: req.user.id,
      name: String(name).trim(),
      phone: String(phone).trim(),
      passwordHash,
      isActive: isActive == null ? true : Boolean(isActive),
      assignedFuelTypes: Array.isArray(assignedFuelTypeIds)
        ? assignedFuelTypeIds.filter(Boolean)
        : [],
    })

    const safe = await Worker.findById(doc._id).select('-passwordHash')
    res.status(201).json({ item: safe })
  } catch (err) {
    if (err.code === 11000) return next(httpError(409, 'Worker phone already exists'))
    next(err)
  }
}

async function updateWorker(req, res, next) {
  try {
    const { id } = req.params
    const { name, phone, password, isActive, assignedFuelTypeIds } = req.body || {}
    const patch = {}
    if (name != null) patch.name = String(name).trim()
    if (phone != null) patch.phone = String(phone).trim()
    if (isActive != null) patch.isActive = Boolean(isActive)
    if (password != null && String(password).length > 0) patch.passwordHash = await bcrypt.hash(String(password), 10)
    if (assignedFuelTypeIds != null) {
      patch.assignedFuelTypes = Array.isArray(assignedFuelTypeIds)
        ? assignedFuelTypeIds.filter(Boolean)
        : []
    }

    const doc = await Worker.findOneAndUpdate({ _id: id, adminId: req.user.id }, patch, { new: true }).select('-passwordHash')
    if (!doc) throw httpError(404, 'Worker not found')
    res.json({ item: doc })
  } catch (err) {
    if (err.code === 11000) return next(httpError(409, 'Worker phone already exists'))
    next(err)
  }
}

async function deleteWorker(req, res, next) {
  try {
    const { id } = req.params
    const doc = await Worker.findOneAndDelete({ _id: id, adminId: req.user.id })
    if (!doc) throw httpError(404, 'Worker not found')
    res.json({ ok: true })
  } catch (err) {
    next(err)
  }
}

module.exports = { listWorkers, createWorker, updateWorker, deleteWorker }

