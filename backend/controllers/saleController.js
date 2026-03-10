const mongoose = require('mongoose')
const { Sale } = require('../models/Sale')
const { Worker } = require('../models/Worker')
const { Machine } = require('../models/Machine')
const { FuelType } = require('../models/FuelType')
const { httpError } = require('../utils/httpError')

async function listSales(req, res, next) {
  try {
    const limit = Math.min(Number(req.query.limit || 50), 200)
    const items = await Sale.find({ adminId: req.user.id })
      .populate('worker', 'name phone')
      .populate('machine', 'name')
      .populate('fuelType', 'name')
      .sort({ createdAt: -1 })
      .limit(limit)
    res.json({ items })
  } catch (err) {
    next(err)
  }
}

async function createSale(req, res, next) {
  const session = await mongoose.startSession()
  try {
    const { workerId, machineId, fuelTypeId, quantityLiters, paymentMethod } = req.body || {}
    const qty = Number(quantityLiters)
    if (!workerId || !machineId || !fuelTypeId) throw httpError(400, 'workerId, machineId, fuelTypeId are required')
    if (!qty || qty <= 0) throw httpError(400, 'quantityLiters must be > 0')

    let saleDoc

    await session.withTransaction(async () => {
      const [worker, machine, fuelType] = await Promise.all([
        Worker.findOne({ _id: workerId, adminId: req.user.id }).session(session),
        Machine.findOne({ _id: machineId, adminId: req.user.id }).session(session),
        FuelType.findOne({ _id: fuelTypeId, adminId: req.user.id }).session(session),
      ])

      if (!worker) throw httpError(404, 'Worker not found')
      if (!worker.isActive) throw httpError(400, 'Worker is inactive')
      if (!machine) throw httpError(404, 'Machine not found')
      if (!machine.isActive) throw httpError(400, 'Machine is inactive')
      if (!fuelType) throw httpError(404, 'Fuel type not found')
      if (!fuelType.isActive) throw httpError(400, 'Fuel type is inactive')

      const supports = machine.supportedFuelTypes.some((id) => id.toString() === fuelType._id.toString())
      if (!supports) throw httpError(400, 'Machine does not support selected fuel type')

      const updatedFuel = await FuelType.findOneAndUpdate(
        { _id: fuelType._id, currentStockLiters: { $gte: qty } },
        { $inc: { currentStockLiters: -qty } },
        { new: true, session },
      )
      if (!updatedFuel) throw httpError(409, 'Insufficient fuel stock')

      const price = Number(updatedFuel.pricePerLiter)
      const amount = Number((qty * price).toFixed(2))

      const method = ['cash', 'upi', 'card', 'credit', 'other'].includes(paymentMethod)
        ? paymentMethod
        : 'cash'

      saleDoc = await Sale.create(
        [
          {
            adminId: req.user.id,
            worker: worker._id,
            machine: machine._id,
            fuelType: updatedFuel._id,
            quantityLiters: qty,
            pricePerLiterAtSale: price,
            amount,
            paymentMethod: method,
          },
        ],
        { session },
      )
      saleDoc = saleDoc[0]
    })

    const populated = await Sale.findById(saleDoc._id)
      .populate('worker', 'name phone')
      .populate('machine', 'name')
      .populate('fuelType', 'name')

    req.app.get('io')?.to('admins')?.emit('sale:created', { sale: populated })
    res.status(201).json({ item: populated })
  } catch (err) {
    next(err)
  } finally {
    session.endSession()
  }
}

async function updateSale(req, res, next) {
  const session = await mongoose.startSession()
  try {
    const { id } = req.params
    const { workerId, machineId, fuelTypeId, quantityLiters, paymentMethod } = req.body || {}

    const existing = await Sale.findOne({ _id: id, adminId: req.user.id })
      .populate('fuelType')
      .session(session)
    if (!existing) throw httpError(404, 'Sale not found')

    const qty = quantityLiters != null ? Number(quantityLiters) : existing.quantityLiters
    if (qty <= 0) throw httpError(400, 'quantityLiters must be > 0')

    const workerIdToUse = workerId || existing.worker
    const machineIdToUse = machineId || existing.machine
    const fuelTypeIdToUse = fuelTypeId || existing.fuelType

    let updated

    await session.withTransaction(async () => {
      const [worker, machine, fuelType] = await Promise.all([
        Worker.findOne({ _id: workerIdToUse, adminId: req.user.id }).session(session),
        Machine.findOne({ _id: machineIdToUse, adminId: req.user.id }).session(session),
        FuelType.findOne({ _id: fuelTypeIdToUse, adminId: req.user.id }).session(session),
      ])

      if (!worker || !worker.isActive) throw httpError(404, 'Worker not found or inactive')
      if (!machine || !machine.isActive) throw httpError(404, 'Machine not found or inactive')
      if (!fuelType || !fuelType.isActive) throw httpError(404, 'Fuel type not found or inactive')

      const supports = machine.supportedFuelTypes.some((id) => id.toString() === fuelType._id.toString())
      if (!supports) throw httpError(400, 'Machine does not support selected fuel type')

      const oldFuelId = existing.fuelType._id.toString()
      const newFuelId = fuelType._id.toString()
      const oldQty = existing.quantityLiters

      if (oldFuelId === newFuelId) {
        const diff = oldQty - qty
        if (diff > 0) {
          await FuelType.updateOne({ _id: fuelType._id }, { $inc: { currentStockLiters: diff } }, { session })
        } else if (diff < 0) {
          const need = -diff
          const updatedFuel = await FuelType.findOneAndUpdate(
            { _id: fuelType._id, currentStockLiters: { $gte: need } },
            { $inc: { currentStockLiters: -need } },
            { new: true, session },
          )
          if (!updatedFuel) throw httpError(409, 'Insufficient fuel stock')
        }
      } else {
        await FuelType.updateOne({ _id: existing.fuelType._id }, { $inc: { currentStockLiters: oldQty } }, { session })
        const updatedFuel = await FuelType.findOneAndUpdate(
          { _id: fuelType._id, currentStockLiters: { $gte: qty } },
          { $inc: { currentStockLiters: -qty } },
          { new: true, session },
        )
        if (!updatedFuel) throw httpError(409, 'Insufficient fuel stock')
      }

      const price = Number(fuelType.pricePerLiter)
      const amount = Number((qty * price).toFixed(2))

      const method =
        paymentMethod && ['cash', 'upi', 'card', 'credit', 'other'].includes(paymentMethod)
          ? paymentMethod
          : existing.paymentMethod || 'cash'

      updated = await Sale.findOneAndUpdate(
        { _id: id, adminId: req.user.id },
        {
          worker: worker._id,
          machine: machine._id,
          fuelType: fuelType._id,
          quantityLiters: qty,
          pricePerLiterAtSale: price,
          amount,
          paymentMethod: method,
        },
        { new: true, session },
      )
    })

    const populated = await Sale.findById(updated._id)
      .populate('worker', 'name phone')
      .populate('machine', 'name')
      .populate('fuelType', 'name')

    req.app.get('io')?.to('admins')?.emit('sale:updated', { sale: populated })
    res.json({ item: populated })
  } catch (err) {
    next(err)
  } finally {
    session.endSession()
  }
}

async function deleteSale(req, res, next) {
  const session = await mongoose.startSession()
  try {
    const { id } = req.params

    const existing = await Sale.findOne({ _id: id, adminId: req.user.id })
      .populate('fuelType')
      .session(session)
    if (!existing) throw httpError(404, 'Sale not found')

    await session.withTransaction(async () => {
      await FuelType.updateOne(
        { _id: existing.fuelType._id },
        { $inc: { currentStockLiters: existing.quantityLiters } },
        { session },
      )
      await Sale.deleteOne({ _id: id, adminId: req.user.id }, { session })
    })

    req.app.get('io')?.to('admins')?.emit('sale:deleted', { id })
    res.json({ ok: true })
  } catch (err) {
    next(err)
  } finally {
    session.endSession()
  }
}

module.exports = { listSales, createSale, updateSale, deleteSale }

