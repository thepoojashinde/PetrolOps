const mongoose = require('mongoose')
const { Activity } = require('../models/Activity')
const { Worker } = require('../models/Worker')
const { Machine } = require('../models/Machine')
const { FuelType } = require('../models/FuelType')
const { httpError } = require('../utils/httpError')

async function listActiveActivities(req, res, next) {
  try {
    const items = await Activity.find({ adminId: req.user.id, status: 'active' })
      .populate('worker', 'name phone isWorking')
      .populate('machine', 'name isActive occupiedByWorker')
      .populate('fuelType', 'name isActive pricePerLiter')
      .sort({ startedAt: -1 })
    res.json({ items })
  } catch (err) {
    next(err)
  }
}

async function startActivity(req, res, next) {
  const session = await mongoose.startSession()
  try {
    const { workerId, machineId, fuelTypeId } = req.body || {}
    if (!workerId || !machineId || !fuelTypeId) throw httpError(400, 'workerId, machineId, fuelTypeId are required')

    let activityDoc

    await session.withTransaction(async () => {
      const [worker, machine, fuelType] = await Promise.all([
        Worker.findOne({ _id: workerId, adminId: req.user.id }).session(session),
        Machine.findOne({ _id: machineId, adminId: req.user.id }).session(session),
        FuelType.findOne({ _id: fuelTypeId, adminId: req.user.id }).session(session),
      ])

      if (!worker) throw httpError(404, 'Worker not found')
      if (!worker.isActive) throw httpError(400, 'Worker is inactive')
      if (worker.isWorking) throw httpError(409, 'Worker is already active')

      if (!machine) throw httpError(404, 'Machine not found')
      if (!machine.isActive) throw httpError(400, 'Machine is inactive')
      if (machine.occupiedByWorker) throw httpError(409, 'Machine is occupied')

      if (!fuelType) throw httpError(404, 'Fuel type not found')
      if (!fuelType.isActive) throw httpError(400, 'Fuel type is inactive')

      const supports = machine.supportedFuelTypes.some((id) => id.toString() === fuelType._id.toString())
      if (!supports) throw httpError(400, 'Machine does not support selected fuel type')

      // Conditional updates prevent races.
      const updatedMachine = await Machine.findOneAndUpdate(
        { _id: machine._id, occupiedByWorker: null },
        { $set: { occupiedByWorker: worker._id } },
        { new: true, session },
      )
      if (!updatedMachine) throw httpError(409, 'Machine is occupied')

      const updatedWorker = await Worker.findOneAndUpdate(
        { _id: worker._id, isWorking: false },
        { $set: { isWorking: true, currentMachine: machine._id, currentFuelType: fuelType._id } },
        { new: true, session },
      )
      if (!updatedWorker) throw httpError(409, 'Worker is already active')

      activityDoc = await Activity.create(
        [
          {
            adminId: req.user.id,
            worker: worker._id,
            machine: machine._id,
            fuelType: fuelType._id,
            status: 'active',
            startedAt: new Date(),
          },
        ],
        { session },
      )
      activityDoc = activityDoc[0]
    })

    const populated = await Activity.findById(activityDoc._id)
      .populate('worker', 'name phone')
      .populate('machine', 'name')
      .populate('fuelType', 'name')

    req.app.get('io')?.to('admins')?.emit('activity:started', { activity: populated })
    res.status(201).json({ item: populated })
  } catch (err) {
    next(err)
  } finally {
    session.endSession()
  }
}

async function stopActivity(req, res, next) {
  const session = await mongoose.startSession()
  try {
    const { activityId } = req.params
    let stopped

    await session.withTransaction(async () => {
      const activity = await Activity.findOne({ _id: activityId, adminId: req.user.id }).session(session)
      if (!activity) throw httpError(404, 'Activity not found')
      if (activity.status !== 'active') throw httpError(400, 'Activity already stopped')

      await Activity.updateOne(
        { _id: activity._id },
        { $set: { status: 'stopped', stoppedAt: new Date() } },
        { session },
      )

      await Machine.updateOne({ _id: activity.machine }, { $set: { occupiedByWorker: null } }, { session })
      await Worker.updateOne(
        { _id: activity.worker },
        { $set: { isWorking: false, currentMachine: null, currentFuelType: null } },
        { session },
      )

      stopped = await Activity.findById(activity._id)
        .session(session)
        .populate('worker', 'name phone')
        .populate('machine', 'name')
        .populate('fuelType', 'name')
    })

    req.app.get('io')?.to('admins')?.emit('activity:stopped', { activity: stopped })
    res.json({ item: stopped })
  } catch (err) {
    next(err)
  } finally {
    session.endSession()
  }
}

module.exports = { listActiveActivities, startActivity, stopActivity }

