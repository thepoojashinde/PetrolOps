const express = require('express')
const { requireAdmin } = require('../middleware/auth')
const { listWorkers, createWorker, updateWorker, deleteWorker } = require('../controllers/workerController')

const router = express.Router()
router.use(requireAdmin)

router.get('/', listWorkers)
router.post('/', createWorker)
router.put('/:id', updateWorker)
router.delete('/:id', deleteWorker)

module.exports = { workerRoutes: router }

