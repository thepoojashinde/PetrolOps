const express = require('express')
const { requireAdmin } = require('../middleware/auth')
const { listMachines, createMachine, updateMachine, deleteMachine } = require('../controllers/machineController')

const router = express.Router()
router.use(requireAdmin)

router.get('/', listMachines)
router.post('/', createMachine)
router.put('/:id', updateMachine)
router.delete('/:id', deleteMachine)

module.exports = { machineRoutes: router }

